-- ============================================================================
-- MISEN V8 — Database Migration : Session 1
-- Tables : generations, user_credits, credit_transactions
-- RPC : deduct_credits, refund_credits
-- RLS : Row Level Security policies
-- © 2026 Jabrilia Éditions — Confidentiel
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. GENERATIONS TABLE
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS generations (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shot_id         TEXT NOT NULL,

  -- Provider info
  provider        TEXT NOT NULL CHECK (provider IN (
    'kling', 'runway', 'sora', 'veo', 'seedance', 'wan', 'hailuo'
  )),
  model           TEXT NOT NULL,
  provider_job_id TEXT,

  -- Prompt data
  prompt          TEXT NOT NULL,
  negative_prompt TEXT,
  duration        INTEGER NOT NULL DEFAULT 10,
  aspect_ratio    TEXT NOT NULL DEFAULT '16:9' CHECK (aspect_ratio IN (
    '16:9', '9:16', '1:1', '4:3', '3:4'
  )),

  -- References
  reference_image_url TEXT,
  reference_video_url TEXT,

  -- Status & results
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'cancelled'
  )),
  result_url      TEXT,
  thumbnail_url   TEXT,
  error_message   TEXT,

  -- Credits
  credits_used    INTEGER NOT NULL DEFAULT 0,

  -- Metadata (style, seed, providerOptions, estimatedDuration)
  metadata        JSONB,

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_project_id ON generations(project_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_provider_job ON generations(provider, provider_job_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_generations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generations_updated_at
  BEFORE UPDATE ON generations
  FOR EACH ROW
  EXECUTE FUNCTION update_generations_updated_at();

-- RLS
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generations"
  ON generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
  ON generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations"
  ON generations FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role bypass (for API routes)
CREATE POLICY "Service role full access to generations"
  ON generations FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ---------------------------------------------------------------------------
-- 2. USER CREDITS TABLE
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_credits (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance     INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime    INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_credits_user ON user_credits(user_id);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. CREDIT TRANSACTIONS TABLE
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS credit_transactions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount          INTEGER NOT NULL, -- negative for deductions, positive for refunds/purchases
  balance_after   INTEGER NOT NULL,
  type            TEXT NOT NULL CHECK (type IN (
    'purchase', 'deduction', 'refund', 'bonus', 'subscription'
  )),
  reference_id    UUID,          -- links to generation, stripe payment, etc.
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_tx_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_tx_created ON credit_transactions(created_at DESC);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4. RPC: DEDUCT CREDITS (atomic)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id       UUID,
  p_amount        INTEGER,
  p_reference_id  UUID DEFAULT NULL,
  p_description   TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Atomic balance update
  UPDATE user_credits
  SET balance = balance - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND balance >= p_amount
  RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, balance_after, type, reference_id, description)
  VALUES (p_user_id, -p_amount, v_new_balance, 'deduction', p_reference_id, p_description);

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 5. RPC: REFUND CREDITS (atomic)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION refund_credits(
  p_user_id       UUID,
  p_amount        INTEGER,
  p_reference_id  UUID DEFAULT NULL,
  p_description   TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE user_credits
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN
    -- Create record if doesn't exist
    INSERT INTO user_credits (user_id, balance)
    VALUES (p_user_id, p_amount)
    RETURNING balance INTO v_new_balance;
  END IF;

  INSERT INTO credit_transactions (user_id, amount, balance_after, type, reference_id, description)
  VALUES (p_user_id, p_amount, v_new_balance, 'refund', p_reference_id, p_description);

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 6. RPC: ADD CREDITS (for purchases / subscriptions)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION add_credits(
  p_user_id       UUID,
  p_amount        INTEGER,
  p_type          TEXT DEFAULT 'purchase',
  p_reference_id  UUID DEFAULT NULL,
  p_description   TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  INSERT INTO user_credits (user_id, balance, lifetime)
  VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = user_credits.balance + p_amount,
    lifetime = user_credits.lifetime + p_amount,
    updated_at = NOW()
  RETURNING balance INTO v_new_balance;

  INSERT INTO credit_transactions (user_id, amount, balance_after, type, reference_id, description)
  VALUES (p_user_id, p_amount, v_new_balance, p_type, p_reference_id, p_description);

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 7. Initialize credits for new users (trigger on auth.users)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, balance, lifetime)
  VALUES (NEW.id, 50, 50)  -- 50 free credits on signup
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_initialize_credits'
  ) THEN
    CREATE TRIGGER trg_initialize_credits
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION initialize_user_credits();
  END IF;
END;
$$;
