"""
Application FastAPI pour l'API TED.

Point d'entrée principal du serveur web.
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from ted_api.api.dependencies import init_dependencies, shutdown_dependencies
from ted_api.api.routes import router
from ted_api.config import get_settings

# Configuration du logging structuré
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer() if get_settings().log_format == "console"
        else structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(
        logging.INFO if get_settings().log_level == "INFO" else logging.DEBUG
    ),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Gestionnaire de cycle de vie de l'application.

    Initialise les dépendances au démarrage et les ferme à l'arrêt.
    """
    settings = get_settings()
    logger.info(
        "Starting TED API Module",
        version="1.0.0",
        host=settings.api_host,
        port=settings.api_port,
    )

    # Startup
    await init_dependencies(settings)

    yield

    # Shutdown
    await shutdown_dependencies()
    logger.info("TED API Module stopped")


# Création de l'application FastAPI
app = FastAPI(
    title="TED API Module",
    description="""
## API pour les appels d'offres européens (TED)

Ce module permet de:
- Récupérer les appels d'offres actifs depuis l'API TED
- Filtrer par pays, secteur (CPV), valeur, deadline
- Stocker les données en base SQLite
- Synchroniser automatiquement les données

### Endpoints principaux

- `GET /api/tenders` - Liste des appels d'offres avec filtres
- `GET /api/tenders/{id}` - Détails d'un appel d'offres
- `POST /api/tenders/sync` - Déclencher une synchronisation
- `GET /api/tenders/stats` - Statistiques

### Authentification

Aucune authentification requise (lecture seule).
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configuration CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)


# Gestionnaire d'erreurs global
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Gestionnaire d'erreurs global.

    Capture toutes les exceptions non gérées et retourne une réponse JSON.
    """
    logger.error(
        "Unhandled exception",
        path=request.url.path,
        method=request.method,
        error=str(exc),
        error_type=type(exc).__name__,
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Erreur interne du serveur",
            "error_type": type(exc).__name__,
        },
    )


# Inclusion des routes
app.include_router(router)


# Route racine
@app.get("/", tags=["root"])
async def root() -> dict[str, str]:
    """
    Route racine - informations sur l'API.
    """
    return {
        "name": "TED API Module",
        "version": "1.0.0",
        "description": "API pour les appels d'offres européens",
        "docs": "/docs",
        "health": "/api/health",
    }


def main() -> None:
    """Point d'entrée pour le script console."""
    import uvicorn

    settings = get_settings()

    uvicorn.run(
        "ted_api.api.app:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload,
        log_level=settings.log_level.lower(),
    )


if __name__ == "__main__":
    main()
