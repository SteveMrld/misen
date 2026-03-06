import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_SECRET = 'MISEN-MIGRATE-2026';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const results: string[] = [];

  if (!supabaseUrl) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_SUPABASE_URL manquante' }, { status: 500 });
  }

  // If no service role key, try to get it from Management API
  let finalKey = serviceRoleKey;
  if (!finalKey) {
    const sbToken = request.nextUrl.searchParams.get('sbt');
    const ref = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
    if (sbToken) {
      try {
        const kr = await fetch(`https://api.supabase.com/v1/projects/${ref}/api-keys`, {
          headers: { 'Authorization': `Bearer ${sbToken}` }
        });
        if (kr.ok) {
          const keys = await kr.json();
          const srk = keys.find((k: any) => k.name === 'service_role');
          if (srk) {
            finalKey = srk.api_key;
            results.push('Service role key récupérée via Management API');
          }
        }
      } catch (e) {
        results.push('Impossible de récupérer la service_role key');
      }
    }
    if (!finalKey) {
      return NextResponse.json({
        error: 'SUPABASE_SERVICE_ROLE_KEY manquante. Ajoute sbt= param ou configure la variable Vercel.',
        results
      }, { status: 500 });
    }
  }

  const supabase = createClient(supabaseUrl, finalKey);

  try {
    // Check if table exists
    const { error: checkErr } = await supabase.from('invitations').select('code').limit(1);

    if (checkErr && checkErr.message.includes('does not exist')) {
      results.push('Table invitations n\'existe pas — création nécessaire via SQL Editor');
      return NextResponse.json({
        status: 'NEEDS_SQL',
        results,
        message: 'La table doit être créée manuellement dans le SQL Editor Supabase.',
        sql_url: `https://supabase.com/dashboard/project/${supabaseUrl.replace('https://', '').replace('.supabase.co', '')}/sql/new`,
      });
    }

    results.push('Table invitations existe ✓');

    // Insert founder codes
    const { error: e2 } = await supabase.from('invitations').upsert({
      code: 'MISEN-FOUNDER-2026', name: 'Steve Moradel', role: 'founder',
      welcome_message: 'Bienvenue chez vous, Steve. MISEN est votre vision.', max_uses: 999, uses: 0,
    }, { onConflict: 'code' });
    results.push(e2 ? 'Erreur fondateur: ' + e2.message : 'Code MISEN-FOUNDER-2026 (Steve) ✓');

    const { error: e3 } = await supabase.from('invitations').upsert({
      code: 'MISEN-STEPHANE-2026', name: 'Stéphane Juffe', role: 'cofounder',
      welcome_message: 'Bienvenue Stéphane. Cofondateur de MISEN.', max_uses: 1, uses: 0,
    }, { onConflict: 'code' });
    results.push(e3 ? 'Erreur Stéphane: ' + e3.message : 'Code MISEN-STEPHANE-2026 (Stéphane) ✓');

    const { data: codes } = await supabase.from('invitations').select('code, name, role, max_uses, uses').order('created_at');

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
