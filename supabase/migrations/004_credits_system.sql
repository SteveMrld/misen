-- ============================================
-- MISEN — Credits System Migration
-- Run in Supabase SQL Editor
-- ============================================

-- 1. User credits balance
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_purchased INTEGER NOT NULL DEFAULT 0,
  lifetime_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own credits" ON user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own credits" ON user_credits FOR UPDATE USING (auth.uid() = user_id);

-- 2. Credit transactions log
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive = credit, negative = debit
  type TEXT NOT NULL CHECK (type IN ('purchase', 'generation', 'refund', 'bonus', 'subscription')),
  description TEXT,
  stripe_session_id TEXT,
  reference_id UUID, -- links to generation id
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own transactions" ON credit_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_credit_transactions_user ON credit_transactions(user_id, created_at DESC);

-- 3. Generations table (if not exists)
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shot_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  duration NUMERIC NOT NULL DEFAULT 5,
  aspect_ratio TEXT NOT NULL DEFAULT '16:9',
  reference_image_url TEXT,
  reference_video_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  provider_job_id TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  credits_used INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own generations" ON generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own generations" ON generations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own generations" ON generations FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_generations_project ON generations(project_id, created_at DESC);
CREATE INDEX idx_generations_user ON generations(user_id, created_at DESC);

-- 4. Deduct credits function (atomic)
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reference_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT 'Video generation'
) RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Lock the row
  SELECT balance INTO current_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check balance
  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct
  UPDATE user_credits
  SET balance = balance - p_amount,
      lifetime_used = lifetime_used + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO credit_transactions (user_id, amount, type, description, reference_id)
  VALUES (p_user_id, -p_amount, 'generation', p_description, p_reference_id);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add credits function (for purchases)
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT DEFAULT 'purchase',
  p_description TEXT DEFAULT 'Credit purchase',
  p_stripe_session_id TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  -- Upsert user_credits
  INSERT INTO user_credits (user_id, balance, lifetime_purchased)
  VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = user_credits.balance + p_amount,
    lifetime_purchased = user_credits.lifetime_purchased + p_amount,
    updated_at = NOW();

  -- Get new balance
  SELECT balance INTO new_balance FROM user_credits WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO credit_transactions (user_id, amount, type, description, stripe_session_id)
  VALUES (p_user_id, p_amount, p_type, p_description, p_stripe_session_id);

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
