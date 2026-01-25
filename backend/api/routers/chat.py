"""
Chat Router

Grounded RAG conversations over teacher's sources.
"""

from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


# --- Schemas ---


class Citation(BaseModel):
    """A citation from source material."""
    source_id: str
    chunk_id: str
    text: str
    page: Optional[int] = None
    relevance: float


class ChatMessage(BaseModel):
    """A message in the chat."""
    notebook_id: str = "default"
    message: str
    conversation_id: Optional[str] = None
    include_citations: bool = True


class ChatResponse(BaseModel):
    """Response to a chat message."""
    response: str
    citations: List[Citation] = []
    conversation_id: str
    grounded: bool


class TransformRequest(BaseModel):
    """Request to transform sources."""
    notebook_id: str = "default"
    transform: str  # summarize, extract_misconceptions, map_standards, generate_questions, simplify_language
    options: dict = {}
    source_ids: List[str] = []


class TransformResponse(BaseModel):
    """Response from a transform."""
    transform: str
    result: str
    sources_used: List[str]
    metadata: dict = {}


class ConversationListItem(BaseModel):
    """Item in conversation list."""
    conversation_id: str
    title: str
    created_at: str
    message_count: int


# --- Endpoints ---


@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatMessage):
    """
    Send a message and get a grounded response.

    The response will be grounded in the teacher's uploaded sources,
    with citations to specific passages.
    """
    # TODO: Integrate with KnowledgeBeast
    # 1. Query vector store for relevant chunks
    # 2. Construct prompt with retrieved context
    # 3. Call LLM with grounding instructions
    # 4. Extract citations from response

    return ChatResponse(
        response="This feature is pending KnowledgeBeast integration. Your question was: " + request.message,
        citations=[],
        conversation_id=request.conversation_id or "conv_placeholder",
        grounded=False,
    )


@router.post("/transform", response_model=TransformResponse)
async def transform_sources(request: TransformRequest):
    """
    Apply a transformation to sources.

    Supported transforms:
    - summarize: Create summary (options: audience, length)
    - extract_misconceptions: Find common student misconceptions
    - map_standards: Map content to standards
    - generate_questions: Create discussion questions
    - simplify_language: Reduce reading level
    """
    valid_transforms = [
        "summarize",
        "extract_misconceptions",
        "map_standards",
        "generate_questions",
        "simplify_language",
    ]

    if request.transform not in valid_transforms:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transform. Valid options: {valid_transforms}",
        )

    # TODO: Implement transforms with LLM
    return TransformResponse(
        transform=request.transform,
        result=f"Transform '{request.transform}' pending implementation.",
        sources_used=request.source_ids,
        metadata=request.options,
    )


@router.get("/conversations", response_model=dict)
async def list_conversations():
    """
    List all conversations.
    """
    # TODO: Store and retrieve conversations
    return {
        "conversations": [],
    }
