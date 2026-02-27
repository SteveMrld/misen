import { NextRequest, NextResponse } from 'next/server';
import { getProject } from '@/lib/db/projects';
import { generateExport } from '@/lib/engines/export';
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

    const { data: analyses } = await supabase
      .from('analyses')
      .select('result')
      .eq('project_id', params.id)
      .order('version', { ascending: false })
      .limit(1);

    const analysis = analyses?.[0]?.result || {};
    const format = (request.nextUrl.searchParams.get('format') || 'json') as any;

    const result = generateExport({
      projectName: project.name || 'MISEN Export',
      scriptText: project.script_text || '',
      analysis,
      format,
    });

    return new NextResponse(result.content, {
      headers: {
        'Content-Type': result.mimeType,
        'Content-Disposition': `attachment; filename="${result.filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
