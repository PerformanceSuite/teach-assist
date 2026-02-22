"""
Sources Router

Document ingestion and management for Notebook Mode.
Uses KnowledgeBeast for RAG capabilities.
Supports file uploads and URL/webpage ingestion.
"""

import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional

import structlog
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from api.config import settings
from api.deps import get_knowledge_engine
from libs.web_ingester import (
    fetch_and_parse,
    InvalidUrlError,
    FetchError,
    ParseError,
)
from libs.table_extractor import extract_document

logger = structlog.get_logger(__name__)

router = APIRouter()


# --- Schemas ---


class SourceMetadata(BaseModel):
    """Metadata for an uploaded source."""
    tags: List[str] = []
    description: Optional[str] = None
    notebook_id: str = "default"


class SourceResponse(BaseModel):
    """Response after uploading a source."""
    source_id: str
    filename: str
    pages: Optional[int] = None
    chunks: int
    status: str


class SourceListItem(BaseModel):
    """Item in source list."""
    source_id: str
    filename: str
    created_at: str
    file_size: int
    tags: List[str] = []


class SourceDetail(BaseModel):
    """Detailed source information."""
    source_id: str
    filename: str
    created_at: str
    file_size: int
    preview: str
    metadata: dict


class UrlIngestRequest(BaseModel):
    """Request to ingest a URL."""
    url: str
    title: Optional[str] = None
    notebook_id: str = "default"
    tags: List[str] = []
    description: Optional[str] = None


# --- Helper Functions ---


def get_source_metadata_path(source_id: str) -> Path:
    """Get path to source metadata file."""
    return settings.sources_path / f"{source_id}.meta.json"


def save_source_metadata(source_id: str, filename: str, metadata: SourceMetadata, file_size: int):
    """Save source metadata to disk."""
    meta = {
        "source_id": source_id,
        "filename": filename,
        "created_at": datetime.utcnow().isoformat(),
        "file_size": file_size,
        "tags": metadata.tags,
        "description": metadata.description,
        "notebook_id": metadata.notebook_id,
    }
    meta_path = get_source_metadata_path(source_id)
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)
    return meta


def load_source_metadata(source_id: str) -> dict:
    """Load source metadata from disk."""
    meta_path = get_source_metadata_path(source_id)
    if not meta_path.exists():
        return None
    with open(meta_path) as f:
        return json.load(f)


def list_all_sources() -> List[dict]:
    """List all source metadata files."""
    sources = []
    for meta_file in settings.sources_path.glob("*.meta.json"):
        try:
            with open(meta_file) as f:
                sources.append(json.load(f))
        except Exception as e:
            logger.warning("failed_to_load_source_metadata", file=str(meta_file), error=str(e))
    return sorted(sources, key=lambda x: x.get("created_at", ""), reverse=True)


# --- Endpoints ---


@router.post("/upload", response_model=SourceResponse)
async def upload_source(
    file: UploadFile = File(...),
    notebook_id: str = Form("default"),
    tags: str = Form(""),
    description: str = Form(""),
):
    """
    Upload a document (PDF, DOCX, TXT, MD).

    The document will be saved and indexed for semantic search.
    """
    # Validate file type
    allowed_extensions = {".pdf", ".docx", ".doc", ".txt", ".md", ".markdown"}
    filename = file.filename or "unknown"
    ext = Path(filename).suffix.lower()

    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Allowed: {allowed_extensions}",
        )

    # Generate source ID
    source_id = f"src_{uuid.uuid4().hex[:12]}"

    # Save file to sources directory
    file_path = settings.sources_path / f"{source_id}{ext}"
    content = await file.read()
    file_size = len(content)

    with open(file_path, "wb") as f:
        f.write(content)

    logger.info(
        "source_uploaded",
        source_id=source_id,
        filename=filename,
        size=file_size,
        notebook_id=notebook_id,
    )

    # Parse tags
    tag_list = [t.strip() for t in tags.split(",") if t.strip()]

    # Save metadata
    metadata = SourceMetadata(
        tags=tag_list,
        description=description or None,
        notebook_id=notebook_id,
    )
    save_source_metadata(source_id, filename, metadata, file_size)

    # Index in KnowledgeBeast
    kb = get_knowledge_engine()
    chunks = 0

    if kb:
        try:
            # Use table-aware extraction for DOCX and PDF
            if ext in {".docx", ".pdf"}:
                content_blocks = extract_document(file_path)
                for block in content_blocks:
                    result = await kb.ingest(
                        content=block["content"],
                        source_id=source_id,
                        title=filename,
                        source_type=ext[1:],
                        metadata={
                            "content_type": block.get("content_type", "prose"),
                            **block.get("metadata", {}),
                        },
                    )
                    chunks += result.chunks_created
            else:
                # Plain text files
                with open(file_path, "rb") as f:
                    file_content = f.read()
                result = await kb.ingest(
                    content=file_content.decode('utf-8', errors='ignore'),
                    source_id=source_id,
                    title=filename,
                    source_type=ext[1:],
                )
                chunks = result.chunks_created

            logger.info("source_indexed", source_id=source_id, chunks=chunks)
        except Exception as e:
            logger.error("source_indexing_failed", source_id=source_id, error=str(e))

    return SourceResponse(
        source_id=source_id,
        filename=filename,
        pages=None,  # TODO: Extract page count for PDFs
        chunks=chunks,
        status="indexed" if kb else "saved",
    )


@router.post("/url", response_model=SourceResponse)
async def ingest_url(request: UrlIngestRequest):
    """
    Ingest a web page URL.

    The content will be fetched, extracted, and indexed into the knowledge base.

    Supports:
    - Standard HTML pages
    - Blog posts and articles
    - Documentation pages

    Note: Google Docs requires sharing settings to be "Anyone with the link can view".
    """
    try:
        # Fetch and parse the URL
        logger.info("ingesting_url", url=request.url)
        web_content = await fetch_and_parse(request.url, timeout=30.0)

        # Generate source ID
        source_id = f"url_{uuid.uuid4().hex[:12]}"

        # Use provided title or extracted title
        title = request.title or web_content["title"]
        content = web_content["content"]

        # Save content to file for persistence
        file_path = settings.sources_path / f"{source_id}.txt"
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(f"Source: {web_content['url']}\n")
            f.write(f"Title: {title}\n")
            f.write(f"---\n\n")
            f.write(content)

        file_size = file_path.stat().st_size

        logger.info(
            "url_content_saved",
            source_id=source_id,
            url=request.url,
            title=title,
            content_length=len(content),
        )

        # Save metadata
        metadata = SourceMetadata(
            tags=request.tags,
            description=request.description or web_content.get("description"),
            notebook_id=request.notebook_id,
        )

        # Add URL to metadata dict for save
        meta = {
            "source_id": source_id,
            "filename": title,
            "created_at": datetime.utcnow().isoformat(),
            "file_size": file_size,
            "tags": metadata.tags,
            "description": metadata.description,
            "notebook_id": metadata.notebook_id,
            "source_url": web_content["url"],
            "source_type": "url",
        }
        meta_path = get_source_metadata_path(source_id)
        with open(meta_path, "w") as f:
            json.dump(meta, f, indent=2)

        # Index in KnowledgeBeast
        kb = get_knowledge_engine()
        chunks = 0

        if kb:
            try:
                result = await kb.ingest(
                    content=content,
                    source_id=source_id,
                    title=title,
                    source_type="url",
                    metadata={
                        "source_url": web_content["url"],
                        "description": web_content.get("description"),
                    }
                )
                chunks = result.chunks_created
                logger.info("url_source_indexed", source_id=source_id, chunks=chunks)
            except Exception as e:
                logger.error("url_indexing_failed", source_id=source_id, error=str(e))

        return SourceResponse(
            source_id=source_id,
            filename=title,
            pages=None,
            chunks=chunks,
            status="indexed" if kb else "saved",
        )

    except InvalidUrlError as e:
        logger.warning("invalid_url", url=request.url, error=str(e))
        raise HTTPException(status_code=400, detail=str(e))

    except FetchError as e:
        logger.warning("fetch_error", url=request.url, error=str(e))
        raise HTTPException(status_code=422, detail=f"Failed to fetch URL: {str(e)}")

    except ParseError as e:
        logger.warning("parse_error", url=request.url, error=str(e))
        raise HTTPException(status_code=422, detail=f"Failed to parse content: {str(e)}")

    except Exception as e:
        logger.error("url_ingestion_failed", url=request.url, error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.get("", response_model=dict)
async def list_sources(
    notebook_id: Optional[str] = None,
    tag: Optional[str] = None,
):
    """
    List all sources.

    Optionally filter by notebook or tag.
    """
    sources = list_all_sources()

    # Filter by notebook_id
    if notebook_id:
        sources = [s for s in sources if s.get("notebook_id") == notebook_id]

    # Filter by tag
    if tag:
        sources = [s for s in sources if tag in s.get("tags", [])]

    return {
        "sources": [
            SourceListItem(
                source_id=s["source_id"],
                filename=s["filename"],
                created_at=s["created_at"],
                file_size=s["file_size"],
                tags=s.get("tags", []),
            ).model_dump()
            for s in sources
        ],
        "total": len(sources),
    }




@router.get("/stats")
async def get_stats():
    """
    Get knowledge base statistics.
    """
    kb = get_knowledge_engine()

    if not kb:
        return {
            "total_documents": 0,
            "total_chunks": 0,
            "embedding_model": "not_initialized"
        }

    stats = await kb.get_stats()

    # Count sources from metadata files
    sources = list_all_sources()

    return {
        "total_documents": len(sources),
        "total_chunks": stats.get("total_documents", 0),  # In KB, "documents" are chunks
        "embedding_model": stats.get("embedding_model", "unknown")
    }


@router.get("/{source_id}", response_model=SourceDetail)
async def get_source(
    source_id: str,
):
    """
    Get source details and preview.
    """
    meta = load_source_metadata(source_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Source not found")

    # Find the source file
    source_files = list(settings.sources_path.glob(f"{source_id}.*"))
    source_files = [f for f in source_files if not f.name.endswith(".meta.json")]

    preview = ""
    if source_files:
        source_file = source_files[0]
        try:
            # Read first 1000 chars for preview (text files only)
            if source_file.suffix.lower() in {".txt", ".md", ".markdown"}:
                with open(source_file, "r", errors="ignore") as f:
                    preview = f.read(1000)
                    if len(preview) == 1000:
                        preview += "..."
            else:
                preview = f"[Binary file: {source_file.suffix}]"
        except Exception as e:
            preview = f"[Error reading file: {e}]"

    return SourceDetail(
        source_id=meta["source_id"],
        filename=meta["filename"],
        created_at=meta["created_at"],
        file_size=meta["file_size"],
        preview=preview,
        metadata={
            "tags": meta.get("tags", []),
            "description": meta.get("description"),
            "notebook_id": meta.get("notebook_id"),
        },
    )


@router.delete("/{source_id}")
async def delete_source(
    source_id: str,
):
    """
    Remove a source from the knowledge base.
    """
    meta = load_source_metadata(source_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Source not found")

    # Delete source file
    deleted_files = []
    for source_file in settings.sources_path.glob(f"{source_id}.*"):
        try:
            os.remove(source_file)
            deleted_files.append(source_file.name)
        except Exception as e:
            logger.error("failed_to_delete_source_file", file=str(source_file), error=str(e))

    # Note: In-memory vector store doesn't need reindexing
    # Documents are removed from memory when app restarts or explicitly cleared

    logger.info("source_deleted", source_id=source_id, files=deleted_files)

    return {
        "deleted": True,
        "source_id": source_id,
        "files_removed": deleted_files,
    }


    
    stats = await kb.get_stats()
    
    # Count sources from metadata files
    sources = list_all_sources()
    
    return {
        "total_documents": len(sources),
        "total_chunks": stats.get("total_documents", 0),  # In KB, "documents" are chunks
        "embedding_model": stats.get("embedding_model", "unknown")
    }
