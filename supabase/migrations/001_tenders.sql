-- Migration: 001_tenders.sql
-- Creates tables for public tenders monitoring module

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: public_tenders
CREATE TABLE public_tenders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    organism TEXT NOT NULL,
    organism_unit TEXT,
    tender_type TEXT CHECK (tender_type IN ('licitacion_publica', 'contratacion_directa', 'concurso', 'subasta')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'awarded', 'cancelled')),
    amount DECIMAL,
    currency TEXT DEFAULT 'ARS',
    publication_date TIMESTAMPTZ,
    deadline TIMESTAMPTZ,
    opening_date TIMESTAMPTZ,
    url TEXT NOT NULL,
    category TEXT,
    keywords_matched TEXT[],
    raw_data JSONB,
    briefing_text TEXT,
    briefing_generated_at TIMESTAMPTZ,
    relevance_score DECIMAL DEFAULT 0 CHECK (relevance_score >= 0 AND relevance_score <= 1),
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for public_tenders
CREATE INDEX idx_public_tenders_deadline ON public_tenders (deadline);
CREATE INDEX idx_public_tenders_status ON public_tenders (status);
CREATE INDEX idx_public_tenders_relevance_score ON public_tenders (relevance_score DESC);
CREATE INDEX idx_public_tenders_scraped_at ON public_tenders (scraped_at DESC);
CREATE INDEX idx_public_tenders_external_id ON public_tenders (external_id);

-- Table 2: tender_alerts
CREATE TABLE tender_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    name TEXT NOT NULL,
    keywords TEXT[] NOT NULL,
    excluded_keywords TEXT[],
    min_amount DECIMAL,
    max_amount DECIMAL,
    organisms_filter TEXT[],
    tender_types TEXT[],
    active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for tender_alerts
CREATE INDEX idx_tender_alerts_organization_id ON tender_alerts (organization_id);
CREATE INDEX idx_tender_alerts_active ON tender_alerts (active);

-- Table 3: tender_matches
CREATE TABLE tender_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL REFERENCES public_tenders(id) ON DELETE CASCADE,
    alert_id UUID NOT NULL REFERENCES tender_alerts(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'interested', 'preparing', 'submitted', 'won', 'lost', 'discarded')),
    match_score DECIMAL DEFAULT 0,
    matched_keywords TEXT[],
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tender_id, organization_id)
);

-- Indexes for tender_matches
CREATE INDEX idx_tender_matches_organization_id ON tender_matches (organization_id);
CREATE INDEX idx_tender_matches_status ON tender_matches (status);
CREATE INDEX idx_tender_matches_tender_id ON tender_matches (tender_id);

-- Table 4: scraping_logs
CREATE TABLE scraping_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'success', 'error')),
    tenders_found INTEGER DEFAULT 0,
    tenders_new INTEGER DEFAULT 0,
    tenders_updated INTEGER DEFAULT 0,
    matches_generated INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB
);