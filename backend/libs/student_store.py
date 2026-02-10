"""
Student Store - Simple file-based storage for student profiles.

Students are stored as individual JSON files in the data/students directory.
Each student has a name and interests for personalizing AI responses.
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
class Student:
    """
    Student profile for personalization.

    Used to make AI responses more engaging by connecting
    concepts to student interests.
    """
    id: str
    name: str  # Display name (e.g., "Alex M.")
    interests: List[str] = field(default_factory=list)
    created_at: str = ""
    updated_at: str = ""

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "id": self.id,
            "name": self.name,
            "interests": self.interests,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Student":
        """Create Student from dictionary."""
        return cls(
            id=data.get("id", ""),
            name=data.get("name", data.get("display_name", "")),  # Backward compat
            interests=data.get("interests", []),
            created_at=data.get("created_at", ""),
            updated_at=data.get("updated_at", ""),
        )


class StudentStore:
    """
    File-based student storage.

    Students are stored as individual JSON files in the data/students directory.

    Example:
        store = StudentStore()

        # Create a student
        student = store.create("Alex M.", interests=["soccer", "gaming"])

        # List all students
        students = store.list()

        # Get by ID
        alex = store.get("std_abc123")

        # Update
        store.update("std_abc123", interests=["soccer", "music"])

        # Delete
        store.delete("std_abc123")
    """

    def __init__(self, data_dir: Optional[Path] = None):
        """
        Initialize the student store.

        Args:
            data_dir: Directory for storing student files.
                     Defaults to backend/data/students/
        """
        if data_dir:
            self.dir = Path(data_dir)
        else:
            self.dir = Path(__file__).parent.parent / "data" / "students"

        # Ensure directory exists
        self.dir.mkdir(parents=True, exist_ok=True)
        logger.debug("student_store_initialized", path=str(self.dir))

    def _get_path(self, student_id: str) -> Path:
        """Get file path for a student."""
        return self.dir / f"{student_id}.json"

    def list(self) -> List[Student]:
        """
        List all students.

        Returns:
            List of Student objects, sorted by name.
        """
        students = []
        for file_path in self.dir.glob("std_*.json"):
            try:
                with open(file_path) as f:
                    data = json.load(f)
                    students.append(Student.from_dict(data))
            except Exception as e:
                logger.error("failed_to_load_student", path=str(file_path), error=str(e))

        return sorted(students, key=lambda s: s.name.lower())

    def get(self, student_id: str) -> Student:
        """
        Get a student by ID.

        Args:
            student_id: Student ID

        Returns:
            Student object

        Raises:
            FileNotFoundError: If student doesn't exist
        """
        path = self._get_path(student_id)
        if not path.exists():
            raise FileNotFoundError(f"Student not found: {student_id}")

        with open(path) as f:
            data = json.load(f)

        return Student.from_dict(data)

    def get_many(self, student_ids: List[str]) -> List[Student]:
        """
        Get multiple students by their IDs.

        Args:
            student_ids: List of student IDs

        Returns:
            List of Student objects (only those found)
        """
        students = []
        for sid in student_ids:
            try:
                students.append(self.get(sid))
            except FileNotFoundError:
                logger.warning("student_not_found", student_id=sid)
        return students

    def create(self, name: str, interests: Optional[List[str]] = None) -> Student:
        """
        Create a new student.

        Args:
            name: Display name
            interests: List of interests

        Returns:
            Created Student object
        """
        student_id = f"std_{uuid.uuid4().hex[:12]}"
        now = datetime.utcnow().isoformat()

        student = Student(
            id=student_id,
            name=name,
            interests=interests or [],
            created_at=now,
            updated_at=now,
        )

        self._save(student)
        logger.info("student_created", id=student_id, name=name)

        return student

    def update(self, student_id: str, **kwargs) -> Student:
        """
        Update a student.

        Args:
            student_id: Student ID
            **kwargs: Fields to update (name, interests)

        Returns:
            Updated Student object

        Raises:
            FileNotFoundError: If student doesn't exist
        """
        student = self.get(student_id)

        if "name" in kwargs:
            student.name = kwargs["name"]
        if "interests" in kwargs:
            student.interests = kwargs["interests"]

        student.updated_at = datetime.utcnow().isoformat()

        self._save(student)
        logger.info("student_updated", id=student_id)

        return student

    def _save(self, student: Student) -> None:
        """Save a student to disk."""
        path = self._get_path(student.id)
        with open(path, "w") as f:
            json.dump(student.to_dict(), f, indent=2)

    def delete(self, student_id: str) -> bool:
        """
        Delete a student.

        Args:
            student_id: Student ID to delete

        Returns:
            True if deleted, False if didn't exist
        """
        path = self._get_path(student_id)
        if path.exists():
            path.unlink()
            logger.info("student_deleted", id=student_id)
            return True
        return False

    def exists(self, student_id: str) -> bool:
        """Check if a student exists."""
        return self._get_path(student_id).exists()
