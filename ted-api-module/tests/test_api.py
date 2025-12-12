"""
Tests pour l'API FastAPI.

Couvre:
- Endpoints REST
- Validation des paramètres
- Codes de retour HTTP
- Gestion des erreurs
"""

from datetime import datetime, timedelta
from typing import Any
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import status
from fastapi.testclient import TestClient

from ted_api.api.app import app
from ted_api.api import dependencies
from ted_api.cache import MemoryCache
from ted_api.config import Settings
from ted_api.database import TenderDatabase
from ted_api.models import PaginatedResponse, Tender


class TestTendersAPI:
    """Tests pour les endpoints /api/tenders."""

    @pytest.fixture
    def mock_db(self, sample_tenders: list[Tender]) -> AsyncMock:
        """Mock de la base de données."""
        mock = AsyncMock(spec=TenderDatabase)
        mock.get_tenders.return_value = PaginatedResponse(
            total=len(sample_tenders),
            page=1,
            limit=20,
            items=sample_tenders,
        )
        mock.get_tender_by_id.return_value = sample_tenders[0]
        mock.get_stats.return_value = {
            "total": len(sample_tenders),
            "active": len(sample_tenders),
            "by_country": {"FRA": 3, "DEU": 1},
            "total_value": 900000,
            "average_value": 225000,
        }
        mock.get_expiring_tenders.return_value = [sample_tenders[2]]
        return mock

    @pytest.fixture
    def mock_client(self, sample_tenders: list[Tender]) -> AsyncMock:
        """Mock du client TED API."""
        mock = AsyncMock()
        mock.get_active_tenders.return_value = sample_tenders
        return mock

    @pytest.fixture
    def client(
        self,
        test_settings: Settings,
        mock_db: AsyncMock,
        mock_client: AsyncMock,
    ) -> TestClient:
        """Client de test avec mocks."""
        # Override les dépendances
        async def get_db_override() -> AsyncMock:
            return mock_db

        async def get_client_override() -> AsyncMock:
            return mock_client

        async def get_cache_override() -> MemoryCache:
            return MemoryCache()

        app.dependency_overrides[dependencies.get_database] = get_db_override
        app.dependency_overrides[dependencies.get_ted_client] = get_client_override
        app.dependency_overrides[dependencies.get_cache] = get_cache_override

        with TestClient(app, raise_server_exceptions=False) as client:
            yield client

        # Nettoyer les overrides
        app.dependency_overrides.clear()

    def test_root_endpoint(self, client: TestClient) -> None:
        """Test endpoint racine."""
        response = client.get("/")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["name"] == "TED API Module"
        assert "version" in data

    def test_get_tenders_default(
        self, client: TestClient, mock_db: AsyncMock
    ) -> None:
        """Test GET /api/tenders sans paramètres."""
        response = client.get("/api/tenders")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert "total" in data
        assert "items" in data
        assert isinstance(data["items"], list)

    def test_get_tenders_with_country(
        self, client: TestClient, mock_db: AsyncMock
    ) -> None:
        """Test GET /api/tenders avec filtre pays."""
        response = client.get("/api/tenders?country=DEU")
        assert response.status_code == status.HTTP_200_OK

        # Vérifier que le filtre a été passé
        mock_db.get_tenders.assert_called_once()
        call_kwargs = mock_db.get_tenders.call_args
        filters = call_kwargs.kwargs.get("filters") or call_kwargs[1].get("filters")
        assert filters.country == "DEU"

    def test_get_tenders_with_cpv(
        self, client: TestClient, mock_db: AsyncMock
    ) -> None:
        """Test GET /api/tenders avec filtre CPV."""
        response = client.get("/api/tenders?cpv=30000000")
        assert response.status_code == status.HTTP_200_OK

    def test_get_tenders_with_value_range(
        self, client: TestClient, mock_db: AsyncMock
    ) -> None:
        """Test GET /api/tenders avec plage de valeurs."""
        response = client.get("/api/tenders?min_value=10000&max_value=500000")
        assert response.status_code == status.HTTP_200_OK

    def test_get_tenders_invalid_value_range(
        self, client: TestClient
    ) -> None:
        """Test GET /api/tenders avec plage invalide."""
        response = client.get("/api/tenders?min_value=500000&max_value=10000")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_get_tenders_with_search(
        self, client: TestClient, mock_db: AsyncMock
    ) -> None:
        """Test GET /api/tenders avec recherche texte."""
        response = client.get("/api/tenders?search=informatique")
        assert response.status_code == status.HTTP_200_OK

    def test_get_tenders_search_too_short(
        self, client: TestClient
    ) -> None:
        """Test GET /api/tenders avec recherche trop courte."""
        response = client.get("/api/tenders?search=a")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_get_tenders_pagination(
        self, client: TestClient, mock_db: AsyncMock
    ) -> None:
        """Test pagination."""
        response = client.get("/api/tenders?page=2&limit=50")
        assert response.status_code == status.HTTP_200_OK

        # Vérifier les paramètres de pagination
        call_kwargs = mock_db.get_tenders.call_args
        assert call_kwargs.kwargs.get("page") == 2 or call_kwargs[1].get("page") == 2

    def test_get_tenders_invalid_page(self, client: TestClient) -> None:
        """Test page invalide."""
        response = client.get("/api/tenders?page=0")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_get_tenders_invalid_limit(self, client: TestClient) -> None:
        """Test limite invalide."""
        response = client.get("/api/tenders?limit=200")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_get_tender_by_id(
        self, client: TestClient, mock_db: AsyncMock, sample_tenders: list[Tender]
    ) -> None:
        """Test GET /api/tenders/{id}."""
        notice_id = sample_tenders[0].notice_id
        response = client.get(f"/api/tenders/{notice_id}")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["notice_id"] == notice_id

    def test_get_tender_not_found(
        self, client: TestClient, mock_db: AsyncMock
    ) -> None:
        """Test GET /api/tenders/{id} non trouvé."""
        mock_db.get_tender_by_id.return_value = None

        response = client.get("/api/tenders/nonexistent-id")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_tenders_stats(
        self, client: TestClient, mock_db: AsyncMock
    ) -> None:
        """Test GET /api/tenders/stats."""
        response = client.get("/api/tenders/stats")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert "total" in data
        assert "by_country" in data

    def test_get_expiring_tenders(
        self, client: TestClient, mock_db: AsyncMock
    ) -> None:
        """Test GET /api/tenders/expiring."""
        response = client.get("/api/tenders/expiring?days=7")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert isinstance(data, list)

    def test_get_expiring_tenders_invalid_days(
        self, client: TestClient
    ) -> None:
        """Test GET /api/tenders/expiring avec days invalide."""
        response = client.get("/api/tenders/expiring?days=100")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestSyncAPI:
    """Tests pour les endpoints de synchronisation."""

    @pytest.fixture
    def mock_db(self, sample_tenders: list[Tender]) -> AsyncMock:
        """Mock de la base de données."""
        mock = AsyncMock(spec=TenderDatabase)
        mock.upsert_tenders.return_value = (5, 2)
        mock.get_stats.return_value = {"total": 7}
        return mock

    @pytest.fixture
    def mock_client(self, sample_tenders: list[Tender]) -> AsyncMock:
        """Mock du client TED API."""
        mock = AsyncMock()
        mock.get_active_tenders.return_value = sample_tenders
        return mock

    @pytest.fixture
    def client(
        self,
        test_settings: Settings,
        mock_db: AsyncMock,
        mock_client: AsyncMock,
    ) -> TestClient:
        """Client de test."""
        async def get_db_override() -> AsyncMock:
            return mock_db

        async def get_client_override() -> AsyncMock:
            return mock_client

        async def get_cache_override() -> MemoryCache:
            return MemoryCache()

        app.dependency_overrides[dependencies.get_database] = get_db_override
        app.dependency_overrides[dependencies.get_ted_client] = get_client_override
        app.dependency_overrides[dependencies.get_cache] = get_cache_override

        with TestClient(app, raise_server_exceptions=False) as client:
            yield client

        app.dependency_overrides.clear()

    def test_trigger_sync(
        self, client: TestClient, mock_db: AsyncMock, mock_client: AsyncMock
    ) -> None:
        """Test POST /api/tenders/sync."""
        response = client.post("/api/tenders/sync?country=FRA")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["status"] == "completed"
        assert "total_synced" in data

    def test_get_sync_status(self, client: TestClient) -> None:
        """Test GET /api/tenders/sync/status."""
        response = client.get("/api/tenders/sync/status")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert "status" in data

    def test_delete_expired(
        self, client: TestClient, mock_db: AsyncMock
    ) -> None:
        """Test DELETE /api/tenders/expired."""
        mock_db.delete_expired_tenders.return_value = 3

        response = client.delete("/api/tenders/expired")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["deleted"] == 3


class TestHealthCheck:
    """Tests pour le health check."""

    @pytest.fixture
    def mock_db(self) -> AsyncMock:
        """Mock de la base de données."""
        mock = AsyncMock(spec=TenderDatabase)
        mock.get_stats.return_value = {"total": 100}
        return mock

    @pytest.fixture
    def client(self, mock_db: AsyncMock) -> TestClient:
        """Client de test."""
        async def get_db_override() -> AsyncMock:
            return mock_db

        app.dependency_overrides[dependencies.get_database] = get_db_override

        with TestClient(app, raise_server_exceptions=False) as client:
            yield client

        app.dependency_overrides.clear()

    def test_health_check_ok(
        self, client: TestClient, mock_db: AsyncMock
    ) -> None:
        """Test GET /api/health."""
        response = client.get("/api/health")
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["status"] == "ok"
        assert data["database"] == "connected"

    def test_health_check_db_error(
        self, client: TestClient, mock_db: AsyncMock
    ) -> None:
        """Test health check avec erreur DB."""
        mock_db.get_stats.side_effect = Exception("DB error")

        response = client.get("/api/health")
        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
