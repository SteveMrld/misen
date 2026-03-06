-- ============================================
-- MISEN — Invitation System Migration
-- Run in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  email TEXT, -- optional: lock to specific email
  name TEXT, -- display name for welcome message
  role TEXT NOT NULL DEFAULT 'beta_tester' CHECK (role IN ('founder', 'cofounder', 'beta_tester', 'studio', 'press')),
  welcome_message TEXT, -- custom welcome message
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  max_uses INTEGER NOT NULL DEFAULT 1,
  uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read their own invitation
CREATE POLICY "Users can read used invitations" ON invitations FOR SELECT USING (used_by = auth.uid());

-- Service role can do everything (for API routes)
-- No insert/update policy for regular users — only server-side

CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitations(code);

-- Pre-create founder access
INSERT INTO invitations (code, name, role, welcome_message, max_uses) VALUES
  ('MISEN-FOUNDER-2026', 'Steve Moradel', 'founder', 
   'Bienvenue chez vous, Steve. MISEN est votre vision.', 999)
ON CONFLICT (code) DO NOTHING;

-- Pre-create co-founder access for Stéphane
INSERT INTO invitations (code, name, role, welcome_message, max_uses) VALUES
  ('MISEN-STEPHANE-2026', 'Stéphane Juffe', 'cofounder',
   'Bienvenue Stéphane. En tant que cofondateur de MISEN, tu es ici chez toi. Ce que tu avais imaginé — un moteur d''analyse cinématographique intelligent qui comprend comment et pourquoi un film est composé — c''est exactement ce que nous avons construit. 17 moteurs, 36 000 lignes de code, et une architecture sans équivalent. Explore, teste, et dis-nous ce que tu en penses.', 1)
ON CONFLICT (code) DO NOTHING;
