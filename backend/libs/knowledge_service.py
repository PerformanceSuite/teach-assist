"""
KnowledgeBeast Service Wrapper for TeachAssist

This module provides a simplified interface to KnowledgeBeast for the TeachAssist backend.
"""

import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
import tempfile
import uuid
from datetime import datetime

import structlog

# Import KnowledgeBeast components
import sys
sys.path.insert(0, str(Path(__file__).parent / "knowledgebeast"))

from knowledgebeast.core.engine import KnowledgeBase
from knowledgebeast.core.config import KnowledgeBeastConfig

logger = structlog.get_logger(__name__)


class TeachAssistKnowledgeService:
    """
    Service wrapper for KnowledgeBeast tailored to TeachAssist use cases.

    Handles:
    - Multi-notebook isolation (each notebook has its own knowledge base)
    - Document ingestion from various formats
    - Grounded chat with citations
    - Source management
    """

    def __init__(self, data_dir: Path):
        """
        Initialize the knowledge service.

        Args:
            data_dir: Base directory for storing notebooks and sources
        """
        self.data_dir = data_dir
        self.data_dir.mkdir(parents=True, exist_ok=True)

        # Knowledge bases keyed by notebook_id
        self._notebooks: Dict[str, KnowledgeBase] = {}

        # Metadata storage (in production, use a database)
        self._source_metadata: Dict[str, Dict[str, Any]] = {}

        logger.info("knowledge_service_initialized", data_dir=str(data_dir))

    def _get_notebook_dir(self, notebook_id: str) -> Path:
        """Get the directory for a specific notebook."""
        notebook_dir = self.data_dir / f"notebook_{notebook_id}"
        notebook_dir.mkdir(parents=True, exist_ok=True)
        return notebook_dir

    def _get_or_create_notebook(self, notebook_id: str) -> KnowledgeBase:
        """Get or create a knowledge base for a notebook."""
        if notebook_id not in self._notebooks:
            notebook_dir = self._get_notebook_dir(notebook_id)

            config = KnowledgeBeastConfig(
                knowledge_dirs=[notebook_dir],
                auto_warm=False,  # Don't auto-warm on creation
            )

            kb = KnowledgeBase(config=config)
            self._notebooks[notebook_id] = kb

            logger.info("notebook_created", notebook_id=notebook_id, path=str(notebook_dir))

        return self._notebooks[notebook_id]

    async def ingest_file(
        self,
        file_content: bytes,
        filename: str,
        notebook_id: str = "default",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Ingest a file into a notebook's knowledge base.

        Args:
            file_content: Raw file bytes
            filename: Original filename
            notebook_id: Notebook to add the file to
            metadata: Optional metadata (tags, description, etc.)

        Returns:
            Dict with source_id, filename, chunks count, etc.
        """
        # Generate unique source ID
        source_id = f"src_{uuid.uuid4().hex[:12]}"

        # Save file to notebook directory
        notebook_dir = self._get_notebook_dir(notebook_id)
        source_path = notebook_dir / f"{source_id}_{filename}"

        source_path.write_bytes(file_content)

        # Get knowledge base and rebuild index
        kb = self._get_or_create_notebook(notebook_id)
        kb.rebuild_index()

        # Store metadata
        self._source_metadata[source_id] = {
            "source_id": source_id,
            "filename": filename,
            "notebook_id": notebook_id,
            "created_at": datetime.utcnow().isoformat(),
            "path": str(source_path),
            "metadata": metadata or {},
        }

        # Get stats to determine chunk count
        stats = kb.get_stats()

        logger.info(
            "file_ingested",
            source_id=source_id,
            filename=filename,
            notebook_id=notebook_id,
            chunks=stats.get("indexed_chunks", 0),
        )

        return {
            "source_id": source_id,
            "filename": filename,
            "chunks": stats.get("indexed_chunks", 0),
            "status": "indexed",
        }

    async def query(
        self,
        query: str,
        notebook_id: str = "default",
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Query a notebook's knowledge base.

        Args:
            query: User's question
            notebook_id: Notebook to query
            top_k: Number of results to return

        Returns:
            List of results with text, metadata, and relevance scores
        """
        kb = self._get_or_create_notebook(notebook_id)

        # Query the knowledge base
        results = kb.query(query, top_k=top_k)

        # Transform results to our format
        citations = []
        for result in results:
            citations.append({
                "text": result.get("text", ""),
                "source": result.get("source", ""),
                "chunk_id": result.get("chunk_id", ""),
                "relevance": result.get("score", 0.0),
                "page": result.get("page"),
            })

        logger.info("query_executed", notebook_id=notebook_id, query=query, results=len(citations))

        return citations

    def list_sources(
        self,
        notebook_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        List all sources, optionally filtered by notebook.

        Args:
            notebook_id: Optional notebook filter

        Returns:
            List of source metadata
        """
        sources = []

        for source_id, metadata in self._source_metadata.items():
            if notebook_id is None or metadata["notebook_id"] == notebook_id:
                sources.append({
                    "source_id": metadata["source_id"],
                    "filename": metadata["filename"],
                    "created_at": metadata["created_at"],
                    "chunks": 0,  # TODO: Get actual chunk count
                    "tags": metadata.get("metadata", {}).get("tags", []),
                })

        return sources

    def get_source(self, source_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a source."""
        metadata = self._source_metadata.get(source_id)

        if not metadata:
            return None

        # Read preview from file
        source_path = Path(metadata["path"])
        preview = ""

        if source_path.exists():
            try:
                preview = source_path.read_text(encoding="utf-8", errors="ignore")[:500]
            except Exception as e:
                logger.warning("preview_read_failed", source_id=source_id, error=str(e))
                preview = "[Preview unavailable]"

        return {
            "source_id": metadata["source_id"],
            "filename": metadata["filename"],
            "created_at": metadata["created_at"],
            "chunks": 0,  # TODO: Get actual chunk count
            "preview": preview,
            "metadata": metadata.get("metadata", {}),
        }

    def delete_source(self, source_id: str) -> bool:
        """
        Delete a source from the knowledge base.

        Args:
            source_id: Source to delete

        Returns:
            True if deleted, False if not found
        """
        metadata = self._source_metadata.get(source_id)

        if not metadata:
            return False

        # Delete file
        source_path = Path(metadata["path"])
        if source_path.exists():
            source_path.unlink()

        # Rebuild the notebook's index
        notebook_id = metadata["notebook_id"]
        if notebook_id in self._notebooks:
            self._notebooks[notebook_id].rebuild_index()

        # Remove metadata
        del self._source_metadata[source_id]

        logger.info("source_deleted", source_id=source_id)

        return True

    def get_stats(self, notebook_id: str = "default") -> Dict[str, Any]:
        """Get statistics for a notebook."""
        kb = self._get_or_create_notebook(notebook_id)
        return kb.get_stats()
