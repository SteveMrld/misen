import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_SECRET = 'MISEN-MIGRATE-2026';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const sbt = request.nextUrl.searchParams.get('sbt') || '';
  const ref = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  const results: string[] = [];

  if (!supabaseUrl || !sbt) {
    return NextResponse.json({ error: 'Paramètres manquants (supabaseUrl ou sbt)' }, { status: 400 });
  }

  try {
    // Step 1: Get service_role key
    const kr = await fetch(`https://api.supabase.com/v1/projects/${ref}/api-keys`, {
      headers: { 'Authorization': `Bearer ${sbt}` }
    });
    if (!kr.ok) throw new Error('Cannot fetch API keys: ' + kr.status);
    const keys = await kr.json();
    const srk = keys.find((k: any) => k.name === 'service_role');
    if (!srk) throw new Error('service_role key not found');
    results.push('Service role key récupérée ✓');

    // Step 2: Create table via Management API SQL endpoint
    const createSQL = `
      CREATE TABLE IF NOT EXISTS invitations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT UNIQUE NOT NULL,
        email TEXT,
        name TEXT,
        role TEXT NOT NULL DEFAULT 'beta_tester' CHECK (role IN ('founder', 'cofounder', 'beta_tester', 'studio', 'press')),
        welcome_message TEXT,
        used_by UUID REFERENCES auth.users(id),
        used_at TIMESTAMPTZ,
        max_uses INTEGER NOT NULL DEFAULT 1,
        uses INTEGER NOT NULL DEFAULT 0,
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='invitations' AND policyname='Users can read used invitations') THEN
          CREATE POLICY "Users can read used invitations" ON invitations FOR SELECT USING (used_by = auth.uid());
        END IF;
      END $$;
      CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitations(code);
    `;

    const sqlR = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${sbt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: createSQL }),
    });

    if (sqlR.ok) {
      results.push('Table invitations créée ✓');
      results.push('RLS + policies activées ✓');
    } else {
      const sqlErr = await sqlR.text();
      results.push('SQL warning: ' + sqlErr);
    }

    // Step 3: Insert codes via Management API SQL
    const insertSQL = `
      INSERT INTO invitations (code, name, role, welcome_message, max_uses)
      VALUES ('MISEN-FOUNDER-2026', 'Steve Moradel', 'founder', 'Bienvenue chez vous, Steve. MISEN est votre vision.', 999)
      ON CONFLICT (code) DO NOTHING;

      INSERT INTO invitations (code, name, role, welcome_message, max_uses)
      VALUES ('MISEN-STEPHANE-2026', 'Stéphane Juffe', 'cofounder', 'Bienvenue Stéphane. Cofondateur de MISEN.', 1)
      ON CONFLICT (code) DO NOTHING;
    `;

    const insR = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${sbt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: insertSQL }),
    });

    if (insR.ok) {
      results.push('Code MISEN-FOUNDER-2026 (Steve) ✓');
      results.push('Code MISEN-STEPHANE-2026 (Stéphane) ✓');
    } else {
      const insErr = await insR.text();
      results.push('Insert warning: ' + insErr);
    }

    // Step 4: Verify via PostgREST
    // Need to wait a moment for schema cache to refresh
    await new Promise(r => setTimeout(r, 2000));

    const supabase = createClient(supabaseUrl, srk.api_key);
    const { data: codes, error: listErr } = await supabase
      .from('invitations')
      .select('code, name, role, max_uses, uses')
      .order('created_at');

    if (listErr) {
      results.push('Vérification: schema cache pas encore à jour — les codes sont créés, rafraîchis dans 1 min');
    } else {
      results.push(`Vérification: ${(codes || []).length} invitation(s) trouvée(s) ✓`);
    }

    return NextResponse.json({
      status: 'OK',
      results,
      codes: codes || [],
      links: {
        steve: 'https://misen-ten.vercel.app/invite/MISEN-FOUNDER-2026',
        stephane: 'https://misen-ten.vercel.app/invite/MISEN-STEPHANE-2026',
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message, results }, { status: 500 });
  }
}
