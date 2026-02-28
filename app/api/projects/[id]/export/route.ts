import { NextRequest, NextResponse } from 'next/server';
import { getProject } from '@/lib/db/projects';
import { generateExport } from '@/lib/engines/export';
import { exportPDF } from '@/lib/engines/export-pdf';
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

    // PDF is special — returns binary Buffer
    if (format === 'pdf') {
      const safeName = (project.name || 'MISEN_Export').replace(/[^a-zA-Z0-9-_àâéèêëïîôùûç ]/gi, '').replace(/\s+/g, '_');
      const pdfBuffer = await exportPDF({
        projectName: project.name || 'MISEN Export',
        scriptText: project.script_text || '',
        analysis,
      });
      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${safeName}_bible.pdf"`,
        },
      });
    }

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
