"""
Routes API REST pour les appels d'offres TED.

Endpoints:
- GET /api/tenders - Liste des appels d'offres avec filtres
- GET /api/tenders/{notice_id} - Détails d'un appel d'offres
- POST /api/tenders/sync - Déclenche une synchronisation manuelle
- GET /api/tenders/stats - Statistiques
"""

from datetime import datetime
from typing import Any

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, status

from ted_api.api.dependencies import get_database, get_ted_client
from ted_api.client import TEDAPIClient, TEDAPIError
from ted_api.database import TenderDatabase
from ted_api.models import PaginatedResponse, SyncStatus, Tender, TenderFilter

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/api", tags=["tenders"])

# État de la synchronisation
_sync_status = SyncStatus()


@router.get(
    "/tenders",
    response_model=PaginatedResponse[Tender],
    summary="Liste des appels d'offres",
    description="Récupère les appels d'offres avec filtres optionnels et pagination.",
)
async def get_tenders(
    country: str | None = Query(
        "FRA",
        description="Code pays ISO (ex: FRA, DEU). Null pour tous les pays.",
    ),
    cpv: str | None = Query(
        None,
        description="Code CPV (ex: 30000000). Recherche par préfixe.",
    ),
    min_value: float | None = Query(
        None,
        ge=0,
        description="Valeur minimale du marché (EUR)",
    ),
    max_value: float | None = Query(
        None,
        ge=0,
        description="Valeur maximale du marché (EUR)",
    ),
    days_remaining: int | None = Query(
        None,
        ge=0,
        description="Nombre minimum de jours restants avant deadline",
    ),
    search: str | None = Query(
        None,
        min_length=2,
        description="Recherche full-text dans titre et description",
    ),
    page: int = Query(1, ge=1, description="Numéro de page"),
    limit: int = Query(20, ge=1, le=100, description="Résultats par page"),
    db: TenderDatabase = Depends(get_database),
) -> PaginatedResponse[Tender]:
    """
    Liste les appels d'offres avec filtres optionnels.

    Tous les filtres sont cumulatifs (AND).
    Les résultats sont triés par date de publication (récent en premier).
    """
    # Valider min/max value
    if min_value is not None and max_value is not None:
        if min_value > max_value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="min_value ne peut pas être supérieur à max_value",
            )

    filters = TenderFilter(
        country=country,
        cpv=cpv,
        min_value=min_value,
        max_value=max_value,
        days_remaining=days_remaining,
        search_text=search,
    )

    logger.info("Fetching tenders", filters=filters.model_dump(), page=page, limit=limit)

    try:
        result = await db.get_tenders(filters=filters, page=page, limit=limit)
        return result
    except Exception as e:
        logger.error("Database error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Erreur de base de données",
        ) from e


@router.get(
    "/tenders/stats",
    response_model=dict[str, Any],
    summary="Statistiques des appels d'offres",
)
async def get_stats(
    db: TenderDatabase = Depends(get_database),
) -> dict[str, Any]:
    """
    Récupère des statistiques sur les appels d'offres stockés.

    Returns:
        Statistiques (total, actifs, par pays, valeur totale, etc.)
    """
    try:
        return await db.get_stats()
    except Exception as e:
        logger.error("Stats error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Erreur lors du calcul des statistiques",
        ) from e


@router.get(
    "/tenders/expiring",
    response_model=list[Tender],
    summary="Appels d'offres expirant bientôt",
)
async def get_expiring_tenders(
    days: int = Query(7, ge=1, le=30, description="Nombre de jours"),
    db: TenderDatabase = Depends(get_database),
) -> list[Tender]:
    """
    Récupère les appels d'offres dont la deadline approche.

    Args:
        days: Nombre de jours avant expiration (défaut: 7)

    Returns:
        Liste des Tender expirant dans les N prochains jours
    """
    try:
        return await db.get_expiring_tenders(days=days)
    except Exception as e:
        logger.error("Expiring tenders error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Erreur lors de la récupération des appels expirants",
        ) from e


@router.get(
    "/tenders/{notice_id}",
    response_model=Tender,
    summary="Détails d'un appel d'offres",
    responses={
        404: {"description": "Appel d'offres non trouvé"},
    },
)
async def get_tender(
    notice_id: str,
    db: TenderDatabase = Depends(get_database),
) -> Tender:
    """
    Récupère les détails d'un appel d'offres par son ID.

    Args:
        notice_id: Identifiant de la notice TED (ex: "123456-2024")

    Returns:
        Détails complets du Tender

    Raises:
        404: Si l'appel d'offres n'est pas trouvé
    """
    tender = await db.get_tender_by_id(notice_id)

    if tender is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Appel d'offres '{notice_id}' non trouvé",
        )

    return tender


@router.post(
    "/tenders/sync",
    response_model=SyncStatus,
    summary="Déclencher une synchronisation",
    description="Lance une synchronisation manuelle avec l'API TED.",
)
async def trigger_sync(
    country: str = Query("FRA", description="Code pays à synchroniser"),
    db: TenderDatabase = Depends(get_database),
    client: TEDAPIClient = Depends(get_ted_client),
) -> SyncStatus:
    """
    Déclenche une synchronisation manuelle des appels d'offres.

    Cette opération peut prendre plusieurs secondes selon le nombre
    d'appels d'offres à récupérer.

    Args:
        country: Code pays ISO à synchroniser (défaut: FRA)

    Returns:
        Statut de la synchronisation
    """
    global _sync_status

    if _sync_status.status == "running":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Une synchronisation est déjà en cours",
        )

    _sync_status = SyncStatus(status="running")

    try:
        logger.info("Starting manual sync", country=country)

        # Récupérer les appels d'offres actifs
        tenders = await client.get_active_tenders(country=country)

        # Sauvegarder en base
        inserted, updated = await db.upsert_tenders(tenders)

        _sync_status = SyncStatus(
            last_sync=datetime.now(),
            total_synced=len(tenders),
            new_notices=inserted,
            status="completed",
        )

        logger.info(
            "Manual sync completed",
            total=len(tenders),
            inserted=inserted,
            updated=updated,
        )

        return _sync_status

    except TEDAPIError as e:
        _sync_status = SyncStatus(
            status="error",
            error_message=str(e),
        )
        logger.error("Sync failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Erreur API TED: {e}",
        ) from e

    except Exception as e:
        _sync_status = SyncStatus(
            status="error",
            error_message=str(e),
        )
        logger.error("Sync failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la synchronisation: {e}",
        ) from e


@router.get(
    "/tenders/sync/status",
    response_model=SyncStatus,
    summary="Statut de synchronisation",
)
async def get_sync_status() -> SyncStatus:
    """
    Récupère le statut de la dernière synchronisation.

    Returns:
        Statut de synchronisation (dernière date, nombre de notices, erreurs)
    """
    return _sync_status


@router.delete(
    "/tenders/expired",
    summary="Supprimer les appels expirés",
    response_model=dict[str, int],
)
async def delete_expired_tenders(
    db: TenderDatabase = Depends(get_database),
) -> dict[str, int]:
    """
    Supprime les appels d'offres dont la deadline est passée.

    Returns:
        Nombre d'appels supprimés
    """
    try:
        deleted = await db.delete_expired_tenders()
        return {"deleted": deleted}
    except Exception as e:
        logger.error("Delete expired error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Erreur lors de la suppression",
        ) from e


# Health check endpoint
@router.get(
    "/health",
    summary="Health check",
    tags=["system"],
)
async def health_check(
    db: TenderDatabase = Depends(get_database),
) -> dict[str, str]:
    """
    Vérifie la santé du service.

    Returns:
        Statut "ok" si tout fonctionne
    """
    try:
        # Vérifier la connexion DB
        stats = await db.get_stats()
        return {
            "status": "ok",
            "database": "connected",
            "tenders_count": str(stats["total"]),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service unhealthy: {e}",
        ) from e
