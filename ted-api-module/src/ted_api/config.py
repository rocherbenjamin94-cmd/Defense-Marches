"""
Configuration du module TED API

Utilise pydantic-settings pour la gestion des variables d'environnement.
"""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration du module TED API."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # TED API Configuration
    ted_api_url: str = Field(
        default="https://api.ted.europa.eu/v3/notices/search",
        description="URL de l'API TED Search",
    )
    ted_api_key: str | None = Field(
        default=None,
        description="Clé API TED (optionnel pour Search, requis pour autres APIs)",
    )
    ted_default_country: str = Field(
        default="FRA",
        description="Code pays ISO par défaut (FRA, DEU, ITA, etc.)",
    )
    ted_default_limit: int = Field(
        default=100,
        ge=1,
        le=100,
        description="Nombre de résultats par page (max 100)",
    )
    ted_request_timeout: float = Field(
        default=30.0,
        ge=5.0,
        description="Timeout pour les requêtes API TED (secondes)",
    )

    # Database Configuration
    database_path: str = Field(
        default="../veille-boamp/backend-dc1/data/cache.db",
        description="Chemin vers la base de données SQLite partagée",
    )

    # Cache Configuration
    cache_ttl: int = Field(
        default=3600,
        ge=60,
        description="Durée de vie du cache en secondes (défaut: 1 heure)",
    )
    redis_url: str | None = Field(
        default=None,
        description="URL Redis (optionnel). Si non défini, utilise le cache mémoire",
    )

    # Scheduler Configuration
    sync_enabled: bool = Field(
        default=True,
        description="Activer la synchronisation automatique",
    )
    sync_hour: int = Field(
        default=2,
        ge=0,
        le=23,
        description="Heure de synchronisation quotidienne (0-23)",
    )
    sync_minute: int = Field(
        default=0,
        ge=0,
        le=59,
        description="Minute de synchronisation quotidienne (0-59)",
    )

    # API Server Configuration
    api_host: str = Field(
        default="0.0.0.0",
        description="Adresse d'écoute du serveur API",
    )
    api_port: int = Field(
        default=8000,
        ge=1,
        le=65535,
        description="Port du serveur API",
    )
    api_reload: bool = Field(
        default=False,
        description="Activer le rechargement automatique (développement)",
    )
    cors_origins: list[str] = Field(
        default=["*"],
        description="Origins CORS autorisées",
    )

    # Logging Configuration
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field(
        default="INFO",
        description="Niveau de logging",
    )
    log_format: Literal["json", "console"] = Field(
        default="console",
        description="Format des logs (json pour production)",
    )

    @field_validator("database_path")
    @classmethod
    def resolve_database_path(cls, v: str) -> str:
        """Résout le chemin relatif de la base de données."""
        path = Path(v)
        if not path.is_absolute():
            # Résoudre par rapport au répertoire du module
            base_path = Path(__file__).parent.parent.parent.parent
            path = base_path / v
        return str(path.resolve())

    @property
    def database_url(self) -> str:
        """URL SQLAlchemy pour la base de données."""
        return f"sqlite+aiosqlite:///{self.database_path}"


@lru_cache
def get_settings() -> Settings:
    """
    Récupère les settings (cached).

    Utilise lru_cache pour éviter de recharger les settings à chaque appel.
    """
    return Settings()
