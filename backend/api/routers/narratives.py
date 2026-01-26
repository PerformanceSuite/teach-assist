"""
Narratives Router

Semester narrative comment synthesis for student evaluations.
Generates FERPA-safe narrative comments grounded in IB criteria and teacher observations.
"""

import uuid
from datetime import datetime
from typing import Dict, List, Optional

import structlog
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field

from api.deps import get_anthropic_client, get_persona_store

logger = structlog.get_logger(__name__)

router = APIRouter()


# --- In-Memory Storage (v0.1) ---
# In production, this would be a database

_narrative_batches: Dict[str, dict] = {}


# --- IB MYP Science Criteria ---

IB_MYP_SCIENCE_CRITERIA = {
    "A_knowing": {
        "id": "A_knowing",
        "name": "Knowing and Understanding",
        "strand_i": "Describe scientific knowledge",
        "strand_ii": "Apply scientific knowledge to solve problems",
        "strand_iii": "Analyze and evaluate information",
        "max_score": 8,
    },
    "B_inquiring": {
        "id": "B_inquiring",
        "name": "Inquiring and Designing",
        "strand_i": "Describe a problem or question",
        "strand_ii": "Formulate a testable hypothesis",
        "strand_iii": "Design scientific investigations",
        "max_score": 8,
    },
    "C_processing": {
        "id": "C_processing",
        "name": "Processing and Evaluating",
        "strand_i": "Present collected and transformed data",
        "strand_ii": "Interpret data and explain results",
        "strand_iii": "Evaluate validity of hypothesis and method",
        "max_score": 8,
    },
    "D_reflecting": {
        "id": "D_reflecting",
        "name": "Reflecting on the Impacts of Science",
        "strand_i": "Summarize the ways science is applied",
        "strand_ii": "Describe and summarize implications",
        "strand_iii": "Apply communication modes effectively",
        "max_score": 8,
    },
}


# --- Schemas ---


class CriteriaScores(BaseModel):
    """IB MYP Science criteria scores (1-8 scale)."""
    A_knowing: Optional[int] = Field(None, ge=1, le=8)
    B_inquiring: Optional[int] = Field(None, ge=1, le=8)
    C_processing: Optional[int] = Field(None, ge=1, le=8)
    D_reflecting: Optional[int] = Field(None, ge=1, le=8)


class StudentData(BaseModel):
    """Data for a single student."""
    initials: str = Field(..., min_length=1, max_length=5, description="Student initials (FERPA-safe)")
    criteria_scores: CriteriaScores
    units_completed: List[str] = []
    observations: List[str] = Field(..., min_length=1, description="Teacher observations and notes")
    formative_trend: Optional[str] = Field(None, pattern="^(improving|consistent|declining)$")
    notable_work: Optional[str] = None


class SynthesizeOptions(BaseModel):
    """Options for narrative synthesis."""
    tone: str = Field("encouraging", pattern="^(encouraging|neutral|direct)$")
    include_growth_area: bool = True
    council_review: List[str] = []


class SynthesizeRequest(BaseModel):
    """Request to synthesize narrative comments."""
    class_name: str
    semester: str
    rubric_source_id: Optional[str] = None
    students: List[StudentData] = Field(..., min_length=1, max_length=50)
    options: SynthesizeOptions = SynthesizeOptions()


class NarrativeStructure(BaseModel):
    """Breakdown of narrative by sentence purpose."""
    achievement: str
    evidence: str
    growth: str
    outlook: str


class CouncilReviewResult(BaseModel):
    """Result from a council review."""
    approved: bool
    notes: str


class CriteriaSummary(BaseModel):
    """Summary of criteria performance."""
    strongest: str
    growth_area: str


class StudentNarrative(BaseModel):
    """Generated narrative for a student."""
    initials: str
    draft: str
    structure: NarrativeStructure
    criteria_summary: CriteriaSummary
    council_review: Dict[str, CouncilReviewResult] = {}
    word_count: int
    status: str = "ready_for_review"


class PatternDetected(BaseModel):
    """Cross-student pattern detected."""
    pattern: str
    description: str
    affected_students: List[str]
    suggestion: str


class SynthesizeResponse(BaseModel):
    """Response from narrative synthesis."""
    batch_id: str
    class_name: str
    semester: str
    narratives: List[StudentNarrative]
    patterns_detected: List[PatternDetected] = []
    processing_time_ms: int


class BatchSubmitResponse(BaseModel):
    """Response from batch submission."""
    batch_id: str
    student_count: int
    status: str
    estimated_time_seconds: int
    webhook_url: Optional[str] = None


class ClusterInfo(BaseModel):
    """Information about a student cluster."""
    cluster_id: str
    pattern: str
    student_initials: List[str]
    shared_growth_area: str


class BatchStatusResponse(BaseModel):
    """Response for batch status check."""
    batch_id: str
    status: str
    class_name: Optional[str] = None
    semester: Optional[str] = None
    progress: Optional[dict] = None
    narratives: List[StudentNarrative] = []
    clusters: List[ClusterInfo] = []
    patterns_detected: List[PatternDetected] = []
    council_summary: Dict[str, str] = {}


class EditRequest(BaseModel):
    """Request to edit a narrative."""
    initials: str
    edited_draft: str
    status: str = Field("approved", pattern="^(approved|needs_revision)$")


class EditResponse(BaseModel):
    """Response from editing a narrative."""
    initials: str
    status: str
    updated_at: str


class IBRubricRequest(BaseModel):
    """Request to load IB rubric."""
    grade_band: str = "MYP3"
    include_descriptors: bool = True


class IBRubricResponse(BaseModel):
    """Response with IB rubric loaded."""
    rubric_id: str
    criteria: List[dict]
    loaded: bool


# --- Narrative Generation Prompt ---

NARRATIVE_SYSTEM_PROMPT = """You are the Narrative Comment Synthesizer for TeachAssist, a teacher assistant tool.

Your goal is to help teachers draft professional student evaluations while ensuring the teacher retains full authority.

CORE CONSTRAINTS:
1. IDENTITY: Only use the provided student initials. Never use full names. This is required for FERPA/COPPA compliance.
2. PEDAGOGICAL ALIGNMENT: Ground feedback in the provided IB Science/Math rubrics and criteria.
3. TONE: {tone}. Avoid generic "great job" statements. Use evidence-based observations.
4. FORMAT: Output a 4-sentence narrative comment ready for the teacher to edit.

DRAFTING STRUCTURE:
- Sentence 1 (Achievement): Summarize a major strength or "transfer goal" met during the semester.
- Sentence 2 (Evidence): Cite a specific project, lab, or performance task provided in the observations.
- Sentence 3 (Growth): Identify one actionable area for development based on criteria scores.
- Sentence 4 (Outlook): A brief professional outlook for the next semester.

IB MYP CRITERIA REFERENCE:
- Criterion A (Knowing and Understanding): Scientific knowledge, application, analysis
- Criterion B (Inquiring and Designing): Questions, hypotheses, investigation design
- Criterion C (Processing and Evaluating): Data presentation, interpretation, evaluation
- Criterion D (Reflecting): Applications, implications, communication

OUTPUT FORMAT:
For each student, output a JSON object with:
{{
  "initials": "XX",
  "draft": "Full 4-sentence narrative here...",
  "structure": {{
    "achievement": "Sentence 1",
    "evidence": "Sentence 2",
    "growth": "Sentence 3",
    "outlook": "Sentence 4"
  }},
  "strongest_criterion": "criterion_id",
  "growth_criterion": "criterion_id"
}}
"""


# --- Helper Functions ---


def get_tone_description(tone: str) -> str:
    """Get tone description for the prompt."""
    tones = {
        "encouraging": "Professional, encouraging, and specific. Highlight strengths while framing growth areas as opportunities.",
        "neutral": "Professional and objective. Present observations and growth areas directly without excessive praise.",
        "direct": "Professional and straightforward. Focus on evidence and actionable next steps."
    }
    return tones.get(tone, tones["encouraging"])


def identify_strongest_and_growth(scores: CriteriaScores) -> tuple:
    """Identify the strongest criterion and area for growth."""
    score_dict = {
        "A_knowing": scores.A_knowing or 0,
        "B_inquiring": scores.B_inquiring or 0,
        "C_processing": scores.C_processing or 0,
        "D_reflecting": scores.D_reflecting or 0,
    }

    # Filter out zeros
    valid_scores = {k: v for k, v in score_dict.items() if v > 0}

    if not valid_scores:
        return "A_knowing", "D_reflecting"  # Default

    strongest = max(valid_scores, key=valid_scores.get)
    growth = min(valid_scores, key=valid_scores.get)

    return strongest, growth


def detect_patterns(students: List[StudentData]) -> List[PatternDetected]:
    """Detect cross-student patterns from the data."""
    patterns = []

    # Check for common growth areas
    growth_areas = {}
    for student in students:
        _, growth = identify_strongest_and_growth(student.criteria_scores)
        if growth not in growth_areas:
            growth_areas[growth] = []
        growth_areas[growth].append(student.initials)

    # Report patterns where 3+ students share a growth area
    for criterion, initials in growth_areas.items():
        if len(initials) >= 3:
            criterion_name = IB_MYP_SCIENCE_CRITERIA.get(criterion, {}).get("name", criterion)
            patterns.append(PatternDetected(
                pattern=f"{criterion}_growth",
                description=f"Multiple students show growth area in {criterion_name}",
                affected_students=initials,
                suggestion=f"Consider adding explicit {criterion_name.lower()} scaffolds in the next semester"
            ))

    # Check for formative trends
    trend_counts = {"improving": [], "declining": [], "consistent": []}
    for student in students:
        if student.formative_trend:
            trend_counts[student.formative_trend].append(student.initials)

    if len(trend_counts["declining"]) >= 2:
        patterns.append(PatternDetected(
            pattern="declining_trend",
            description="Multiple students showing declining formative trends",
            affected_students=trend_counts["declining"],
            suggestion="Review pacing and scaffolding for these students"
        ))

    return patterns


async def generate_narrative_with_llm(
    student: StudentData,
    class_name: str,
    semester: str,
    tone: str,
    client,
) -> StudentNarrative:
    """Generate a narrative for a single student using the LLM."""

    strongest, growth = identify_strongest_and_growth(student.criteria_scores)
    strongest_name = IB_MYP_SCIENCE_CRITERIA.get(strongest, {}).get("name", strongest)
    growth_name = IB_MYP_SCIENCE_CRITERIA.get(growth, {}).get("name", growth)

    # Build the user message
    user_message = f"""
Generate a narrative comment for this student:

CLASS: {class_name}
SEMESTER: {semester}
STUDENT INITIALS: {student.initials}

CRITERIA SCORES (1-8 scale):
- Criterion A (Knowing): {student.criteria_scores.A_knowing or 'Not assessed'}
- Criterion B (Inquiring): {student.criteria_scores.B_inquiring or 'Not assessed'}
- Criterion C (Processing): {student.criteria_scores.C_processing or 'Not assessed'}
- Criterion D (Reflecting): {student.criteria_scores.D_reflecting or 'Not assessed'}

STRONGEST AREA: {strongest_name}
GROWTH AREA: {growth_name}

UNITS COMPLETED: {', '.join(student.units_completed) if student.units_completed else 'Not specified'}

TEACHER OBSERVATIONS:
{chr(10).join('- ' + obs for obs in student.observations)}

NOTABLE WORK: {student.notable_work or 'Not specified'}

FORMATIVE TREND: {student.formative_trend or 'Not specified'}

Please generate a 4-sentence narrative comment following the structure guidelines.
Return ONLY the JSON object, no other text.
"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            temperature=0.4,
            system=NARRATIVE_SYSTEM_PROMPT.format(tone=get_tone_description(tone)),
            messages=[{"role": "user", "content": user_message}],
        )

        response_text = response.content[0].text.strip()

        # Try to parse JSON from response
        import json

        # Handle potential markdown code blocks
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]

        try:
            parsed = json.loads(response_text)
        except json.JSONDecodeError:
            # If JSON parsing fails, extract the draft text
            logger.warning("narrative_json_parse_failed", initials=student.initials)
            parsed = {
                "draft": response_text,
                "structure": {
                    "achievement": "",
                    "evidence": "",
                    "growth": "",
                    "outlook": ""
                }
            }

        draft = parsed.get("draft", response_text)
        structure = parsed.get("structure", {})

        return StudentNarrative(
            initials=student.initials,
            draft=draft,
            structure=NarrativeStructure(
                achievement=structure.get("achievement", ""),
                evidence=structure.get("evidence", ""),
                growth=structure.get("growth", ""),
                outlook=structure.get("outlook", ""),
            ),
            criteria_summary=CriteriaSummary(
                strongest=parsed.get("strongest_criterion", strongest),
                growth_area=parsed.get("growth_criterion", growth),
            ),
            word_count=len(draft.split()),
            status="ready_for_review",
        )

    except Exception as e:
        logger.error("narrative_generation_failed", initials=student.initials, error=str(e))

        # Return a placeholder narrative
        return StudentNarrative(
            initials=student.initials,
            draft=f"[Error generating narrative for {student.initials}: {str(e)}]",
            structure=NarrativeStructure(
                achievement="",
                evidence="",
                growth="",
                outlook="",
            ),
            criteria_summary=CriteriaSummary(
                strongest=strongest,
                growth_area=growth,
            ),
            word_count=0,
            status="error",
        )


async def review_narrative_with_council(
    narrative: StudentNarrative,
    persona_name: str,
) -> CouncilReviewResult:
    """Have a council persona review a narrative."""
    store = get_persona_store()
    client = get_anthropic_client()

    if not client:
        return CouncilReviewResult(
            approved=True,
            notes="Council review skipped - no API key configured"
        )

    try:
        persona = store.get(persona_name)
    except FileNotFoundError:
        return CouncilReviewResult(
            approved=True,
            notes=f"Persona '{persona_name}' not found"
        )

    review_prompt = f"""
Review this student narrative comment for a {persona.display_name} perspective.

NARRATIVE:
{narrative.draft}

Check for:
- Growth-oriented language (not deficit framing)
- Specific and actionable feedback
- Professional tone
- FERPA compliance (no identifying information beyond initials)

Respond with:
- APPROVED or NEEDS_REVISION
- Brief notes (1-2 sentences) explaining your assessment
"""

    try:
        response = client.messages.create(
            model=persona.model,
            max_tokens=256,
            temperature=0.2,
            system=persona.system_prompt,
            messages=[{"role": "user", "content": review_prompt}],
        )

        review_text = response.content[0].text.strip()
        approved = "APPROVED" in review_text.upper() and "NEEDS_REVISION" not in review_text.upper()

        return CouncilReviewResult(
            approved=approved,
            notes=review_text.replace("APPROVED", "").replace("NEEDS_REVISION", "").strip()[:200]
        )

    except Exception as e:
        logger.error("council_review_failed", persona=persona_name, error=str(e))
        return CouncilReviewResult(
            approved=True,
            notes=f"Review error: {str(e)}"
        )


# --- Endpoints ---


@router.post("/synthesize", response_model=SynthesizeResponse)
async def synthesize_narratives(request: SynthesizeRequest):
    """
    Generate narrative comments for one or more students (sync).

    Best for 1-10 students. For larger batches, use POST /batch.
    """
    import time
    start_time = time.time()

    client = get_anthropic_client()

    if not client:
        raise HTTPException(
            status_code=503,
            detail="LLM service not available. Please configure ANTHROPIC_API_KEY.",
        )

    if len(request.students) > 10:
        raise HTTPException(
            status_code=400,
            detail="Too many students for sync processing. Use POST /batch for 10+ students.",
        )

    narratives = []

    for student in request.students:
        # Generate narrative
        narrative = await generate_narrative_with_llm(
            student=student,
            class_name=request.class_name,
            semester=request.semester,
            tone=request.options.tone,
            client=client,
        )

        # Council review if requested
        if request.options.council_review:
            for persona_name in request.options.council_review:
                review = await review_narrative_with_council(narrative, persona_name)
                narrative.council_review[persona_name] = review

                if not review.approved:
                    narrative.status = "needs_attention"

        narratives.append(narrative)

    # Detect patterns across students
    patterns = detect_patterns(request.students)

    batch_id = f"narr_{uuid.uuid4().hex[:12]}"
    processing_time = int((time.time() - start_time) * 1000)

    # Store for potential later retrieval
    _narrative_batches[batch_id] = {
        "batch_id": batch_id,
        "class_name": request.class_name,
        "semester": request.semester,
        "narratives": [n.model_dump() for n in narratives],
        "patterns_detected": [p.model_dump() for p in patterns],
        "status": "complete",
        "created_at": datetime.utcnow().isoformat(),
    }

    logger.info(
        "narratives_synthesized",
        batch_id=batch_id,
        student_count=len(narratives),
        processing_time_ms=processing_time,
    )

    return SynthesizeResponse(
        batch_id=batch_id,
        class_name=request.class_name,
        semester=request.semester,
        narratives=narratives,
        patterns_detected=patterns,
        processing_time_ms=processing_time,
    )


@router.post("/batch", response_model=BatchSubmitResponse)
async def submit_batch(request: SynthesizeRequest):
    """
    Submit a larger batch (10+ students) for async processing.

    Use GET /batch/{batch_id} to check status and retrieve results.
    """
    batch_id = f"narr_batch_{uuid.uuid4().hex[:12]}"

    # Store the request for async processing
    _narrative_batches[batch_id] = {
        "batch_id": batch_id,
        "class_name": request.class_name,
        "semester": request.semester,
        "request": request.model_dump(),
        "narratives": [],
        "patterns_detected": [],
        "clusters": [],
        "status": "processing",
        "progress": {"completed": 0, "total": len(request.students)},
        "created_at": datetime.utcnow().isoformat(),
    }

    # In a real implementation, this would queue async processing
    # For v0.1, we'll process synchronously but return immediately
    # and update status as we go

    # Start background processing (simplified for v0.1)
    import asyncio
    asyncio.create_task(_process_batch_async(batch_id, request))

    estimated_seconds = len(request.students) * 3  # ~3 seconds per student

    logger.info(
        "batch_submitted",
        batch_id=batch_id,
        student_count=len(request.students),
    )

    return BatchSubmitResponse(
        batch_id=batch_id,
        student_count=len(request.students),
        status="processing",
        estimated_time_seconds=estimated_seconds,
    )


async def _process_batch_async(batch_id: str, request: SynthesizeRequest):
    """Process a batch asynchronously."""
    client = get_anthropic_client()

    if not client:
        _narrative_batches[batch_id]["status"] = "error"
        _narrative_batches[batch_id]["error"] = "No API key configured"
        return

    narratives = []

    for i, student in enumerate(request.students):
        narrative = await generate_narrative_with_llm(
            student=student,
            class_name=request.class_name,
            semester=request.semester,
            tone=request.options.tone,
            client=client,
        )

        # Council review if requested
        if request.options.council_review:
            for persona_name in request.options.council_review:
                review = await review_narrative_with_council(narrative, persona_name)
                narrative.council_review[persona_name] = review

                if not review.approved:
                    narrative.status = "needs_attention"

        narratives.append(narrative)

        # Update progress
        _narrative_batches[batch_id]["progress"]["completed"] = i + 1
        _narrative_batches[batch_id]["narratives"] = [n.model_dump() for n in narratives]

    # Detect patterns and clusters
    patterns = detect_patterns(request.students)

    # Create clusters based on growth areas
    clusters = []
    growth_groups = {}
    for narrative in narratives:
        growth = narrative.criteria_summary.growth_area
        if growth not in growth_groups:
            growth_groups[growth] = []
        growth_groups[growth].append(narrative.initials)

    for growth_area, initials in growth_groups.items():
        if len(initials) >= 2:
            growth_name = IB_MYP_SCIENCE_CRITERIA.get(growth_area, {}).get("name", growth_area)
            clusters.append(ClusterInfo(
                cluster_id=f"cluster_{growth_area}",
                pattern=f"Shared growth area: {growth_name}",
                student_initials=initials,
                shared_growth_area=growth_area,
            ))

    # Build council summary
    council_summary = {}
    if request.options.council_review:
        for persona_name in request.options.council_review:
            approved_count = sum(
                1 for n in narratives
                if persona_name in n.council_review and n.council_review[persona_name].approved
            )
            flagged_count = len(narratives) - approved_count
            council_summary[persona_name] = f"Reviewed {len(narratives)} narratives. {flagged_count} flagged for revision."

    # Update batch status
    _narrative_batches[batch_id].update({
        "narratives": [n.model_dump() for n in narratives],
        "patterns_detected": [p.model_dump() for p in patterns],
        "clusters": [c.model_dump() for c in clusters],
        "council_summary": council_summary,
        "status": "complete",
        "completed_at": datetime.utcnow().isoformat(),
    })

    logger.info(
        "batch_complete",
        batch_id=batch_id,
        student_count=len(narratives),
        clusters_found=len(clusters),
    )


@router.get("/batch/{batch_id}", response_model=BatchStatusResponse)
async def get_batch_status(batch_id: str):
    """
    Check batch status and retrieve results.
    """
    if batch_id not in _narrative_batches:
        raise HTTPException(status_code=404, detail=f"Batch '{batch_id}' not found")

    batch = _narrative_batches[batch_id]

    return BatchStatusResponse(
        batch_id=batch["batch_id"],
        status=batch["status"],
        class_name=batch.get("class_name"),
        semester=batch.get("semester"),
        progress=batch.get("progress"),
        narratives=[StudentNarrative(**n) for n in batch.get("narratives", [])],
        clusters=[ClusterInfo(**c) for c in batch.get("clusters", [])],
        patterns_detected=[PatternDetected(**p) for p in batch.get("patterns_detected", [])],
        council_summary=batch.get("council_summary", {}),
    )


@router.put("/batch/{batch_id}/edit", response_model=EditResponse)
async def edit_narrative(batch_id: str, request: EditRequest):
    """
    Update a narrative draft after teacher review.
    """
    if batch_id not in _narrative_batches:
        raise HTTPException(status_code=404, detail=f"Batch '{batch_id}' not found")

    batch = _narrative_batches[batch_id]

    # Find and update the narrative
    found = False
    for narrative in batch.get("narratives", []):
        if narrative["initials"] == request.initials:
            narrative["draft"] = request.edited_draft
            narrative["status"] = request.status
            narrative["word_count"] = len(request.edited_draft.split())
            found = True
            break

    if not found:
        raise HTTPException(
            status_code=404,
            detail=f"Student '{request.initials}' not found in batch"
        )

    updated_at = datetime.utcnow().isoformat()

    logger.info(
        "narrative_edited",
        batch_id=batch_id,
        initials=request.initials,
        status=request.status,
    )

    return EditResponse(
        initials=request.initials,
        status=request.status,
        updated_at=updated_at,
    )


@router.get("/batch/{batch_id}/export")
async def export_narratives(
    batch_id: str,
    format: str = Query("csv", pattern="^(csv|json|txt)$"),
    include_approved_only: bool = False,
):
    """
    Export narratives for ISAMS or other systems.

    Formats:
    - csv: Standard CSV with initials, narrative, status, word_count
    - json: Full JSON response
    - txt: Plain text for direct paste into ISAMS
    """
    if batch_id not in _narrative_batches:
        raise HTTPException(status_code=404, detail=f"Batch '{batch_id}' not found")

    batch = _narrative_batches[batch_id]
    narratives = batch.get("narratives", [])

    if include_approved_only:
        narratives = [n for n in narratives if n.get("status") == "approved"]

    if format == "csv":
        import csv
        import io

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["initials", "narrative", "status", "word_count"])

        for n in narratives:
            writer.writerow([
                n["initials"],
                n["draft"],
                n["status"],
                n["word_count"],
            ])

        return PlainTextResponse(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={batch_id}.csv"}
        )

    elif format == "txt":
        lines = [f"=== {batch.get('class_name', 'Class')} - {batch.get('semester', 'Semester')} Narrative Comments ===", ""]

        for n in narratives:
            lines.append(f"[{n['initials']}]")
            lines.append(n["draft"])
            lines.append("")

        return PlainTextResponse(
            content="\n".join(lines),
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={batch_id}.txt"}
        )

    else:  # json
        return {
            "batch_id": batch_id,
            "class_name": batch.get("class_name"),
            "semester": batch.get("semester"),
            "narratives": narratives,
            "exported_at": datetime.utcnow().isoformat(),
        }


@router.post("/rubric/ib-science", response_model=IBRubricResponse)
async def load_ib_science_rubric(request: IBRubricRequest):
    """
    Load standard IB MYP Science criteria into context.

    This provides the criteria definitions used for narrative synthesis.
    """
    criteria = list(IB_MYP_SCIENCE_CRITERIA.values())

    if not request.include_descriptors:
        # Remove strand details if not requested
        criteria = [
            {k: v for k, v in c.items() if not k.startswith("strand_")}
            for c in criteria
        ]

    logger.info(
        "ib_rubric_loaded",
        grade_band=request.grade_band,
        criteria_count=len(criteria),
    )

    return IBRubricResponse(
        rubric_id=f"ib_{request.grade_band.lower()}_science",
        criteria=criteria,
        loaded=True,
    )
