"""
TeachAssist Configuration

Loads settings from environment variables with sensible defaults.
"""

from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8002
    debug: bool = True

    # Anthropic
    anthropic_api_key: str = ""

    # OpenAI (for embeddings)
    openai_api_key: str = ""

    # Embedding (for knowledge service)
    # Using OpenAI's text-embedding-3-small for serverless compatibility
    kb_embedding_model: str = "text-embedding-3-small"
    kb_embedding_dimension: int = 1536  # text-embedding-3-small produces 1536-dim embeddings
    kb_persist_directory: str = "./data/knowledge"  # Directory for knowledge artifacts
    kb_collection_prefix: str = "teachassist"  # Prefix for collections
    kb_cache_size: int = 1000  # LRU cache size for queries
    kb_search_alpha: float = 0.7  # Weight for vector search in hybrid mode (0-1)

    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://wildvine.net",
        "https://teach-assist-three.vercel.app",
        "https://teach-assist-proactiva.vercel.app",
    ]

    # Personas
    personas_dir: str = "../personas"

    # Sources / Notebook Mode
    sources_dir: str = "./data/sources"

    # Auth
    nextauth_secret: str = ""

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "env_prefix": "TA_",  # All env vars prefixed with TA_ to avoid chromadb conflicts
        "extra": "ignore",  # Ignore extra environment variables (like chromadb's own vars)
    }

    @property
    def personas_path(self) -> Path:
        """Get absolute path to personas directory."""
        return Path(__file__).parent.parent.parent / "personas"

    @property
    def chroma_path(self) -> Path:
        """Get absolute path to ChromaDB directory."""
        return Path(__file__).parent.parent / self.chroma_persist_dir

    @property
    def sources_path(self) -> Path:
        """Get absolute path to sources directory."""
        path = Path(__file__).parent.parent / self.sources_dir
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def data_path(self) -> Path:
        """Get absolute path to data directory."""
        data_dir = Path(__file__).parent.parent / "data"
        data_dir.mkdir(parents=True, exist_ok=True)
        return data_dir


settings = Settings()
