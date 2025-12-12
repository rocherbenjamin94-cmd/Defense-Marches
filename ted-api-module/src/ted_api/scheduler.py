"""
Planificateur de tâches pour la synchronisation TED.

Utilise APScheduler pour exécuter une synchronisation quotidienne
des appels d'offres depuis l'API TED.
"""

import asyncio
from datetime import datetime
from typing import Callable

import structlog
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from ted_api.cache import CacheBackend, get_cache_backend_async
from ted_api.client import TEDAPIClient, TEDAPIError
from ted_api.config import Settings
from ted_api.database import TenderDatabase

logger = structlog.get_logger(__name__)


class TenderSyncScheduler:
    """
    Planificateur de synchronisation des appels d'offres TED.

    Exécute une tâche quotidienne pour:
    1. Récupérer les nouveaux appels d'offres depuis l'API TED
    2. Les stocker en base de données
    3. Logger les nouvelles notices

    Attributes:
        settings: Configuration du module
        client: Client API TED
        db: Base de données
        scheduler: APScheduler instance
    """

    def __init__(
        self,
        settings: Settings,
        client: TEDAPIClient,
        db: TenderDatabase,
    ) -> None:
        """
        Initialise le planificateur.

        Args:
            settings: Configuration du module
            client: Client API TED
            db: Base de données
        """
        self.settings = settings
        self.client = client
        self.db = db
        self.scheduler = AsyncIOScheduler()
        self._log = logger.bind(component="TenderSyncScheduler")
        self._on_sync_complete: list[Callable[[int, int], None]] = []

    def add_sync_callback(self, callback: Callable[[int, int], None]) -> None:
        """
        Ajoute un callback appelé après chaque synchronisation.

        Args:
            callback: Fonction(inserted, updated) appelée après sync
        """
        self._on_sync_complete.append(callback)

    async def sync_tenders(self, country: str | None = None) -> tuple[int, int]:
        """
        Synchronise les appels d'offres depuis l'API TED.

        Args:
            country: Code pays (défaut: settings.ted_default_country)

        Returns:
            Tuple (nombre insérés, nombre mis à jour)
        """
        if country is None:
            country = self.settings.ted_default_country

        self._log.info("Starting tender sync", country=country)
        start_time = datetime.now()

        try:
            # Récupérer les appels d'offres actifs
            tenders = await self.client.get_active_tenders(country=country)
            self._log.info("Tenders fetched from TED API", count=len(tenders))

            # Stocker en base
            inserted, updated = await self.db.upsert_tenders(tenders)

            elapsed = (datetime.now() - start_time).total_seconds()
            self._log.info(
                "Tender sync completed",
                country=country,
                total=len(tenders),
                inserted=inserted,
                updated=updated,
                elapsed_seconds=elapsed,
            )

            # Appeler les callbacks
            for callback in self._on_sync_complete:
                try:
                    callback(inserted, updated)
                except Exception as e:
                    self._log.warning("Sync callback failed", error=str(e))

            return inserted, updated

        except TEDAPIError as e:
            self._log.error(
                "TED API error during sync",
                country=country,
                error=str(e),
                status_code=e.status_code,
            )
            raise

        except Exception as e:
            self._log.error(
                "Unexpected error during sync",
                country=country,
                error=str(e),
            )
            raise

    async def _scheduled_sync(self) -> None:
        """Tâche planifiée de synchronisation."""
        try:
            await self.sync_tenders()
        except Exception as e:
            self._log.error("Scheduled sync failed", error=str(e))

    def start(
        self,
        hour: int | None = None,
        minute: int | None = None,
    ) -> None:
        """
        Démarre le planificateur.

        Args:
            hour: Heure de synchronisation (défaut: settings.sync_hour)
            minute: Minute de synchronisation (défaut: settings.sync_minute)
        """
        if not self.settings.sync_enabled:
            self._log.info("Scheduler disabled in settings")
            return

        if hour is None:
            hour = self.settings.sync_hour
        if minute is None:
            minute = self.settings.sync_minute

        # Configurer la tâche cron
        trigger = CronTrigger(hour=hour, minute=minute)

        self.scheduler.add_job(
            self._scheduled_sync,
            trigger=trigger,
            id="ted_tender_sync",
            name="TED Tender Sync",
            replace_existing=True,
        )

        self.scheduler.start()
        self._log.info(
            "Scheduler started",
            sync_time=f"{hour:02d}:{minute:02d}",
        )

    def stop(self) -> None:
        """Arrête le planificateur."""
        if self.scheduler.running:
            self.scheduler.shutdown(wait=False)
            self._log.info("Scheduler stopped")

    @property
    def is_running(self) -> bool:
        """Vérifie si le planificateur est actif."""
        return self.scheduler.running

    def get_next_run_time(self) -> datetime | None:
        """
        Récupère la prochaine heure d'exécution.

        Returns:
            datetime de la prochaine exécution ou None
        """
        job = self.scheduler.get_job("ted_tender_sync")
        if job is None:
            return None
        return job.next_run_time


async def create_scheduler(settings: Settings) -> TenderSyncScheduler:
    """
    Factory pour créer un scheduler avec ses dépendances.

    Args:
        settings: Configuration du module

    Returns:
        TenderSyncScheduler initialisé
    """
    cache = await get_cache_backend_async(settings.redis_url)
    client = TEDAPIClient(settings, cache)
    db = TenderDatabase(settings.async_database_url)
    await db.init_schema()

    return TenderSyncScheduler(settings, client, db)


async def run_sync_standalone(
    settings: Settings | None = None,
    country: str | None = None,
) -> tuple[int, int]:
    """
    Exécute une synchronisation en mode standalone.

    Utile pour les scripts ou les tâches cron externes.

    Args:
        settings: Configuration (optionnel)
        country: Code pays (optionnel)

    Returns:
        Tuple (insérés, mis à jour)
    """
    from ted_api.config import get_settings

    if settings is None:
        settings = get_settings()

    scheduler = await create_scheduler(settings)

    try:
        return await scheduler.sync_tenders(country=country)
    finally:
        await scheduler.client.close()
        await scheduler.db.close()


def main() -> None:
    """
    Point d'entrée CLI pour la synchronisation.

    Usage:
        python -m ted_api.scheduler [--country FRA]
    """
    import argparse

    from ted_api.config import get_settings

    parser = argparse.ArgumentParser(description="TED Tender Sync")
    parser.add_argument(
        "--country",
        default=None,
        help="Code pays ISO (ex: FRA, DEU)",
    )
    parser.add_argument(
        "--daemon",
        action="store_true",
        help="Démarrer en mode daemon (planification)",
    )
    args = parser.parse_args()

    settings = get_settings()

    if args.daemon:
        # Mode daemon avec APScheduler
        async def run_daemon() -> None:
            scheduler = await create_scheduler(settings)
            scheduler.start()

            logger.info("Daemon started, waiting for scheduled sync...")

            # Garder le processus actif
            try:
                while True:
                    await asyncio.sleep(60)
            except KeyboardInterrupt:
                scheduler.stop()
                logger.info("Daemon stopped")

        asyncio.run(run_daemon())
    else:
        # Synchronisation unique
        inserted, updated = asyncio.run(
            run_sync_standalone(settings, country=args.country)
        )
        print(f"Sync completed: {inserted} inserted, {updated} updated")


if __name__ == "__main__":
    main()
