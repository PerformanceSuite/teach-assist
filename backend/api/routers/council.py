"""
Council Router

Inner Council advisory personas.
"""

import re
from typing import List, Optional, Tuple

import structlog
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from api.deps import get_anthropic_client, get_persona_store

logger = structlog.get_logger(__name__)

router = APIRouter()


# --- Response Parsing ---


def parse_structured_response(text: str) -> Tuple[List[str], List[str], List[str], List[str], str]:
    """
    Parse advisor response into structured sections.

    Advisors output markdown with sections like:
    ### Observations
    - bullet point

    ### Risks (or Alignment Risks, Learning Risks, Equity Risks, Time Risks)
    - bullet point

    ### Suggestions
    - bullet point

    ### Questions
    - bullet point

    Returns: (observations, risks, suggestions, questions, raw_text)
    """
    observations = []
    risks = []
    suggestions = []
    questions = []

    # Split into lines and process sequentially
    lines = text.split('\n')
    current_section = None
    current_content = []

    def save_section():
        """Save accumulated content to the appropriate section."""
        nonlocal current_content
        if current_section and current_content:
            content_text = '\n'.join(current_content)
            bullets = extract_bullets(content_text)
            if current_section == 'observations':
                observations.extend(bullets)
            elif current_section == 'risks':
                risks.extend(bullets)
            elif current_section == 'suggestions':
                suggestions.extend(bullets)
            elif current_section == 'questions':
                questions.extend(bullets)
        current_content = []

    # Pattern to match section headers
    # Matches: ### Observations, ## Alignment Risks, **Suggestions**, etc.
    header_pattern = re.compile(
        r'^(?:#{2,3}\s*|\*\*)?(Observations?|'
        r'(?:Alignment\s+|Learning\s+|Equity\s+|Time\s+|Standards\s+)?Risks?|'
        r'Suggestions?|'
        r'Questions?)(?:\*\*)?:?\s*$',
        re.IGNORECASE
    )

    for line in lines:
        stripped = line.strip()

        # Check if this is a section header
        match = header_pattern.match(stripped)
        if match:
            # Save previous section
            save_section()

            # Determine new section
            header = match.group(1).lower()
            if 'observation' in header:
                current_section = 'observations'
            elif 'risk' in header:
                current_section = 'risks'
            elif 'suggestion' in header:
                current_section = 'suggestions'
            elif 'question' in header:
                current_section = 'questions'
        elif current_section:
            # Accumulate content for current section
            current_content.append(line)

    # Don't forget the last section
    save_section()

    return observations, risks, suggestions, questions, text


def extract_bullets(text: str) -> List[str]:
    """
    Extract bullet points from a section of text.

    Handles:
    - Markdown bullets (-, *, •)
    - Numbered lists (1., 2.)
    - Bold prefixes (**Label:** content)
    """
    bullets = []
    lines = text.strip().split('\n')

    current_bullet = []

    for line in lines:
        stripped = line.strip()

        # Skip empty lines
        if not stripped:
            if current_bullet:
                bullets.append(' '.join(current_bullet))
                current_bullet = []
            continue

        # Check for bullet/list markers
        bullet_match = re.match(r'^[-*•]\s+(.+)$', stripped)
        numbered_match = re.match(r'^\d+[.)]\s+(.+)$', stripped)

        if bullet_match:
            # Save previous bullet
            if current_bullet:
                bullets.append(' '.join(current_bullet))
            current_bullet = [bullet_match.group(1)]
        elif numbered_match:
            if current_bullet:
                bullets.append(' '.join(current_bullet))
            current_bullet = [numbered_match.group(1)]
        elif current_bullet:
            # Continuation of previous bullet (indented or wrapped)
            current_bullet.append(stripped)
        elif stripped and not stripped.startswith('#'):
            # Non-bulleted content - treat as single item if meaningful
            # Skip section headers and notes
            if not stripped.lower().startswith('note:') and len(stripped) > 10:
                current_bullet = [stripped]

    # Don't forget the last bullet
    if current_bullet:
        bullets.append(' '.join(current_bullet))

    return bullets


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
    raw_text: str = ""  # Original response for display/debugging


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
                        suggestions=["Configure TA_GEMINI_API_KEY or TA_ANTHROPIC_API_KEY in .env"],
                        questions=[],
                        raw_text="API key not configured",
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
            response_text = response.content[0].text
            observations, risks, suggestions, questions, raw = parse_structured_response(response_text)

            logger.info(
                "advisor_response_parsed",
                persona=persona_name,
                observations_count=len(observations),
                risks_count=len(risks),
                suggestions_count=len(suggestions),
                questions_count=len(questions),
            )

            advice_list.append(
                AdvisorResponse(
                    persona=persona.name,
                    display_name=persona.display_name,
                    response=StructuredAdvice(
                        observations=observations,
                        risks=risks,
                        suggestions=suggestions,
                        questions=questions,
                        raw_text=raw,
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
                        raw_text=f"Error: {str(e)}",
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
            response="API key not configured. Please set TA_GEMINI_API_KEY or TA_ANTHROPIC_API_KEY.",
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

        response_text = response.content[0].text

        # Try to parse structured advice if present
        observations, risks, suggestions, questions, raw = parse_structured_response(response_text)

        # Only include structured_advice if we found structured content
        structured = None
        if observations or risks or suggestions or questions:
            structured = StructuredAdvice(
                observations=observations,
                risks=risks,
                suggestions=suggestions,
                questions=questions,
                raw_text=raw,
            )

        return CouncilChatResponse(
            persona=persona.name,
            response=response_text,
            conversation_id=request.conversation_id or "conv_new",
            structured_advice=structured,
        )

    except Exception as e:
        logger.error("chat_failed", persona=request.persona, error=str(e))
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")
