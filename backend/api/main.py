"""
TeachAssist API - Main Application

FastAPI application that provides:
- Sources API: Document ingestion and management
- Chat API: Grounded RAG conversations
- Council API: Inner Council advisory personas
- Grading API: Batch feedback workflows
- Planning API: UbD lesson planning
- Narratives API: Semester narrative comment synthesis
"""

from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.config import settings
from api.routers import chat, council, grading, health, narratives, planning, sources, students

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    logger.info("teachassist_starting", version="0.1.0")

    # Initialize KnowledgeBeast on startup
    # TODO: Initialize vector store, embedding engine

    yield

    logger.info("teachassist_shutting_down")


app = FastAPI(
    title="TeachAssist API",
    description="Teacher-first professional operating system API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router, tags=["health"])
app.include_router(sources.router, prefix="/api/v1/sources", tags=["sources"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(council.router, prefix="/api/v1/council", tags=["council"])
app.include_router(grading.router, prefix="/api/v1/grading", tags=["grading"])
app.include_router(planning.router, prefix="/api/v1/planning", tags=["planning"])
app.include_router(narratives.router, prefix="/api/v1/narratives", tags=["narratives"])
app.include_router(students.router, prefix="/api/v1/students", tags=["students"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "TeachAssist API",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
    )
