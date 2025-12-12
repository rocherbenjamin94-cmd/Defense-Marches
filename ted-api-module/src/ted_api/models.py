"""
Modèles Pydantic pour les appels d'offres TED.

Inclut la validation des données, conversion des dates et sérialisation JSON.
"""

from datetime import datetime, date
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field, computed_field, field_validator, model_validator


T = TypeVar("T")


class Tender(BaseModel):
    """
    Modèle représentant un appel d'offres TED.

    Attributes:
        notice_id: Identifiant unique de la notice (ex: "123456-2024")
        title: Titre/objet du marché
        description: Description détaillée (optionnel)
        buyer_name: Nom de l'acheteur/pouvoir adjudicateur
        buyer_country: Code pays ISO de l'acheteur (ex: "FRA")
        estimated_value: Valeur estimée du marché (optionnel)
        currency: Devise (ex: "EUR")
        deadline: Date limite de soumission (optionnel)
        publication_date: Date de publication
        cpv_codes: Codes CPV (classification des marchés)
        procedure_type: Type de procédure (OPEN, RESTRICTED, etc.)
        place_of_performance: Lieu d'exécution (code NUTS)
        url: URL de la notice sur TED
    """

    notice_id: str = Field(..., description="Identifiant unique de la notice")
    title: str = Field(..., description="Titre/objet du marché")
    description: str | None = Field(None, description="Description détaillée")
    buyer_name: str = Field(..., description="Nom de l'acheteur")
    buyer_country: str = Field(..., description="Code pays ISO (ex: FRA)")
    estimated_value: float | None = Field(None, ge=0, description="Valeur estimée")
    currency: str | None = Field(None, description="Devise (ex: EUR)")
    deadline: datetime | None = Field(None, description="Date limite de soumission")
    publication_date: datetime = Field(..., description="Date de publication")
    cpv_codes: list[str] = Field(default_factory=list, description="Codes CPV")
    procedure_type: str | None = Field(None, description="Type de procédure")
    place_of_performance: str | None = Field(None, description="Lieu d'exécution (NUTS)")
    url: str = Field(..., description="URL de la notice TED")

    @field_validator("deadline", "publication_date", mode="before")
    @classmethod
    def parse_ted_date(cls, v: Any) -> datetime | None:
        """
        Convertit les dates TED v3 en datetime.

        Formats supportés:
        - YYYYMMDD (ancien format)
        - YYYY-MM-DD (ISO date)
        - YYYY-MM-DDTHH:MM:SS+HH:MM (ISO datetime avec timezone)
        - YYYY-MM-DD+HH:MM (TED v3 date avec timezone)

        Args:
            v: Valeur de date

        Returns:
            datetime ou None si la valeur est vide
        """
        if v is None or v == "":
            return None
        if isinstance(v, datetime):
            return v
        if isinstance(v, date):
            return datetime.combine(v, datetime.min.time())
        if isinstance(v, str):
            # Format TED legacy: YYYYMMDD
            if len(v) == 8 and v.isdigit():
                return datetime.strptime(v, "%Y%m%d")
            # Format TED v3 avec timezone: "2020-07-06+02:00"
            if "+" in v and "T" not in v and len(v) > 10:
                date_part = v.split("+")[0]
                try:
                    return datetime.strptime(date_part, "%Y-%m-%d")
                except ValueError:
                    pass
            # Format TED v3 avec Z: "2021-04-15Z"
            if v.endswith("Z") and len(v) == 11:
                try:
                    return datetime.strptime(v[:-1], "%Y-%m-%d")
                except ValueError:
                    pass
            # Format ISO datetime complet
            try:
                # Remplacer Z par +00:00 pour fromisoformat
                normalized = v.replace("Z", "+00:00")
                return datetime.fromisoformat(normalized)
            except ValueError:
                pass
            # Format ISO date simple
            try:
                return datetime.strptime(v[:10], "%Y-%m-%d")
            except ValueError:
                pass
        raise ValueError(f"Format de date invalide: {v}")

    @field_validator("cpv_codes", mode="before")
    @classmethod
    def parse_cpv_codes(cls, v: Any) -> list[str]:
        """Parse les codes CPV (peut être une string ou une liste)."""
        if v is None:
            return []
        if isinstance(v, str):
            # Peut être un code unique ou séparé par des virgules
            return [code.strip() for code in v.split(",") if code.strip()]
        if isinstance(v, list):
            return [str(code) for code in v]
        return [str(v)]

    @field_validator("buyer_country", mode="before")
    @classmethod
    def normalize_country(cls, v: Any) -> str:
        """Normalise le code pays en majuscules."""
        if v is None:
            return "UNKNOWN"
        return str(v).upper().strip()

    @computed_field  # type: ignore[misc]
    @property
    def days_until_deadline(self) -> int | None:
        """
        Calcule le nombre de jours restants avant la deadline.

        Returns:
            Nombre de jours restants, None si pas de deadline,
            négatif si la deadline est passée.
        """
        if self.deadline is None:
            return None
        # Utiliser une datetime naive pour la comparaison
        now = datetime.now()
        deadline_naive = self.deadline.replace(tzinfo=None) if self.deadline.tzinfo else self.deadline
        delta = deadline_naive - now
        return delta.days

    @computed_field  # type: ignore[misc]
    @property
    def is_expired(self) -> bool:
        """Vérifie si l'appel d'offres est expiré."""
        if self.deadline is None:
            return False
        now = datetime.now()
        deadline_naive = self.deadline.replace(tzinfo=None) if self.deadline.tzinfo else self.deadline
        return now > deadline_naive

    @computed_field  # type: ignore[misc]
    @property
    def formatted_value(self) -> str | None:
        """Retourne la valeur formatée avec devise."""
        if self.estimated_value is None:
            return None
        currency = self.currency or "EUR"
        return f"{self.estimated_value:,.2f} {currency}"

    class Config:
        json_schema_extra = {
            "example": {
                "notice_id": "123456-2024",
                "title": "Fourniture de matériel informatique",
                "description": "Acquisition de serveurs et postes de travail",
                "buyer_name": "Ministère de l'Intérieur",
                "buyer_country": "FRA",
                "estimated_value": 250000.0,
                "currency": "EUR",
                "deadline": "2025-01-15T00:00:00",
                "publication_date": "2024-12-11T00:00:00",
                "cpv_codes": ["30200000", "30210000"],
                "procedure_type": "OPEN",
                "place_of_performance": "FR",
                "url": "https://ted.europa.eu/en/notice/-/detail/123456-2024",
            }
        }


class TenderFilter(BaseModel):
    """
    Filtres pour la recherche d'appels d'offres.

    Tous les filtres sont optionnels et cumulatifs (AND).
    """

    country: str | None = Field(
        default="FRA",
        description="Code pays ISO (ex: FRA, DEU). None pour tous les pays.",
    )
    cpv: str | None = Field(
        default=None,
        description="Code CPV (ex: 30000000). Recherche par préfixe.",
    )
    min_value: float | None = Field(
        default=None,
        ge=0,
        description="Valeur minimale du marché",
    )
    max_value: float | None = Field(
        default=None,
        ge=0,
        description="Valeur maximale du marché",
    )
    days_remaining: int | None = Field(
        default=None,
        ge=0,
        description="Nombre minimum de jours restants avant deadline",
    )
    search_text: str | None = Field(
        default=None,
        description="Recherche full-text dans titre et description",
    )

    @model_validator(mode="after")
    def validate_value_range(self) -> "TenderFilter":
        """Valide que min_value <= max_value si les deux sont définis."""
        if self.min_value is not None and self.max_value is not None:
            if self.min_value > self.max_value:
                raise ValueError("min_value ne peut pas être supérieur à max_value")
        return self


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Réponse paginée générique.

    Attributes:
        total: Nombre total d'éléments
        page: Page actuelle (1-indexed)
        limit: Nombre d'éléments par page
        pages: Nombre total de pages
        items: Liste des éléments de la page
    """

    total: int = Field(..., ge=0, description="Nombre total d'éléments")
    page: int = Field(..., ge=1, description="Page actuelle")
    limit: int = Field(..., ge=1, le=100, description="Éléments par page")
    items: list[T] = Field(default_factory=list, description="Éléments de la page")

    @computed_field  # type: ignore[misc]
    @property
    def pages(self) -> int:
        """Calcule le nombre total de pages."""
        if self.limit == 0:
            return 0
        return (self.total + self.limit - 1) // self.limit

    @computed_field  # type: ignore[misc]
    @property
    def has_next(self) -> bool:
        """Vérifie s'il y a une page suivante."""
        return self.page < self.pages

    @computed_field  # type: ignore[misc]
    @property
    def has_previous(self) -> bool:
        """Vérifie s'il y a une page précédente."""
        return self.page > 1


class TEDAPIResponse(BaseModel):
    """
    Réponse brute de l'API TED.

    Utilisé pour parser la réponse JSON de l'API TED avant conversion en Tender.
    """

    total: int = Field(default=0, description="Nombre total de notices")
    page: int = Field(default=1, description="Page actuelle")
    limit: int = Field(default=100, description="Limite par page")
    notices: list[dict[str, Any]] = Field(
        default_factory=list, description="Notices brutes"
    )


class SyncStatus(BaseModel):
    """Statut de la dernière synchronisation."""

    last_sync: datetime | None = Field(None, description="Date de dernière sync")
    total_synced: int = Field(0, description="Nombre de notices synchronisées")
    new_notices: int = Field(0, description="Nouvelles notices depuis dernière sync")
    status: str = Field("idle", description="Statut (idle, running, error)")
    error_message: str | None = Field(None, description="Message d'erreur si échec")


# Champs TED v3 à récupérer par défaut
# Documentation: https://api.ted.europa.eu/swagger
DEFAULT_TED_FIELDS: list[str] = [
    "ND",              # Notice Document (identifiant unique)
    "TI",              # Title (titre multilingue)
    "publication-date",  # Date de publication
    "buyer-name",      # Nom de l'acheteur (multilingue)
    "CY",              # Country (pays, liste)
    "NC",              # Notice Classification (type: supplies, services, works)
    "DT",              # Deadline Time (date limite, liste)
    "DS",              # Dispatch date
    "RC",              # Region Code (NUTS)
    "TVH",             # Total Value High (valeur estimée haute)
    "TVL",             # Total Value Low (valeur estimée basse)
    "notice-type",     # Type de notice
    "PR",              # Procedure type
    "links",           # Liens vers les documents
]


def _extract_multilingual_text(data: Any, preferred_lang: str = "fra") -> str:
    """
    Extrait le texte d'un champ multilingue TED v3.

    Args:
        data: Objet multilingue {"fra": "...", "eng": "..."} ou {"fra": ["..."]}
        preferred_lang: Langue préférée (défaut: fra)

    Returns:
        Texte extrait ou chaîne vide
    """
    if data is None:
        return ""
    if isinstance(data, str):
        return data
    if isinstance(data, dict):
        # Essayer la langue préférée d'abord
        text = data.get(preferred_lang) or data.get("eng") or data.get("fra")
        if text is None:
            # Prendre n'importe quelle langue disponible
            text = next(iter(data.values()), "")
        # Le texte peut être une liste
        if isinstance(text, list):
            return text[0] if text else ""
        return str(text)
    return str(data)


def _extract_first_from_list(data: Any) -> Any:
    """Extrait le premier élément si c'est une liste."""
    if isinstance(data, list):
        return data[0] if data else None
    return data


def ted_notice_to_tender(notice: dict[str, Any]) -> Tender:
    """
    Convertit une notice TED v3 brute en modèle Tender.

    Args:
        notice: Dictionnaire de la notice TED v3

    Returns:
        Instance Tender validée
    """
    # Identifiant
    notice_id = notice.get("ND", notice.get("publication-number", ""))

    # Titre multilingue
    title = _extract_multilingual_text(notice.get("TI"), "fra") or "Sans titre"

    # Nom de l'acheteur (multilingue avec liste)
    buyer_name = _extract_multilingual_text(notice.get("buyer-name"), "fra") or "Inconnu"

    # Pays (liste)
    country_list = notice.get("CY", [])
    buyer_country = country_list[0] if country_list else "UNKNOWN"

    # Date de publication
    pub_date = notice.get("publication-date", "")

    # Deadline (liste de timestamps)
    deadline_list = notice.get("DT", [])
    deadline = _extract_first_from_list(deadline_list)

    # Région NUTS
    region_list = notice.get("RC", [])
    place_of_performance = _extract_first_from_list(region_list)

    # Valeur estimée (TVH = Total Value High)
    estimated_value = _parse_float(notice.get("TVH")) or _parse_float(notice.get("TVL"))

    # Type de procédure
    procedure_type = notice.get("PR")

    # Classification (NC)
    nc_list = notice.get("NC", [])

    # URL depuis links
    links = notice.get("links", {})
    html_links = links.get("html", {})
    url = (
        html_links.get("FRA")
        or html_links.get("ENG")
        or next(iter(html_links.values()), None)
        or f"https://ted.europa.eu/fr/notice/-/detail/{notice_id}"
    )

    return Tender(
        notice_id=notice_id,
        title=title,
        description=None,  # Non disponible dans la recherche v3
        buyer_name=buyer_name,
        buyer_country=buyer_country,
        estimated_value=estimated_value,
        currency="EUR",  # TED utilise principalement EUR
        deadline=deadline,
        publication_date=pub_date or datetime.now().strftime("%Y-%m-%d"),
        cpv_codes=nc_list,  # NC contient la classification
        procedure_type=procedure_type,
        place_of_performance=place_of_performance,
        url=url,
    )


def _parse_float(value: Any) -> float | None:
    """Parse une valeur en float, retourne None si impossible."""
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None
