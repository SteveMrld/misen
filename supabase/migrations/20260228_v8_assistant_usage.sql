-- ============================================================================
-- MISEN V8 — Assistant Scénariste : table de suivi des requêtes
-- ============================================================================

CREATE TABLE IF NOT EXISTS assistant_usage (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL CHECK (provider IN ('claude', 'openai')),
  used_server_key BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Index pour les requêtes de quota (user + mois courant)
CREATE INDEX IF NOT EXISTS idx_assistant_usage_user_month
  ON assistant_usage(user_id, created_at DESC);

-- Index pour le cap global (server_key + mois courant)
CREATE INDEX IF NOT EXISTS idx_assistant_usage_global_month
  ON assistant_usage(used_server_key, created_at DESC)
  WHERE used_server_key = true;

-- RLS
ALTER TABLE assistant_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assistant usage"
  ON assistant_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assistant usage"
  ON assistant_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);
