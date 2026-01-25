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

    # ChromaDB / KnowledgeBeast
    chroma_persist_dir: str = "./data/chroma"
    chroma_collection_name: str = "teachassist_kb"

    # Embedding
    embedding_model: str = "all-MiniLM-L6-v2"

    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

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
