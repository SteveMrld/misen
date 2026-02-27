import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const q = request.nextUrl.searchParams.get('q') || 'cinematic';
    const type = request.nextUrl.searchParams.get('type') || 'image';

    // Use Pexels API key from user's api_keys or env
    const { data: keyData } = await supabase
      .from('api_keys').select('api_key').eq('user_id', user.id).eq('provider', 'pexels').single();

    const apiKey = keyData?.api_key || process.env.PEXELS_API_KEY || '';
    if (!apiKey) return NextResponse.json({ error: 'Clé API Pexels manquante. Ajoutez-la dans Réglages > Clés API.' }, { status: 400 });

    const endpoint = type === 'video'
      ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=8&orientation=landscape`
      : `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=12&orientation=landscape`;

    const res = await fetch(endpoint, { headers: { Authorization: apiKey } });
    if (!res.ok) return NextResponse.json({ error: 'Erreur API Pexels' }, { status: 502 });

    const data = await res.json();

    if (type === 'video') {
      const results = (data.videos || []).map((v: any) => {
        const f = v.video_files?.find((x: any) => x.quality === 'sd') || v.video_files?.[0];
        return { id: v.id, url: f?.link, thumbnail: v.image, duration: v.duration, photographer: v.user?.name };
      });
      return NextResponse.json({ results, type: 'video' });
    }

    const results = (data.photos || []).map((p: any) => ({
      id: p.id, url: p.src?.large, thumbnail: p.src?.small, photographer: p.photographer,
    }));
    return NextResponse.json({ results, type: 'image' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
