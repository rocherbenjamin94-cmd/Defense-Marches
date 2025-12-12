#!/usr/bin/env python3
"""
Point d'entrée pour le module TED API.

Usage:
    python run.py              # Démarre le serveur API
    python run.py --sync       # Lance une synchronisation unique
    python run.py --daemon     # Démarre en mode daemon (sync planifiée)
"""

import argparse
import asyncio
import sys
from pathlib import Path

# Ajouter src au path pour les imports
sys.path.insert(0, str(Path(__file__).parent / "src"))


def main() -> None:
    """Point d'entrée principal."""
    parser = argparse.ArgumentParser(
        description="TED API Module - Appels d'offres européens",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples:
    python run.py                      # Démarrer le serveur API
    python run.py --sync               # Synchronisation unique
    python run.py --sync --country DEU # Sync Allemagne
    python run.py --host 127.0.0.1     # Écouter localhost seulement
    python run.py --port 3000          # Port personnalisé
    python run.py --reload             # Mode développement
        """,
    )

    parser.add_argument(
        "--sync",
        action="store_true",
        help="Lancer une synchronisation unique puis quitter",
    )
    parser.add_argument(
        "--daemon",
        action="store_true",
        help="Démarrer en mode daemon (synchronisation planifiée)",
    )
    parser.add_argument(
        "--country",
        default=None,
        help="Code pays ISO pour la synchronisation (défaut: FRA)",
    )
    parser.add_argument(
        "--host",
        default=None,
        help="Adresse d'écoute (défaut: 0.0.0.0)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=None,
        help="Port d'écoute (défaut: 8000)",
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        help="Activer le rechargement automatique (développement)",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=1,
        help="Nombre de workers (défaut: 1)",
    )

    args = parser.parse_args()

    if args.sync:
        # Mode synchronisation unique
        run_sync(country=args.country)
    elif args.daemon:
        # Mode daemon
        run_daemon()
    else:
        # Mode serveur API (défaut)
        run_server(
            host=args.host,
            port=args.port,
            reload=args.reload,
            workers=args.workers,
        )


def run_server(
    host: str | None = None,
    port: int | None = None,
    reload: bool = False,
    workers: int = 1,
) -> None:
    """Démarre le serveur FastAPI."""
    import uvicorn
    from ted_api.config import get_settings

    settings = get_settings()

    uvicorn.run(
        "ted_api.api.app:app",
        host=host or settings.api_host,
        port=port or settings.api_port,
        reload=reload or settings.api_reload,
        workers=workers,
        log_level=settings.log_level.lower(),
    )


def run_sync(country: str | None = None) -> None:
    """Exécute une synchronisation unique."""
    from ted_api.scheduler import run_sync_standalone

    print(f"Démarrage de la synchronisation (pays: {country or 'FRA'})...")

    try:
        inserted, updated = asyncio.run(run_sync_standalone(country=country))
        print(f"Synchronisation terminée: {inserted} insérés, {updated} mis à jour")
    except Exception as e:
        print(f"Erreur lors de la synchronisation: {e}")
        sys.exit(1)


def run_daemon() -> None:
    """Démarre le scheduler en mode daemon."""
    from ted_api.config import get_settings
    from ted_api.scheduler import create_scheduler

    settings = get_settings()

    async def daemon() -> None:
        scheduler = await create_scheduler(settings)
        scheduler.start()

        print(
            f"Daemon démarré. Synchronisation planifiée à "
            f"{settings.sync_hour:02d}:{settings.sync_minute:02d}"
        )
        print("Appuyez sur Ctrl+C pour arrêter...")

        try:
            while True:
                await asyncio.sleep(60)
        except KeyboardInterrupt:
            scheduler.stop()
            print("\nDaemon arrêté.")

    asyncio.run(daemon())


if __name__ == "__main__":
    main()
