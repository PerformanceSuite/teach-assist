"""
Persona Store - Simple file-based storage for Inner Council advisory personas.

Personas are stored as YAML files for easy editing and version control.
Each persona defines the "who" - role, expertise, personality, constraints.

Adapted from CC4's persona_store.py for TeachAssist's Inner Council.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

import structlog
import yaml

logger = structlog.get_logger(__name__)


@dataclass
class Persona:
    """
    Advisory persona definition for Inner Council.

    A persona defines:
    - Who the advisor is (role, expertise)
    - How it should behave (system prompt)
    - Output format expectations
    - Execution hints (model, temperature)
    """

    name: str
    display_name: str
    description: str
    system_prompt: str
    category: str = "advisory"
    model: str = "claude-sonnet-4-20250514"
    temperature: float = 0.5
    max_tokens: int = 2048
    requires_sandbox: bool = False
    preferred_languages: List[str] = field(default_factory=list)
    tool_permissions: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    # TeachAssist-specific fields
    grade_levels: List[int] = field(default_factory=list)
    subjects: List[str] = field(default_factory=list)
    frameworks: List[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        """Convert to dictionary for serialization."""
        return {
            "name": self.name,
            "display_name": self.display_name,
            "description": self.description,
            "category": self.category,
            "model": self.model,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "requires_sandbox": self.requires_sandbox,
            "preferred_languages": self.preferred_languages,
            "tool_permissions": self.tool_permissions,
            "tags": self.tags,
            "grade_levels": self.grade_levels,
            "subjects": self.subjects,
            "frameworks": self.frameworks,
            "system_prompt": self.system_prompt,
        }


class PersonaStore:
    """
    File-based persona storage.

    Personas are stored as YAML files in a directory.
    Each file is named {persona_name}.yaml.

    Example:
        store = PersonaStore(Path("./personas"))

        # List all personas
        personas = store.list()

        # Get a specific persona
        guardian = store.get("standards-guardian")

        # List only advisory personas
        advisors = store.list(category="advisory")
    """

    def __init__(self, personas_dir: Optional[Path] = None):
        """
        Initialize the persona store.

        Args:
            personas_dir: Directory containing persona YAML files.
        """
        self.dir = personas_dir or Path(__file__).parent.parent.parent / "personas"
        self.dir = Path(self.dir)

        if not self.dir.exists():
            logger.warning("personas_dir_not_found", path=str(self.dir))
            self.dir.mkdir(parents=True, exist_ok=True)

    def list(self, category: Optional[str] = None) -> List[Persona]:
        """
        List all personas, optionally filtered by category.

        Args:
            category: Optional category filter (e.g., "advisory")

        Returns:
            List of Persona objects, sorted by name.
        """
        personas = []

        for f in self.dir.glob("*.yaml"):
            if f.name.startswith("_"):
                continue  # Skip index/meta files
            try:
                persona = self.get(f.stem)
                if category is None or persona.category == category:
                    personas.append(persona)
            except Exception as e:
                logger.warning("failed_to_load_persona", file=f.name, error=str(e))

        return sorted(personas, key=lambda p: p.name)

    def get(self, name: str) -> Persona:
        """
        Get a persona by name.

        Args:
            name: Persona name (without .yaml extension)

        Returns:
            Persona object

        Raises:
            FileNotFoundError: If persona doesn't exist
        """
        path = self.dir / f"{name}.yaml"

        if not path.exists():
            raise FileNotFoundError(f"Persona not found: {name}")

        with open(path) as f:
            data = yaml.safe_load(f)

        return Persona(
            name=data.get("name", name),
            display_name=data.get("display_name", name),
            description=data.get("description", ""),
            system_prompt=data.get("system_prompt", ""),
            category=data.get("category", "advisory"),
            model=data.get("model", "claude-sonnet-4-20250514"),
            temperature=data.get("temperature", 0.5),
            max_tokens=data.get("max_tokens", 2048),
            requires_sandbox=data.get("requires_sandbox", False),
            preferred_languages=data.get("preferred_languages", []),
            tool_permissions=data.get("tool_permissions", []),
            tags=data.get("tags", []),
            grade_levels=data.get("grade_levels", []),
            subjects=data.get("subjects", []),
            frameworks=data.get("frameworks", []),
        )

    def save(self, persona: Persona) -> None:
        """
        Save a persona to file.

        Args:
            persona: Persona to save
        """
        path = self.dir / f"{persona.name}.yaml"

        with open(path, "w") as f:
            yaml.dump(
                persona.to_dict(),
                f,
                default_flow_style=False,
                sort_keys=False,
                allow_unicode=True,
            )

        logger.info("persona_saved", name=persona.name, path=str(path))

    def delete(self, name: str) -> bool:
        """
        Delete a persona.

        Args:
            name: Persona name to delete

        Returns:
            True if deleted, False if didn't exist
        """
        path = self.dir / f"{name}.yaml"

        if path.exists():
            path.unlink()
            logger.info("persona_deleted", name=name)
            return True

        return False

    def exists(self, name: str) -> bool:
        """Check if a persona exists."""
        return (self.dir / f"{name}.yaml").exists()
