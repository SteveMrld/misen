import { NextRequest, NextResponse } from 'next/server';
import { getProject, updateProject, saveAnalysis } from '@/lib/db/projects';
import { runPipeline } from '@/lib/engines/pipeline';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await getProject(params.id);
    if (!project) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
    }

    if (!project.script_text || project.script_text.trim().length === 0) {
      return NextResponse.json({ error: 'Aucun script à analyser' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const stylePreset = body.style_preset || 'cinematique';

    // Lance le pipeline des 13 moteurs
    const result = runPipeline(project.script_text, { stylePreset });

    // Sauvegarde l'analyse (auto-versionning)
    const analysis = await saveAnalysis(params.id, result, stylePreset);

    // Met à jour le statut du projet
    await updateProject(params.id, {
      status: 'analyzing',
      scenes_count: result.scenes?.length || 0,
    });

    return NextResponse.json({
      analysis_id: analysis.id,
      version: analysis.version,
      result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
