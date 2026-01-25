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
    """Get or create the KnowledgeBeast HybridQueryEngine singleton."""
    global _knowledge_engine

    if _knowledge_engine is None:
        # TODO: Initialize KnowledgeBeast when integrated
        # from libs.knowledgebeast import HybridQueryEngine, DocumentRepository
        # from libs.knowledgebeast.backends import ChromaDBBackend
        #
        # backend = ChromaDBBackend(persist_directory=str(settings.chroma_path))
        # repo = DocumentRepository()
        # _knowledge_engine = HybridQueryEngine(repo, backend=backend)
        logger.warning("knowledge_engine_not_initialized", reason="KnowledgeBeast not yet integrated")
        return None

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
