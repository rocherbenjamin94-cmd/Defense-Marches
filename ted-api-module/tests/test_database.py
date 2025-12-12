"""
Tests pour la base de données SQLite.

Couvre:
- Initialisation du schéma
- CRUD des tenders
- Filtrage et pagination
- Statistiques
"""

from datetime import datetime, timedelta

import pytest
import pytest_asyncio

from ted_api.database import TenderDatabase
from ted_api.models import Tender, TenderFilter


class TestTenderDatabase:
    """Tests pour TenderDatabase."""

    @pytest_asyncio.fixture
    async def db(self, tmp_path) -> TenderDatabase:
        """Fixture base de données de test."""
        db = TenderDatabase(str(tmp_path / "test.db"))
        await db.init_schema()
        yield db
        await db.close()

    @pytest.mark.asyncio
    async def test_init_schema(self, db: TenderDatabase) -> None:
        """Test initialisation du schéma."""
        # Le schéma devrait être créé sans erreur
        # Re-exécuter init_schema ne devrait pas échouer
        await db.init_schema()

    @pytest.mark.asyncio
    async def test_upsert_single_tender(
        self, db: TenderDatabase, sample_tender: Tender
    ) -> None:
        """Test insertion d'un seul tender."""
        inserted, updated = await db.upsert_tenders([sample_tender])
        assert inserted == 1
        assert updated == 0

    @pytest.mark.asyncio
    async def test_upsert_multiple_tenders(
        self, db: TenderDatabase, sample_tenders: list[Tender]
    ) -> None:
        """Test insertion de plusieurs tenders."""
        inserted, updated = await db.upsert_tenders(sample_tenders)
        assert inserted == len(sample_tenders)
        assert updated == 0

    @pytest.mark.asyncio
    async def test_upsert_update_existing(
        self, db: TenderDatabase, sample_tender: Tender
    ) -> None:
        """Test mise à jour d'un tender existant."""
        # Première insertion
        await db.upsert_tenders([sample_tender])

        # Modification et mise à jour
        updated_tender = sample_tender.model_copy(
            update={"title": "Titre modifié"}
        )
        inserted, updated = await db.upsert_tenders([updated_tender])

        assert inserted == 0
        assert updated == 1

        # Vérifier la mise à jour
        result = await db.get_tender_by_id(sample_tender.notice_id)
        assert result is not None
        assert result.title == "Titre modifié"

    @pytest.mark.asyncio
    async def test_upsert_empty_list(self, db: TenderDatabase) -> None:
        """Test upsert avec liste vide."""
        inserted, updated = await db.upsert_tenders([])
        assert inserted == 0
        assert updated == 0

    @pytest.mark.asyncio
    async def test_get_tender_by_id(
        self, db: TenderDatabase, sample_tender: Tender
    ) -> None:
        """Test récupération par ID."""
        await db.upsert_tenders([sample_tender])

        result = await db.get_tender_by_id(sample_tender.notice_id)
        assert result is not None
        assert result.notice_id == sample_tender.notice_id
        assert result.title == sample_tender.title

    @pytest.mark.asyncio
    async def test_get_tender_by_id_not_found(self, db: TenderDatabase) -> None:
        """Test récupération ID inexistant."""
        result = await db.get_tender_by_id("nonexistent-id")
        assert result is None

    @pytest.mark.asyncio
    async def test_get_tenders_no_filter(
        self, db: TenderDatabase, sample_tenders: list[Tender]
    ) -> None:
        """Test récupération sans filtre."""
        await db.upsert_tenders(sample_tenders)

        result = await db.get_tenders()
        assert result.total == len(sample_tenders)
        assert len(result.items) == len(sample_tenders)

    @pytest.mark.asyncio
    async def test_get_tenders_filter_country(
        self, db: TenderDatabase, sample_tenders: list[Tender]
    ) -> None:
        """Test filtre par pays."""
        await db.upsert_tenders(sample_tenders)

        filters = TenderFilter(country="FRA")
        result = await db.get_tenders(filters=filters)

        # sample_tenders contient 3 FRA et 1 DEU
        assert result.total == 3
        assert all(t.buyer_country == "FRA" for t in result.items)

    @pytest.mark.asyncio
    async def test_get_tenders_filter_cpv(
        self, db: TenderDatabase, sample_tenders: list[Tender]
    ) -> None:
        """Test filtre par code CPV."""
        await db.upsert_tenders(sample_tenders)

        filters = TenderFilter(country=None, cpv="30")  # Préfixe IT
        result = await db.get_tenders(filters=filters)

        # Deux tenders ont des CPV commençant par 30
        assert result.total >= 1

    @pytest.mark.asyncio
    async def test_get_tenders_filter_value_range(
        self, db: TenderDatabase, sample_tenders: list[Tender]
    ) -> None:
        """Test filtre par plage de valeur."""
        await db.upsert_tenders(sample_tenders)

        filters = TenderFilter(
            country=None,
            min_value=100000,
            max_value=500000,
        )
        result = await db.get_tenders(filters=filters)

        for tender in result.items:
            assert tender.estimated_value is not None
            assert 100000 <= tender.estimated_value <= 500000

    @pytest.mark.asyncio
    async def test_get_tenders_filter_search_text(
        self, db: TenderDatabase, sample_tenders: list[Tender]
    ) -> None:
        """Test recherche full-text."""
        await db.upsert_tenders(sample_tenders)

        filters = TenderFilter(country=None, search_text="informatique")
        result = await db.get_tenders(filters=filters)

        assert result.total >= 1
        assert any("informatique" in t.title.lower() for t in result.items)

    @pytest.mark.asyncio
    async def test_get_tenders_pagination(
        self, db: TenderDatabase, sample_tenders: list[Tender]
    ) -> None:
        """Test pagination."""
        await db.upsert_tenders(sample_tenders)

        # Page 1
        result1 = await db.get_tenders(page=1, limit=2)
        assert len(result1.items) == 2
        assert result1.page == 1
        assert result1.total == len(sample_tenders)

        # Page 2
        result2 = await db.get_tenders(page=2, limit=2)
        assert len(result2.items) == 2
        assert result2.page == 2

        # Les items doivent être différents
        ids1 = {t.notice_id for t in result1.items}
        ids2 = {t.notice_id for t in result2.items}
        assert ids1.isdisjoint(ids2)

    @pytest.mark.asyncio
    async def test_get_new_tenders_since(
        self, db: TenderDatabase, sample_tenders: list[Tender]
    ) -> None:
        """Test récupération des nouvelles notices."""
        # Insérer des tenders
        await db.upsert_tenders(sample_tenders)

        # Récupérer depuis une heure avant
        since = datetime.now() - timedelta(hours=1)
        new_tenders = await db.get_new_tenders_since(since)

        assert len(new_tenders) == len(sample_tenders)

    @pytest.mark.asyncio
    async def test_get_expiring_tenders(
        self, db: TenderDatabase, sample_tenders: list[Tender]
    ) -> None:
        """Test récupération des tenders expirant bientôt."""
        await db.upsert_tenders(sample_tenders)

        # Tenders expirant dans 7 jours
        expiring = await db.get_expiring_tenders(days=7)

        # Au moins un tender devrait expirer dans 5 jours
        assert len(expiring) >= 1

    @pytest.mark.asyncio
    async def test_delete_expired_tenders(self, db: TenderDatabase) -> None:
        """Test suppression des tenders expirés."""
        # Créer un tender expiré
        expired_tender = Tender(
            notice_id="expired-1",
            title="Tender expiré",
            buyer_name="Test",
            buyer_country="FRA",
            publication_date=datetime.now() - timedelta(days=60),
            deadline=datetime.now() - timedelta(days=1),  # Hier
            url="https://test.com",
        )
        await db.upsert_tenders([expired_tender])

        deleted = await db.delete_expired_tenders()
        assert deleted == 1

        # Vérifier suppression
        result = await db.get_tender_by_id("expired-1")
        assert result is None

    @pytest.mark.asyncio
    async def test_get_stats(
        self, db: TenderDatabase, sample_tenders: list[Tender]
    ) -> None:
        """Test statistiques."""
        await db.upsert_tenders(sample_tenders)

        stats = await db.get_stats()

        assert stats["total"] == len(sample_tenders)
        assert "by_country" in stats
        assert "FRA" in stats["by_country"]
        assert stats["by_country"]["FRA"] == 3

    @pytest.mark.asyncio
    async def test_get_stats_empty_db(self, db: TenderDatabase) -> None:
        """Test statistiques sur base vide."""
        stats = await db.get_stats()

        assert stats["total"] == 0
        assert stats["active"] == 0
