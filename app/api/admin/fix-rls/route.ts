import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SECRET = 'MISEN-MIGRATE-2026';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== ADMIN_SECRET) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const sbt = request.nextUrl.searchParams.get('sbt') || '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const ref = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

  if (!sbt || !ref) return NextResponse.json({ error: 'Params manquants' }, { status: 400 });

  const SQL = `
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='invitations' AND policyname='Anyone can read invitations by code') THEN
        CREATE POLICY "Anyone can read invitations by code" ON invitations FOR SELECT USING (true);
      END IF;
    END $$;
  `;

  try {
    const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${sbt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: SQL }),
    });

    if (r.ok) {
      return NextResponse.json({ status: 'OK', message: 'Policy RLS corrigée — les invitations sont maintenant lisibles.' });
    } else {
      const err = await r.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
