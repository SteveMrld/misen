import { NextRequest, NextResponse } from 'next/server';
import { getProject, updateProject, saveAnalysis } from '@/lib/db/projects';
import { runPipeline } from '@/lib/engines/pipeline';
import { evaluateProject } from '@/lib/test/expert-panel';

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
    const genre = body.genre || 'court_metrage';

    // Lance le pipeline des 17 moteurs
    const result = runPipeline(project.script_text, { stylePreset });

    // ── QA Expert Panel ──
    let qaReport: any = null;
    try {
      const panelResult = evaluateProject(
        { ...result, id: params.id, title: project.name || 'Untitled' },
        project.script_text,
        genre
      );
      qaReport = {
        score: panelResult.consensusScore,
        grade: panelResult.consensusGrade,
        readyForProduction: panelResult.readyForProduction,
        keyInsights: panelResult.keyInsights.slice(0, 3),
        criticalIssues: panelResult.criticalIssues.slice(0, 3),
        experts: panelResult.evaluations.map(e => ({
          id: e.expertId,
          name: e.expertName,
          score: e.overallScore,
          grade: e.grade,
          verdict: e.verdict,
          strengths: e.strengths.slice(0, 2),
          weaknesses: e.weaknesses.slice(0, 1),
        }))
      };
    } catch { /* QA non bloquant */ }

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
      qaReport,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
