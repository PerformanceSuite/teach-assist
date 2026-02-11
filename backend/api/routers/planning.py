"""
Planning Router

UbD-aligned lesson and unit planning with LLM generation.
"""

import json
import re
from typing import List, Optional

import structlog
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from api.deps import get_anthropic_client, get_knowledge_engine
from libs.student_store import StudentStore
from libs.planning_store import (
    PlanningStore,
    Unit,
    Lesson,
    LessonPlan as StoreLessonPlan,
    LessonSection as StoreLessonSection,
    LessonOutline as StoreLessonOutline,
    PerformanceTask as StorePerformanceTask,
    GRASPS as StoreGRASPS,
)

logger = structlog.get_logger(__name__)

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
    student_ids: Optional[List[str]] = None  # Selected student IDs for personalization


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


class UnitListItem(BaseModel):
    """Item in unit list."""
    unit_id: str
    title: str
    grade: int
    subject: str
    duration_weeks: int
    status: str
    created_at: str
    updated_at: str


class LessonListItem(BaseModel):
    """Item in lesson list."""
    lesson_id: str
    topic: str
    unit_id: Optional[str]
    lesson_number: int
    duration_minutes: int
    status: str
    created_at: str


# --- LLM Prompts ---


UBD_UNIT_PROMPT = """You are an expert curriculum designer using Understanding by Design (UbD) framework.

Create a complete unit plan for a {grade}th grade {subject} unit titled "{title}" that spans {duration_weeks} weeks.

STANDARDS TO ADDRESS:
{standards}

{constraints_text}

RELEVANT CURRICULUM CONTEXT:
{curriculum_context}

Generate a UbD-aligned unit plan with the following components:

1. TRANSFER GOALS (2-3): What should students be able to independently do with their learning in new situations?

2. ESSENTIAL QUESTIONS (2-4): Open-ended questions that stimulate thought, provoke inquiry, and spark more questions.

3. PERFORMANCE TASK using GRASPS framework:
   - Goal: What is the task/goal?
   - Role: What role does the student take?
   - Audience: Who is the target audience?
   - Situation: What is the context/scenario?
   - Product: What will students create?
   - Standards: Which standards does this assess?

4. LESSON SEQUENCE: Outline {num_lessons} lessons for the unit.
   For each lesson provide:
   - Lesson number
   - Title
   - Type (introduction, instruction, practice, assessment, lab)
   - 2-3 key activities

Respond in JSON format:
{{
    "transfer_goals": ["goal1", "goal2"],
    "essential_questions": ["question1", "question2"],
    "performance_task": {{
        "grasps": {{
            "goal": "...",
            "role": "...",
            "audience": "...",
            "situation": "...",
            "product": "...",
            "standards": "..."
        }}
    }},
    "lesson_sequence": [
        {{
            "lesson": 1,
            "title": "...",
            "type": "introduction",
            "activities": ["activity1", "activity2"]
        }}
    ]
}}
"""


LESSON_PLAN_PROMPT = """You are an expert teacher creating a detailed lesson plan.

Create a {format_description} lesson plan for:
- Topic: {topic}
- Duration: {duration_minutes} minutes
- Lesson number: {lesson_number}
{unit_context}

{student_context}

{curriculum_context}

Generate a lesson plan with the following structure:

1. LEARNING TARGET: A clear, measurable statement starting with "I can..."

2. LESSON PLAN with 4 sections (total time = {duration_minutes} minutes):
   - Opening ({opening_time} min): Hook/activating prior knowledge
   - Instruction ({instruction_time} min): Direct teaching with examples
   - Practice ({practice_time} min): Guided and independent practice
   - Closing ({closing_time} min): Exit ticket and summary

   For each section provide:
   - Duration in minutes
   - Main activity description
   - 2-3 key points to cover

3. MATERIALS: List of required materials

4. DIFFERENTIATION NOTES: How to support diverse learners
{differentiation_guidance}

Respond in JSON format:
{{
    "learning_target": "I can...",
    "plan": {{
        "opening": {{
            "duration": {opening_time},
            "activity": "...",
            "key_points": ["point1", "point2"]
        }},
        "instruction": {{
            "duration": {instruction_time},
            "activity": "...",
            "key_points": ["point1", "point2"]
        }},
        "practice": {{
            "duration": {practice_time},
            "activity": "...",
            "key_points": ["point1", "point2"]
        }},
        "closing": {{
            "duration": {closing_time},
            "activity": "...",
            "key_points": ["point1", "point2"]
        }}
    }},
    "materials": ["material1", "material2"],
    "differentiation_notes": "..."
}}
"""


# --- Helper Functions ---


def extract_json_from_response(text: str) -> dict:
    """Extract JSON from LLM response, handling markdown code blocks."""
    # Try to find JSON in code blocks first
    code_block_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if code_block_match:
        json_str = code_block_match.group(1)
    else:
        # Try to find raw JSON
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            json_str = json_match.group(0)
        else:
            raise ValueError("No JSON found in response")

    return json.loads(json_str)


def calculate_lesson_timings(duration_minutes: int) -> dict:
    """Calculate section timings based on total duration."""
    if duration_minutes <= 30:
        return {"opening": 3, "instruction": 10, "practice": 12, "closing": 5}
    elif duration_minutes <= 50:
        return {"opening": 5, "instruction": 15, "practice": 20, "closing": 10}
    else:
        return {"opening": 8, "instruction": 20, "practice": 30, "closing": 12}


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
    client = get_anthropic_client()
    kb = get_knowledge_engine()
    planning_store = PlanningStore()

    if not client:
        raise HTTPException(
            status_code=503,
            detail="LLM service not available. Please configure ANTHROPIC_API_KEY.",
        )

    # Query knowledge base for relevant curriculum context
    curriculum_context = "(No curriculum sources available.)"
    if kb:
        try:
            query = f"{request.subject} grade {request.grade} {request.title} {' '.join(request.standards)}"
            results = await kb.search(query, mode="hybrid", top_k=5)

            if results:
                context_parts = []
                for result in results:
                    if isinstance(result, tuple):
                        doc_name, content = result[0], result[1]
                    elif isinstance(result, dict):
                        doc_name = result.get("name", "unknown")
                        content = result.get("content", "")
                    else:
                        continue
                    context_parts.append(f"[{doc_name}]: {content[:500]}...")

                if context_parts:
                    curriculum_context = "\n\n".join(context_parts)
        except Exception as e:
            logger.warning("knowledge_query_failed", error=str(e))

    # Build constraints text
    constraints_text = ""
    if request.constraints:
        constraints_text = f"""
CONSTRAINTS:
- Lab days per week: {request.constraints.lab_days_per_week}
- Materials budget: {request.constraints.materials_budget}
- Max homework minutes: {request.constraints.max_homework_minutes}
"""

    # Calculate number of lessons (roughly 3-4 per week)
    num_lessons = request.duration_weeks * 4

    # Generate unit plan using Claude
    try:
        prompt = UBD_UNIT_PROMPT.format(
            grade=request.grade,
            subject=request.subject,
            title=request.title,
            duration_weeks=request.duration_weeks,
            standards="\n".join(f"- {s}" for s in request.standards),
            constraints_text=constraints_text,
            curriculum_context=curriculum_context,
            num_lessons=num_lessons,
        )

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            temperature=0.4,
            system="You are an expert curriculum designer. Always respond with valid JSON.",
            messages=[{"role": "user", "content": prompt}],
        )

        result_text = response.content[0].text
        result_data = extract_json_from_response(result_text)

        logger.info(
            "unit_plan_generated",
            title=request.title,
            lessons_count=len(result_data.get("lesson_sequence", [])),
        )

    except json.JSONDecodeError as e:
        logger.error("unit_json_parse_failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to parse unit plan response. Please try again.",
        )
    except Exception as e:
        logger.error("unit_generation_failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate unit plan: {str(e)}",
        )

    # Convert lesson sequence to store format
    lesson_sequence = []
    for ls in result_data.get("lesson_sequence", []):
        lesson_sequence.append(StoreLessonOutline(
            lesson=ls.get("lesson", 0),
            title=ls.get("title", ""),
            type=ls.get("type", "instruction"),
            activities=ls.get("activities", []),
        ))

    # Convert performance task to store format
    grasps_data = result_data.get("performance_task", {}).get("grasps", {})
    performance_task = StorePerformanceTask(
        grasps=StoreGRASPS(
            goal=grasps_data.get("goal", ""),
            role=grasps_data.get("role", ""),
            audience=grasps_data.get("audience", ""),
            situation=grasps_data.get("situation", ""),
            product=grasps_data.get("product", ""),
            standards=grasps_data.get("standards", ""),
        )
    )

    # Save to PlanningStore
    unit = planning_store.create_unit(
        title=request.title,
        grade=request.grade,
        subject=request.subject,
        duration_weeks=request.duration_weeks,
        standards=request.standards,
        transfer_goals=result_data.get("transfer_goals", []),
        essential_questions=result_data.get("essential_questions", []),
        performance_task=performance_task,
        lesson_sequence=lesson_sequence,
        status="draft",
    )

    # Build response
    return UnitResponse(
        unit_id=unit.id,
        title=unit.title,
        transfer_goals=unit.transfer_goals,
        essential_questions=unit.essential_questions,
        performance_task=PerformanceTask(
            grasps=GRASPS(
                goal=performance_task.grasps.goal,
                role=performance_task.grasps.role,
                audience=performance_task.grasps.audience,
                situation=performance_task.grasps.situation,
                product=performance_task.grasps.product,
                standards=performance_task.grasps.standards,
            )
        ),
        lesson_sequence=[
            LessonOutline(
                lesson=ls.lesson,
                title=ls.title,
                type=ls.type,
                activities=ls.activities,
            )
            for ls in lesson_sequence
        ],
        status=unit.status,
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
    client = get_anthropic_client()
    kb = get_knowledge_engine()
    planning_store = PlanningStore()

    if not client:
        raise HTTPException(
            status_code=503,
            detail="LLM service not available. Please configure ANTHROPIC_API_KEY.",
        )

    # Calculate section timings
    timings = calculate_lesson_timings(request.duration_minutes)

    # Format description based on format type
    format_descriptions = {
        "minimum_viable": "concise, essential-elements-only",
        "detailed": "comprehensive with full differentiation strategies",
        "stretch": "detailed with extension activities for early finishers",
    }
    format_description = format_descriptions.get(request.format, "standard")

    # Build unit context if unit_id provided
    unit_context = ""
    if request.unit_id:
        try:
            unit = planning_store.get_unit(request.unit_id)
            unit_context = f"""
UNIT CONTEXT:
- Unit: {unit.title}
- Grade: {unit.grade}
- Subject: {unit.subject}
- Essential Questions: {', '.join(unit.essential_questions)}
"""
        except FileNotFoundError:
            logger.warning("unit_not_found", unit_id=request.unit_id)

    # Build student personalization context
    student_context = ""
    differentiation_guidance = ""
    if request.student_ids:
        student_store = StudentStore()
        students = student_store.get_many(request.student_ids)

        if students:
            student_lines = []
            accommodations_set = set()
            interests_set = set()

            for student in students:
                interests_str = ", ".join(student.interests) if student.interests else "not specified"
                accommodations_str = ", ".join(student.accommodations) if student.accommodations else None

                line = f"- {student.name} (interests: {interests_str})"
                if accommodations_str:
                    line += f" [accommodations: {accommodations_str}]"
                    accommodations_set.update(student.accommodations)
                student_lines.append(line)
                interests_set.update(student.interests)

            student_context = f"""
STUDENT PERSONALIZATION:
The lesson should be personalized for these students:
{chr(10).join(student_lines)}
"""

            if accommodations_set:
                differentiation_guidance = f"""
Include specific strategies for these accommodations: {', '.join(accommodations_set)}
Consider incorporating these student interests where appropriate: {', '.join(list(interests_set)[:5])}
"""

            logger.info(
                "student_personalization_added",
                student_count=len(students),
                accommodations=list(accommodations_set),
            )

    # Query knowledge base for relevant curriculum context
    curriculum_context = ""
    if kb:
        try:
            query = f"{request.topic}"
            results = await kb.search(query, mode="hybrid", top_k=3)

            if results:
                context_parts = []
                for result in results:
                    if isinstance(result, tuple):
                        doc_name, content = result[0], result[1]
                    elif isinstance(result, dict):
                        doc_name = result.get("name", "unknown")
                        content = result.get("content", "")
                    else:
                        continue
                    context_parts.append(f"[{doc_name}]: {content[:300]}...")

                if context_parts:
                    curriculum_context = f"""
RELEVANT CURRICULUM MATERIALS:
{chr(10).join(context_parts)}
"""
        except Exception as e:
            logger.warning("knowledge_query_failed", error=str(e))

    # Generate lesson plan using Claude
    try:
        prompt = LESSON_PLAN_PROMPT.format(
            format_description=format_description,
            topic=request.topic,
            duration_minutes=request.duration_minutes,
            lesson_number=request.lesson_number,
            unit_context=unit_context,
            student_context=student_context,
            curriculum_context=curriculum_context,
            opening_time=timings["opening"],
            instruction_time=timings["instruction"],
            practice_time=timings["practice"],
            closing_time=timings["closing"],
            differentiation_guidance=differentiation_guidance,
        )

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            temperature=0.4,
            system="You are an expert teacher and curriculum designer. Always respond with valid JSON.",
            messages=[{"role": "user", "content": prompt}],
        )

        result_text = response.content[0].text
        result_data = extract_json_from_response(result_text)

        logger.info(
            "lesson_plan_generated",
            topic=request.topic,
            format=request.format,
        )

    except json.JSONDecodeError as e:
        logger.error("lesson_json_parse_failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to parse lesson plan response. Please try again.",
        )
    except Exception as e:
        logger.error("lesson_generation_failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate lesson plan: {str(e)}",
        )

    # Convert plan to store format
    plan_data = result_data.get("plan", {})
    store_plan = StoreLessonPlan(
        opening=StoreLessonSection(
            duration=plan_data.get("opening", {}).get("duration", timings["opening"]),
            activity=plan_data.get("opening", {}).get("activity", ""),
            key_points=plan_data.get("opening", {}).get("key_points", []),
        ),
        instruction=StoreLessonSection(
            duration=plan_data.get("instruction", {}).get("duration", timings["instruction"]),
            activity=plan_data.get("instruction", {}).get("activity", ""),
            key_points=plan_data.get("instruction", {}).get("key_points", []),
        ),
        practice=StoreLessonSection(
            duration=plan_data.get("practice", {}).get("duration", timings["practice"]),
            activity=plan_data.get("practice", {}).get("activity", ""),
            key_points=plan_data.get("practice", {}).get("key_points", []),
        ),
        closing=StoreLessonSection(
            duration=plan_data.get("closing", {}).get("duration", timings["closing"]),
            activity=plan_data.get("closing", {}).get("activity", ""),
            key_points=plan_data.get("closing", {}).get("key_points", []),
        ),
    )

    # Save to PlanningStore
    lesson = planning_store.create_lesson(
        topic=request.topic,
        unit_id=request.unit_id,
        lesson_number=request.lesson_number,
        duration_minutes=request.duration_minutes,
        learning_target=result_data.get("learning_target", ""),
        plan=store_plan,
        materials=result_data.get("materials", []),
        differentiation_notes=result_data.get("differentiation_notes", ""),
        format=request.format,
        status="draft",
    )

    # Build response
    return LessonResponse(
        lesson_id=lesson.id,
        title=f"Lesson {lesson.lesson_number}: {lesson.topic}",
        learning_target=lesson.learning_target,
        plan=LessonPlan(
            opening=LessonSection(
                duration=store_plan.opening.duration,
                activity=store_plan.opening.activity,
                key_points=store_plan.opening.key_points,
            ),
            instruction=LessonSection(
                duration=store_plan.instruction.duration,
                activity=store_plan.instruction.activity,
                key_points=store_plan.instruction.key_points,
            ),
            practice=LessonSection(
                duration=store_plan.practice.duration,
                activity=store_plan.practice.activity,
                key_points=store_plan.practice.key_points,
            ),
            closing=LessonSection(
                duration=store_plan.closing.duration,
                activity=store_plan.closing.activity,
                key_points=store_plan.closing.key_points,
            ),
        ),
        materials=lesson.materials,
        differentiation_notes=lesson.differentiation_notes,
        format=lesson.format,
    )


@router.get("/units", response_model=dict)
async def list_units():
    """
    List saved units.
    """
    planning_store = PlanningStore()
    units = planning_store.list_units()

    return {
        "units": [
            UnitListItem(
                unit_id=u.id,
                title=u.title,
                grade=u.grade,
                subject=u.subject,
                duration_weeks=u.duration_weeks,
                status=u.status,
                created_at=u.created_at,
                updated_at=u.updated_at,
            ).model_dump()
            for u in units
        ],
        "count": len(units),
    }


@router.get("/units/{unit_id}", response_model=UnitResponse)
async def get_unit(unit_id: str):
    """
    Get full unit details.
    """
    planning_store = PlanningStore()

    try:
        unit = planning_store.get_unit(unit_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Unit not found")

    # Build response
    performance_task = unit.performance_task
    return UnitResponse(
        unit_id=unit.id,
        title=unit.title,
        transfer_goals=unit.transfer_goals,
        essential_questions=unit.essential_questions,
        performance_task=PerformanceTask(
            grasps=GRASPS(
                goal=performance_task.grasps.goal if performance_task else "",
                role=performance_task.grasps.role if performance_task else "",
                audience=performance_task.grasps.audience if performance_task else "",
                situation=performance_task.grasps.situation if performance_task else "",
                product=performance_task.grasps.product if performance_task else "",
                standards=performance_task.grasps.standards if performance_task else "",
            )
        ),
        lesson_sequence=[
            LessonOutline(
                lesson=ls.lesson,
                title=ls.title,
                type=ls.type,
                activities=ls.activities,
            )
            for ls in unit.lesson_sequence
        ],
        status=unit.status,
    )


@router.delete("/units/{unit_id}")
async def delete_unit(unit_id: str):
    """
    Delete a unit.
    """
    planning_store = PlanningStore()

    if not planning_store.delete_unit(unit_id):
        raise HTTPException(status_code=404, detail="Unit not found")

    return {"message": "Unit deleted", "unit_id": unit_id}


@router.get("/lessons", response_model=dict)
async def list_lessons(unit_id: Optional[str] = None):
    """
    List saved lessons, optionally filtered by unit.
    """
    planning_store = PlanningStore()
    lessons = planning_store.list_lessons(unit_id=unit_id)

    return {
        "lessons": [
            LessonListItem(
                lesson_id=l.id,
                topic=l.topic,
                unit_id=l.unit_id,
                lesson_number=l.lesson_number,
                duration_minutes=l.duration_minutes,
                status=l.status,
                created_at=l.created_at,
            ).model_dump()
            for l in lessons
        ],
        "count": len(lessons),
    }


@router.get("/lessons/{lesson_id}", response_model=LessonResponse)
async def get_lesson(lesson_id: str):
    """
    Get full lesson details.
    """
    planning_store = PlanningStore()

    try:
        lesson = planning_store.get_lesson(lesson_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Lesson not found")

    plan = lesson.plan
    return LessonResponse(
        lesson_id=lesson.id,
        title=f"Lesson {lesson.lesson_number}: {lesson.topic}",
        learning_target=lesson.learning_target,
        plan=LessonPlan(
            opening=LessonSection(
                duration=plan.opening.duration if plan else 5,
                activity=plan.opening.activity if plan else "",
                key_points=plan.opening.key_points if plan else [],
            ),
            instruction=LessonSection(
                duration=plan.instruction.duration if plan else 15,
                activity=plan.instruction.activity if plan else "",
                key_points=plan.instruction.key_points if plan else [],
            ),
            practice=LessonSection(
                duration=plan.practice.duration if plan else 20,
                activity=plan.practice.activity if plan else "",
                key_points=plan.practice.key_points if plan else [],
            ),
            closing=LessonSection(
                duration=plan.closing.duration if plan else 10,
                activity=plan.closing.activity if plan else "",
                key_points=plan.closing.key_points if plan else [],
            ),
        ),
        materials=lesson.materials,
        differentiation_notes=lesson.differentiation_notes,
        format=lesson.format,
    )


@router.delete("/lessons/{lesson_id}")
async def delete_lesson(lesson_id: str):
    """
    Delete a lesson.
    """
    planning_store = PlanningStore()

    if not planning_store.delete_lesson(lesson_id):
        raise HTTPException(status_code=404, detail="Lesson not found")

    return {"message": "Lesson deleted", "lesson_id": lesson_id}
