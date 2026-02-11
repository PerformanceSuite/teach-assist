"""
Planning Store - File-based storage for units and lesson plans.

Units and lessons are stored as individual JSON files in the data directory.
Follows UbD (Understanding by Design) framework for unit planning.
"""

from __future__ import annotations

import json
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import structlog

logger = structlog.get_logger(__name__)


@dataclass
class LessonSection:
    """A section of a lesson plan (opening, instruction, practice, closing)."""
    duration: int
    activity: str
    key_points: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "duration": self.duration,
            "activity": self.activity,
            "key_points": self.key_points,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "LessonSection":
        return cls(
            duration=data.get("duration", 0),
            activity=data.get("activity", ""),
            key_points=data.get("key_points", []),
        )


@dataclass
class LessonPlan:
    """Full lesson plan structure."""
    opening: LessonSection
    instruction: LessonSection
    practice: LessonSection
    closing: LessonSection

    def to_dict(self) -> Dict[str, Any]:
        return {
            "opening": self.opening.to_dict(),
            "instruction": self.instruction.to_dict(),
            "practice": self.practice.to_dict(),
            "closing": self.closing.to_dict(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "LessonPlan":
        return cls(
            opening=LessonSection.from_dict(data.get("opening", {})),
            instruction=LessonSection.from_dict(data.get("instruction", {})),
            practice=LessonSection.from_dict(data.get("practice", {})),
            closing=LessonSection.from_dict(data.get("closing", {})),
        )


@dataclass
class Lesson:
    """
    Lesson plan for personalized instruction.

    Supports differentiation based on student profiles.
    """
    id: str
    topic: str
    unit_id: Optional[str] = None
    lesson_number: int = 1
    duration_minutes: int = 50
    learning_target: str = ""
    plan: Optional[LessonPlan] = None
    materials: List[str] = field(default_factory=list)
    differentiation_notes: str = ""
    format: str = "minimum_viable"  # minimum_viable, detailed, stretch
    status: str = "draft"
    created_at: str = ""
    updated_at: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "topic": self.topic,
            "unit_id": self.unit_id,
            "lesson_number": self.lesson_number,
            "duration_minutes": self.duration_minutes,
            "learning_target": self.learning_target,
            "plan": self.plan.to_dict() if self.plan else None,
            "materials": self.materials,
            "differentiation_notes": self.differentiation_notes,
            "format": self.format,
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Lesson":
        plan_data = data.get("plan")
        return cls(
            id=data.get("id", ""),
            topic=data.get("topic", ""),
            unit_id=data.get("unit_id"),
            lesson_number=data.get("lesson_number", 1),
            duration_minutes=data.get("duration_minutes", 50),
            learning_target=data.get("learning_target", ""),
            plan=LessonPlan.from_dict(plan_data) if plan_data else None,
            materials=data.get("materials", []),
            differentiation_notes=data.get("differentiation_notes", ""),
            format=data.get("format", "minimum_viable"),
            status=data.get("status", "draft"),
            created_at=data.get("created_at", ""),
            updated_at=data.get("updated_at", ""),
        )


@dataclass
class GRASPS:
    """GRASPS framework for performance task design."""
    goal: str = ""
    role: str = ""
    audience: str = ""
    situation: str = ""
    product: str = ""
    standards: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "goal": self.goal,
            "role": self.role,
            "audience": self.audience,
            "situation": self.situation,
            "product": self.product,
            "standards": self.standards,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "GRASPS":
        return cls(
            goal=data.get("goal", ""),
            role=data.get("role", ""),
            audience=data.get("audience", ""),
            situation=data.get("situation", ""),
            product=data.get("product", ""),
            standards=data.get("standards", ""),
        )


@dataclass
class PerformanceTask:
    """Performance task using GRASPS framework."""
    grasps: GRASPS

    def to_dict(self) -> Dict[str, Any]:
        return {
            "grasps": self.grasps.to_dict(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "PerformanceTask":
        return cls(
            grasps=GRASPS.from_dict(data.get("grasps", {})),
        )


@dataclass
class LessonOutline:
    """Outline of a lesson in the unit sequence."""
    lesson: int
    title: str
    type: str  # introduction, instruction, practice, assessment, lab
    activities: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "lesson": self.lesson,
            "title": self.title,
            "type": self.type,
            "activities": self.activities,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "LessonOutline":
        return cls(
            lesson=data.get("lesson", 0),
            title=data.get("title", ""),
            type=data.get("type", "instruction"),
            activities=data.get("activities", []),
        )


@dataclass
class Unit:
    """
    UbD-aligned unit plan.

    Follows Understanding by Design framework with:
    - Transfer goals (Stage 1)
    - Essential questions (Stage 1)
    - Performance task with GRASPS (Stage 2)
    - Lesson sequence (Stage 3)
    """
    id: str
    title: str
    grade: int
    subject: str
    duration_weeks: int
    standards: List[str] = field(default_factory=list)
    transfer_goals: List[str] = field(default_factory=list)
    essential_questions: List[str] = field(default_factory=list)
    performance_task: Optional[PerformanceTask] = None
    lesson_sequence: List[LessonOutline] = field(default_factory=list)
    status: str = "draft"
    created_at: str = ""
    updated_at: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "grade": self.grade,
            "subject": self.subject,
            "duration_weeks": self.duration_weeks,
            "standards": self.standards,
            "transfer_goals": self.transfer_goals,
            "essential_questions": self.essential_questions,
            "performance_task": self.performance_task.to_dict() if self.performance_task else None,
            "lesson_sequence": [lesson.to_dict() for lesson in self.lesson_sequence],
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Unit":
        perf_task_data = data.get("performance_task")
        lesson_seq_data = data.get("lesson_sequence", [])
        return cls(
            id=data.get("id", ""),
            title=data.get("title", ""),
            grade=data.get("grade", 0),
            subject=data.get("subject", ""),
            duration_weeks=data.get("duration_weeks", 0),
            standards=data.get("standards", []),
            transfer_goals=data.get("transfer_goals", []),
            essential_questions=data.get("essential_questions", []),
            performance_task=PerformanceTask.from_dict(perf_task_data) if perf_task_data else None,
            lesson_sequence=[LessonOutline.from_dict(ls) for ls in lesson_seq_data],
            status=data.get("status", "draft"),
            created_at=data.get("created_at", ""),
            updated_at=data.get("updated_at", ""),
        )


class PlanningStore:
    """
    File-based storage for units and lessons.

    Units are stored in data/units/, lessons in data/lessons/.

    Example:
        store = PlanningStore()

        # Create a unit
        unit = store.create_unit(
            title="Forces and Motion",
            grade=8,
            subject="Science",
            duration_weeks=3,
            standards=["MS-PS2-1", "MS-PS2-2"],
        )

        # Create a lesson
        lesson = store.create_lesson(
            topic="Introduction to Forces",
            unit_id=unit.id,
            lesson_number=1,
        )

        # List and retrieve
        units = store.list_units()
        unit = store.get_unit("unit_abc123")
    """

    def __init__(self, data_dir: Optional[Path] = None):
        """
        Initialize the planning store.

        Args:
            data_dir: Base directory for storing files.
                     Defaults to backend/data/
        """
        if data_dir:
            base_dir = Path(data_dir)
        else:
            base_dir = Path(__file__).parent.parent / "data"

        self.units_dir = base_dir / "units"
        self.lessons_dir = base_dir / "lessons"

        # Ensure directories exist
        self.units_dir.mkdir(parents=True, exist_ok=True)
        self.lessons_dir.mkdir(parents=True, exist_ok=True)

        logger.debug(
            "planning_store_initialized",
            units_path=str(self.units_dir),
            lessons_path=str(self.lessons_dir),
        )

    # --- Unit Methods ---

    def _get_unit_path(self, unit_id: str) -> Path:
        """Get file path for a unit."""
        return self.units_dir / f"{unit_id}.json"

    def list_units(self) -> List[Unit]:
        """
        List all units.

        Returns:
            List of Unit objects, sorted by updated_at descending.
        """
        units = []
        for file_path in self.units_dir.glob("unit_*.json"):
            try:
                with open(file_path) as f:
                    data = json.load(f)
                    units.append(Unit.from_dict(data))
            except Exception as e:
                logger.error("failed_to_load_unit", path=str(file_path), error=str(e))

        return sorted(units, key=lambda u: u.updated_at or "", reverse=True)

    def get_unit(self, unit_id: str) -> Unit:
        """
        Get a unit by ID.

        Args:
            unit_id: Unit ID

        Returns:
            Unit object

        Raises:
            FileNotFoundError: If unit doesn't exist
        """
        path = self._get_unit_path(unit_id)
        if not path.exists():
            raise FileNotFoundError(f"Unit not found: {unit_id}")

        with open(path) as f:
            data = json.load(f)

        return Unit.from_dict(data)

    def create_unit(
        self,
        title: str,
        grade: int,
        subject: str,
        duration_weeks: int,
        standards: Optional[List[str]] = None,
        transfer_goals: Optional[List[str]] = None,
        essential_questions: Optional[List[str]] = None,
        performance_task: Optional[PerformanceTask] = None,
        lesson_sequence: Optional[List[LessonOutline]] = None,
        status: str = "draft",
    ) -> Unit:
        """
        Create a new unit.

        Args:
            title: Unit title
            grade: Grade level
            subject: Subject area
            duration_weeks: How many weeks the unit spans
            standards: List of standards addressed
            transfer_goals: UbD transfer goals
            essential_questions: UbD essential questions
            performance_task: Performance task with GRASPS
            lesson_sequence: Outline of lessons
            status: Unit status (draft, active, archived)

        Returns:
            Created Unit object
        """
        unit_id = f"unit_{uuid.uuid4().hex[:12]}"
        now = datetime.utcnow().isoformat()

        unit = Unit(
            id=unit_id,
            title=title,
            grade=grade,
            subject=subject,
            duration_weeks=duration_weeks,
            standards=standards or [],
            transfer_goals=transfer_goals or [],
            essential_questions=essential_questions or [],
            performance_task=performance_task,
            lesson_sequence=lesson_sequence or [],
            status=status,
            created_at=now,
            updated_at=now,
        )

        self._save_unit(unit)
        logger.info("unit_created", id=unit_id, title=title)

        return unit

    def update_unit(self, unit_id: str, **kwargs) -> Unit:
        """
        Update a unit.

        Args:
            unit_id: Unit ID
            **kwargs: Fields to update

        Returns:
            Updated Unit object

        Raises:
            FileNotFoundError: If unit doesn't exist
        """
        unit = self.get_unit(unit_id)

        for key, value in kwargs.items():
            if hasattr(unit, key):
                setattr(unit, key, value)

        unit.updated_at = datetime.utcnow().isoformat()

        self._save_unit(unit)
        logger.info("unit_updated", id=unit_id)

        return unit

    def _save_unit(self, unit: Unit) -> None:
        """Save a unit to disk."""
        path = self._get_unit_path(unit.id)
        with open(path, "w") as f:
            json.dump(unit.to_dict(), f, indent=2)

    def delete_unit(self, unit_id: str) -> bool:
        """
        Delete a unit.

        Args:
            unit_id: Unit ID to delete

        Returns:
            True if deleted, False if didn't exist
        """
        path = self._get_unit_path(unit_id)
        if path.exists():
            path.unlink()
            logger.info("unit_deleted", id=unit_id)
            return True
        return False

    def unit_exists(self, unit_id: str) -> bool:
        """Check if a unit exists."""
        return self._get_unit_path(unit_id).exists()

    # --- Lesson Methods ---

    def _get_lesson_path(self, lesson_id: str) -> Path:
        """Get file path for a lesson."""
        return self.lessons_dir / f"{lesson_id}.json"

    def list_lessons(self, unit_id: Optional[str] = None) -> List[Lesson]:
        """
        List all lessons, optionally filtered by unit.

        Args:
            unit_id: Optional unit ID to filter by

        Returns:
            List of Lesson objects, sorted by lesson_number.
        """
        lessons = []
        for file_path in self.lessons_dir.glob("lesson_*.json"):
            try:
                with open(file_path) as f:
                    data = json.load(f)
                    lesson = Lesson.from_dict(data)
                    if unit_id is None or lesson.unit_id == unit_id:
                        lessons.append(lesson)
            except Exception as e:
                logger.error("failed_to_load_lesson", path=str(file_path), error=str(e))

        return sorted(lessons, key=lambda l: (l.unit_id or "", l.lesson_number))

    def get_lesson(self, lesson_id: str) -> Lesson:
        """
        Get a lesson by ID.

        Args:
            lesson_id: Lesson ID

        Returns:
            Lesson object

        Raises:
            FileNotFoundError: If lesson doesn't exist
        """
        path = self._get_lesson_path(lesson_id)
        if not path.exists():
            raise FileNotFoundError(f"Lesson not found: {lesson_id}")

        with open(path) as f:
            data = json.load(f)

        return Lesson.from_dict(data)

    def create_lesson(
        self,
        topic: str,
        unit_id: Optional[str] = None,
        lesson_number: int = 1,
        duration_minutes: int = 50,
        learning_target: str = "",
        plan: Optional[LessonPlan] = None,
        materials: Optional[List[str]] = None,
        differentiation_notes: str = "",
        format: str = "minimum_viable",
        status: str = "draft",
    ) -> Lesson:
        """
        Create a new lesson.

        Args:
            topic: Lesson topic
            unit_id: Parent unit ID (optional)
            lesson_number: Order in the unit sequence
            duration_minutes: Lesson duration
            learning_target: What students should learn
            plan: Lesson plan with sections
            materials: Required materials
            differentiation_notes: Notes for differentiation
            format: Plan format (minimum_viable, detailed, stretch)
            status: Lesson status (draft, ready, taught)

        Returns:
            Created Lesson object
        """
        lesson_id = f"lesson_{uuid.uuid4().hex[:12]}"
        now = datetime.utcnow().isoformat()

        lesson = Lesson(
            id=lesson_id,
            topic=topic,
            unit_id=unit_id,
            lesson_number=lesson_number,
            duration_minutes=duration_minutes,
            learning_target=learning_target,
            plan=plan,
            materials=materials or [],
            differentiation_notes=differentiation_notes,
            format=format,
            status=status,
            created_at=now,
            updated_at=now,
        )

        self._save_lesson(lesson)
        logger.info("lesson_created", id=lesson_id, topic=topic)

        return lesson

    def update_lesson(self, lesson_id: str, **kwargs) -> Lesson:
        """
        Update a lesson.

        Args:
            lesson_id: Lesson ID
            **kwargs: Fields to update

        Returns:
            Updated Lesson object

        Raises:
            FileNotFoundError: If lesson doesn't exist
        """
        lesson = self.get_lesson(lesson_id)

        for key, value in kwargs.items():
            if hasattr(lesson, key):
                setattr(lesson, key, value)

        lesson.updated_at = datetime.utcnow().isoformat()

        self._save_lesson(lesson)
        logger.info("lesson_updated", id=lesson_id)

        return lesson

    def _save_lesson(self, lesson: Lesson) -> None:
        """Save a lesson to disk."""
        path = self._get_lesson_path(lesson.id)
        with open(path, "w") as f:
            json.dump(lesson.to_dict(), f, indent=2)

    def delete_lesson(self, lesson_id: str) -> bool:
        """
        Delete a lesson.

        Args:
            lesson_id: Lesson ID to delete

        Returns:
            True if deleted, False if didn't exist
        """
        path = self._get_lesson_path(lesson_id)
        if path.exists():
            path.unlink()
            logger.info("lesson_deleted", id=lesson_id)
            return True
        return False

    def lesson_exists(self, lesson_id: str) -> bool:
        """Check if a lesson exists."""
        return self._get_lesson_path(lesson_id).exists()
