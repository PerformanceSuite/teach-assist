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

# Monkey-patch pydantic to support chromadb 0.3.x with Pydantic v2
# chromadb 0.3.x tries to import BaseSettings from pydantic, but in Pydantic v2
# it's been moved to pydantic-settings. This adds it back for compatibility.
try:
    import pydantic
    from pydantic_settings import BaseSettings
    # Directly set BaseSettings to avoid triggering pydantic's __getattr__ migration error
    setattr(pydantic, 'BaseSettings', BaseSettings)
except ImportError:
    pass  # pydantic-settings not available, chromadb import will fail later

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
            import os

            # Save and temporarily clear env vars that conflict with chromadb
            # chromadb's Settings() initialization is very strict about extra vars
            _saved_env = dict(os.environ)
            _allowed_chromadb_vars = {
                'CLICKHOUSE_HOST', 'CLICKHOUSE_PORT',
                'CHROMA_SERVER_HOST', 'CHROMA_SERVER_HTTP_PORT', 'CHROMA_SERVER_GRPC_PORT'
            }

            # Clear any partially-imported chromadb modules from cache
            import sys
            chromadb_modules = [key for key in sys.modules.keys() if key.startswith('chromadb')]
            for mod in chromadb_modules:
                del sys.modules[mod]

            # Clear all env vars except the allowed chromadb ones
            for key in list(os.environ.keys()):
                if key not in _allowed_chromadb_vars:
                    del os.environ[key]

            # Now import knowledgebeast (which will import chromadb)
            from knowledgebeast import KnowledgeBase, KnowledgeBeastConfig

            # Restore all environment variables
            os.environ.clear()
            os.environ.update(_saved_env)

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
