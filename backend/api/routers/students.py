"""
Students Router

CRUD operations for student profiles.
Used for personalized AI interactions based on student interests.
"""

from typing import List, Optional

import structlog
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from libs.student_store import StudentStore

logger = structlog.get_logger(__name__)

router = APIRouter()

# Initialize store
_store: Optional[StudentStore] = None


def get_store() -> StudentStore:
    """Get or create the student store singleton."""
    global _store
    if _store is None:
        _store = StudentStore()
    return _store


# --- Schemas ---


class StudentCreate(BaseModel):
    """Request to create a new student."""
    name: str
    interests: List[str] = []


class StudentUpdate(BaseModel):
    """Request to update a student."""
    name: Optional[str] = None
    interests: Optional[List[str]] = None


class StudentResponse(BaseModel):
    """Student profile response."""
    id: str
    name: str
    interests: List[str]
    created_at: str
    updated_at: str


# --- Endpoints ---


@router.get("", response_model=dict)
async def list_students():
    """
    List all students.

    Returns all student profiles sorted by name.
    """
    store = get_store()
    students = store.list()

    return {
        "students": [
            StudentResponse(
                id=s.id,
                name=s.name,
                interests=s.interests,
                created_at=s.created_at,
                updated_at=s.updated_at,
            ).model_dump()
            for s in students
        ],
        "total": len(students),
    }


@router.post("", response_model=StudentResponse)
async def create_student(request: StudentCreate):
    """
    Create a new student profile.

    Args:
        request: Student name and optional interests

    Returns:
        Created student profile
    """
    store = get_store()

    student = store.create(
        name=request.name,
        interests=request.interests,
    )

    logger.info("student_created_via_api", student_id=student.id, name=student.name)

    return StudentResponse(
        id=student.id,
        name=student.name,
        interests=student.interests,
        created_at=student.created_at,
        updated_at=student.updated_at,
    )


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(student_id: str):
    """
    Get a student by ID.

    Args:
        student_id: The student's unique ID

    Returns:
        Student profile

    Raises:
        404: If student not found
    """
    store = get_store()

    try:
        student = store.get(student_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Student not found")

    return StudentResponse(
        id=student.id,
        name=student.name,
        interests=student.interests,
        created_at=student.created_at,
        updated_at=student.updated_at,
    )


@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(student_id: str, request: StudentUpdate):
    """
    Update a student profile.

    Args:
        student_id: The student's unique ID
        request: Fields to update

    Returns:
        Updated student profile

    Raises:
        404: If student not found
    """
    store = get_store()

    try:
        # Build kwargs from non-None fields
        kwargs = {}
        if request.name is not None:
            kwargs["name"] = request.name
        if request.interests is not None:
            kwargs["interests"] = request.interests

        if not kwargs:
            # No updates provided, just return current
            student = store.get(student_id)
        else:
            student = store.update(student_id, **kwargs)

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Student not found")

    logger.info("student_updated_via_api", student_id=student.id)

    return StudentResponse(
        id=student.id,
        name=student.name,
        interests=student.interests,
        created_at=student.created_at,
        updated_at=student.updated_at,
    )


@router.delete("/{student_id}")
async def delete_student(student_id: str):
    """
    Delete a student profile.

    Args:
        student_id: The student's unique ID

    Returns:
        Confirmation of deletion

    Raises:
        404: If student not found
    """
    store = get_store()

    if not store.exists(student_id):
        raise HTTPException(status_code=404, detail="Student not found")

    store.delete(student_id)

    logger.info("student_deleted_via_api", student_id=student_id)

    return {
        "deleted": True,
        "student_id": student_id,
    }
