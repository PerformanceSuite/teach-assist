"""
Sources Router

Document ingestion and management for Notebook Mode.
"""

from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Depends
from pydantic import BaseModel

from api.deps import get_knowledge_engine
from libs.knowledge_service import TeachAssistKnowledgeService

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
    kb_service: TeachAssistKnowledgeService = Depends(get_knowledge_engine),
):
    """
    Upload a document (PDF, DOCX, TXT, MD).

    The document will be chunked and indexed for semantic search.
    """
    # Read file content
    file_content = await file.read()

    # Parse metadata if provided
    meta_dict = {}
    if metadata:
        import json
        try:
            meta_dict = json.loads(metadata)
        except json.JSONDecodeError:
            pass

    # Ingest the file
    result = await kb_service.ingest_file(
        file_content=file_content,
        filename=file.filename or "unknown",
        notebook_id=notebook_id,
        metadata=meta_dict,
    )

    return SourceResponse(
        source_id=result["source_id"],
        filename=result["filename"],
        pages=None,
        chunks=result["chunks"],
        status=result["status"],
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
    kb_service: TeachAssistKnowledgeService = Depends(get_knowledge_engine),
):
    """
    List all sources.

    Optionally filter by notebook or tag.
    """
    sources = kb_service.list_sources(notebook_id=notebook_id)

    # Filter by tag if provided
    if tag:
        sources = [s for s in sources if tag in s.get("tags", [])]

    return {
        "sources": sources,
        "total": len(sources),
    }


@router.get("/{source_id}", response_model=SourceDetail)
async def get_source(
    source_id: str,
    kb_service: TeachAssistKnowledgeService = Depends(get_knowledge_engine),
):
    """
    Get source details and preview.
    """
    source = kb_service.get_source(source_id)

    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    return SourceDetail(**source)


@router.delete("/{source_id}")
async def delete_source(
    source_id: str,
    kb_service: TeachAssistKnowledgeService = Depends(get_knowledge_engine),
):
    """
    Remove a source from the knowledge base.
    """
    deleted = kb_service.delete_source(source_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Source not found")

    return {"deleted": True, "source_id": source_id}
