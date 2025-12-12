# Guide Complet d'Intégration de l'API TED (Tenders Electronic Daily)

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture de l'API TED](#architecture-de-lapi-ted)
3. [Types d'API Disponibles](#types-dapi-disponibles)
4. [Authentification](#authentification)
5. [Search API - Appels d'Offres Actifs](#search-api---appels-doffres-actifs)
6. [Format des Requêtes](#format-des-requêtes)
7. [Exemples Pratiques](#exemples-pratiques)
8. [Gestion des Erreurs](#gestion-des-erreurs)
9. [Limite de Débit (Rate Limiting)](#limite-de-débit-rate-limiting)
10. [Bonnes Pratiques](#bonnes-pratiques)

---

## Vue d'Ensemble

**TED (Tenders Electronic Daily)** est la plateforme officielle de l'Union Européenne dédiée aux appels d'offres publics et à la passation des marchés publics. L'API TED permet aux développeurs d'intégrer programmatiquement les données de marché public dans leurs applications.

### Cas d'Usage Principaux

- **Intégration d'appels d'offres actifs** dans des portails e-procurement
- **Analyse de tendances** des marchés publics
- **Surveillance automatisée** des opportunités de marché
- **Validation et publication** de notices de marché
- **Visualisation** de notices en format HTML/PDF

### Points Clés

- **Accès anonyme** pour la recherche de notices publiées
- **API gratuite** et librement accessible
- **Données mises à jour quotidiennement**
- **Support de multiples formats** (JSON, XML, HTML, PDF)
- **Conformité avec les normes EU** (eForms et TED XML schema)

---

## Architecture de l'API TED

```
┌─────────────────────────────────────────────────────────────┐
│                    TED Ecosystem                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Search API  │  │ Validation   │  │Visualisation │       │
│  │  (Reusers)   │  │  API (CVS)   │  │   API        │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         ↑                 ↑                  ↑                │
│  (Public, anonym)   (Avec clé API)  (Avec clé API)          │
│                                                               │
│  ┌──────────────────────────────────────┐                   │
│  │   Publication API (eSenders)         │                   │
│  │   - Soumettre notices                │                   │
│  │   - Gérer publication                │                   │
│  └──────────────────────────────────────┘                   │
│         (Authentification requise - clé API)                 │
│                                                               │
│  ┌──────────────────────────────────────┐                   │
│  │   TED Website                        │                   │
│  │   - Notices publiées                 │                   │
│  │   - Base de données TED              │                   │
│  └──────────────────────────────────────┘                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Types d'API Disponibles

### 1. **Search API** (Pour Récupérer les Appels d'Offres)

L'API principale pour accéder aux notices publiées.

**Caractéristiques:**
- Accès anonyme (pas de clé API requise)
- Recherche par requête expert
- Filtrage et tri
- Pagination

**Cas d'usage:** Récupération des appels d'offres actifs pour votre plateforme

### 2. **Publication API** (Pour Soumettre les Notices)

Pour les fournisseurs souhaitant publier des notices.

**Caractéristiques:**
- Authentification requise
- Soumission de notices eForms
- Gestion du cycle de vie des notices
- Validation automatique

### 3. **Validation API (CVS)**

Valide les notices avant soumission.

**Caractéristiques:**
- Vérification de la conformité
- Détection d'erreurs
- Avertissements préalables

### 4. **Visualisation API**

Convertit les notices en formats lisibles.

**Formats supportés:**
- HTML
- PDF (signé et non-signé)
- Direct links

---

## Authentification

### Pour l'API Search (Appels d'Offres Actifs)

**Bonne nouvelle:** L'API Search ne nécessite **pas d'authentification** !

Vous pouvez effectuer des requêtes directement sans clé API.

### Pour les Autres APIs (Publication, Validation)

Si vous avez besoin de soumettre des notices, vous avez besoin d'une clé API.

#### Obtenir une Clé API

1. **Accédez au TED Developer Portal**
   - URL: `https://developer.ted.europa.eu`
   - Environnement: Preview (pour les tests) ou Production

2. **Créez un compte EU Login**
   - Utilisez vos identifiants EU Login
   - Compte distinct pour Preview et Production

3. **Générez une clé API**
   - Allez à "Manage API Keys"
   - Générez une nouvelle clé
   - **Sauvegardez-la immédiatement** (non récupérable)
   - Validité: 24 mois, renouvelable pour 12 mois supplémentaires

#### Format d'Authentification

Ajoutez la clé API dans le header de votre requête:

```
Authorization: Bearer YOUR_API_KEY
```

Ou avec certains endpoints:

```
X-API-Key: YOUR_API_KEY
```

**Important:** Une seule clé API par compte EU Login en Production. Utilisez un email partagé/fonctionnel plutôt que personnel.

---

## Search API - Appels d'Offres Actifs

### Endpoint Principal

```
POST https://api.ted.europa.eu/v3/search
```

### Paramètres de Requête

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `query` | string | ✓ | Requête de recherche expert au format TED |
| `fields` | array | ✓ | Champs à retourner pour chaque notice |
| `scope` | string | ✗ | `LATEST`, `ACTIVE`, `ALL` (défaut: `LATEST`) |
| `page` | integer | ✗ | Numéro de page (défaut: 1) |
| `limit` | integer | ✗ | Max notices par requête (défaut: 10, max: 100) |
| `check_query_syntax` | boolean | ✗ | Vérifier la syntaxe sans retourner (défaut: false) |
| `pagination_mode` | string | ✗ | `page_number` ou `iteration` (défaut: `page_number`) |

### Scope - Comprendre les Différentes Étendues

#### `ACTIVE` (Recommandé pour les Appels d'Offres Actifs)

```
search_scope = ACTIVE
```

Retourne les notices "actives":

1. **Planning notices** - Envoyées dans les **364 derniers jours**
   - PINs (Prior Information Notices)
   - Notices informatives périodiques

2. **Competition notices** - Notices avec **deadline non expirée**
   - Contract notices (CN)
   - Notices de concours de design
   - Notices de système de qualification

3. **Result notices** - Envoyées dans les **99 derniers jours**
   - Contract award notices (CAN)
   - Design contest results

#### `LATEST`

Notices publiées dans la **dernière édition de l'OJ S** (Official Journal Supplement)

#### `ALL`

Toutes les notices de la **dernière décennie**

### Syntaxe de Requête Expert

La requête suit un **langage de requête standardisé** avec champs et opérateurs.

#### Opérateurs Disponibles

| Opérateur | Fonction | Exemple |
|-----------|----------|---------|
| `=` | Égalité exacte | `notice-type = cn-standard` |
| `~` | Recherche texte (avec stemming) | `FT ~ procurement` |
| `!=` | Négation égalité | `notice-type != pin-buyer` |
| `!~` | Négation recherche texte | `FT !~ cancelled` |
| `IN` | Liste de valeurs (OR) | `notice-type IN (cn-standard cn-social)` |
| `NOT IN` | Exclusion de liste | `notice-type NOT IN (pin-buyer)` |
| `>` | Supérieur à | `estimated-value > 50000` |
| `<` | Inférieur à | `estimated-value < 1000000` |
| `>=` | Supérieur ou égal | `publication-date >= 20241201` |
| `<=` | Inférieur ou égal | `publication-date <= 20241231` |
| `AND` | ET logique | `notice-type = cn-standard AND buyer-country = FRA` |
| `OR` | OU logique | `notice-type = (cn-standard OR cn-social)` |
| `NOT` | Négation logique | `notice-type = cn-standard NOT buyer-country = FRA` |
| `SORT BY` | Tri des résultats | `SORT BY publication-date DESC` |

### Champs Recherchables Courants

| Champ | Alias | Type | Description |
|-------|-------|------|-------------|
| `notice-type` | | Code | Type de notice (cn-standard, can-standard, etc.) |
| `publication-date` | `PD` | Date | Date de publication (YYYYMMDD) |
| `buyer-country` | | Code | Pays de l'acheteur (FRA, DEU, ITA, etc.) |
| `classification-cpv` | `PC` | CPV | Code de classification (ex: 30000000) |
| `contract-nature` | | Code | Nature du marché (WORKS, SUPPLIES, SERVICES) |
| `estimated-value` | `EV`, `TV` | Montant | Valeur estimée du marché |
| `estimated-value-currency` | `EV-CUR` | Code | Devise (EUR, GBP, etc.) |
| `place-of-performance` | `RC` | NUTS | Lieu d'exécution (code NUTS) |
| `deadline-for-submission` | | Date | Date limite de soumission |
| `buyer-name` | | Texte | Nom de l'acheteur |
| `FT` | | Texte | Recherche full-text sur tous les champs |
| `procedure-type` | | Code | Type de procédure (open, negotiated, etc.) |
| `legal-basis-directive` | | Code | Directive légale appliquée |

### Formats de Date

Les dates doivent être au format: `YYYYMMDD`

Exemples:
- `20241211` = 11 décembre 2024
- `publication-date >= 20241101` = à partir du 1er novembre 2024

### Codes de Types de Notice

| Code | Description |
|------|-------------|
| `cn-standard` | Contract Notice - Régime standard |
| `cn-social` | Contract Notice - Régime social |
| `cn-desg` | Contract Notice - Concours de design |
| `can-standard` | Contract Award Notice - Régime standard |
| `can-social` | Contract Award Notice - Régime social |
| `can-desg` | Design Contest Result Notice |
| `pin-buyer` | Prior Information Notice - Acheteur |
| `pin-cfc-standard` | PIN - Call for Competition (standard) |
| `pin-cfc-social` | PIN - Call for Competition (social) |
| `qu-sy` | Notice de système de qualification |
| `subco` | Subcontracting notice |

### Codes de Nature de Contrat

- `WORKS` - Travaux
- `SUPPLIES` - Fournitures
- `SERVICES` - Services

### Codes de Procédure

- `OPEN` - Procédure ouverte
- `NEGOTIATED` - Procédure négociée
- `RESTRICTED` - Procédure restreinte
- `INOVATION` - Partenariat d'innovation
- `COMPETITIVE_DIALOGUE` - Dialogue compétitif
- `SIMPLIFIED` - Procédure simplifiée

---

## Format des Requêtes

### Requête HTTP Basique

```http
POST https://api.ted.europa.eu/v3/search
Content-Type: application/json

{
  "query": "notice-type = cn-standard AND publication-date >= 20241211",
  "fields": [
    "notice-id",
    "publication-date",
    "notice-title",
    "buyer-name",
    "estimated-value",
    "estimated-value-currency",
    "deadline-for-submission",
    "notice-url"
  ],
  "scope": "ACTIVE",
  "page": 1,
  "limit": 50
}
```

### Structure de Réponse

```json
{
  "total": 1250,
  "page": 1,
  "limit": 50,
  "notices": [
    {
      "notice-id": "12345678-2024",
      "publication-date": "20241211",
      "notice-title": "Fourniture de services IT pour...",
      "buyer-name": "Ministère de...",
      "estimated-value": "250000",
      "estimated-value-currency": "EUR",
      "deadline-for-submission": "20250110",
      "notice-url": "https://ted.europa.eu/en/notice/-/detail/12345678-2024"
    },
    // ... autres notices
  ]
}
```

### Champs Recommandés à Récupérer

Pour une liste d'appels d'offres active:

```json
{
  "fields": [
    "notice-id",                          // ID unique
    "publication-date",                   // Date de publication
    "notice-title",                       // Titre/Objet
    "notice-description",                 // Description
    "buyer-name",                         // Nom acheteur
    "buyer-country",                      // Pays
    "classification-cpv",                 // Secteur (code CPV)
    "contract-nature",                    // Type de marché
    "estimated-value",                    // Valeur estimée
    "estimated-value-currency",           // Devise
    "deadline-for-submission",            // Date limite
    "procedure-type",                     // Type de procédure
    "place-of-performance",               // Lieu d'exécution
    "notice-url",                         // Lien direct
    "languages-allowed"                   // Langues acceptées
  ]
}
```

---

## Exemples Pratiques

### Exemple 1: Récupérer Tous les Appels d'Offres Actifs en France

```python
import requests
import json

url = "https://api.ted.europa.eu/v3/search"

query = "notice-type IN (cn-standard cn-social) AND buyer-country = FRA"

payload = {
    "query": query,
    "fields": [
        "notice-id",
        "publication-date",
        "notice-title",
        "buyer-name",
        "estimated-value",
        "estimated-value-currency",
        "deadline-for-submission",
        "notice-url"
    ],
    "scope": "ACTIVE",
    "page": 1,
    "limit": 100
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

if response.status_code == 200:
    data = response.json()
    print(f"Total: {data['total']} notices trouvées")
    
    for notice in data['notices']:
        print(f"- {notice['notice-title']}")
        print(f"  Acheteur: {notice['buyer-name']}")
        print(f"  Valeur: {notice['estimated-value']} {notice['estimated-value-currency']}")
        print(f"  Deadline: {notice['deadline-for-submission']}")
        print(f"  URL: {notice['notice-url']}\n")
else:
    print(f"Erreur: {response.status_code}")
    print(response.text)
```

### Exemple 2: Rechercher par Secteur (CPV)

```python
# CPV 30000000 = Office and computing machinery
# CPV 71000000 = Architectural and construction related services

query = "notice-type = cn-standard AND classification-cpv IN (30000000 71000000) AND publication-date >= 20241201"
```

### Exemple 3: Filtrer par Valeur de Marché

```python
# Marchés entre 50 000 et 500 000 EUR
query = "notice-type = cn-standard AND estimated-value >= 50000 AND estimated-value <= 500000 AND estimated-value-currency = EUR"
```

### Exemple 4: Recherche Full-Text

```python
# Recherche de mots-clés
query = 'FT ~ (software development) AND notice-type = cn-standard'
```

### Exemple 5: Pagination - Récupérer Tous les Résultats

```python
import requests

def fetch_all_tenders(query, fields, scope="ACTIVE"):
    """Récupère tous les appels d'offres avec pagination"""
    
    url = "https://api.ted.europa.eu/v3/search"
    all_notices = []
    page = 1
    limit = 100  # Maximum par requête
    
    while True:
        payload = {
            "query": query,
            "fields": fields,
            "scope": scope,
            "page": page,
            "limit": limit
        }
        
        response = requests.post(
            url,
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code != 200:
            print(f"Erreur: {response.status_code}")
            break
        
        data = response.json()
        all_notices.extend(data['notices'])
        
        # Vérifier s'il y a d'autres pages
        if len(all_notices) >= data['total']:
            break
        
        page += 1
    
    return all_notices

# Utilisation
fields = ["notice-id", "notice-title", "buyer-name", "deadline-for-submission"]
query = "notice-type = cn-standard"
tenders = fetch_all_tenders(query, fields)
print(f"Total récupéré: {len(tenders)}")
```

### Exemple 6: Intégration avec une Base de Données

```python
import requests
import sqlite3
from datetime import datetime

def store_tenders_in_db(query, db_path="tenders.db"):
    """Récupère les appels d'offres et les stocke en BD"""
    
    # Créer/connecter à la base de données
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Créer la table si elle n'existe pas
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tenders (
            notice_id TEXT PRIMARY KEY,
            title TEXT,
            buyer_name TEXT,
            buyer_country TEXT,
            value REAL,
            currency TEXT,
            deadline TEXT,
            publication_date TEXT,
            cpv_code TEXT,
            procedure_type TEXT,
            place_of_performance TEXT,
            url TEXT,
            fetched_at TIMESTAMP
        )
    ''')
    
    # Requête API
    url = "https://api.ted.europa.eu/v3/search"
    payload = {
        "query": query,
        "fields": [
            "notice-id", "notice-title", "buyer-name", "buyer-country",
            "estimated-value", "estimated-value-currency", "deadline-for-submission",
            "publication-date", "classification-cpv", "procedure-type",
            "place-of-performance", "notice-url"
        ],
        "scope": "ACTIVE",
        "limit": 100
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        
        for notice in data['notices']:
            cursor.execute('''
                INSERT OR REPLACE INTO tenders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                notice.get('notice-id'),
                notice.get('notice-title'),
                notice.get('buyer-name'),
                notice.get('buyer-country'),
                float(notice.get('estimated-value', 0)),
                notice.get('estimated-value-currency'),
                notice.get('deadline-for-submission'),
                notice.get('publication-date'),
                notice.get('classification-cpv'),
                notice.get('procedure-type'),
                notice.get('place-of-performance'),
                notice.get('notice-url'),
                datetime.now()
            ))
        
        conn.commit()
        print(f"✓ {len(data['notices'])} appels d'offres enregistrés")
    
    conn.close()

# Utilisation
store_tenders_in_db("notice-type = cn-standard AND publication-date >= 20241211")
```

---

## Gestion des Erreurs

### Codes d'Erreur Courants

| Code | Signification | Action |
|------|---------------|--------|
| 200 | OK | Succès |
| 400 | Bad Request | Vérifier la syntaxe de la requête |
| 401 | Unauthorized | Clé API invalide/expirée |
| 403 | Forbidden | Permissions insuffisantes |
| 404 | Not Found | Ressource inexistante |
| 429 | Too Many Requests | Limite de débit dépassée |
| 500 | Server Error | Erreur serveur |
| 503 | Service Unavailable | Service temporairement indisponible |

### Gestion des Erreurs en Python

```python
import requests
import time

def search_tenders_with_retry(query, max_retries=3):
    """Requête avec gestion d'erreur et retry"""
    
    url = "https://api.ted.europa.eu/v3/search"
    
    payload = {
        "query": query,
        "fields": ["notice-id", "notice-title"],
        "scope": "ACTIVE",
        "limit": 50
    }
    
    for attempt in range(max_retries):
        try:
            response = requests.post(
                url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            # Gestion des erreurs
            if response.status_code == 200:
                return response.json()
            
            elif response.status_code == 400:
                error_msg = response.json().get('message', 'Erreur de requête')
                print(f"❌ Erreur de syntaxe: {error_msg}")
                return None
            
            elif response.status_code == 429:
                wait_time = int(response.headers.get('Retry-After', 60))
                print(f"⚠️  Limite de débit atteinte. Attente de {wait_time}s...")
                time.sleep(wait_time)
                continue
            
            elif response.status_code == 503:
                print(f"⚠️  Service indisponible (tentative {attempt + 1}/{max_retries})")
                time.sleep(5 * (attempt + 1))
                continue
            
            else:
                print(f"❌ Erreur {response.status_code}: {response.text}")
                return None
        
        except requests.exceptions.Timeout:
            print(f"❌ Timeout (tentative {attempt + 1}/{max_retries})")
            time.sleep(5)
        
        except requests.exceptions.RequestException as e:
            print(f"❌ Erreur de connexion: {str(e)}")
            time.sleep(5)
    
    print("❌ Échec après plusieurs tentatives")
    return None

# Utilisation
result = search_tenders_with_retry("notice-type = cn-standard")
```

---

## Limite de Débit (Rate Limiting)

### Limites Officielles

| Opération | Limite |
|-----------|--------|
| Visualiser/télécharger depuis une IP | 600 opérations en < 6 minutes |
| Requêtes HTTP globales | 700 requêtes par minute |
| Téléchargements packages (HTTPS) | 3 téléchargements simultanés |

### Gestion du Rate Limiting

**L'API Search n'a pas de limite stricte**, mais respectez les bonnes pratiques:

1. **Espacez vos requêtes**
   ```python
   import time
   
   for i in range(10):
       # Requête
       requests.post(url, json=payload)
       # Pause entre requêtes
       time.sleep(1)
   ```

2. **Utilisez la pagination**
   ```python
   # Plutôt que 10 requêtes de 10 résultats
   # Faire 1 requête de 100 résultats
   payload = {"limit": 100}
   ```

3. **Mettez en cache les résultats**
   ```python
   import cache
   
   @cache.cache_result(ttl=3600)  # Cache 1 heure
   def get_tenders():
       return requests.post(url, json=payload).json()
   ```

4. **Respectez les en-têtes de réponse**
   ```python
   rate_limit = response.headers.get('X-RateLimit-Limit')
   remaining = response.headers.get('X-RateLimit-Remaining')
   reset_time = response.headers.get('X-RateLimit-Reset')
   ```

---

## Bonnes Pratiques

### 1. Architecture de Votre Intégration

```
┌──────────────────────────────────────┐
│         Votre Application Web         │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│    Module de Synchronisation TED     │
│  - Récupère appels d'offres          │
│  - Gestion erreurs & retry           │
│  - Mise en cache                     │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│     Base de Données Locale           │
│  - Stockage des appels d'offres      │
│  - Historique                        │
│  - Indexation rapide                 │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│         API TED (api.ted.europa.eu)  │
└──────────────────────────────────────┘
```

### 2. Synchronisation Récurrente

```python
import schedule
import requests
from datetime import datetime

def sync_tenders_daily():
    """Synchronise les appels d'offres chaque jour"""
    
    query = "notice-type = cn-standard AND publication-date >= 20241211"
    payload = {
        "query": query,
        "fields": ["notice-id", "notice-title", "deadline-for-submission"],
        "scope": "ACTIVE",
        "limit": 100
    }
    
    response = requests.post(
        "https://api.ted.europa.eu/v3/search",
        json=payload
    )
    
    if response.status_code == 200:
        # Stocker en BD
        save_to_database(response.json())
        print(f"✓ Synchronisation réussie à {datetime.now()}")

# Planifier la synchronisation
schedule.every().day.at("02:00").do(sync_tenders_daily)

while True:
    schedule.run_pending()
    time.sleep(60)
```

### 3. Filtrage Côté Client

```python
def filter_relevant_tenders(all_tenders, filters):
    """Filtre les appels d'offres selon les critères"""
    
    filtered = all_tenders
    
    # Filtre par pays
    if 'countries' in filters:
        filtered = [t for t in filtered 
                   if t['buyer-country'] in filters['countries']]
    
    # Filtre par secteur (CPV)
    if 'cpv_codes' in filters:
        filtered = [t for t in filtered 
                   if t['classification-cpv'].startswith(tuple(filters['cpv_codes']))]
    
    # Filtre par valeur
    if 'min_value' in filters:
        filtered = [t for t in filtered 
                   if float(t['estimated-value']) >= filters['min_value']]
    
    # Filtre par deadline
    if 'days_until_deadline' in filters:
        from datetime import datetime, timedelta
        deadline = datetime.now() + timedelta(days=filters['days_until_deadline'])
        filtered = [t for t in filtered 
                   if datetime.strptime(t['deadline-for-submission'], '%Y%m%d') <= deadline]
    
    return filtered

# Utilisation
filters = {
    'countries': ['FRA', 'DEU', 'ITA'],
    'cpv_codes': ['30', '71'],
    'min_value': 100000,
    'days_until_deadline': 30
}

relevant = filter_relevant_tenders(all_tenders, filters)
```

### 4. Validation des Données

```python
def validate_notice(notice):
    """Valide les données d'une notice"""
    
    required_fields = [
        'notice-id', 'notice-title', 'buyer-name',
        'deadline-for-submission', 'notice-url'
    ]
    
    # Vérifier champs obligatoires
    for field in required_fields:
        if field not in notice or not notice[field]:
            return False, f"Champ manquant: {field}"
    
    # Vérifier format de la date
    try:
        datetime.strptime(notice['deadline-for-submission'], '%Y%m%d')
    except:
        return False, "Date invalide"
    
    # Vérifier valeur numérique
    if notice.get('estimated-value'):
        try:
            float(notice['estimated-value'])
        except:
            return False, "Valeur invalide"
    
    return True, "OK"

# Utilisation
for notice in notices:
    is_valid, message = validate_notice(notice)
    if not is_valid:
        print(f"⚠️  Notice invalide: {message}")
```

### 5. Documentation du Développeur

Quand vous communiquez avec Claude Code:

```python
"""
INTÉGRATION API TED - Requête de Développement

OBJECTIF:
Intégrer l'API TED pour afficher les appels d'offres actifs en France
dans notre portail e-procurement.

ENDPOINT:
POST https://api.ted.europa.eu/v3/search

REQUÊTE MODÈLE:
{
    "query": "notice-type IN (cn-standard cn-social) AND buyer-country = FRA",
    "fields": ["notice-id", "notice-title", "buyer-name", "deadline-for-submission"],
    "scope": "ACTIVE",
    "limit": 50
}

RÉPONSE ATTENDUE:
{
    "total": 1250,
    "page": 1,
    "notices": [
        {
            "notice-id": "ID",
            "notice-title": "Titre",
            "buyer-name": "Acheteur",
            "deadline-for-submission": "YYYYMMDD"
        }
    ]
}

CONTRAINTES:
- Pas d'authentification requise (API Search)
- Gestion des limites de débit
- Mise en cache recommandée (au moins 1h)
- Synchronisation quotidienne minimale

EXEMPLE DE CODE À DÉVELOPPER:
- Classe TED API Client
- Gestion pagination et retry
- Stockage en BD
- Affichage web des résultats
"""
```

---

## Ressources Additionnelles

### Documentation Officielle

- **TED Developer Docs**: https://docs.ted.europa.eu
- **API Swagger**: https://api.ted.europa.eu/swagger
- **TED Search Help**: https://ted.europa.eu/en/help/search-browse
- **Developers Corner**: https://ted.europa.eu/en/simap/developers-corner-for-reusers

### Outils Utiles

- **Postman Collection**: Import depuis Swagger
- **cURL Testing**:
  ```bash
  curl -X POST "https://api.ted.europa.eu/v3/search" \
    -H "Content-Type: application/json" \
    -d '{
      "query": "notice-type = cn-standard",
      "fields": ["notice-id", "notice-title"],
      "scope": "ACTIVE",
      "limit": 10
    }'
  ```

### Gestion des Codes et Nomenclatures

- **CPV Codes**: https://simap.ted.europa.eu/web/simap/cpv (Classification des Marchés Publics)
- **NUTS Codes**: Pour les lieux d'exécution
- **Codes Pays**: FRA, DEU, ITA, etc.
- **Codes Devises**: EUR, GBP, CHF, etc.

### Communauté

- **GitHub Issues**: https://github.com/OP-TED/eForms-SDK/discussions
- **TED Support**: https://ted.europa.eu/en/contact
- **Workshops**: https://op.europa.eu/en/web/ted-eforms

---

## Résumé Exécutif pour Claude Code

**Vous avez besoin de:**

1. ✅ **Classe TED API Client**
   - Méthode `search(query, fields, scope, limit, page)`
   - Gestion des erreurs et retry automatique
   - Cache en mémoire (Redis optionnel)

2. ✅ **Modèle de Données**
   - Notice avec champs: id, titre, acheteur, valeur, deadline, URL
   - Validation des données

3. ✅ **Intégration Web**
   - Endpoint `/api/tenders` retournant les notices actives filtrées
   - Paramètres de filtrage (pays, secteur, valeur, deadline)
   - Pagination

4. ✅ **Synchronisation Récurrente**
   - Tâche planifiée pour mettre à jour quotidiennement
   - Stockage en BD
   - Notification pour nouvelles notices

**API Key**: Pas nécessaire pour la recherche des notices publiées

**Rate Limiting**: Respectez les bonnes pratiques (cache, pagination, délai entre requêtes)

**Format**: JSON avec requête expert au format TED

---

**Document généré**: 11 décembre 2024
**Version API**: TED API v3
**Statut**: Production Ready
