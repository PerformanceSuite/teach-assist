"""
TeachAssist Dependencies

Dependency injection for FastAPI routes.
"""

from functools import lru_cache
from pathlib import Path
from typing import Generator

import structlog

from api.config import settings

logger = structlog.get_logger(__name__)


# Lazy imports to avoid circular dependencies and slow startup
_persona_store = None
_knowledge_engine = None


def get_persona_store():
    """Get or create the PersonaStore singleton."""
    global _persona_store

    if _persona_store is None:
        from libs.persona_store import PersonaStore
        _persona_store = PersonaStore(personas_dir=settings.personas_path)
        logger.info("persona_store_initialized", path=str(settings.personas_path))

    return _persona_store


def get_knowledge_engine():
    """Get or create the TeachAssist Knowledge Service singleton."""
    global _knowledge_engine

    if _knowledge_engine is None:
        from libs.knowledge_service import TeachAssistKnowledgeService

        _knowledge_engine = TeachAssistKnowledgeService(data_dir=settings.data_path)
        logger.info("knowledge_service_initialized", data_dir=str(settings.data_path))

    return _knowledge_engine


def get_anthropic_client():
    """Get Anthropic client for LLM calls."""
    if not settings.anthropic_api_key:
        logger.warning("anthropic_client_not_available", reason="No API key configured")
        return None

    from anthropic import Anthropic
    return Anthropic(api_key=settings.anthropic_api_key)


@lru_cache()
def get_settings():
    """Get cached settings."""
    return settings
