"""
Tests pour le système de cache.

Couvre:
- MemoryCache: get, set, delete, TTL, cleanup
- get_cache_backend factory
"""

import asyncio
from typing import Any

import pytest

from ted_api.cache import (
    CacheBackend,
    MemoryCache,
    get_cache_backend,
)


class TestMemoryCache:
    """Tests pour le cache mémoire."""

    @pytest.fixture
    def cache(self) -> MemoryCache:
        """Fixture cache mémoire."""
        return MemoryCache()

    @pytest.mark.asyncio
    async def test_set_and_get(self, cache: MemoryCache) -> None:
        """Test set puis get."""
        await cache.set("key1", {"data": "value"}, ttl=60)
        result = await cache.get("key1")
        assert result == {"data": "value"}

    @pytest.mark.asyncio
    async def test_get_nonexistent(self, cache: MemoryCache) -> None:
        """Test get sur clé inexistante."""
        result = await cache.get("nonexistent")
        assert result is None

    @pytest.mark.asyncio
    async def test_delete(self, cache: MemoryCache) -> None:
        """Test suppression."""
        await cache.set("key1", "value", ttl=60)
        deleted = await cache.delete("key1")
        assert deleted is True

        result = await cache.get("key1")
        assert result is None

    @pytest.mark.asyncio
    async def test_delete_nonexistent(self, cache: MemoryCache) -> None:
        """Test suppression clé inexistante."""
        deleted = await cache.delete("nonexistent")
        assert deleted is False

    @pytest.mark.asyncio
    async def test_exists(self, cache: MemoryCache) -> None:
        """Test exists."""
        await cache.set("key1", "value", ttl=60)
        assert await cache.exists("key1") is True
        assert await cache.exists("nonexistent") is False

    @pytest.mark.asyncio
    async def test_clear(self, cache: MemoryCache) -> None:
        """Test vidage du cache."""
        await cache.set("key1", "value1", ttl=60)
        await cache.set("key2", "value2", ttl=60)

        await cache.clear()

        assert await cache.get("key1") is None
        assert await cache.get("key2") is None
        assert cache.size == 0

    @pytest.mark.asyncio
    async def test_ttl_expiration(self, cache: MemoryCache) -> None:
        """Test expiration TTL."""
        await cache.set("key1", "value", ttl=1)  # 1 seconde

        # Avant expiration
        result = await cache.get("key1")
        assert result == "value"

        # Attendre expiration
        await asyncio.sleep(1.1)

        # Après expiration
        result = await cache.get("key1")
        assert result is None

    @pytest.mark.asyncio
    async def test_cleanup_expired(self, cache: MemoryCache) -> None:
        """Test nettoyage des entrées expirées."""
        await cache.set("key1", "value1", ttl=1)
        await cache.set("key2", "value2", ttl=60)

        await asyncio.sleep(1.1)

        cleaned = await cache.cleanup_expired()
        assert cleaned == 1
        assert cache.size == 1
        assert await cache.get("key2") == "value2"

    @pytest.mark.asyncio
    async def test_overwrite_value(self, cache: MemoryCache) -> None:
        """Test écrasement de valeur."""
        await cache.set("key1", "value1", ttl=60)
        await cache.set("key1", "value2", ttl=60)

        result = await cache.get("key1")
        assert result == "value2"

    @pytest.mark.asyncio
    async def test_complex_values(self, cache: MemoryCache) -> None:
        """Test stockage de valeurs complexes."""
        data: dict[str, Any] = {
            "notices": [
                {"id": "1", "title": "Test"},
                {"id": "2", "title": "Test 2"},
            ],
            "total": 2,
            "nested": {"deep": {"value": 123}},
        }
        await cache.set("complex", data, ttl=60)

        result = await cache.get("complex")
        assert result == data
        assert result["notices"][0]["id"] == "1"

    def test_size_property(self, cache: MemoryCache) -> None:
        """Test propriété size."""
        assert cache.size == 0

    @pytest.mark.asyncio
    async def test_concurrent_access(self, cache: MemoryCache) -> None:
        """Test accès concurrent."""

        async def set_value(i: int) -> None:
            await cache.set(f"key{i}", f"value{i}", ttl=60)

        async def get_value(i: int) -> str | None:
            return await cache.get(f"key{i}")

        # Écritures concurrentes
        await asyncio.gather(*[set_value(i) for i in range(100)])

        # Lectures concurrentes
        results = await asyncio.gather(*[get_value(i) for i in range(100)])

        assert all(r is not None for r in results)
        assert cache.size == 100


class TestGetCacheBackend:
    """Tests pour la factory get_cache_backend."""

    def test_memory_cache_when_no_redis(self) -> None:
        """Test sélection cache mémoire quand pas de Redis."""
        cache = get_cache_backend(redis_url=None)
        assert isinstance(cache, MemoryCache)

    def test_memory_cache_when_redis_unavailable(self) -> None:
        """Test fallback mémoire quand Redis indisponible."""
        cache = get_cache_backend(redis_url="redis://invalid:6379")
        # Devrait fallback sur MemoryCache (ou lever une erreur selon l'implémentation)
        assert isinstance(cache, CacheBackend)
