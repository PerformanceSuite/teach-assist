"""
Chat Router

Grounded RAG conversations over teacher's sources.
"""

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from api.deps import get_knowledge_engine, get_anthropic_client
from libs.knowledge_service import TeachAssistKnowledgeService

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
async def send_message(
    request: ChatMessage,
    kb_service: TeachAssistKnowledgeService = Depends(get_knowledge_engine),
    anthropic_client = Depends(get_anthropic_client),
):
    """
    Send a message and get a grounded response.

    The response will be grounded in the teacher's uploaded sources,
    with citations to specific passages.
    """
    # Query the knowledge base for relevant context
    citations_data = await kb_service.query(
        query=request.message,
        notebook_id=request.notebook_id,
        top_k=5,
    )

    # Build context from citations
    context_parts = []
    for i, cite in enumerate(citations_data):
        context_parts.append(f"[{i+1}] {cite['text']}\nSource: {cite['source']}")

    context = "\n\n".join(context_parts)

    # Generate conversation ID if not provided
    conversation_id = request.conversation_id or f"conv_{__import__('uuid').uuid4().hex[:12]}"

    # If no Anthropic client, return just the citations
    if not anthropic_client:
        return ChatResponse(
            response="(AI responses require Anthropic API key configuration)\n\nRelevant context found:\n" + context,
            citations=[
                Citation(
                    source_id=cite.get("source", "unknown"),
                    chunk_id=cite.get("chunk_id", ""),
                    text=cite["text"],
                    page=cite.get("page"),
                    relevance=cite["relevance"],
                )
                for cite in citations_data
            ],
            conversation_id=conversation_id,
            grounded=bool(citations_data),
        )

    # Construct grounded prompt
    grounded_prompt = f"""You are a helpful teaching assistant. Answer the teacher's question using ONLY the provided source material. If the sources don't contain enough information to answer the question, say so clearly.

Source Material:
{context}

Teacher's Question: {request.message}

Provide a clear, helpful answer grounded in the sources above. Reference sources using [1], [2], etc."""

    # Call LLM
    try:
        message = anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            messages=[{"role": "user", "content": grounded_prompt}]
        )

        response_text = message.content[0].text

    except Exception as e:
        response_text = f"Error generating response: {str(e)}\n\nRelevant context:\n{context}"

    # Convert citations to response format
    citations_list = [
        Citation(
            source_id=cite.get("source", "unknown"),
            chunk_id=cite.get("chunk_id", ""),
            text=cite["text"],
            page=cite.get("page"),
            relevance=cite["relevance"],
        )
        for cite in citations_data
    ]

    return ChatResponse(
        response=response_text,
        citations=citations_list,
        conversation_id=conversation_id,
        grounded=bool(citations_data),
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
