import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/invite/validate?code=XXX — Check if invitation is valid
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.json({ valid: false, error: 'Code requis' });

  try {
    const supabase = await createClient();

    const { data: invite, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !invite) {
      return NextResponse.json({ valid: false, error: 'Invitation non trouvée' });
    }

    // Check expiry
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Invitation expirée' });
    }

    // Check uses
    if (invite.uses >= invite.max_uses) {
      return NextResponse.json({ valid: false, error: 'Invitation déjà utilisée' });
    }

    return NextResponse.json({
      valid: true,
      name: invite.name,
      role: invite.role,
      welcome_message: invite.welcome_message,
    });

  } catch (err: any) {
    return NextResponse.json({ valid: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/invite/validate — Mark invitation as used after registration
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { code } = await request.json();
    if (!code) return NextResponse.json({ error: 'Code requis' }, { status: 400 });

    // Update invitation
    const { data: invite } = await supabase
      .from('invitations')
      .select('*')
      .eq('code', code)
      .single();

    if (!invite) return NextResponse.json({ error: 'Invitation non trouvée' }, { status: 404 });

    await supabase
      .from('invitations')
      .update({
        used_by: user.id,
        used_at: new Date().toISOString(),
        uses: (invite.uses || 0) + 1,
      })
      .eq('code', code);

    // Also store the role on the user metadata
    await supabase.auth.updateUser({
      data: { invite_role: invite.role, invite_code: code, invited_name: invite.name }
    });

    return NextResponse.json({ ok: true, role: invite.role });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
