"""TED API - FastAPI Application"""

from ted_api.api.app import app
from ted_api.api.routes import router

__all__ = ["app", "router"]
