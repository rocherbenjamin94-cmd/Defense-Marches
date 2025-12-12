"""
Fixtures pytest pour les tests TED API.

Fournit des fixtures réutilisables pour:
- Configuration de test
- Base de données temporaire
- Client API mocké
- Cache mémoire
- Application FastAPI de test
"""

import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, AsyncGenerator, Generator

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient

from ted_api.cache import MemoryCache
from ted_api.config import Settings
from ted_api.database import TenderDatabase
from ted_api.models import Tender


# Configurer pytest-asyncio
pytest_plugins = ["pytest_asyncio"]


@pytest.fixture
def test_settings(tmp_path: Path) -> Settings:
    """Settings de test avec base de données temporaire."""
    return Settings(
        ted_api_url="https://api.ted.europa.eu/v3/search",
        ted_default_country="FRA",
        ted_default_limit=10,
        ted_request_timeout=10.0,
        database_path=str(tmp_path / "test.db"),
        cache_ttl=60,
        redis_url=None,
        sync_enabled=False,
        api_host="127.0.0.1",
        api_port=8001,
        log_level="DEBUG",
    )


@pytest_asyncio.fixture
async def test_db(test_settings: Settings) -> AsyncGenerator[TenderDatabase, None]:
    """Base de données de test initialisée."""
    db = TenderDatabase(test_settings.database_path)
    await db.init_schema()
    yield db
    await db.close()


@pytest.fixture
def memory_cache() -> MemoryCache:
    """Cache mémoire pour les tests."""
    return MemoryCache()


@pytest.fixture
def sample_tender() -> Tender:
    """Tender de test."""
    return Tender(
        notice_id="123456-2024",
        title="Fourniture de matériel informatique",
        description="Acquisition de serveurs et postes de travail",
        buyer_name="Ministère de l'Intérieur",
        buyer_country="FRA",
        estimated_value=250000.0,
        currency="EUR",
        deadline=datetime.now() + timedelta(days=30),
        publication_date=datetime.now() - timedelta(days=5),
        cpv_codes=["30200000", "30210000"],
        procedure_type="OPEN",
        place_of_performance="FR",
        url="https://ted.europa.eu/en/notice/-/detail/123456-2024",
    )


@pytest.fixture
def sample_tenders() -> list[Tender]:
    """Liste de Tenders de test."""
    now = datetime.now()
    return [
        Tender(
            notice_id="111111-2024",
            title="Services informatiques",
            description="Développement logiciel",
            buyer_name="Région Île-de-France",
            buyer_country="FRA",
            estimated_value=100000.0,
            currency="EUR",
            deadline=now + timedelta(days=15),
            publication_date=now - timedelta(days=3),
            cpv_codes=["72000000"],
            procedure_type="OPEN",
            place_of_performance="FR",
            url="https://ted.europa.eu/en/notice/-/detail/111111-2024",
        ),
        Tender(
            notice_id="222222-2024",
            title="Travaux de construction",
            description="Rénovation bâtiment",
            buyer_name="Mairie de Paris",
            buyer_country="FRA",
            estimated_value=500000.0,
            currency="EUR",
            deadline=now + timedelta(days=45),
            publication_date=now - timedelta(days=10),
            cpv_codes=["45000000"],
            procedure_type="RESTRICTED",
            place_of_performance="FR75",
            url="https://ted.europa.eu/en/notice/-/detail/222222-2024",
        ),
        Tender(
            notice_id="333333-2024",
            title="Fourniture de mobilier",
            description="Mobilier de bureau",
            buyer_name="Université de Lyon",
            buyer_country="FRA",
            estimated_value=50000.0,
            currency="EUR",
            deadline=now + timedelta(days=5),  # Expire bientôt
            publication_date=now - timedelta(days=20),
            cpv_codes=["39100000"],
            procedure_type="OPEN",
            place_of_performance="FR71",
            url="https://ted.europa.eu/en/notice/-/detail/333333-2024",
        ),
        Tender(
            notice_id="444444-2024",
            title="IT Equipment Supply",
            description="Computer equipment",
            buyer_name="Bundesministerium",
            buyer_country="DEU",  # Allemagne
            estimated_value=750000.0,
            currency="EUR",
            deadline=now + timedelta(days=60),
            publication_date=now - timedelta(days=2),
            cpv_codes=["30200000"],
            procedure_type="OPEN",
            place_of_performance="DE",
            url="https://ted.europa.eu/en/notice/-/detail/444444-2024",
        ),
    ]


@pytest.fixture
def mock_ted_response() -> dict[str, Any]:
    """Réponse TED API mockée."""
    now = datetime.now()
    deadline = now + timedelta(days=30)
    pub_date = now - timedelta(days=5)

    return {
        "total": 2,
        "page": 1,
        "limit": 100,
        "notices": [
            {
                "notice-id": "123456-2024",
                "publication-date": pub_date.strftime("%Y%m%d"),
                "notice-title": "Fourniture de matériel informatique",
                "notice-description": "Acquisition de serveurs",
                "buyer-name": "Ministère de l'Intérieur",
                "buyer-country": "FRA",
                "estimated-value": "250000",
                "estimated-value-currency": "EUR",
                "deadline-for-submission": deadline.strftime("%Y%m%d"),
                "classification-cpv": ["30200000"],
                "procedure-type": "OPEN",
                "place-of-performance": "FR",
                "notice-url": "https://ted.europa.eu/en/notice/-/detail/123456-2024",
            },
            {
                "notice-id": "789012-2024",
                "publication-date": pub_date.strftime("%Y%m%d"),
                "notice-title": "Services de conseil",
                "notice-description": None,
                "buyer-name": "Agence Nationale",
                "buyer-country": "FRA",
                "estimated-value": None,
                "estimated-value-currency": None,
                "deadline-for-submission": None,
                "classification-cpv": "71000000",  # String unique
                "procedure-type": "NEGOTIATED",
                "place-of-performance": "FR",
                "notice-url": "https://ted.europa.eu/en/notice/-/detail/789012-2024",
            },
        ],
    }


@pytest.fixture
def mock_ted_empty_response() -> dict[str, Any]:
    """Réponse TED API vide."""
    return {
        "total": 0,
        "page": 1,
        "limit": 100,
        "notices": [],
    }


# Fixture pour le TestClient FastAPI
@pytest.fixture
def test_client(test_settings: Settings) -> Generator[TestClient, None, None]:
    """Client de test FastAPI."""
    # Importer ici pour éviter les imports circulaires
    from ted_api.api.app import app
    from ted_api.api import dependencies

    # Override les dépendances
    original_get_settings = dependencies.get_settings_dep

    async def mock_get_settings() -> Settings:
        return test_settings

    dependencies.get_settings_dep = mock_get_settings  # type: ignore

    with TestClient(app) as client:
        yield client

    # Restaurer
    dependencies.get_settings_dep = original_get_settings


# Marqueur pour les tests d'intégration (nécessitent API TED réelle)
def pytest_configure(config: Any) -> None:
    """Configure les marqueurs pytest."""
    config.addinivalue_line(
        "markers",
        "integration: marks tests as integration tests (require real TED API)",
    )
    config.addinivalue_line(
        "markers",
        "slow: marks tests as slow running",
    )
