import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Founder emails that can create invitations
const ADMIN_EMAILS = [
  'steve@stevemoradel.com',
  'contact@stevemoradel.com',
  'steve.moradel@gmail.com',
  'stevemoradel@gmail.com',
];

function generateCode(prefix: string = 'MISEN'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${code}`;
}

// POST /api/invite — Create a new invitation (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Accès réservé aux fondateurs' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, role, welcome_message, max_uses, expires_days } = body;

    const code = generateCode();
    const expires_at = expires_days
      ? new Date(Date.now() + expires_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data: invite, error } = await supabase
      .from('invitations')
      .insert({
        code,
        name: name || null,
        email: email || null,
        role: role || 'beta_tester',
        welcome_message: welcome_message || null,
        max_uses: max_uses || 1,
        expires_at,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const inviteUrl = `${request.nextUrl.origin}/invite/${code}`;

    return NextResponse.json({
      code,
      url: inviteUrl,
      invite,
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/invite — List all invitations (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Accès réservé aux fondateurs' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      invitations: (data || []).map(inv => ({
        ...inv,
        url: `${request.nextUrl.origin}/invite/${inv.code}`,
      })),
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
