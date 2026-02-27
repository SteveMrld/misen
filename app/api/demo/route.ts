import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEMO_SCRIPT, DEMO_PROJECT_NAME } from '@/lib/demo/data';
import { runPipeline } from '@/lib/engines/pipeline';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    // Crée le projet démo
    const { data: project, error: projErr } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: DEMO_PROJECT_NAME,
        script_text: DEMO_SCRIPT,
        status: 'analyzing',
      })
      .select()
      .single();

    if (projErr) throw projErr;

    // Lance l'analyse automatique
    const result = runPipeline(DEMO_SCRIPT, { stylePreset: 'cinematique' });

    // Sauvegarde l'analyse
    const { data: analysis } = await supabase
      .from('analyses')
      .insert({
        project_id: project.id,
        version: 1,
        result,
        style_preset: 'cinematique',
      })
      .select()
      .single();

    // Met à jour le projet
    await supabase
      .from('projects')
      .update({ status: 'analyzed', scenes_count: result.scenes?.length || 0 })
      .eq('id', project.id);

    return NextResponse.json({
      projectId: project.id,
      analysisId: analysis?.id,
      scenes: result.scenes?.length || 0,
      plans: result.plans?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
