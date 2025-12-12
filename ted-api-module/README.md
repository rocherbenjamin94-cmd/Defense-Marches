# TED API Module

Module Python pour récupérer les appels d'offres européens depuis l'API TED (Tenders Electronic Daily) et les exposer via une API REST.

## Fonctionnalités

- **Client API TED** avec retry automatique et cache
- **Modèles Pydantic** avec validation et conversion de dates
- **API REST FastAPI** avec filtres et pagination
- **Base de données SQLite** partagée avec veille-boamp
- **Synchronisation planifiée** (quotidienne à 2h)
- **Cache** mémoire ou Redis (auto-détection)

## Installation

```bash
# Cloner ou copier le module
cd ted-api-module

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Pour le développement
pip install -r requirements-dev.txt
```

## Configuration

Copiez `.env.example` en `.env` et adaptez les valeurs :

```bash
cp .env.example .env
```

Variables principales :

| Variable | Description | Défaut |
|----------|-------------|--------|
| `TED_DEFAULT_COUNTRY` | Code pays ISO | `FRA` |
| `DATABASE_PATH` | Chemin SQLite | `../veille-boamp/backend-dc1/data/cache.db` |
| `CACHE_TTL` | Durée cache (secondes) | `3600` |
| `REDIS_URL` | URL Redis (optionnel) | - |
| `API_PORT` | Port serveur | `8000` |

## Utilisation

### Démarrer le serveur API

```bash
python run.py
# ou
python run.py --host 127.0.0.1 --port 3000 --reload
```

Le serveur démarre sur `http://localhost:8000`

### Documentation API

- Swagger UI : http://localhost:8000/docs
- ReDoc : http://localhost:8000/redoc
- OpenAPI JSON : http://localhost:8000/openapi.json

### Endpoints disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/tenders` | Liste des appels d'offres |
| GET | `/api/tenders/{id}` | Détails d'un appel |
| GET | `/api/tenders/stats` | Statistiques |
| GET | `/api/tenders/expiring` | Appels expirant bientôt |
| POST | `/api/tenders/sync` | Déclencher sync manuelle |
| GET | `/api/tenders/sync/status` | Statut de synchronisation |
| DELETE | `/api/tenders/expired` | Supprimer les expirés |
| GET | `/api/health` | Health check |

### Paramètres de filtrage

```
GET /api/tenders?country=FRA&cpv=30000000&min_value=10000&max_value=500000&days_remaining=30&search=informatique&page=1&limit=20
```

| Paramètre | Type | Description |
|-----------|------|-------------|
| `country` | string | Code pays ISO (défaut: FRA) |
| `cpv` | string | Code CPV (préfixe) |
| `min_value` | float | Valeur minimale |
| `max_value` | float | Valeur maximale |
| `days_remaining` | int | Jours avant deadline |
| `search` | string | Recherche full-text |
| `page` | int | Numéro de page (défaut: 1) |
| `limit` | int | Résultats par page (défaut: 20, max: 100) |

### Synchronisation manuelle

```bash
# Depuis la ligne de commande
python run.py --sync

# Synchroniser un autre pays
python run.py --sync --country DEU

# Mode daemon (sync planifiée)
python run.py --daemon
```

### Via l'API

```bash
# Déclencher une sync
curl -X POST "http://localhost:8000/api/tenders/sync?country=FRA"

# Vérifier le statut
curl "http://localhost:8000/api/tenders/sync/status"
```

## Exemples d'utilisation

### Python

```python
import httpx

# Récupérer les appels d'offres français
response = httpx.get(
    "http://localhost:8000/api/tenders",
    params={"country": "FRA", "limit": 50}
)
data = response.json()

print(f"Total: {data['total']} appels d'offres")
for tender in data['items']:
    print(f"- {tender['title']}")
    print(f"  Acheteur: {tender['buyer_name']}")
    print(f"  Deadline: {tender['deadline']}")
    print(f"  Jours restants: {tender['days_until_deadline']}")
```

### JavaScript/Fetch

```javascript
const response = await fetch(
  'http://localhost:8000/api/tenders?country=FRA&cpv=30000000'
);
const data = await response.json();

data.items.forEach(tender => {
  console.log(`${tender.title} - ${tender.formatted_value}`);
});
```

### cURL

```bash
# Liste des appels d'offres
curl "http://localhost:8000/api/tenders?country=FRA&limit=10"

# Détails d'un appel
curl "http://localhost:8000/api/tenders/123456-2024"

# Statistiques
curl "http://localhost:8000/api/tenders/stats"
```

## Tests

```bash
# Exécuter tous les tests
pytest

# Avec couverture
pytest --cov=ted_api --cov-report=html

# Tests spécifiques
pytest tests/test_models.py -v
pytest tests/test_api.py -v
```

## Structure du projet

```
ted-api-module/
├── src/
│   └── ted_api/
│       ├── __init__.py
│       ├── config.py         # Configuration (Settings)
│       ├── models.py         # Modèles Pydantic
│       ├── client.py         # Client API TED
│       ├── cache.py          # Cache mémoire/Redis
│       ├── database.py       # SQLite
│       ├── scheduler.py      # Sync planifiée
│       └── api/
│           ├── __init__.py
│           ├── app.py        # Application FastAPI
│           ├── routes.py     # Endpoints
│           └── dependencies.py
├── tests/
│   ├── conftest.py           # Fixtures
│   ├── test_models.py
│   ├── test_client.py
│   ├── test_cache.py
│   ├── test_database.py
│   └── test_api.py
├── requirements.txt
├── requirements-dev.txt
├── pyproject.toml
├── run.py
├── .env.example
└── README.md
```

## Intégration avec veille-boamp

Ce module partage la base de données SQLite avec le projet veille-boamp :
- Chemin : `../veille-boamp/backend-dc1/data/cache.db`
- Table créée : `ted_tenders`

Les données sont accessibles depuis les deux projets.

## API TED

Ce module utilise l'API TED Search (gratuite, sans authentification) :
- Documentation : https://docs.ted.europa.eu
- Swagger : https://api.ted.europa.eu/swagger

### Limites

- Max 100 résultats par requête
- Pas de limite de débit stricte (respecter les bonnes pratiques)
- Données mises à jour quotidiennement

## Licence

MIT
