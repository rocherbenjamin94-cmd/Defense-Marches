"""
Dépendances FastAPI pour l'injection.

Fournit les singletons pour:
- Settings
- Cache backend
- Database
- TED API Client
- Scheduler
"""

from typing import AsyncGenerator

import structlog

from ted_api.cache import CacheBackend, get_cache_backend_async
from ted_api.client import TEDAPIClient
from ted_api.config import Settings, get_settings
from ted_api.database import TenderDatabase

logger = structlog.get_logger(__name__)

# Singletons (initialisés au démarrage)
_cache: CacheBackend | None = None
_database: TenderDatabase | None = None
_client: TEDAPIClient | None = None


async def init_dependencies(settings: Settings | None = None) -> None:
    """
    Initialise toutes les dépendances au démarrage.

    Args:
        settings: Configuration (optionnel, utilise get_settings() sinon)
    """
    global _cache, _database, _client

    if settings is None:
        settings = get_settings()

    logger.info("Initializing dependencies...")

    # Cache
    _cache = await get_cache_backend_async(settings.redis_url)
    logger.info("Cache initialized", type=type(_cache).__name__)

    # Database
    _database = TenderDatabase(settings.async_database_url)
    await _database.init_schema()
    logger.info("Database initialized", url=settings.database_url)

    # TED API Client
    _client = TEDAPIClient(settings, _cache)
    logger.info("TED API client initialized")


async def shutdown_dependencies() -> None:
    """Ferme proprement toutes les dépendances."""
    global _cache, _database, _client

    logger.info("Shutting down dependencies...")

    if _client is not None:
        await _client.close()
        _client = None

    if _database is not None:
        await _database.close()
        _database = None

    if _cache is not None:
        await _cache.close()
        _cache = None

    logger.info("Dependencies shut down")


def get_settings_dep() -> Settings:
    """Dépendance pour les settings."""
    return get_settings()


async def get_cache() -> CacheBackend:
    """Dépendance pour le cache."""
    if _cache is None:
        raise RuntimeError("Cache not initialized. Call init_dependencies() first.")
    return _cache


async def get_database() -> TenderDatabase:
    """Dépendance pour la base de données."""
    if _database is None:
        raise RuntimeError("Database not initialized. Call init_dependencies() first.")
    return _database


async def get_ted_client() -> TEDAPIClient:
    """Dépendance pour le client TED API."""
    if _client is None:
        raise RuntimeError("TED client not initialized. Call init_dependencies() first.")
    return _client


async def get_ted_client_context() -> AsyncGenerator[TEDAPIClient, None]:
    """
    Context manager pour le client TED API.

    Utile pour les tests ou l'utilisation standalone.
    """
    settings = get_settings()
    cache = await get_cache_backend_async(settings.redis_url)

    async with TEDAPIClient(settings, cache) as client:
        yield client

    await cache.close()
