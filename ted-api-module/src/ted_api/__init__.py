"""
TED API Module - Récupération des appels d'offres européens

Ce module permet de:
- Récupérer les appels d'offres actifs depuis l'API TED
- Filtrer par pays, secteur (CPV), valeur, deadline
- Stocker en base de données SQLite
- Exposer via une API REST FastAPI
"""

from ted_api.models import Tender, TenderFilter, PaginatedResponse
from ted_api.client import TEDAPIClient
from ted_api.config import Settings, get_settings

__version__ = "1.0.0"
__all__ = [
    "Tender",
    "TenderFilter",
    "PaginatedResponse",
    "TEDAPIClient",
    "Settings",
    "get_settings",
]
