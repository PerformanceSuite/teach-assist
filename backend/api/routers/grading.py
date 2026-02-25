"""
Grading Router

Batch feedback generation for student work.
Generates rubric-aligned feedback drafts (NOT scores) for teacher review.
Human-in-the-loop: teacher always has final authority.
"""

import uuid
import asyncio
from datetime import datetime
from typing import Dict, List, Optional

import structlog
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field

from api.deps import get_anthropic_client
from libs.rubric_templates import get_template, RubricTemplate, get_criteria_prompt_block

logger = structlog.get_logger(__name__)

router = APIRouter()


# --- In-Memory Storage (v0.1) ---

_grade_batches: Dict[str, dict] = {}


# --- Schemas ---


class StudentWork(BaseModel):
    """A piece of student work to generate feedback for."""
    student_id: str = Field(..., min_length=1, max_length=10, description="Student initials (FERPA-safe)")
    content: str = Field(..., min_length=1, description="The student's work (text or description)")
    submission_type: str = Field("text", pattern="^(text|description|summary)$")


class GradeBatchRequest(BaseModel):
    """Request to create a grading feedback batch."""
    rubric_template_id: Optional[str] = Field(None, description="ID of rubric template to use")
    assignment_name: str = Field(..., min_length=1, description="Name/description of the assignment")
    assignment_context: str = Field("", description="Additional context about the assignment")
    submissions: List[StudentWork] = Field(..., min_length=1, max_length=50)


class FeedbackDraft(BaseModel):
    """Generated feedback for a student."""
    student_id: str
    strengths: List[str] = Field(description="Specific strengths identified")
    growth_areas: List[str] = Field(description="Areas for development")
    evidence: List[str] = Field(description="Specific evidence from student work")
    next_steps: List[str] = Field(description="Actionable suggestions")
    draft_comment: str = Field(description="Full feedback draft ready for teacher editing")
    criteria_alignment: Dict[str, str] = Field(default_factory=dict, description="Alignment to rubric criteria")
    status: str = Field("ready_for_review", pattern="^(ready_for_review|approved|edited)$")
    word_count: int = 0


class GradeBatchResponse(BaseModel):
    """Response from batch submission."""
    batch_id: str
    submission_count: int
    status: str
    estimated_time_seconds: int


class GradeBatchStatusResponse(BaseModel):
    """Status of a grade batch."""
    batch_id: str
    assignment_name: str
    status: str
    progress: Optional[dict] = None
    feedback: List[FeedbackDraft] = []
    rubric_template_id: Optional[str] = None


class FeedbackEditRequest(BaseModel):
    """Request to edit/approve feedback."""
    student_id: str
    draft_comment: str
    status: str = Field("approved", pattern="^(approved|edited)$")


class FeedbackEditResponse(BaseModel):
    """Response from editing feedback."""
    student_id: str
    status: str
    updated_at: str


# --- Feedback Generation Prompt ---

FEEDBACK_SYSTEM_PROMPT = """You are a feedback generation assistant for TeachAssist.

Your goal is to help teachers draft rubric-aligned feedback for student work.
You generate FEEDBACK, never SCORES or GRADES. The teacher always has final authority.

CORE RULES:
1. IDENTITY: Use only student initials provided. Never use full names (FERPA compliance).
2. SPECIFICITY: Reference specific elements of the student's work as evidence.
3. GROWTH-ORIENTED: Frame feedback constructively with clear next steps.
4. BALANCED: Include both strengths and growth areas.

{criteria_reference}

OUTPUT FORMAT:
Return a JSON object with:
{{
  "strengths": ["strength 1", "strength 2"],
  "growth_areas": ["area 1", "area 2"],
  "evidence": ["specific evidence from work 1", "evidence 2"],
  "next_steps": ["actionable step 1", "step 2"],
  "draft_comment": "Full paragraph of feedback...",
  "criteria_alignment": {{"criterion_id": "brief alignment note"}}
}}
"""


# --- Helper Functions ---


async def generate_feedback_with_llm(
    work: StudentWork,
    assignment_name: str,
    assignment_context: str,
    client,
    rubric: Optional[RubricTemplate] = None,
) -> FeedbackDraft:
    """Generate feedback for a single piece of student work."""

    if rubric:
        criteria_reference = get_criteria_prompt_block(rubric)
    else:
        criteria_reference = "No specific rubric provided. Generate general feedback based on the work quality."

    user_message = f"""
Generate feedback for this student's work:

ASSIGNMENT: {assignment_name}
CONTEXT: {assignment_context or 'None provided'}
STUDENT ID: {work.student_id}
SUBMISSION TYPE: {work.submission_type}

STUDENT WORK:
{work.content}

Generate balanced, specific feedback. Return ONLY the JSON object.
"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            temperature=0.3,
            system=FEEDBACK_SYSTEM_PROMPT.format(criteria_reference=criteria_reference),
            messages=[{"role": "user", "content": user_message}],
        )

        response_text = response.content[0].text.strip()

        import json
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]

        try:
            parsed = json.loads(response_text)
        except json.JSONDecodeError:
            logger.warning("feedback_json_parse_failed", student_id=work.student_id)
            parsed = {
                "strengths": [],
                "growth_areas": [],
                "evidence": [],
                "next_steps": [],
                "draft_comment": response_text,
                "criteria_alignment": {},
            }

        draft = parsed.get("draft_comment", response_text)

        return FeedbackDraft(
            student_id=work.student_id,
            strengths=parsed.get("strengths", []),
            growth_areas=parsed.get("growth_areas", []),
            evidence=parsed.get("evidence", []),
            next_steps=parsed.get("next_steps", []),
            draft_comment=draft,
            criteria_alignment=parsed.get("criteria_alignment", {}),
            word_count=len(draft.split()),
            status="ready_for_review",
        )

    except Exception as e:
        logger.error("feedback_generation_failed", student_id=work.student_id, error=str(e))
        return FeedbackDraft(
            student_id=work.student_id,
            strengths=[],
            growth_areas=[],
            evidence=[],
            next_steps=[],
            draft_comment=f"[Error generating feedback for {work.student_id}: {str(e)}]",
            criteria_alignment={},
            word_count=0,
            status="ready_for_review",
        )


# --- Endpoints ---


@router.post("/batch", response_model=GradeBatchResponse)
async def create_grade_batch(request: GradeBatchRequest):
    """
    Submit a batch of student work for feedback generation.

    Generates rubric-aligned feedback drafts (NOT scores).
    Teacher reviews, edits, and approves each piece of feedback.
    """
    client = get_anthropic_client()
    if not client:
        raise HTTPException(
            status_code=503,
            detail="LLM service not available. Please configure TA_GEMINI_API_KEY or TA_ANTHROPIC_API_KEY.",
        )

    # Resolve rubric
    rubric = None
    if request.rubric_template_id:
        rubric = get_template(request.rubric_template_id)
        if not rubric:
            raise HTTPException(status_code=404, detail=f"Rubric template '{request.rubric_template_id}' not found")

    batch_id = f"grade_{uuid.uuid4().hex[:12]}"

    _grade_batches[batch_id] = {
        "batch_id": batch_id,
        "assignment_name": request.assignment_name,
        "assignment_context": request.assignment_context,
        "rubric_template_id": request.rubric_template_id,
        "feedback": [],
        "status": "processing",
        "progress": {"completed": 0, "total": len(request.submissions)},
        "created_at": datetime.utcnow().isoformat(),
    }

    # Start background processing
    asyncio.create_task(_process_grade_batch(batch_id, request, client, rubric))

    estimated_seconds = len(request.submissions) * 3

    logger.info("grade_batch_submitted", batch_id=batch_id, count=len(request.submissions))

    return GradeBatchResponse(
        batch_id=batch_id,
        submission_count=len(request.submissions),
        status="processing",
        estimated_time_seconds=estimated_seconds,
    )


async def _process_grade_batch(
    batch_id: str,
    request: GradeBatchRequest,
    client,
    rubric: Optional[RubricTemplate],
):
    """Process a grade batch asynchronously."""
    feedback_items = []

    for i, work in enumerate(request.submissions):
        feedback = await generate_feedback_with_llm(
            work=work,
            assignment_name=request.assignment_name,
            assignment_context=request.assignment_context,
            client=client,
            rubric=rubric,
        )
        feedback_items.append(feedback)

        _grade_batches[batch_id]["progress"]["completed"] = i + 1
        _grade_batches[batch_id]["feedback"] = [f.model_dump() for f in feedback_items]

    _grade_batches[batch_id].update({
        "feedback": [f.model_dump() for f in feedback_items],
        "status": "complete",
        "completed_at": datetime.utcnow().isoformat(),
    })

    logger.info("grade_batch_complete", batch_id=batch_id, count=len(feedback_items))


@router.get("/batch/{batch_id}", response_model=GradeBatchStatusResponse)
async def get_grade_batch_status(batch_id: str):
    """Get batch status and feedback results."""
    if batch_id not in _grade_batches:
        raise HTTPException(status_code=404, detail=f"Batch '{batch_id}' not found")

    batch = _grade_batches[batch_id]

    return GradeBatchStatusResponse(
        batch_id=batch["batch_id"],
        assignment_name=batch["assignment_name"],
        status=batch["status"],
        progress=batch.get("progress"),
        feedback=[FeedbackDraft(**f) for f in batch.get("feedback", [])],
        rubric_template_id=batch.get("rubric_template_id"),
    )


@router.put("/batch/{batch_id}/feedback", response_model=FeedbackEditResponse)
async def edit_feedback(batch_id: str, request: FeedbackEditRequest):
    """Update/approve feedback after teacher review."""
    if batch_id not in _grade_batches:
        raise HTTPException(status_code=404, detail=f"Batch '{batch_id}' not found")

    batch = _grade_batches[batch_id]

    found = False
    for feedback in batch.get("feedback", []):
        if feedback["student_id"] == request.student_id:
            feedback["draft_comment"] = request.draft_comment
            feedback["status"] = request.status
            feedback["word_count"] = len(request.draft_comment.split())
            found = True
            break

    if not found:
        raise HTTPException(status_code=404, detail=f"Student '{request.student_id}' not found in batch")

    updated_at = datetime.utcnow().isoformat()

    logger.info("feedback_edited", batch_id=batch_id, student_id=request.student_id, status=request.status)

    return FeedbackEditResponse(
        student_id=request.student_id,
        status=request.status,
        updated_at=updated_at,
    )


@router.get("/batch/{batch_id}/export")
async def export_grade_batch(
    batch_id: str,
    format: str = Query("txt", pattern="^(csv|json|txt)$"),
    approved_only: bool = False,
):
    """Export feedback in various formats."""
    if batch_id not in _grade_batches:
        raise HTTPException(status_code=404, detail=f"Batch '{batch_id}' not found")

    batch = _grade_batches[batch_id]
    feedback_items = batch.get("feedback", [])

    if approved_only:
        feedback_items = [f for f in feedback_items if f.get("status") == "approved"]

    if format == "csv":
        import csv
        import io

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["student_id", "feedback", "status", "word_count"])

        for f in feedback_items:
            writer.writerow([
                f["student_id"],
                f["draft_comment"],
                f["status"],
                f["word_count"],
            ])

        return PlainTextResponse(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={batch_id}.csv"}
        )

    elif format == "txt":
        lines = [
            f"=== {batch.get('assignment_name', 'Assignment')} — Feedback ===",
            "",
        ]
        for f in feedback_items:
            lines.append(f"[{f['student_id']}]")
            lines.append(f["draft_comment"])
            lines.append("")

        return PlainTextResponse(
            content="\n".join(lines),
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={batch_id}.txt"}
        )

    else:  # json
        return {
            "batch_id": batch_id,
            "assignment_name": batch.get("assignment_name"),
            "feedback": feedback_items,
            "exported_at": datetime.utcnow().isoformat(),
        }
