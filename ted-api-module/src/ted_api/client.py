"""
Client pour l'API TED (Tenders Electronic Daily).

Gère les requêtes vers l'API TED avec:
- Retry automatique sur erreurs 429/503
- Cache des résultats
- Pagination automatique
- Logging structuré
"""

import hashlib
import json
import logging
from collections.abc import AsyncGenerator
from typing import Any

import httpx
import structlog
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
    before_sleep_log,
    RetryError,
)

from ted_api.config import Settings
from ted_api.models import (
    DEFAULT_TED_FIELDS,
    TEDAPIResponse,
    Tender,
    ted_notice_to_tender,
)

logger = structlog.get_logger(__name__)


class TEDAPIError(Exception):
    """Erreur lors d'une requête à l'API TED."""

    def __init__(self, message: str, status_code: int | None = None):
        super().__init__(message)
        self.status_code = status_code


class TEDAPIClient:
    """
    Client pour l'API TED Search.

    Attributes:
        settings: Configuration du module
        cache: Backend de cache (optionnel)
    """

    def __init__(
        self,
        settings: Settings,
        cache: Any | None = None,  # CacheBackend, import circulaire évité
    ) -> None:
        """
        Initialise le client TED API.

        Args:
            settings: Configuration du module
            cache: Backend de cache (MemoryCache ou RedisCache)
        """
        self.settings = settings
        self.cache = cache
        self._client: httpx.AsyncClient | None = None
        self._log = logger.bind(component="TEDAPIClient")

    async def __aenter__(self) -> "TEDAPIClient":
        """Context manager async entry."""
        await self._ensure_client()
        return self

    async def __aexit__(self, *args: Any) -> None:
        """Context manager async exit."""
        await self.close()

    async def _ensure_client(self) -> httpx.AsyncClient:
        """Crée ou retourne le client HTTP."""
        if self._client is None or self._client.is_closed:
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "User-Agent": "TED-API-Module/1.0",
            }
            # Ajouter la clé API si configurée
            if self.settings.ted_api_key:
                headers["Authorization"] = f"Bearer {self.settings.ted_api_key}"
                self._log.debug("Using API key authentication")

            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(self.settings.ted_request_timeout),
                headers=headers,
            )
        return self._client

    async def close(self) -> None:
        """Ferme le client HTTP."""
        if self._client is not None and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    def _build_cache_key(self, payload: dict[str, Any]) -> str:
        """Génère une clé de cache unique pour une requête."""
        payload_str = json.dumps(payload, sort_keys=True)
        return f"ted:search:{hashlib.md5(payload_str.encode()).hexdigest()}"

    @retry(
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.TimeoutException)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        before_sleep=before_sleep_log(logger, logging.INFO),
        reraise=True,
    )
    async def _request(self, payload: dict[str, Any]) -> dict[str, Any]:
        """
        Effectue une requête POST vers l'API TED avec retry.

        Args:
            payload: Corps de la requête JSON

        Returns:
            Réponse JSON de l'API

        Raises:
            TEDAPIError: En cas d'erreur après les retries
        """
        client = await self._ensure_client()

        self._log.debug("TED API request", payload=payload)

        try:
            response = await client.post(
                self.settings.ted_api_url,
                json=payload,
            )

            # Gestion des erreurs HTTP
            if response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", 60))
                self._log.warning(
                    "Rate limit hit",
                    retry_after=retry_after,
                    status_code=429,
                )
                raise httpx.HTTPStatusError(
                    "Rate limit exceeded",
                    request=response.request,
                    response=response,
                )

            if response.status_code == 503:
                self._log.warning("TED API unavailable", status_code=503)
                raise httpx.HTTPStatusError(
                    "Service unavailable",
                    request=response.request,
                    response=response,
                )

            response.raise_for_status()

            data = response.json()
            self._log.debug(
                "TED API response",
                total=data.get("total", 0),
                page=data.get("page", 1),
            )
            return data

        except httpx.TimeoutException as e:
            self._log.error("TED API timeout", error=str(e))
            raise

        except httpx.HTTPStatusError as e:
            self._log.error(
                "TED API HTTP error",
                status_code=e.response.status_code,
                error=str(e),
            )
            raise

    async def search_tenders(
        self,
        query: str,
        fields: list[str] | None = None,
        limit: int = 100,
        page: int = 1,
        scope: str = "ACTIVE",
        use_cache: bool = True,
    ) -> TEDAPIResponse:
        """
        Recherche des appels d'offres via l'API TED.

        Args:
            query: Requête de recherche au format TED
                   Ex: "notice-type = cn-standard AND buyer-country = FRA"
            fields: Champs à retourner (défaut: DEFAULT_TED_FIELDS)
            limit: Nombre de résultats par page (1-100)
            page: Numéro de page (1-indexed)
            scope: Étendue de recherche (ACTIVE, LATEST, ALL)
            use_cache: Utiliser le cache si disponible

        Returns:
            TEDAPIResponse avec les notices trouvées

        Raises:
            TEDAPIError: En cas d'erreur API
        """
        if fields is None:
            fields = DEFAULT_TED_FIELDS

        payload = {
            "query": query,
            "fields": fields,
            "scope": scope,
            "page": page,
            "limit": min(limit, 100),  # Max 100 par requête TED
        }

        # Vérifier le cache
        cache_key = self._build_cache_key(payload)
        if use_cache and self.cache is not None:
            cached = await self.cache.get(cache_key)
            if cached is not None:
                self._log.debug("Cache hit", cache_key=cache_key)
                return TEDAPIResponse(**cached)

        # Requête API
        try:
            data = await self._request(payload)
            # TED v3 utilise "totalNoticeCount" au lieu de "total"
            response = TEDAPIResponse(
                total=data.get("totalNoticeCount", data.get("total", 0)),
                page=page,  # TED v3 ne retourne pas la page
                limit=limit,
                notices=data.get("notices", []),
            )

            # Mettre en cache
            if use_cache and self.cache is not None:
                await self.cache.set(
                    cache_key,
                    response.model_dump(),
                    self.settings.cache_ttl,
                )

            return response

        except RetryError as e:
            raise TEDAPIError(
                f"TED API failed after retries: {e}",
                status_code=503,
            ) from e

        except httpx.HTTPStatusError as e:
            raise TEDAPIError(
                f"TED API error: {e}",
                status_code=e.response.status_code,
            ) from e

        except Exception as e:
            raise TEDAPIError(f"Unexpected error: {e}") from e

    async def get_active_tenders(
        self,
        country: str | None = None,
        notice_types: list[str] | None = None,
        cpv_codes: list[str] | None = None,
        min_value: float | None = None,
        max_value: float | None = None,
        max_results: int | None = 1000,
    ) -> list[Tender]:
        """
        Récupère les appels d'offres actifs avec filtres.

        Args:
            country: Code pays ISO (ex: "FRA"). None = tous pays
            notice_types: Types de notice (défaut: cn-standard, cn-social)
            cpv_codes: Codes CPV à filtrer
            min_value: Valeur minimale
            max_value: Valeur maximale
            max_results: Nombre maximum de résultats (défaut: 1000, None=illimité)

        Returns:
            Liste des Tender correspondants
        """
        if country is None:
            country = self.settings.ted_default_country

        if notice_types is None:
            notice_types = ["cn-standard", "cn-social"]

        # Construire la requête
        query_parts = []

        # Types de notice
        if len(notice_types) == 1:
            query_parts.append(f"notice-type = {notice_types[0]}")
        else:
            types_str = " ".join(notice_types)
            query_parts.append(f"notice-type IN ({types_str})")

        # Pays
        if country:
            query_parts.append(f"buyer-country = {country}")

        # Codes CPV
        if cpv_codes:
            if len(cpv_codes) == 1:
                query_parts.append(f"classification-cpv = {cpv_codes[0]}")
            else:
                cpv_str = " ".join(cpv_codes)
                query_parts.append(f"classification-cpv IN ({cpv_str})")

        # Valeur estimée
        if min_value is not None:
            query_parts.append(f"estimated-value >= {min_value}")
        if max_value is not None:
            query_parts.append(f"estimated-value <= {max_value}")

        query = " AND ".join(query_parts)

        self._log.info(
            "Fetching active tenders",
            query=query,
            country=country,
        )

        # Récupérer tous les résultats (avec limite optionnelle)
        tenders: list[Tender] = []
        async for tender in self.get_all_tenders_paginated(query, max_results=max_results):
            tenders.append(tender)

        self._log.info(
            "Active tenders fetched",
            count=len(tenders),
            country=country,
        )

        return tenders

    async def get_all_tenders_paginated(
        self,
        query: str,
        fields: list[str] | None = None,
        max_results: int | None = None,
        scope: str = "ACTIVE",
    ) -> AsyncGenerator[Tender, None]:
        """
        Générateur async pour récupérer tous les résultats avec pagination.

        Args:
            query: Requête de recherche TED
            fields: Champs à retourner
            max_results: Nombre max de résultats (None = illimité)
            scope: Étendue de recherche

        Yields:
            Tender: Appels d'offres un par un
        """
        page = 1
        limit = self.settings.ted_default_limit
        total_fetched = 0

        while True:
            response = await self.search_tenders(
                query=query,
                fields=fields,
                limit=limit,
                page=page,
                scope=scope,
            )

            if not response.notices:
                break

            for notice in response.notices:
                try:
                    tender = ted_notice_to_tender(notice)
                    yield tender
                    total_fetched += 1

                    if max_results and total_fetched >= max_results:
                        return

                except Exception as e:
                    self._log.warning(
                        "Failed to parse notice",
                        notice_id=notice.get("notice-id"),
                        error=str(e),
                    )

            # Vérifier s'il y a d'autres pages
            if total_fetched >= response.total:
                break

            page += 1

            self._log.debug(
                "Pagination progress",
                page=page,
                fetched=total_fetched,
                total=response.total,
            )

    async def check_query_syntax(self, query: str) -> bool:
        """
        Vérifie la syntaxe d'une requête TED sans exécuter.

        Args:
            query: Requête à vérifier

        Returns:
            True si la syntaxe est valide
        """
        payload = {
            "query": query,
            "fields": ["notice-id"],
            "check_query_syntax": True,
            "limit": 1,
        }

        try:
            await self._request(payload)
            return True
        except TEDAPIError:
            return False
