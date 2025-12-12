"""
Tests pour les modèles Pydantic.

Couvre:
- Validation des données
- Conversion des dates
- Calculs (days_until_deadline, is_expired)
- Sérialisation JSON
"""

from datetime import datetime, timedelta

import pytest

from ted_api.models import (
    PaginatedResponse,
    Tender,
    TenderFilter,
    ted_notice_to_tender,
)


class TestTender:
    """Tests pour le modèle Tender."""

    def test_create_valid_tender(self, sample_tender: Tender) -> None:
        """Test création d'un Tender valide."""
        assert sample_tender.notice_id == "123456-2024"
        assert sample_tender.buyer_country == "FRA"
        assert sample_tender.estimated_value == 250000.0

    def test_parse_ted_date_yyyymmdd(self) -> None:
        """Test parsing date format TED (YYYYMMDD)."""
        tender = Tender(
            notice_id="test",
            title="Test",
            buyer_name="Test",
            buyer_country="FRA",
            publication_date="20241211",
            deadline="20250115",
            url="https://test.com",
        )
        assert tender.publication_date == datetime(2024, 12, 11)
        assert tender.deadline == datetime(2025, 1, 15)

    def test_parse_ted_date_iso(self) -> None:
        """Test parsing date format ISO."""
        tender = Tender(
            notice_id="test",
            title="Test",
            buyer_name="Test",
            buyer_country="FRA",
            publication_date="2024-12-11T00:00:00",
            url="https://test.com",
        )
        assert tender.publication_date.year == 2024
        assert tender.publication_date.month == 12

    def test_parse_ted_date_none(self) -> None:
        """Test parsing date None."""
        tender = Tender(
            notice_id="test",
            title="Test",
            buyer_name="Test",
            buyer_country="FRA",
            publication_date="20241211",
            deadline=None,
            url="https://test.com",
        )
        assert tender.deadline is None

    def test_days_until_deadline_future(self) -> None:
        """Test calcul jours restants (deadline future)."""
        future = datetime.now() + timedelta(days=10)
        tender = Tender(
            notice_id="test",
            title="Test",
            buyer_name="Test",
            buyer_country="FRA",
            publication_date=datetime.now(),
            deadline=future,
            url="https://test.com",
        )
        assert tender.days_until_deadline is not None
        assert 9 <= tender.days_until_deadline <= 10

    def test_days_until_deadline_past(self) -> None:
        """Test calcul jours restants (deadline passée)."""
        past = datetime.now() - timedelta(days=5)
        tender = Tender(
            notice_id="test",
            title="Test",
            buyer_name="Test",
            buyer_country="FRA",
            publication_date=datetime.now() - timedelta(days=30),
            deadline=past,
            url="https://test.com",
        )
        assert tender.days_until_deadline is not None
        assert tender.days_until_deadline < 0

    def test_days_until_deadline_none(self) -> None:
        """Test jours restants sans deadline."""
        tender = Tender(
            notice_id="test",
            title="Test",
            buyer_name="Test",
            buyer_country="FRA",
            publication_date=datetime.now(),
            deadline=None,
            url="https://test.com",
        )
        assert tender.days_until_deadline is None

    def test_is_expired_true(self) -> None:
        """Test is_expired avec deadline passée."""
        past = datetime.now() - timedelta(days=1)
        tender = Tender(
            notice_id="test",
            title="Test",
            buyer_name="Test",
            buyer_country="FRA",
            publication_date=datetime.now() - timedelta(days=30),
            deadline=past,
            url="https://test.com",
        )
        assert tender.is_expired is True

    def test_is_expired_false(self) -> None:
        """Test is_expired avec deadline future."""
        future = datetime.now() + timedelta(days=10)
        tender = Tender(
            notice_id="test",
            title="Test",
            buyer_name="Test",
            buyer_country="FRA",
            publication_date=datetime.now(),
            deadline=future,
            url="https://test.com",
        )
        assert tender.is_expired is False

    def test_formatted_value(self) -> None:
        """Test formatted_value."""
        tender = Tender(
            notice_id="test",
            title="Test",
            buyer_name="Test",
            buyer_country="FRA",
            publication_date=datetime.now(),
            estimated_value=250000.5,
            currency="EUR",
            url="https://test.com",
        )
        assert tender.formatted_value == "250,000.50 EUR"

    def test_formatted_value_none(self) -> None:
        """Test formatted_value sans valeur."""
        tender = Tender(
            notice_id="test",
            title="Test",
            buyer_name="Test",
            buyer_country="FRA",
            publication_date=datetime.now(),
            url="https://test.com",
        )
        assert tender.formatted_value is None

    def test_cpv_codes_string_input(self) -> None:
        """Test parsing CPV codes depuis string."""
        tender = Tender(
            notice_id="test",
            title="Test",
            buyer_name="Test",
            buyer_country="FRA",
            publication_date=datetime.now(),
            cpv_codes="30000000, 72000000",  # type: ignore
            url="https://test.com",
        )
        assert len(tender.cpv_codes) == 2
        assert "30000000" in tender.cpv_codes

    def test_country_normalization(self) -> None:
        """Test normalisation du code pays."""
        tender = Tender(
            notice_id="test",
            title="Test",
            buyer_name="Test",
            buyer_country="fra",  # Minuscules
            publication_date=datetime.now(),
            url="https://test.com",
        )
        assert tender.buyer_country == "FRA"

    def test_json_serialization(self, sample_tender: Tender) -> None:
        """Test sérialisation JSON."""
        json_data = sample_tender.model_dump_json()
        assert "123456-2024" in json_data
        assert "FRA" in json_data


class TestTenderFilter:
    """Tests pour le modèle TenderFilter."""

    def test_default_values(self) -> None:
        """Test valeurs par défaut."""
        filters = TenderFilter()
        assert filters.country == "FRA"
        assert filters.cpv is None
        assert filters.min_value is None

    def test_valid_value_range(self) -> None:
        """Test plage de valeurs valide."""
        filters = TenderFilter(min_value=1000, max_value=5000)
        assert filters.min_value == 1000
        assert filters.max_value == 5000

    def test_invalid_value_range(self) -> None:
        """Test plage de valeurs invalide."""
        with pytest.raises(ValueError, match="min_value"):
            TenderFilter(min_value=5000, max_value=1000)

    def test_all_filters(self) -> None:
        """Test avec tous les filtres."""
        filters = TenderFilter(
            country="DEU",
            cpv="30000000",
            min_value=10000,
            max_value=100000,
            days_remaining=30,
            search_text="software",
        )
        assert filters.country == "DEU"
        assert filters.cpv == "30000000"
        assert filters.search_text == "software"


class TestPaginatedResponse:
    """Tests pour le modèle PaginatedResponse."""

    def test_pages_calculation(self, sample_tenders: list[Tender]) -> None:
        """Test calcul du nombre de pages."""
        response = PaginatedResponse(
            total=100,
            page=1,
            limit=20,
            items=sample_tenders[:2],
        )
        assert response.pages == 5

    def test_pages_partial(self) -> None:
        """Test pages avec reste."""
        response = PaginatedResponse[Tender](
            total=45,
            page=1,
            limit=20,
            items=[],
        )
        assert response.pages == 3

    def test_has_next_true(self) -> None:
        """Test has_next = True."""
        response = PaginatedResponse[Tender](
            total=100,
            page=1,
            limit=20,
            items=[],
        )
        assert response.has_next is True

    def test_has_next_false(self) -> None:
        """Test has_next = False (dernière page)."""
        response = PaginatedResponse[Tender](
            total=100,
            page=5,
            limit=20,
            items=[],
        )
        assert response.has_next is False

    def test_has_previous_true(self) -> None:
        """Test has_previous = True."""
        response = PaginatedResponse[Tender](
            total=100,
            page=3,
            limit=20,
            items=[],
        )
        assert response.has_previous is True

    def test_has_previous_false(self) -> None:
        """Test has_previous = False (première page)."""
        response = PaginatedResponse[Tender](
            total=100,
            page=1,
            limit=20,
            items=[],
        )
        assert response.has_previous is False


class TestTedNoticeToTender:
    """Tests pour la fonction de conversion ted_notice_to_tender."""

    def test_convert_complete_notice(self, mock_ted_response: dict) -> None:
        """Test conversion d'une notice complète."""
        notice = mock_ted_response["notices"][0]
        tender = ted_notice_to_tender(notice)

        assert tender.notice_id == "123456-2024"
        assert tender.title == "Fourniture de matériel informatique"
        assert tender.buyer_country == "FRA"
        assert tender.estimated_value == 250000.0

    def test_convert_minimal_notice(self, mock_ted_response: dict) -> None:
        """Test conversion d'une notice minimale."""
        notice = mock_ted_response["notices"][1]
        tender = ted_notice_to_tender(notice)

        assert tender.notice_id == "789012-2024"
        assert tender.estimated_value is None
        assert tender.deadline is None

    def test_convert_with_default_values(self) -> None:
        """Test conversion avec valeurs par défaut."""
        notice = {
            "notice-id": "test-123",
        }
        tender = ted_notice_to_tender(notice)

        assert tender.notice_id == "test-123"
        assert tender.title == "Sans titre"
        assert tender.buyer_name == "Inconnu"
        assert tender.buyer_country == "UNKNOWN"
