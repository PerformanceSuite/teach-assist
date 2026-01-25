"""
Health Check Router

Provides system health and status endpoints.
"""

from fastapi import APIRouter, Depends

from api.deps import get_knowledge_engine, get_persona_store

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint.

    Returns system status and service availability.
    """
    # Check persona store
    try:
        persona_store = get_persona_store()
        personas_ok = len(persona_store.list()) > 0
    except Exception:
        personas_ok = False

    # Check knowledge engine
    knowledge_ok = get_knowledge_engine() is not None

    return {
        "status": "healthy" if personas_ok else "degraded",
        "version": "0.1.0",
        "services": {
            "personas": "ok" if personas_ok else "not_initialized",
            "knowledgebeast": "ok" if knowledge_ok else "not_initialized",
        },
    }


@router.get("/health/ready")
async def readiness_check():
    """
    Readiness check for load balancers.

    Returns 200 if ready to serve traffic.
    """
    return {"ready": True}


@router.get("/health/live")
async def liveness_check():
    """
    Liveness check for container orchestration.

    Returns 200 if the process is alive.
    """
    return {"alive": True}
