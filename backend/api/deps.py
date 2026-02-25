"""
TeachAssist Dependencies

Dependency injection for FastAPI routes.
Supports both Anthropic and Google Gemini as LLM providers.
"""

import sys
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Generator, List, Optional

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
    """Get or create the KnowledgeService singleton (CC4's InMemoryVectorStore approach)."""
    global _knowledge_engine

    if _knowledge_engine is None:
        try:
            from libs.knowledge_service import KnowledgeService

            # Initialize CC4's simplified knowledge service
            # Uses InMemoryVectorStore instead of ChromaDB
            _knowledge_engine = KnowledgeService()
            logger.info(
                "knowledge_engine_initialized",
                engine="InMemoryVectorStore",
                embedding_model=settings.kb_embedding_model,
                embedding_dimension=settings.kb_embedding_dimension,
            )
        except ImportError as e:
            logger.warning("knowledge_engine_import_failed", error=str(e))
            return None
        except Exception as e:
            logger.error("knowledge_engine_init_failed", error=str(e))
            return None

    return _knowledge_engine


# --- Gemini wrapper providing Anthropic-compatible interface ---


@dataclass
class _TextBlock:
    text: str


@dataclass
class _MessageResponse:
    """Mimics Anthropic's response.content[0].text interface."""
    content: list


class _GeminiMessages:
    """Wraps Gemini's generate_content to match client.messages.create() interface."""

    def __init__(self, api_key: str):
        self._api_key = api_key

    def create(
        self,
        model: str,
        max_tokens: int = 2048,
        temperature: float = 0.4,
        system: str = "",
        messages: list = None,
    ) -> _MessageResponse:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=self._api_key)

        # Map model names: if caller passes a Claude model name, use Gemini equivalent
        gemini_model = _map_model_name(model)

        # Build content from messages (Anthropic format -> Gemini format)
        parts = []
        for msg in (messages or []):
            parts.append(msg.get("content", ""))

        prompt = "\n".join(parts) if parts else ""

        response = client.models.generate_content(
            model=gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system if system else None,
                max_output_tokens=max_tokens,
                temperature=temperature,
            ),
        )

        return _MessageResponse(content=[_TextBlock(text=response.text)])


class _GeminiClient:
    """Drop-in replacement for Anthropic client using Google Gemini."""

    def __init__(self, api_key: str):
        self.messages = _GeminiMessages(api_key)


def _map_model_name(model: str) -> str:
    """Map Anthropic/generic model names to Gemini model names."""
    mapping = {
        "claude-sonnet-4-20250514": "gemini-2.0-flash",
        "claude-3-5-sonnet-20241022": "gemini-2.0-flash",
        "claude-3-haiku-20240307": "gemini-2.0-flash",
    }
    return mapping.get(model, "gemini-2.0-flash")


def get_anthropic_client():
    """
    Get LLM client for API calls.

    Prefers Gemini if TA_GEMINI_API_KEY is set, falls back to Anthropic.
    Returns a client with .messages.create() interface.
    """
    # Prefer Gemini
    if settings.gemini_api_key:
        logger.info("llm_client_provider", provider="gemini")
        return _GeminiClient(api_key=settings.gemini_api_key)

    # Fallback to Anthropic
    if settings.anthropic_api_key:
        logger.info("llm_client_provider", provider="anthropic")
        from anthropic import Anthropic
        return Anthropic(api_key=settings.anthropic_api_key)

    logger.warning("llm_client_not_available", reason="No API key configured (set TA_GEMINI_API_KEY or TA_ANTHROPIC_API_KEY)")
    return None


@lru_cache()
def get_settings():
    """Get cached settings."""
    return settings
