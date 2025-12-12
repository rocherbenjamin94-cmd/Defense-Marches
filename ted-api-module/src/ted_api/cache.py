"""
Système de cache avec auto-détection Redis/Mémoire.

Fournit une abstraction de cache avec deux implémentations:
- MemoryCache: Cache en mémoire (dict avec expiration)
- RedisCache: Cache Redis distribué

L'auto-détection choisit Redis si disponible, sinon mémoire.
"""

import asyncio
import json
import time
from abc import ABC, abstractmethod
from typing import Any

import structlog

logger = structlog.get_logger(__name__)


class CacheBackend(ABC):
    """Interface abstraite pour les backends de cache."""

    @abstractmethod
    async def get(self, key: str) -> Any | None:
        """
        Récupère une valeur du cache.

        Args:
            key: Clé de cache

        Returns:
            Valeur ou None si non trouvée/expirée
        """
        ...

    @abstractmethod
    async def set(self, key: str, value: Any, ttl: int) -> None:
        """
        Stocke une valeur dans le cache.

        Args:
            key: Clé de cache
            value: Valeur à stocker (doit être sérialisable JSON)
            ttl: Durée de vie en secondes
        """
        ...

    @abstractmethod
    async def delete(self, key: str) -> bool:
        """
        Supprime une clé du cache.

        Args:
            key: Clé à supprimer

        Returns:
            True si la clé existait
        """
        ...

    @abstractmethod
    async def clear(self) -> None:
        """Vide tout le cache."""
        ...

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Vérifie si une clé existe et n'est pas expirée."""
        ...

    async def close(self) -> None:
        """Ferme les connexions (optionnel)."""
        pass


class MemoryCache(CacheBackend):
    """
    Cache en mémoire avec expiration.

    Stocke les données dans un dictionnaire avec timestamp d'expiration.
    Nettoyage automatique des entrées expirées.
    """

    def __init__(self) -> None:
        self._cache: dict[str, tuple[Any, float]] = {}
        self._lock = asyncio.Lock()
        self._log = logger.bind(component="MemoryCache")
        self._log.info("Memory cache initialized")

    async def get(self, key: str) -> Any | None:
        """Récupère une valeur du cache mémoire."""
        async with self._lock:
            if key not in self._cache:
                return None

            value, expires_at = self._cache[key]

            # Vérifier expiration
            if time.time() > expires_at:
                del self._cache[key]
                return None

            return value

    async def set(self, key: str, value: Any, ttl: int) -> None:
        """Stocke une valeur avec TTL."""
        async with self._lock:
            expires_at = time.time() + ttl
            self._cache[key] = (value, expires_at)
            self._log.debug("Cache set", key=key, ttl=ttl)

    async def delete(self, key: str) -> bool:
        """Supprime une clé du cache."""
        async with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False

    async def clear(self) -> None:
        """Vide le cache."""
        async with self._lock:
            self._cache.clear()
            self._log.info("Cache cleared")

    async def exists(self, key: str) -> bool:
        """Vérifie l'existence d'une clé."""
        value = await self.get(key)
        return value is not None

    async def cleanup_expired(self) -> int:
        """
        Nettoie les entrées expirées.

        Returns:
            Nombre d'entrées supprimées
        """
        async with self._lock:
            now = time.time()
            expired_keys = [
                key for key, (_, expires_at) in self._cache.items()
                if now > expires_at
            ]
            for key in expired_keys:
                del self._cache[key]

            if expired_keys:
                self._log.debug("Expired entries cleaned", count=len(expired_keys))

            return len(expired_keys)

    @property
    def size(self) -> int:
        """Nombre d'entrées dans le cache."""
        return len(self._cache)


class RedisCache(CacheBackend):
    """
    Cache Redis distribué.

    Utilise redis-py async pour la communication avec Redis.
    Compatible avec Upstash Redis (serverless).
    """

    def __init__(self, redis_url: str) -> None:
        """
        Initialise la connexion Redis.

        Args:
            redis_url: URL de connexion Redis
                       Ex: "redis://localhost:6379/0"
                       Ou Upstash: "rediss://default:xxx@xxx.upstash.io:6379"
        """
        self._redis_url = redis_url
        self._redis: Any = None
        self._log = logger.bind(component="RedisCache")

    async def _ensure_connection(self) -> Any:
        """Crée ou retourne la connexion Redis."""
        if self._redis is None:
            try:
                import redis.asyncio as aioredis
                self._redis = aioredis.from_url(
                    self._redis_url,
                    encoding="utf-8",
                    decode_responses=True,
                )
                # Test de connexion
                await self._redis.ping()
                self._log.info("Redis connection established")
            except Exception as e:
                self._log.error("Redis connection failed", error=str(e))
                raise
        return self._redis

    async def get(self, key: str) -> Any | None:
        """Récupère une valeur de Redis."""
        try:
            redis = await self._ensure_connection()
            data = await redis.get(key)
            if data is None:
                return None
            return json.loads(data)
        except Exception as e:
            self._log.warning("Redis get failed", key=key, error=str(e))
            return None

    async def set(self, key: str, value: Any, ttl: int) -> None:
        """Stocke une valeur dans Redis avec TTL."""
        try:
            redis = await self._ensure_connection()
            data = json.dumps(value)
            await redis.setex(key, ttl, data)
            self._log.debug("Redis set", key=key, ttl=ttl)
        except Exception as e:
            self._log.warning("Redis set failed", key=key, error=str(e))

    async def delete(self, key: str) -> bool:
        """Supprime une clé de Redis."""
        try:
            redis = await self._ensure_connection()
            result = await redis.delete(key)
            return result > 0
        except Exception as e:
            self._log.warning("Redis delete failed", key=key, error=str(e))
            return False

    async def clear(self) -> None:
        """Vide le cache Redis (clés ted:*)."""
        try:
            redis = await self._ensure_connection()
            # Scan et suppression des clés TED uniquement
            cursor = 0
            while True:
                cursor, keys = await redis.scan(cursor, match="ted:*", count=100)
                if keys:
                    await redis.delete(*keys)
                if cursor == 0:
                    break
            self._log.info("Redis cache cleared")
        except Exception as e:
            self._log.warning("Redis clear failed", error=str(e))

    async def exists(self, key: str) -> bool:
        """Vérifie l'existence d'une clé dans Redis."""
        try:
            redis = await self._ensure_connection()
            return await redis.exists(key) > 0
        except Exception as e:
            self._log.warning("Redis exists failed", key=key, error=str(e))
            return False

    async def close(self) -> None:
        """Ferme la connexion Redis."""
        if self._redis is not None:
            await self._redis.close()
            self._redis = None
            self._log.info("Redis connection closed")


def get_cache_backend(redis_url: str | None = None) -> CacheBackend:
    """
    Factory pour obtenir le backend de cache approprié.

    Auto-détecte Redis si l'URL est fournie et la connexion réussit,
    sinon utilise le cache mémoire.

    Args:
        redis_url: URL Redis optionnelle

    Returns:
        CacheBackend: MemoryCache ou RedisCache
    """
    if redis_url:
        try:
            # Vérifier que redis est installé
            import redis.asyncio  # noqa: F401
            cache = RedisCache(redis_url)
            logger.info("Using Redis cache", url=redis_url[:20] + "...")
            return cache
        except ImportError:
            logger.warning("redis package not installed, using memory cache")
        except Exception as e:
            logger.warning("Redis unavailable, using memory cache", error=str(e))

    logger.info("Using memory cache")
    return MemoryCache()


async def get_cache_backend_async(redis_url: str | None = None) -> CacheBackend:
    """
    Factory async qui teste la connexion Redis.

    Args:
        redis_url: URL Redis optionnelle

    Returns:
        CacheBackend validé et connecté
    """
    if redis_url:
        try:
            import redis.asyncio  # noqa: F401
            cache = RedisCache(redis_url)
            # Test de connexion
            await cache._ensure_connection()
            logger.info("Redis cache connected")
            return cache
        except Exception as e:
            logger.warning("Redis connection failed, using memory", error=str(e))

    return MemoryCache()
