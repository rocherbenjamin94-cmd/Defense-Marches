"""
Base de données SQLite pour les appels d'offres TED.

Utilise SQLAlchemy async pour la gestion de la base de données.
La base est partagée avec le projet veille-boamp existant.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Any

import structlog
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from ted_api.config import Settings
from ted_api.models import PaginatedResponse, Tender, TenderFilter

logger = structlog.get_logger(__name__)


# Schema SQL pour la table ted_tenders
TED_TENDERS_SCHEMA = """
CREATE TABLE IF NOT EXISTS ted_tenders (
    notice_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    buyer_name TEXT NOT NULL,
    buyer_country TEXT NOT NULL,
    estimated_value REAL,
    currency TEXT,
    deadline TEXT,
    publication_date TEXT NOT NULL,
    cpv_codes TEXT,
    procedure_type TEXT,
    place_of_performance TEXT,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
"""

TED_TENDERS_INDEXES = [
    "CREATE INDEX IF NOT EXISTS idx_ted_country ON ted_tenders(buyer_country);",
    "CREATE INDEX IF NOT EXISTS idx_ted_deadline ON ted_tenders(deadline);",
    "CREATE INDEX IF NOT EXISTS idx_ted_publication ON ted_tenders(publication_date);",
    "CREATE INDEX IF NOT EXISTS idx_ted_cpv ON ted_tenders(cpv_codes);",
]


class TenderDatabase:
    """
    Gestionnaire de base de données pour les appels d'offres TED.

    Utilise SQLite via SQLAlchemy async.
    Compatible avec la base de données partagée du projet veille-boamp.
    """

    def __init__(self, db_path: str) -> None:
        """
        Initialise la connexion à la base de données.

        Args:
            db_path: Chemin vers le fichier SQLite
        """
        self.db_path = db_path
        self._engine: AsyncEngine | None = None
        self._log = logger.bind(component="TenderDatabase", db_path=db_path)

    @property
    def engine(self) -> AsyncEngine:
        """Retourne le moteur SQLAlchemy (création lazy)."""
        if self._engine is None:
            # S'assurer que le répertoire existe
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)

            self._engine = create_async_engine(
                f"sqlite+aiosqlite:///{self.db_path}",
                echo=False,
            )
            self._log.info("Database engine created")
        return self._engine

    async def init_schema(self) -> None:
        """
        Initialise le schéma de la base de données.

        Crée la table ted_tenders et les index si nécessaire.
        """
        async with self.engine.begin() as conn:
            # Créer la table
            await conn.execute(text(TED_TENDERS_SCHEMA))

            # Créer les index
            for index_sql in TED_TENDERS_INDEXES:
                await conn.execute(text(index_sql))

        self._log.info("Database schema initialized")

    async def close(self) -> None:
        """Ferme la connexion à la base de données."""
        if self._engine is not None:
            await self._engine.dispose()
            self._engine = None
            self._log.info("Database connection closed")

    async def upsert_tenders(self, tenders: list[Tender]) -> tuple[int, int]:
        """
        Insère ou met à jour des appels d'offres.

        Args:
            tenders: Liste des Tender à insérer/mettre à jour

        Returns:
            Tuple (nombre insérés, nombre mis à jour)
        """
        if not tenders:
            return 0, 0

        inserted = 0
        updated = 0

        async with self.engine.begin() as conn:
            for tender in tenders:
                # Vérifier si existe
                result = await conn.execute(
                    text("SELECT notice_id FROM ted_tenders WHERE notice_id = :id"),
                    {"id": tender.notice_id},
                )
                exists = result.fetchone() is not None

                tender_data = self._tender_to_row(tender)

                if exists:
                    # Update
                    await conn.execute(
                        text("""
                            UPDATE ted_tenders SET
                                title = :title,
                                description = :description,
                                buyer_name = :buyer_name,
                                buyer_country = :buyer_country,
                                estimated_value = :estimated_value,
                                currency = :currency,
                                deadline = :deadline,
                                publication_date = :publication_date,
                                cpv_codes = :cpv_codes,
                                procedure_type = :procedure_type,
                                place_of_performance = :place_of_performance,
                                url = :url,
                                updated_at = :updated_at
                            WHERE notice_id = :notice_id
                        """),
                        tender_data,
                    )
                    updated += 1
                else:
                    # Insert
                    await conn.execute(
                        text("""
                            INSERT INTO ted_tenders (
                                notice_id, title, description, buyer_name,
                                buyer_country, estimated_value, currency, deadline,
                                publication_date, cpv_codes, procedure_type,
                                place_of_performance, url, created_at, updated_at
                            ) VALUES (
                                :notice_id, :title, :description, :buyer_name,
                                :buyer_country, :estimated_value, :currency, :deadline,
                                :publication_date, :cpv_codes, :procedure_type,
                                :place_of_performance, :url, :created_at, :updated_at
                            )
                        """),
                        tender_data,
                    )
                    inserted += 1

        self._log.info(
            "Tenders upserted",
            inserted=inserted,
            updated=updated,
            total=len(tenders),
        )

        return inserted, updated

    async def get_tenders(
        self,
        filters: TenderFilter | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> PaginatedResponse[Tender]:
        """
        Récupère les appels d'offres avec filtres et pagination.

        Args:
            filters: Filtres optionnels
            page: Numéro de page (1-indexed)
            limit: Nombre de résultats par page

        Returns:
            PaginatedResponse avec les Tender trouvés
        """
        if filters is None:
            filters = TenderFilter()

        # Construire la requête WHERE
        where_clauses: list[str] = []
        params: dict[str, Any] = {}

        if filters.country:
            where_clauses.append("buyer_country = :country")
            params["country"] = filters.country

        if filters.cpv:
            # Recherche par préfixe CPV
            where_clauses.append("cpv_codes LIKE :cpv")
            params["cpv"] = f"%{filters.cpv}%"

        if filters.min_value is not None:
            where_clauses.append("estimated_value >= :min_value")
            params["min_value"] = filters.min_value

        if filters.max_value is not None:
            where_clauses.append("estimated_value <= :max_value")
            params["max_value"] = filters.max_value

        if filters.days_remaining is not None:
            # Filtrer par deadline minimum
            min_deadline = datetime.now().strftime("%Y-%m-%d")
            where_clauses.append("deadline >= :min_deadline")
            params["min_deadline"] = min_deadline

        if filters.search_text:
            where_clauses.append(
                "(title LIKE :search OR description LIKE :search)"
            )
            params["search"] = f"%{filters.search_text}%"

        # Construire la clause WHERE
        where_sql = ""
        if where_clauses:
            where_sql = "WHERE " + " AND ".join(where_clauses)

        # Compter le total
        count_sql = f"SELECT COUNT(*) FROM ted_tenders {where_sql}"

        async with self.engine.connect() as conn:
            result = await conn.execute(text(count_sql), params)
            total = result.scalar() or 0

            # Récupérer les résultats
            offset = (page - 1) * limit
            select_sql = f"""
                SELECT * FROM ted_tenders
                {where_sql}
                ORDER BY publication_date DESC, deadline ASC
                LIMIT :limit OFFSET :offset
            """
            params["limit"] = limit
            params["offset"] = offset

            result = await conn.execute(text(select_sql), params)
            rows = result.fetchall()

            tenders = [self._row_to_tender(row) for row in rows]

        return PaginatedResponse(
            total=total,
            page=page,
            limit=limit,
            items=tenders,
        )

    async def get_tender_by_id(self, notice_id: str) -> Tender | None:
        """
        Récupère un appel d'offres par son ID.

        Args:
            notice_id: Identifiant de la notice

        Returns:
            Tender ou None si non trouvé
        """
        async with self.engine.connect() as conn:
            result = await conn.execute(
                text("SELECT * FROM ted_tenders WHERE notice_id = :id"),
                {"id": notice_id},
            )
            row = result.fetchone()

            if row is None:
                return None

            return self._row_to_tender(row)

    async def get_new_tenders_since(self, since: datetime) -> list[Tender]:
        """
        Récupère les nouvelles notices depuis une date.

        Args:
            since: Date depuis laquelle chercher

        Returns:
            Liste des nouvelles Tender
        """
        async with self.engine.connect() as conn:
            result = await conn.execute(
                text("""
                    SELECT * FROM ted_tenders
                    WHERE created_at > :since
                    ORDER BY created_at DESC
                """),
                {"since": since.isoformat()},
            )
            rows = result.fetchall()

            return [self._row_to_tender(row) for row in rows]

    async def get_expiring_tenders(self, days: int = 7) -> list[Tender]:
        """
        Récupère les appels d'offres qui expirent bientôt.

        Args:
            days: Nombre de jours avant expiration

        Returns:
            Liste des Tender expirant bientôt
        """
        async with self.engine.connect() as conn:
            result = await conn.execute(
                text("""
                    SELECT * FROM ted_tenders
                    WHERE deadline IS NOT NULL
                    AND deadline >= date('now')
                    AND deadline <= date('now', '+' || :days || ' days')
                    ORDER BY deadline ASC
                """),
                {"days": days},
            )
            rows = result.fetchall()

            return [self._row_to_tender(row) for row in rows]

    async def delete_expired_tenders(self) -> int:
        """
        Supprime les appels d'offres expirés.

        Returns:
            Nombre de notices supprimées
        """
        async with self.engine.begin() as conn:
            result = await conn.execute(
                text("""
                    DELETE FROM ted_tenders
                    WHERE deadline IS NOT NULL
                    AND deadline < date('now')
                """)
            )
            deleted = result.rowcount

        if deleted > 0:
            self._log.info("Expired tenders deleted", count=deleted)

        return deleted

    async def get_stats(self) -> dict[str, Any]:
        """
        Récupère des statistiques sur les appels d'offres.

        Returns:
            Dictionnaire avec les stats
        """
        async with self.engine.connect() as conn:
            # Total
            result = await conn.execute(
                text("SELECT COUNT(*) FROM ted_tenders")
            )
            total = result.scalar() or 0

            # Par pays
            result = await conn.execute(
                text("""
                    SELECT buyer_country, COUNT(*) as count
                    FROM ted_tenders
                    GROUP BY buyer_country
                    ORDER BY count DESC
                    LIMIT 10
                """)
            )
            by_country = {row[0]: row[1] for row in result.fetchall()}

            # Actifs (deadline future)
            result = await conn.execute(
                text("""
                    SELECT COUNT(*) FROM ted_tenders
                    WHERE deadline IS NULL OR deadline >= date('now')
                """)
            )
            active = result.scalar() or 0

            # Valeur totale
            result = await conn.execute(
                text("""
                    SELECT SUM(estimated_value), AVG(estimated_value)
                    FROM ted_tenders
                    WHERE estimated_value IS NOT NULL
                """)
            )
            row = result.fetchone()
            total_value = row[0] if row else 0
            avg_value = row[1] if row else 0

        return {
            "total": total,
            "active": active,
            "by_country": by_country,
            "total_value": total_value,
            "average_value": avg_value,
        }

    def _tender_to_row(self, tender: Tender) -> dict[str, Any]:
        """Convertit un Tender en dict pour insertion SQL."""
        now = datetime.now().isoformat()
        return {
            "notice_id": tender.notice_id,
            "title": tender.title,
            "description": tender.description,
            "buyer_name": tender.buyer_name,
            "buyer_country": tender.buyer_country,
            "estimated_value": tender.estimated_value,
            "currency": tender.currency,
            "deadline": tender.deadline.isoformat() if tender.deadline else None,
            "publication_date": tender.publication_date.isoformat(),
            "cpv_codes": json.dumps(tender.cpv_codes),
            "procedure_type": tender.procedure_type,
            "place_of_performance": tender.place_of_performance,
            "url": tender.url,
            "created_at": now,
            "updated_at": now,
        }

    def _row_to_tender(self, row: Any) -> Tender:
        """Convertit une ligne SQL en Tender."""
        # row est un tuple ou Row object
        if hasattr(row, "_mapping"):
            data = dict(row._mapping)
        else:
            # Fallback pour les tuples
            columns = [
                "notice_id", "title", "description", "buyer_name",
                "buyer_country", "estimated_value", "currency", "deadline",
                "publication_date", "cpv_codes", "procedure_type",
                "place_of_performance", "url", "created_at", "updated_at",
            ]
            data = dict(zip(columns, row))

        # Parser les CPV codes (JSON)
        cpv_codes = data.get("cpv_codes", "[]")
        if isinstance(cpv_codes, str):
            try:
                cpv_codes = json.loads(cpv_codes)
            except json.JSONDecodeError:
                cpv_codes = []

        return Tender(
            notice_id=data["notice_id"],
            title=data["title"],
            description=data.get("description"),
            buyer_name=data["buyer_name"],
            buyer_country=data["buyer_country"],
            estimated_value=data.get("estimated_value"),
            currency=data.get("currency"),
            deadline=data.get("deadline"),
            publication_date=data["publication_date"],
            cpv_codes=cpv_codes,
            procedure_type=data.get("procedure_type"),
            place_of_performance=data.get("place_of_performance"),
            url=data["url"],
        )


async def get_database(settings: Settings) -> TenderDatabase:
    """
    Factory pour créer et initialiser la base de données.

    Args:
        settings: Configuration du module

    Returns:
        TenderDatabase initialisée
    """
    db = TenderDatabase(settings.database_path)
    await db.init_schema()
    return db
