import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Secret token to protect this route
const ADMIN_SECRET = 'MISEN-MIGRATE-2026';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY manquante dans les env vars' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const results: string[] = [];

  try {
    // 1. Create invitations table
    const { error: e1 } = await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS invitations (
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
      )`
    });

    // If RPC doesn't exist, try direct SQL via REST
    if (e1) {
      // Try creating table via direct insert test — if table exists, we're good
      const { error: checkErr } = await supabase
        .from('invitations')
        .select('code')
        .limit(1);

      if (checkErr && checkErr.message.includes('does not exist')) {
        return NextResponse.json({
          error: 'Table invitations n\'existe pas et ne peut pas être créée via l\'API. Exécute le SQL manuellement.',
          sql_url: 'https://supabase.com/dashboard/project/izazbvwrpjxtuwctprey/sql/new',
          status: 'needs_manual_sql'
        }, { status: 500 });
      }
      
      results.push('Table invitations existe déjà ✓');
    } else {
      results.push('Table invitations créée ✓');
    }

    // 2. Insert founder code
    const { error: e2 } = await supabase
      .from('invitations')
      .upsert({
        code: 'MISEN-FOUNDER-2026',
        name: 'Steve Moradel',
        role: 'founder',
        welcome_message: 'Bienvenue chez vous, Steve. MISEN est votre vision.',
        max_uses: 999,
        uses: 0,
      }, { onConflict: 'code' });

    if (e2) {
      results.push('Erreur code fondateur: ' + e2.message);
    } else {
      results.push('Code MISEN-FOUNDER-2026 (Steve) ✓');
    }

    // 3. Insert co-founder code
    const { error: e3 } = await supabase
      .from('invitations')
      .upsert({
        code: 'MISEN-STEPHANE-2026',
        name: 'Stéphane Juffe',
        role: 'cofounder',
        welcome_message: 'Bienvenue Stéphane. En tant que cofondateur de MISEN, tu es ici chez toi.',
        max_uses: 1,
        uses: 0,
      }, { onConflict: 'code' });

    if (e3) {
      results.push('Erreur code Stéphane: ' + e3.message);
    } else {
      results.push('Code MISEN-STEPHANE-2026 (Stéphane) ✓');
    }

    // 4. Check all codes
    const { data: codes } = await supabase
      .from('invitations')
      .select('code, name, role, max_uses, uses')
      .order('created_at');

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
