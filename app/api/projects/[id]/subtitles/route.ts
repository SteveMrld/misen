import { NextRequest, NextResponse } from 'next/server';
import { getProject } from '@/lib/db/projects';
import { generateSubtitles, generateVTT } from '@/lib/engines/subtitle';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const project = await getProject(params.id);
    if (!project) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });

    // Récupère la dernière analyse
    const { data: analyses } = await supabase
      .from('analyses')
      .select('result')
      .eq('project_id', params.id)
      .order('version', { ascending: false })
      .limit(1);

    if (!analyses?.length || !analyses[0].result) {
      return NextResponse.json({ error: 'Aucune analyse disponible' }, { status: 400 });
    }

    const result = analyses[0].result as any;
    const plans = result.plans || [];
    const scenes = result.scenes || [];

    const subtitles = generateSubtitles(plans, scenes);

    const format = request.nextUrl.searchParams.get('format') || 'srt';

    if (format === 'vtt') {
      const vtt = generateVTT(subtitles);
      return new NextResponse(vtt, {
        headers: {
          'Content-Type': 'text/vtt',
          'Content-Disposition': `attachment; filename="${project.name || 'subtitles'}.vtt"`,
        },
      });
    }

    if (format === 'json') {
      return NextResponse.json(subtitles);
    }

    // SRT par défaut
    return new NextResponse(subtitles.srt, {
      headers: {
        'Content-Type': 'application/x-subrip',
        'Content-Disposition': `attachment; filename="${project.name || 'subtitles'}.srt"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
