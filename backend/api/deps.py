"""
TeachAssist Dependencies

Dependency injection for FastAPI routes.
"""

import sys
from functools import lru_cache
from pathlib import Path
from typing import Generator

import structlog

from api.config import settings

# Add KnowledgeBeast to path
_kb_path = Path(__file__).parent.parent / "libs" / "knowledgebeast"
if str(_kb_path) not in sys.path:
    sys.path.insert(0, str(_kb_path))

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
    """Get or create the KnowledgeBeast KnowledgeBase singleton."""
    global _knowledge_engine

    if _knowledge_engine is None:
        try:
            from knowledgebeast import KnowledgeBase, KnowledgeBeastConfig

            # Configure KnowledgeBeast for TeachAssist
            config = KnowledgeBeastConfig(
                knowledge_dirs=[settings.sources_path],
                cache_file=settings.sources_path / ".knowledge_cache.pkl",
                max_cache_size=100,
                use_vector_search=True,
                embedding_model=settings.embedding_model,
                chromadb_path=settings.chroma_path,
                auto_warm=False,  # Don't warm on startup - warm on first query
            )

            _knowledge_engine = KnowledgeBase(config)
            logger.info(
                "knowledge_engine_initialized",
                chroma_path=str(settings.chroma_path),
                embedding_model=settings.embedding_model,
            )
        except ImportError as e:
            logger.warning("knowledge_engine_import_failed", error=str(e))
            return None
        except Exception as e:
            logger.error("knowledge_engine_init_failed", error=str(e))
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
