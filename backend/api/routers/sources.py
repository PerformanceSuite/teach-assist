"""
Sources Router

Document ingestion and management for Notebook Mode.
"""

from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

router = APIRouter()


# --- Schemas ---


class SourceMetadata(BaseModel):
    """Metadata for an uploaded source."""
    tags: List[str] = []
    description: Optional[str] = None


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
    chunks: int
    tags: List[str] = []


class SourceDetail(BaseModel):
    """Detailed source information."""
    source_id: str
    filename: str
    created_at: str
    chunks: int
    preview: str
    metadata: dict


class UrlIngestRequest(BaseModel):
    """Request to ingest a URL."""
    url: str
    notebook_id: str = "default"


# --- Endpoints ---


@router.post("/upload", response_model=SourceResponse)
async def upload_source(
    file: UploadFile = File(...),
    notebook_id: str = Form("default"),
    metadata: Optional[str] = Form(None),
):
    """
    Upload a document (PDF, DOCX, TXT, MD).

    The document will be chunked and indexed for semantic search.
    """
    # TODO: Integrate with KnowledgeBeast
    # 1. Read file content
    # 2. Use appropriate converter (PDF, DOCX, etc.)
    # 3. Chunk the content
    # 4. Index in vector store

    return SourceResponse(
        source_id="src_placeholder",
        filename=file.filename or "unknown",
        pages=None,
        chunks=0,
        status="pending_implementation",
    )


@router.post("/url", response_model=SourceResponse)
async def ingest_url(request: UrlIngestRequest):
    """
    Ingest a web page or Google Doc.

    The content will be fetched, extracted, chunked, and indexed.
    """
    # TODO: Integrate with KnowledgeBeast
    # 1. Fetch URL content
    # 2. Extract text (handle different formats)
    # 3. Chunk and index

    return SourceResponse(
        source_id="src_placeholder",
        filename=request.url,
        chunks=0,
        status="pending_implementation",
    )


@router.get("", response_model=dict)
async def list_sources(
    notebook_id: Optional[str] = None,
    tag: Optional[str] = None,
):
    """
    List all sources.

    Optionally filter by notebook or tag.
    """
    # TODO: Query KnowledgeBeast for indexed sources
    return {
        "sources": [],
        "total": 0,
    }


@router.get("/{source_id}", response_model=SourceDetail)
async def get_source(source_id: str):
    """
    Get source details and preview.
    """
    # TODO: Fetch from KnowledgeBeast
    raise HTTPException(status_code=404, detail="Source not found")


@router.delete("/{source_id}")
async def delete_source(source_id: str):
    """
    Remove a source from the knowledge base.
    """
    # TODO: Delete from KnowledgeBeast
    return {"deleted": False, "source_id": source_id, "reason": "pending_implementation"}
