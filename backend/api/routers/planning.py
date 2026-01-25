"""
Planning Router

UbD-aligned lesson and unit planning.
"""

from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


# --- Schemas ---


class UnitConstraints(BaseModel):
    """Constraints for unit planning."""
    lab_days_per_week: int = 0
    materials_budget: str = "standard"  # limited, standard, flexible
    max_homework_minutes: int = 30


class UnitCreate(BaseModel):
    """Request to create a unit plan."""
    title: str
    grade: int
    subject: str
    duration_weeks: int
    standards: List[str]
    constraints: Optional[UnitConstraints] = None


class GRASPS(BaseModel):
    """GRASPS framework for performance task."""
    goal: str
    role: str
    audience: str
    situation: str
    product: str
    standards: str


class PerformanceTask(BaseModel):
    """Performance task definition."""
    grasps: GRASPS


class LessonOutline(BaseModel):
    """Outline of a lesson in the sequence."""
    lesson: int
    title: str
    type: str  # introduction, instruction, practice, assessment, lab
    activities: List[str]


class UnitResponse(BaseModel):
    """Response with unit plan."""
    unit_id: str
    title: str
    transfer_goals: List[str]
    essential_questions: List[str]
    performance_task: PerformanceTask
    lesson_sequence: List[LessonOutline]
    status: str


class LessonCreate(BaseModel):
    """Request to create a lesson plan."""
    unit_id: Optional[str] = None
    lesson_number: int = 1
    topic: str
    duration_minutes: int = 50
    format: str = "minimum_viable"  # minimum_viable, detailed, stretch


class LessonSection(BaseModel):
    """A section of a lesson plan."""
    duration: int
    activity: str
    key_points: List[str] = []


class LessonPlan(BaseModel):
    """Full lesson plan."""
    opening: LessonSection
    instruction: LessonSection
    practice: LessonSection
    closing: LessonSection


class LessonResponse(BaseModel):
    """Response with lesson plan."""
    lesson_id: str
    title: str
    learning_target: str
    plan: LessonPlan
    materials: List[str]
    differentiation_notes: str
    format: str


# --- Endpoints ---


@router.post("/unit", response_model=UnitResponse)
async def create_unit(request: UnitCreate):
    """
    Generate a unit plan scaffold.

    Creates a UbD-aligned unit with:
    - Transfer goals
    - Essential questions
    - Performance task (GRASPS)
    - Lesson sequence outline
    """
    # TODO: Implement with LLM
    # 1. Parse standards
    # 2. Generate transfer goals from standards
    # 3. Create essential questions
    # 4. Design performance task using GRASPS
    # 5. Outline lesson sequence

    return UnitResponse(
        unit_id="unit_placeholder",
        title=request.title,
        transfer_goals=[
            f"Students will apply understanding of {request.title.lower()} to real-world situations"
        ],
        essential_questions=[
            f"What is the significance of {request.title.lower()}?",
            "How can we apply this knowledge?",
        ],
        performance_task=PerformanceTask(
            grasps=GRASPS(
                goal="Demonstrate understanding through authentic application",
                role="Student as expert/practitioner",
                audience="Peers and teacher",
                situation="Real-world context to be determined",
                product="To be designed based on standards",
                standards=", ".join(request.standards),
            )
        ),
        lesson_sequence=[
            LessonOutline(
                lesson=1,
                title="Introduction",
                type="introduction",
                activities=["Hook activity", "Preview learning targets"],
            ),
        ],
        status="draft",
    )


@router.post("/lesson", response_model=LessonResponse)
async def create_lesson(request: LessonCreate):
    """
    Generate a single lesson plan.

    Formats:
    - minimum_viable: Essential elements only
    - detailed: Full plan with differentiation
    - stretch: Extended activities for early finishers
    """
    # TODO: Implement with LLM
    # 1. Determine lesson structure based on duration
    # 2. Generate activities aligned to topic
    # 3. Add formative checks
    # 4. Include differentiation notes

    return LessonResponse(
        lesson_id="lesson_placeholder",
        title=f"Lesson: {request.topic}",
        learning_target=f"I can explain and apply concepts related to {request.topic}",
        plan=LessonPlan(
            opening=LessonSection(
                duration=5,
                activity="Activating prior knowledge",
            ),
            instruction=LessonSection(
                duration=15,
                activity="Direct instruction with examples",
                key_points=["Key concept 1", "Key concept 2"],
            ),
            practice=LessonSection(
                duration=20,
                activity="Guided and independent practice",
            ),
            closing=LessonSection(
                duration=10,
                activity="Exit ticket and summary",
            ),
        ),
        materials=["To be determined based on activities"],
        differentiation_notes="Pending implementation - will include IEP/504 considerations",
        format=request.format,
    )


@router.get("/units", response_model=dict)
async def list_units():
    """
    List saved units.
    """
    # TODO: Retrieve stored units
    return {"units": []}


@router.get("/units/{unit_id}", response_model=UnitResponse)
async def get_unit(unit_id: str):
    """
    Get full unit details.
    """
    # TODO: Retrieve stored unit
    raise HTTPException(status_code=404, detail="Unit not found")
