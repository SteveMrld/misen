import { NextRequest, NextResponse } from 'next/server';
import { getApiKeys, saveApiKey, deleteApiKey } from '@/lib/db/api-keys';

export async function GET() {
  try {
    const keys = await getApiKeys();
    return NextResponse.json(keys);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { provider, api_key } = await request.json();
    if (!provider || !api_key) {
      return NextResponse.json({ error: 'Provider et clé requis' }, { status: 400 });
    }
    await saveApiKey(provider, api_key.trim());
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { provider } = await request.json();
    if (!provider) {
      return NextResponse.json({ error: 'Provider requis' }, { status: 400 });
    }
    await deleteApiKey(provider);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
