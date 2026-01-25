"""
KnowledgeBeast Service for CC4 - Simplified Implementation

Provides semantic search, RAG, and knowledge management capabilities.
Uses sentence-transformers for embeddings with in-memory vector storage.

Note: This is a simplified implementation that doesn't require chromadb.
For production PostgreSQL+pgvector support, see the full KnowledgeBeast library.

Features:
- Hybrid search (vector + keyword)
- Document ingestion with embeddings
- Per-project knowledge isolation
- Embedding caching for performance
"""

import hashlib
import logging
import threading
from typing import Any, Dict, List, Literal, Optional
from uuid import UUID

import numpy as np
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

from api.config import settings

logger = logging.getLogger(__name__)


class SearchResult(BaseModel):
    """Result from a knowledge search."""
    doc_id: str
    content: str
    title: Optional[str] = None
    score: float
    source_type: Optional[str] = None
    source_id: Optional[str] = None
    metadata: Dict[str, Any] = {}


class IngestResult(BaseModel):
    """Result from document ingestion."""
    document_id: str
    chunks_created: int
    content_hash: str


class AskResult(BaseModel):
    """Result from RAG query."""
    answer: str
    sources: List[SearchResult]
    confidence: float


class InMemoryVectorStore:
    """
    Simple in-memory vector store using numpy.

    Stores documents with embeddings and supports cosine similarity search.
    Thread-safe for concurrent access.
    """

    def __init__(self):
        self._lock = threading.RLock()
        self._documents: Dict[str, Dict[str, Any]] = {}
        self._embeddings: Dict[str, np.ndarray] = {}

    def add(
        self,
        doc_id: str,
        embedding: np.ndarray,
        content: str,
        metadata: Dict[str, Any]
    ) -> None:
        """Add a document with its embedding."""
        with self._lock:
            self._documents[doc_id] = {
                'content': content,
                'metadata': metadata
            }
            self._embeddings[doc_id] = embedding / np.linalg.norm(embedding)  # Normalize

    def search(
        self,
        query_embedding: np.ndarray,
        top_k: int = 10,
        source_type: Optional[str] = None
    ) -> List[tuple]:
        """
        Search for similar documents using cosine similarity.

        Returns list of (doc_id, similarity_score, content, metadata) tuples.
        """
        with self._lock:
            if not self._embeddings:
                return []

            # Normalize query embedding
            query_norm = query_embedding / np.linalg.norm(query_embedding)

            # Compute similarities
            results = []
            for doc_id, embedding in self._embeddings.items():
                # Filter by source_type if specified
                if source_type:
                    doc_meta = self._documents[doc_id].get('metadata', {})
                    if doc_meta.get('source_type') != source_type:
                        continue

                similarity = np.dot(query_norm, embedding)
                doc = self._documents[doc_id]
                results.append((doc_id, float(similarity), doc['content'], doc['metadata']))

            # Sort by similarity (descending)
            results.sort(key=lambda x: x[1], reverse=True)
            return results[:top_k]

    def delete(self, doc_id: str) -> bool:
        """Delete a document."""
        with self._lock:
            if doc_id in self._documents:
                del self._documents[doc_id]
                del self._embeddings[doc_id]
                return True
            return False

    def count(self) -> int:
        """Get document count."""
        with self._lock:
            return len(self._documents)

    def list_all(self) -> List[Dict[str, Any]]:
        """List all documents with metadata."""
        with self._lock:
            documents = []
            for doc_id, doc in self._documents.items():
                documents.append({
                    'doc_id': doc_id,
                    'content': doc['content'][:200] + '...' if len(doc['content']) > 200 else doc['content'],
                    'content_length': len(doc['content']),
                    'metadata': doc['metadata']
                })
            return documents

    def delete_by_source_type(self, source_type: str) -> int:
        """Delete all documents of a given source type."""
        with self._lock:
            to_delete = [
                doc_id for doc_id, doc in self._documents.items()
                if doc['metadata'].get('source_type') == source_type
            ]
            for doc_id in to_delete:
                del self._documents[doc_id]
                del self._embeddings[doc_id]
            return len(to_delete)

    def clear(self) -> None:
        """Clear all documents."""
        with self._lock:
            self._documents.clear()
            self._embeddings.clear()


class KnowledgeService:
    """
    Service for semantic search and RAG operations.

    Uses sentence-transformers for embeddings and in-memory vector storage.
    Supports per-project knowledge isolation via collection prefixes.
    """

    _instance: Optional['KnowledgeService'] = None
    _model: Optional[SentenceTransformer] = None
    _vector_store: Optional[InMemoryVectorStore] = None
    _stats: Dict[str, int]
    _lock: threading.RLock

    def __new__(cls):
        """Singleton pattern for shared model instance."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        """Initialize the knowledge service."""
        if hasattr(self, '_initialized') and self._initialized:
            return  # Already initialized

        logger.info("Initializing KnowledgeBeast (simplified)...")

        self._lock = threading.RLock()

        # Initialize embedding model
        logger.info(f"Loading embedding model: {settings.kb_embedding_model}")
        self._model = SentenceTransformer(settings.kb_embedding_model)

        # Initialize vector store
        self._vector_store = InMemoryVectorStore()

        # Initialize stats
        self._stats = {
            'queries': 0,
            'vector_queries': 0,
            'keyword_queries': 0,
            'hybrid_queries': 0,
            'ingests': 0,
        }

        self._initialized = True
        logger.info(f"KnowledgeBeast initialized (model: {settings.kb_embedding_model}, dim: {settings.kb_embedding_dimension})")

    def _embed(self, text: str) -> np.ndarray:
        """Generate embedding for text."""
        return self._model.encode(text, normalize_embeddings=True)

    def _keyword_score(self, query: str, content: str) -> float:
        """Simple keyword matching score."""
        query_terms = set(query.lower().split())
        content_lower = content.lower()
        matches = sum(1 for term in query_terms if term in content_lower)
        return matches / len(query_terms) if query_terms else 0.0

    def _compute_content_hash(self, content: str) -> str:
        """Compute SHA-256 hash of content for deduplication."""
        return hashlib.sha256(content.encode()).hexdigest()

    async def search(
        self,
        query: str,
        project_id: Optional[UUID] = None,
        mode: Literal['hybrid', 'vector', 'keyword'] = 'hybrid',
        top_k: int = 10,
        alpha: Optional[float] = None,
        source_type: Optional[str] = None,
    ) -> List[SearchResult]:
        """
        Search the knowledge base.

        Args:
            query: Search query string
            project_id: Optional project ID for isolation
            mode: Search mode - 'hybrid', 'vector', or 'keyword'
            top_k: Number of results to return
            alpha: Weight for vector search (0-1, default from settings)
            source_type: Filter by source type (e.g., 'evidence', 'document')

        Returns:
            List of SearchResult objects sorted by relevance
        """
        if not query or not query.strip():
            return []

        alpha = alpha if alpha is not None else settings.kb_search_alpha

        with self._lock:
            self._stats['queries'] += 1

        try:
            if mode == 'vector':
                # Pure vector search
                with self._lock:
                    self._stats['vector_queries'] += 1

                query_embedding = self._embed(query)
                results = self._vector_store.search(query_embedding, top_k, source_type)

            elif mode == 'keyword':
                # Pure keyword search
                with self._lock:
                    self._stats['keyword_queries'] += 1

                # Get all documents and score by keyword match
                all_results = self._vector_store.search(
                    self._embed(query), top_k=1000, source_type=source_type
                )
                scored = []
                for doc_id, _, content, metadata in all_results:
                    score = self._keyword_score(query, content)
                    if score > 0:
                        scored.append((doc_id, score, content, metadata))
                scored.sort(key=lambda x: x[1], reverse=True)
                results = scored[:top_k]

            else:  # hybrid
                with self._lock:
                    self._stats['hybrid_queries'] += 1

                # Vector search
                query_embedding = self._embed(query)
                vector_results = self._vector_store.search(query_embedding, top_k * 2, source_type)

                # Combine with keyword scores
                combined = {}
                for rank, (doc_id, v_score, content, metadata) in enumerate(vector_results):
                    k_score = self._keyword_score(query, content)
                    combined_score = alpha * v_score + (1 - alpha) * k_score
                    combined[doc_id] = (combined_score, content, metadata)

                # Sort by combined score
                sorted_results = sorted(combined.items(), key=lambda x: x[1][0], reverse=True)
                results = [(doc_id, score, content, meta) for doc_id, (score, content, meta) in sorted_results[:top_k]]

            # Convert to SearchResult objects
            search_results = []
            for doc_id, score, content, metadata in results:
                search_results.append(SearchResult(
                    doc_id=doc_id,
                    content=content,
                    title=metadata.get('title'),
                    score=score,
                    source_type=metadata.get('source_type'),
                    source_id=metadata.get('source_id'),
                    metadata=metadata
                ))

            logger.debug(f"Search '{query[:50]}...' returned {len(search_results)} results")
            return search_results

        except Exception as e:
            logger.error(f"Search error: {e}", exc_info=True)
            return []

    async def ingest(
        self,
        content: str,
        title: Optional[str] = None,
        source_type: str = "document",
        source_id: Optional[str] = None,
        project_id: Optional[UUID] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> IngestResult:
        """
        Ingest content into the knowledge base.

        Args:
            content: Text content to ingest
            title: Optional title for the document
            source_type: Type of source (e.g., 'evidence', 'hypothesis', 'document')
            source_id: Optional ID of the source entity
            project_id: Optional project ID for isolation
            metadata: Additional metadata to store

        Returns:
            IngestResult with document ID and chunk count
        """
        content_hash = self._compute_content_hash(content)
        doc_id = f"{source_type}_{content_hash[:16]}"

        # Prepare metadata
        doc_metadata = {
            'title': title,
            'source_type': source_type,
            'source_id': source_id,
            'project_id': str(project_id) if project_id else None,
            'content_hash': content_hash,
            **(metadata or {})
        }

        try:
            # Generate embedding
            embedding = self._embed(content)

            # Add to vector store
            self._vector_store.add(doc_id, embedding, content, doc_metadata)

            with self._lock:
                self._stats['ingests'] += 1

            logger.info(f"Ingested document {doc_id} ({len(content)} chars)")

            return IngestResult(
                document_id=doc_id,
                chunks_created=1,
                content_hash=content_hash
            )

        except Exception as e:
            logger.error(f"Ingest error: {e}", exc_info=True)
            raise

    async def ask(
        self,
        question: str,
        project_id: Optional[UUID] = None,
        context_limit: int = 5,
    ) -> AskResult:
        """
        RAG query - retrieve context and format for LLM.

        Note: This returns context for an LLM, it doesn't generate the answer.
        The calling code should pass the context to an LLM for generation.

        Args:
            question: Question to answer
            project_id: Optional project ID for isolation
            context_limit: Maximum context documents to retrieve

        Returns:
            AskResult with retrieved sources (answer is formatted context)
        """
        # Search for relevant context
        sources = await self.search(
            query=question,
            project_id=project_id,
            mode='hybrid',
            top_k=context_limit
        )

        # Format context for LLM
        context_parts = []
        for i, source in enumerate(sources, 1):
            title = source.title or f"Source {i}"
            context_parts.append(f"[{i}] {title}:\n{source.content[:500]}...")

        context = "\n\n".join(context_parts) if context_parts else "No relevant context found."

        return AskResult(
            answer=context,
            sources=sources,
            confidence=sources[0].score if sources else 0.0
        )

    async def delete(
        self,
        document_id: str,
        project_id: Optional[UUID] = None,
    ) -> bool:
        """
        Delete a document from the knowledge base.

        Args:
            document_id: ID of document to delete
            project_id: Optional project ID for isolation

        Returns:
            True if deleted, False if not found
        """
        try:
            deleted = self._vector_store.delete(document_id)
            if deleted:
                logger.info(f"Deleted document {document_id}")
            return deleted
        except Exception as e:
            logger.error(f"Delete error: {e}", exc_info=True)
            return False

    async def get_stats(self) -> Dict[str, Any]:
        """
        Get knowledge base statistics.

        Returns:
            Dictionary with stats like document count, cache hits, etc.
        """
        try:
            with self._lock:
                return {
                    "document_count": self._vector_store.count(),
                    "term_count": 0,  # Not applicable for vector search
                    "queries": self._stats['queries'],
                    "cache_hits": 0,
                    "cache_misses": 0,
                    "vector_queries": self._stats['vector_queries'],
                    "keyword_queries": self._stats['keyword_queries'],
                    "hybrid_queries": self._stats['hybrid_queries'],
                    "embedding_model": settings.kb_embedding_model,
                    "embedding_dimension": settings.kb_embedding_dimension,
                }
        except Exception as e:
            logger.error(f"Stats error: {e}", exc_info=True)
            return {"error": str(e)}

    async def list_documents(
        self,
        source_type: Optional[str] = None,
        project_id: Optional[UUID] = None,
    ) -> List[Dict[str, Any]]:
        """
        List all documents in the knowledge base.

        Args:
            source_type: Optional filter by source type
            project_id: Optional filter by project ID

        Returns:
            List of document metadata dictionaries
        """
        try:
            all_docs = self._vector_store.list_all()

            # Apply filters
            filtered = []
            for doc in all_docs:
                meta = doc.get('metadata', {})

                # Filter by source_type
                if source_type and meta.get('source_type') != source_type:
                    continue

                # Filter by project_id
                if project_id and meta.get('project_id') != str(project_id):
                    continue

                filtered.append(doc)

            logger.debug(f"Listed {len(filtered)} documents")
            return filtered

        except Exception as e:
            logger.error(f"List documents error: {e}", exc_info=True)
            return []

    async def bulk_delete(
        self,
        document_ids: Optional[List[str]] = None,
        source_type: Optional[str] = None,
        delete_all: bool = False,
    ) -> Dict[str, Any]:
        """
        Bulk delete documents from the knowledge base.

        Args:
            document_ids: Specific document IDs to delete
            source_type: Delete all documents of this source type
            delete_all: Delete ALL documents (requires explicit flag)

        Returns:
            Dict with deleted count and status
        """
        try:
            deleted_count = 0

            if delete_all:
                deleted_count = self._vector_store.count()
                self._vector_store.clear()
                logger.warning(f"Bulk deleted ALL {deleted_count} documents")

            elif source_type:
                deleted_count = self._vector_store.delete_by_source_type(source_type)
                logger.info(f"Bulk deleted {deleted_count} documents of type '{source_type}'")

            elif document_ids:
                for doc_id in document_ids:
                    if self._vector_store.delete(doc_id):
                        deleted_count += 1
                logger.info(f"Bulk deleted {deleted_count}/{len(document_ids)} documents")

            return {
                "success": True,
                "deleted_count": deleted_count
            }

        except Exception as e:
            logger.error(f"Bulk delete error: {e}", exc_info=True)
            return {
                "success": False,
                "deleted_count": 0,
                "error": str(e)
            }

    async def index_codebase(
        self,
        repo_path: str,
        project_id: UUID,
        file_extensions: List[str],
        exclude_patterns: List[str],
        max_file_size_kb: int = 500,
    ) -> Dict[str, Any]:
        """
        Index a project's codebase into the knowledge base.

        Args:
            repo_path: Path to the repository root
            project_id: Project ID for isolation
            file_extensions: List of file extensions to include (e.g., ['.py', '.ts'])
            exclude_patterns: Directory patterns to exclude (e.g., ['node_modules', '.git'])
            max_file_size_kb: Maximum file size in KB to process

        Returns:
            Dict with files_processed, chunks_created, total_tokens, errors
        """
        import os
        from pathlib import Path

        files_processed = 0
        chunks_created = 0
        total_tokens = 0
        errors = []

        max_file_size_bytes = max_file_size_kb * 1024

        def should_exclude(path: Path) -> bool:
            """Check if path should be excluded."""
            parts = path.parts
            for pattern in exclude_patterns:
                if pattern in parts:
                    return True
            return False

        def chunk_content(content: str, chunk_size: int = 1500, overlap: int = 200) -> List[str]:
            """
            Split content into overlapping chunks.

            Args:
                content: Text content to chunk
                chunk_size: Target size per chunk in characters (~375 tokens)
                overlap: Overlap between chunks

            Returns:
                List of content chunks
            """
            if len(content) <= chunk_size:
                return [content]

            chunks = []
            start = 0
            while start < len(content):
                end = start + chunk_size

                # Try to find a good break point (newline or space)
                if end < len(content):
                    # Look for newline within last 100 chars
                    newline_pos = content.rfind('\n', end - 100, end)
                    if newline_pos > start:
                        end = newline_pos + 1
                    else:
                        # Look for space
                        space_pos = content.rfind(' ', end - 50, end)
                        if space_pos > start:
                            end = space_pos + 1

                chunks.append(content[start:end])
                start = end - overlap

            return chunks

        try:
            root_path = Path(repo_path)

            # Walk the directory tree
            for dirpath, dirnames, filenames in os.walk(root_path):
                current_dir = Path(dirpath)

                # Filter out excluded directories (modifies dirnames in-place)
                dirnames[:] = [d for d in dirnames if d not in exclude_patterns and not d.startswith('.')]

                for filename in filenames:
                    file_path = current_dir / filename

                    # Check extension
                    if not any(filename.endswith(ext) for ext in file_extensions):
                        continue

                    # Check if in excluded path
                    rel_path = file_path.relative_to(root_path)
                    if should_exclude(rel_path):
                        continue

                    # Check file size
                    try:
                        file_size = file_path.stat().st_size
                        if file_size > max_file_size_bytes:
                            errors.append(f"Skipped (too large): {rel_path}")
                            continue
                    except OSError as e:
                        errors.append(f"Error accessing {rel_path}: {e}")
                        continue

                    # Read file content
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                    except UnicodeDecodeError:
                        errors.append(f"Skipped (binary): {rel_path}")
                        continue
                    except Exception as e:
                        errors.append(f"Error reading {rel_path}: {e}")
                        continue

                    # Skip empty files
                    if not content.strip():
                        continue

                    # Chunk the content
                    chunks = chunk_content(content)

                    # Ingest each chunk
                    for i, chunk in enumerate(chunks):
                        chunk_title = f"{rel_path}"
                        if len(chunks) > 1:
                            chunk_title = f"{rel_path} (part {i + 1}/{len(chunks)})"

                        try:
                            await self.ingest(
                                content=chunk,
                                title=chunk_title,
                                source_type="code",
                                source_id=str(rel_path),
                                project_id=project_id,
                                metadata={
                                    "file_path": str(rel_path),
                                    "file_extension": file_path.suffix,
                                    "chunk_index": i,
                                    "total_chunks": len(chunks),
                                }
                            )
                            chunks_created += 1
                            total_tokens += len(chunk) // 4  # Rough token estimate
                        except Exception as e:
                            errors.append(f"Error ingesting {rel_path} chunk {i}: {e}")

                    files_processed += 1

            logger.info(
                f"Indexed codebase: {files_processed} files, "
                f"{chunks_created} chunks, {total_tokens} tokens"
            )

            return {
                "files_processed": files_processed,
                "chunks_created": chunks_created,
                "total_tokens": total_tokens,
                "errors": errors[:50],  # Limit error list
            }

        except Exception as e:
            logger.error(f"Index codebase error: {e}", exc_info=True)
            raise


# Singleton instance
_knowledge_service: Optional[KnowledgeService] = None


def get_knowledge_service() -> KnowledgeService:
    """Get the singleton KnowledgeService instance."""
    global _knowledge_service
    if _knowledge_service is None:
        _knowledge_service = KnowledgeService()
    return _knowledge_service
