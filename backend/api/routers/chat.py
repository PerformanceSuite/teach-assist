"""
Chat Router

Grounded RAG conversations over teacher's sources.
Uses KnowledgeBeast for retrieval and Anthropic Claude for generation.
"""

import uuid
from typing import List, Optional

import structlog
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from api.deps import get_anthropic_client, get_knowledge_engine
from libs.student_store import StudentStore

logger = structlog.get_logger(__name__)

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
    top_k: int = 5
    student_ids: Optional[List[str]] = None  # Selected student IDs for personalization


class ChatResponse(BaseModel):
    """Response to a chat message."""
    response: str
    citations: List[Citation] = []
    conversation_id: str
    grounded: bool
    sources_searched: int


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


# --- RAG Prompt Template ---


GROUNDED_SYSTEM_PROMPT = """You are a helpful assistant for teachers using TeachAssist.
Your responses should be grounded in the provided source materials.

INSTRUCTIONS:
1. Answer the teacher's question based on the provided context
2. If the context doesn't contain enough information, say so clearly
3. Be concise and practical - teachers are busy
4. When referencing specific information, mention which source it comes from
5. If you're unsure, acknowledge uncertainty rather than guessing

CONTEXT FROM TEACHER'S SOURCES:
{context}

---
Answer the teacher's question based on the context above. If the context doesn't
contain relevant information, say "I couldn't find information about this in your
uploaded sources" and offer to help in another way.
"""


# --- Endpoints ---


@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatMessage,
):
    """
    Send a message and get a grounded response.

    The response will be grounded in the teacher's uploaded sources,
    with citations to specific passages.
    """
    kb = get_knowledge_engine()
    client = get_anthropic_client()

    if not client:
        raise HTTPException(
            status_code=503,
            detail="LLM service not available. Please configure ANTHROPIC_API_KEY.",
        )

    # Retrieve relevant chunks from knowledge base
    citations = []
    context_parts = []
    sources_searched = 0

    if kb:
        try:
            # Query knowledge base for relevant chunks
            results = await kb.search(
                request.message,
                mode="hybrid",
                top_k=request.top_k,
            )

            sources_searched = len(results) if results else 0

            for i, result in enumerate(results or []):
                # Result format varies - handle both tuple and dict
                if isinstance(result, tuple):
                    doc_name, content, score = result[0], result[1], result[2] if len(result) > 2 else 0.5
                elif isinstance(result, dict):
                    doc_name = result.get("name", result.get("doc_id", "unknown"))
                    content = result.get("content", "")
                    score = result.get("score", result.get("similarity", 0.5))
                else:
                    continue

                chunk_id = f"chunk_{i}"
                context_parts.append(f"[Source: {doc_name}]\n{content}\n")

                if request.include_citations:
                    citations.append(Citation(
                        source_id=doc_name,
                        chunk_id=chunk_id,
                        text=content[:200] + "..." if len(content) > 200 else content,
                        relevance=float(score) if score else 0.5,
                    ))

            logger.info(
                "rag_query_complete",
                query_length=len(request.message),
                results_found=len(results) if results else 0,
            )

        except Exception as e:
            logger.error("rag_query_failed", error=str(e))
            # Continue without RAG context

    # Build context for LLM
    if context_parts:
        context = "\n---\n".join(context_parts)
    else:
        context = "(No relevant sources found. Responding based on general knowledge.)"

    # Add student personalization context if student IDs provided
    if request.student_ids:
        student_store = StudentStore()
        students = student_store.get_many(request.student_ids)

        if students:
            student_lines = []
            for student in students:
                interests_str = ", ".join(student.interests) if student.interests else "not specified"
                accommodations_str = ", ".join(student.accommodations) if student.accommodations else None

                line = f"- {student.name} (interests: {interests_str})"
                if accommodations_str:
                    line += f" [accommodations: {accommodations_str}]"
                student_lines.append(line)

            personalization_context = f"""
STUDENT PERSONALIZATION:
You are personalizing this response for:
{chr(10).join(student_lines)}

When explaining concepts:
- Connect them to students' interests to increase engagement
- Use examples, analogies, or references they would find relatable
- If accommodations are listed, ensure your response supports those needs (e.g., simpler language for reading support, step-by-step for executive function support)

"""
            context = personalization_context + context

            logger.info(
                "student_personalization_added",
                student_count=len(students),
            )

    # Generate response using Claude
    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            temperature=0.3,
            system=GROUNDED_SYSTEM_PROMPT.format(context=context),
            messages=[{"role": "user", "content": request.message}],
        )

        answer = response.content[0].text

        logger.info(
            "grounded_response_generated",
            response_length=len(answer),
            citations_count=len(citations),
        )

    except Exception as e:
        logger.error("llm_generation_failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate response: {str(e)}",
        )

    return ChatResponse(
        response=answer,
        citations=citations,
        conversation_id=request.conversation_id or f"conv_{uuid.uuid4().hex[:8]}",
        grounded=len(citations) > 0,
        sources_searched=sources_searched,
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
    valid_transforms = {
        "summarize": "Create a clear, concise summary of the following content. Target audience: {audience}. Length: {length}.",
        "extract_misconceptions": "Identify common student misconceptions that might arise from this content. List each misconception and explain why it's incorrect.",
        "map_standards": "Identify which educational standards (CCSS, NGSS, or state standards) this content addresses. Be specific about standard codes.",
        "generate_questions": "Generate {count} discussion questions based on this content. Questions should promote critical thinking and deeper understanding.",
        "simplify_language": "Rewrite this content at a {grade_level} reading level while preserving the key concepts.",
    }

    if request.transform not in valid_transforms:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transform. Valid options: {list(valid_transforms.keys())}",
        )

    kb = get_knowledge_engine()
    client = get_anthropic_client()

    if not client:
        raise HTTPException(
            status_code=503,
            detail="LLM service not available. Please configure ANTHROPIC_API_KEY.",
        )

    # Get content from knowledge base
    content_parts = []
    sources_used = []

    if kb:
        try:
            # If specific source IDs provided, we'd filter by them
            # For now, use general query to get all relevant content
            results = await kb.search("", mode="keyword", top_k=20)

            for result in results or []:
                if isinstance(result, tuple):
                    doc_name, content = result[0], result[1]
                elif isinstance(result, dict):
                    doc_name = result.get("name", "unknown")
                    content = result.get("content", "")
                else:
                    continue

                content_parts.append(content)
                if doc_name not in sources_used:
                    sources_used.append(doc_name)

        except Exception as e:
            logger.error("transform_query_failed", error=str(e))

    if not content_parts:
        raise HTTPException(
            status_code=400,
            detail="No sources found. Please upload documents first.",
        )

    # Build the transform prompt
    prompt_template = valid_transforms[request.transform]
    options = {
        "audience": request.options.get("audience", "teachers"),
        "length": request.options.get("length", "medium"),
        "count": request.options.get("count", 5),
        "grade_level": request.options.get("grade_level", "6th grade"),
    }
    transform_instruction = prompt_template.format(**options)

    full_prompt = f"""
{transform_instruction}

CONTENT:
{chr(10).join(content_parts[:5])}
"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            temperature=0.4,
            messages=[{"role": "user", "content": full_prompt}],
        )

        result = response.content[0].text

    except Exception as e:
        logger.error("transform_generation_failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to apply transform: {str(e)}",
        )

    return TransformResponse(
        transform=request.transform,
        result=result,
        sources_used=sources_used[:10],  # Limit to 10
        metadata=request.options,
    )


@router.get("/conversations", response_model=dict)
async def list_conversations():
    """
    List all conversations.
    """
    # TODO: Implement conversation persistence
    # For now, return empty list
    return {
        "conversations": [],
        "message": "Conversation persistence not yet implemented. Each session starts fresh.",
    }
