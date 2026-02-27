import { NextRequest, NextResponse } from 'next/server';
import { searchMedia, suggestMediaQueries } from '@/lib/engines/media-bank';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = (searchParams.get('type') || 'all') as 'image' | 'video' | 'all';

    if (!query) {
      // Si pas de query, retourne les suggestions basées sur l'analyse
      const { data: analyses } = await supabase
        .from('analyses')
        .select('result')
        .eq('project_id', params.id)
        .order('version', { ascending: false })
        .limit(1);

      const scenes = analyses?.[0]?.result?.scenes || [];
      const suggestions = suggestMediaQueries(scenes);
      return NextResponse.json({ suggestions, items: [] });
    }

    // Récupère les clés API pour Pexels/Pixabay
    const { data: keys } = await supabase
      .from('api_keys')
      .select('provider, api_key')
      .eq('user_id', user.id)
      .in('provider', ['pexels', 'pixabay']);

    const apiKeys: Record<string, string> = {};
    (keys || []).forEach((k: any) => { apiKeys[k.provider] = k.api_key; });

    const result = await searchMedia(query, type, apiKeys);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
