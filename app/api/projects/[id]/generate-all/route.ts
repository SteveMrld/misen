// ============================================================================
// MISEN V14.5 — POST /api/projects/[id]/generate-all
// Bout-en-bout : analyse → soumet tous les plans à Kling → retourne job IDs
// © 2026 Jabrilia Éditions — Confidentiel
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { submitGeneration, GenerationError } from '@/lib/services/generation';
import type { VideoProvider } from '@/lib/types/generation';

const MAX_PLANS = 20; // sécurité anti-burst

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const projectId = params.id;
  const body = await request.json().catch(() => ({}));
  const provider: VideoProvider = body.provider || 'kling';
  const aspectRatio = body.aspectRatio || '16:9';

  // 1. Récupérer la dernière analyse
  const { data: analysis, error: analysisError } = await supabase
    .from('analyses')
    .select('id, result')
    .eq('project_id', projectId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (analysisError || !analysis) {
    return NextResponse.json(
      { error: 'Aucune analyse trouvée. Lancez d\'abord /analyze.' },
      { status: 404 }
    );
  }

  const plans: any[] = analysis.result?.plans || [];
  if (plans.length === 0) {
    return NextResponse.json({ error: 'Aucun plan dans l\'analyse' }, { status: 400 });
  }

  // 2. Vérifier les crédits disponibles
  const { data: creditData } = await supabase
    .from('user_credits')
    .select('credits_remaining')
    .eq('user_id', user.id)
    .single();

  const creditsAvailable = creditData?.credits_remaining ?? 0;
  const plansToGenerate = plans.slice(0, MAX_PLANS);
  const totalCreditsNeeded = plansToGenerate.reduce((sum: number, p: any) => {
    const duration = Math.min(p.estimatedDuration || 5, 10);
    return sum + Math.ceil(duration / 5) * 2;
  }, 0);

  if (creditsAvailable < totalCreditsNeeded) {
    return NextResponse.json({
      error: `Crédits insuffisants. Nécessaire: ${totalCreditsNeeded}, disponible: ${creditsAvailable}`,
      creditsNeeded: totalCreditsNeeded,
      creditsAvailable,
    }, { status: 402 });
  }

  // 3. Soumettre chaque plan à Kling
  const results: Array<{
    planId: string;
    shotId: string;
    generationId: string | null;
    providerJobId: string | null;
    status: 'submitted' | 'error';
    error?: string;
  }> = [];

  for (const plan of plansToGenerate) {
    const planId = plan.id || `plan-${results.length + 1}`;
    const prompt = plan.finalPrompt || plan.prompt || '';
    const duration = Math.min(Math.max(plan.estimatedDuration || 5, 3), 10);
    const creditCost = Math.ceil(duration / 5) * 2;

    try {
      // Submit to provider
      const providerResponse = await submitGeneration({
        projectId,
        shotId: planId,
        provider,
        prompt,
        negativePrompt: plan.negativePrompt || undefined,
        duration,
        aspectRatio,
      });

      // Insérer en base
      const { data: generation, error: insertError } = await supabase
        .from('generations')
        .insert({
          project_id: projectId,
          user_id: user.id,
          shot_id: planId,
          provider,
          model: provider === 'kling' ? 'kling-v3' : provider,
          prompt,
          negative_prompt: plan.negativePrompt ?? null,
          duration,
          aspect_ratio: aspectRatio,
          status: 'pending',
          provider_job_id: providerResponse.providerJobId,
          credits_used: creditCost,
          metadata: {
            planId,
            cadrage: plan.cadrage,
            emotion: plan.emotion,
            sceneIndex: plan.sceneIndex,
            planIndex: plan.planIndex,
            analysisId: analysis.id,
            estimatedDuration: providerResponse.estimatedDuration,
          },
        })
        .select('id')
        .single();

      if (!insertError && generation) {
        // Déduire les crédits
        await supabase.rpc('deduct_credits', {
          p_user_id: user.id,
          p_amount: creditCost,
          p_reference_id: generation.id,
          p_description: `MISEN auto-generate: ${provider} plan ${planId}`,
        });

        results.push({
          planId,
          shotId: planId,
          generationId: generation.id,
          providerJobId: providerResponse.providerJobId,
          status: 'submitted',
        });
      } else {
        results.push({ planId, shotId: planId, generationId: null, providerJobId: null, status: 'error', error: 'DB insert failed' });
      }
    } catch (err: any) {
      results.push({
        planId, shotId: planId, generationId: null, providerJobId: null,
        status: 'error',
        error: err instanceof GenerationError ? err.message : String(err),
      });
    }
  }

  const submitted = results.filter(r => r.status === 'submitted').length;
  const failed = results.filter(r => r.status === 'error').length;

  return NextResponse.json({
    submitted,
    failed,
    total: plansToGenerate.length,
    results,
    pollUrl: `/api/projects/${projectId}/generation-status`,
    message: `${submitted}/${plansToGenerate.length} plans soumis à ${provider}`,
  });
}
