-- MISEN V14.4 — Model Intelligence Tables
-- Stores MCAP scores and intelligence scan reports

CREATE TABLE IF NOT EXISTS model_registry (
  model_id TEXT PRIMARY KEY,
  model_name TEXT NOT NULL,
  version TEXT NOT NULL,
  provider TEXT NOT NULL,
  scores JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS intelligence_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report JSONB NOT NULL,
  updated_models JSONB,
  raw_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE model_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_reports ENABLE ROW LEVEL SECURITY;

-- Anyone can read model registry (public data)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='model_registry' AND policyname='Public read model registry') THEN
    CREATE POLICY "Public read model registry" ON model_registry FOR SELECT USING (true);
  END IF;
END $$;

-- Only service role can write
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='intelligence_reports' AND policyname='Service role only intelligence reports') THEN
    CREATE POLICY "Service role only intelligence reports" ON intelligence_reports FOR ALL USING (false);
  END IF;
END $$;

-- Index
CREATE INDEX IF NOT EXISTS idx_model_registry_active ON model_registry(is_active);
CREATE INDEX IF NOT EXISTS idx_intelligence_reports_date ON intelligence_reports(created_at DESC);
