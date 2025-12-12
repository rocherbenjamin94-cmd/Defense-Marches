-- =============================================
-- TenderSpotter PostgreSQL Schema
-- Replaces: Redis cache + SQLite databases
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search

-- =============================================
-- TABLE: tender_cache (replaces Redis boamp:tenders)
-- =============================================
CREATE TABLE IF NOT EXISTS tender_cache (
    id VARCHAR(100) PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    buyer_name VARCHAR(500),
    buyer_department VARCHAR(200),
    publication_date TIMESTAMPTZ NOT NULL,
    deadline_date TIMESTAMPTZ,
    procedure_type VARCHAR(100),
    sectors TEXT[],
    urgency_level VARCHAR(50) DEFAULT 'normal',
    boamp_url TEXT,
    score INTEGER DEFAULT 0,
    location VARCHAR(200),
    cpv VARCHAR(50),
    market_nature VARCHAR(100),
    amount_range VARCHAR(100),
    is_joue BOOLEAN DEFAULT FALSE,
    is_defense_equipment BOOLEAN DEFAULT FALSE,
    source VARCHAR(50) NOT NULL,  -- 'BOAMP', 'PLACE', 'TED'
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tender_cache_source ON tender_cache(source);
CREATE INDEX IF NOT EXISTS idx_tender_cache_deadline ON tender_cache(deadline_date);
CREATE INDEX IF NOT EXISTS idx_tender_cache_publication ON tender_cache(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_tender_cache_expires ON tender_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_tender_cache_buyer ON tender_cache(buyer_name);
CREATE INDEX IF NOT EXISTS idx_tender_cache_title_gin ON tender_cache USING gin(title gin_trgm_ops);

-- =============================================
-- TABLE: place_tenders (replaces Redis place:* keys)
-- =============================================
CREATE TABLE IF NOT EXISTS place_tenders (
    id VARCHAR(100) PRIMARY KEY,
    reference VARCHAR(200),
    titre TEXT NOT NULL,
    acheteur VARCHAR(500),
    date_limite TIMESTAMPTZ,
    date_publication TIMESTAMPTZ,
    type_procedure VARCHAR(100),
    procedure VARCHAR(100),
    lieu VARCHAR(200),
    url TEXT,
    source VARCHAR(50) DEFAULT 'PLACE',
    ministry VARCHAR(50),  -- 'MINARM', 'MININT'
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    scraped_date DATE DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_place_ministry ON place_tenders(ministry);
CREATE INDEX IF NOT EXISTS idx_place_scraped ON place_tenders(scraped_date DESC);
CREATE INDEX IF NOT EXISTS idx_place_deadline ON place_tenders(date_limite);

-- =============================================
-- TABLE: ted_tenders (from ted-api-module)
-- =============================================
CREATE TABLE IF NOT EXISTS ted_tenders (
    notice_id VARCHAR(100) PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    buyer_name VARCHAR(500) NOT NULL,
    buyer_country VARCHAR(10) NOT NULL,
    estimated_value DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'EUR',
    deadline TIMESTAMPTZ,
    publication_date TIMESTAMPTZ NOT NULL,
    cpv_codes TEXT[],
    procedure_type VARCHAR(100),
    place_of_performance VARCHAR(100),
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ted_country ON ted_tenders(buyer_country);
CREATE INDEX IF NOT EXISTS idx_ted_deadline ON ted_tenders(deadline);
CREATE INDEX IF NOT EXISTS idx_ted_publication ON ted_tenders(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_ted_cpv ON ted_tenders USING gin(cpv_codes);

-- =============================================
-- TABLE: entreprises (from SQLite entreprises_cache)
-- =============================================
CREATE TABLE IF NOT EXISTS entreprises (
    siret VARCHAR(14) PRIMARY KEY,
    siren VARCHAR(9) NOT NULL,
    nom_entreprise VARCHAR(500) NOT NULL,
    denomination_sociale VARCHAR(500),
    forme_juridique VARCHAR(200),
    adresse_ligne_1 VARCHAR(500),
    code_postal VARCHAR(10),
    ville VARCHAR(200),
    code_naf VARCHAR(10),
    libelle_naf VARCHAR(200),
    effectif VARCHAR(50),
    date_creation DATE,
    capital DECIMAL(15,2),
    numero_rcs VARCHAR(50),
    greffe VARCHAR(100),
    raw_data JSONB,
    source VARCHAR(50) DEFAULT 'pappers',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entreprises_siren ON entreprises(siren);
CREATE INDEX IF NOT EXISTS idx_entreprises_nom_gin ON entreprises USING gin(nom_entreprise gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_entreprises_ville ON entreprises(ville);

-- =============================================
-- TABLE: pappers_searches_cache
-- =============================================
CREATE TABLE IF NOT EXISTS pappers_searches_cache (
    search_query VARCHAR(500) PRIMARY KEY,
    results JSONB NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: document_analyses (from SQLite)
-- =============================================
CREATE TABLE IF NOT EXISTS document_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_hash VARCHAR(64) UNIQUE NOT NULL,
    analysis_result JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_doc_analyses_hash ON document_analyses(document_hash);
CREATE INDEX IF NOT EXISTS idx_doc_analyses_expires ON document_analyses(expires_at);

-- =============================================
-- TABLE: generated_documents
-- =============================================
CREATE TABLE IF NOT EXISTS generated_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL,
    marche_id VARCHAR(100) NOT NULL,
    marche_titre TEXT,
    marche_acheteur VARCHAR(500),
    document_type VARCHAR(50) NOT NULL,  -- 'DC1', 'DC2', 'MEMO', etc.
    file_name VARCHAR(255),
    file_format VARCHAR(20),  -- 'PDF', 'DOCX'
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gen_docs_user ON generated_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_gen_docs_marche ON generated_documents(marche_id);
CREATE INDEX IF NOT EXISTS idx_gen_docs_date ON generated_documents(generated_at DESC);

-- =============================================
-- TABLE: user_quotas
-- =============================================
CREATE TABLE IF NOT EXISTS user_quotas (
    user_id VARCHAR(100) PRIMARY KEY,
    generations_used INTEGER DEFAULT 0,
    quota_reset_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE: search_logs
-- =============================================
CREATE TABLE IF NOT EXISTS search_logs (
    id SERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    query_type VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL,
    resultat_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_logs_date ON search_logs(created_at DESC);

-- =============================================
-- TABLE: cache_metadata (for TTL management)
-- =============================================
CREATE TABLE IF NOT EXISTS cache_metadata (
    cache_key VARCHAR(200) PRIMARY KEY,
    last_updated TIMESTAMPTZ NOT NULL,
    ttl_seconds INTEGER NOT NULL,
    record_count INTEGER DEFAULT 0,
    metadata JSONB
);

-- =============================================
-- FUNCTION: Auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
DROP TRIGGER IF EXISTS update_tender_cache_updated_at ON tender_cache;
CREATE TRIGGER update_tender_cache_updated_at BEFORE UPDATE ON tender_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_place_tenders_updated_at ON place_tenders;
CREATE TRIGGER update_place_tenders_updated_at BEFORE UPDATE ON place_tenders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ted_tenders_updated_at ON ted_tenders;
CREATE TRIGGER update_ted_tenders_updated_at BEFORE UPDATE ON ted_tenders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_entreprises_updated_at ON entreprises;
CREATE TRIGGER update_entreprises_updated_at BEFORE UPDATE ON entreprises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_quotas_updated_at ON user_quotas;
CREATE TRIGGER update_user_quotas_updated_at BEFORE UPDATE ON user_quotas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTION: Cleanup expired cache entries
-- =============================================
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    DELETE FROM tender_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;

    DELETE FROM document_analyses WHERE expires_at < NOW();
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;

    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- =============================================
-- Initial cache metadata
-- =============================================
INSERT INTO cache_metadata (cache_key, last_updated, ttl_seconds, record_count)
VALUES
    ('boamp:tenders', NOW(), 7200, 0),      -- 2 hours
    ('place:minarm', NOW(), 604800, 0),     -- 7 days
    ('place:minint', NOW(), 604800, 0),     -- 7 days
    ('ted:tenders', NOW(), 3600, 0)         -- 1 hour
ON CONFLICT (cache_key) DO NOTHING;

-- =============================================
-- Grant permissions (adjust user as needed)
-- =============================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tenderspotter;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tenderspotter;
