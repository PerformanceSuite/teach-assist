"""
Council Router

Inner Council advisory personas.
"""

from typing import List, Optional

import structlog
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from api.deps import get_anthropic_client, get_persona_store

logger = structlog.get_logger(__name__)

router = APIRouter()


# --- Schemas ---


class PersonaSummary(BaseModel):
    """Summary of a persona for listing."""
    name: str
    display_name: str
    description: str
    category: str
    tags: List[str]


class PersonaDetail(BaseModel):
    """Detailed persona information."""
    name: str
    display_name: str
    description: str
    category: str
    model: str
    system_prompt_preview: str
    tags: List[str]


class ConsultContext(BaseModel):
    """Context for a consultation."""
    type: str  # lesson_plan, unit_plan, rubric, assessment, communication
    content: str
    grade: Optional[int] = None
    subject: Optional[str] = None


class ConsultRequest(BaseModel):
    """Request to consult with advisors."""
    personas: List[str]
    context: ConsultContext
    question: str


class StructuredAdvice(BaseModel):
    """Structured advice from an advisor."""
    observations: List[str] = []
    risks: List[str] = []
    suggestions: List[str] = []
    questions: List[str] = []


class AdvisorResponse(BaseModel):
    """Response from a single advisor."""
    persona: str
    display_name: str
    response: StructuredAdvice


class ConsultResponse(BaseModel):
    """Response from consultation."""
    advice: List[AdvisorResponse]
    context_received: bool


class CouncilChatRequest(BaseModel):
    """Request for ongoing conversation with an advisor."""
    persona: str
    conversation_id: Optional[str] = None
    message: str


class CouncilChatResponse(BaseModel):
    """Response from advisor chat."""
    persona: str
    response: str
    conversation_id: str
    structured_advice: Optional[StructuredAdvice] = None


# --- Endpoints ---


@router.get("/personas", response_model=dict)
async def list_personas():
    """
    List available advisors.
    """
    store = get_persona_store()

    try:
        personas = store.list(category="advisory")
        return {
            "personas": [
                PersonaSummary(
                    name=p.name,
                    display_name=p.display_name,
                    description=p.description,
                    category=p.category,
                    tags=p.tags,
                )
                for p in personas
            ]
        }
    except Exception as e:
        logger.error("failed_to_list_personas", error=str(e))
        return {"personas": []}


@router.get("/personas/{name}", response_model=PersonaDetail)
async def get_persona(name: str):
    """
    Get a specific persona's details.
    """
    store = get_persona_store()

    try:
        persona = store.get(name)
        return PersonaDetail(
            name=persona.name,
            display_name=persona.display_name,
            description=persona.description,
            category=persona.category,
            model=persona.model,
            system_prompt_preview=persona.system_prompt[:200] + "...",
            tags=persona.tags,
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Persona '{name}' not found")


@router.post("/consult", response_model=ConsultResponse)
async def consult_advisors(request: ConsultRequest):
    """
    Get advice from one or more advisors.

    Each advisor will analyze the provided context and question,
    returning structured feedback in their area of expertise.
    """
    store = get_persona_store()
    client = get_anthropic_client()

    advice_list = []

    for persona_name in request.personas:
        try:
            persona = store.get(persona_name)
        except FileNotFoundError:
            logger.warning("persona_not_found", name=persona_name)
            continue

        if client is None:
            # Return placeholder if no API key
            advice_list.append(
                AdvisorResponse(
                    persona=persona.name,
                    display_name=persona.display_name,
                    response=StructuredAdvice(
                        observations=["API key not configured - cannot provide advice"],
                        risks=[],
                        suggestions=["Configure ANTHROPIC_API_KEY in .env"],
                        questions=[],
                    ),
                )
            )
            continue

        # Build the prompt
        user_message = f"""
Context Type: {request.context.type}
Grade: {request.context.grade or 'Not specified'}
Subject: {request.context.subject or 'Not specified'}

Content to Review:
{request.context.content}

Teacher's Question:
{request.question}

Please provide your advisory feedback following your output format guidelines.
"""

        try:
            response = client.messages.create(
                model=persona.model,
                max_tokens=persona.max_tokens,
                temperature=persona.temperature,
                system=persona.system_prompt,
                messages=[{"role": "user", "content": user_message}],
            )

            # Parse structured response
            # TODO: Better parsing of the structured output
            response_text = response.content[0].text

            advice_list.append(
                AdvisorResponse(
                    persona=persona.name,
                    display_name=persona.display_name,
                    response=StructuredAdvice(
                        observations=[response_text],  # Simplified for now
                        risks=[],
                        suggestions=[],
                        questions=[],
                    ),
                )
            )

        except Exception as e:
            logger.error("advisor_call_failed", persona=persona_name, error=str(e))
            advice_list.append(
                AdvisorResponse(
                    persona=persona.name,
                    display_name=persona.display_name,
                    response=StructuredAdvice(
                        observations=[f"Error consulting advisor: {str(e)}"],
                        risks=[],
                        suggestions=[],
                        questions=[],
                    ),
                )
            )

    return ConsultResponse(
        advice=advice_list,
        context_received=True,
    )


@router.post("/chat", response_model=CouncilChatResponse)
async def chat_with_advisor(request: CouncilChatRequest):
    """
    Have an ongoing conversation with an advisor.
    """
    store = get_persona_store()
    client = get_anthropic_client()

    try:
        persona = store.get(request.persona)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Persona '{request.persona}' not found")

    if client is None:
        return CouncilChatResponse(
            persona=persona.name,
            response="API key not configured. Please set ANTHROPIC_API_KEY.",
            conversation_id=request.conversation_id or "conv_placeholder",
        )

    try:
        response = client.messages.create(
            model=persona.model,
            max_tokens=persona.max_tokens,
            temperature=persona.temperature,
            system=persona.system_prompt,
            messages=[{"role": "user", "content": request.message}],
        )

        return CouncilChatResponse(
            persona=persona.name,
            response=response.content[0].text,
            conversation_id=request.conversation_id or "conv_new",
        )

    except Exception as e:
        logger.error("chat_failed", persona=request.persona, error=str(e))
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
