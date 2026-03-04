// ============================================================================
// MISEN — POST /api/generate-credits
// Generate video using MISEN's pooled API keys (credit-based)
// The user doesn't need their own API key — MISEN handles it.
// © 2026 Jabrilia Éditions — Confidentiel
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Server-side API keys (set in Vercel env)
const SERVER_KEYS: Record<string, string | undefined> = {
  kling: process.env.MISEN_KLING_API_KEY,
  runway: process.env.MISEN_RUNWAY_API_KEY,
  sora: process.env.MISEN_SORA_API_KEY,
  veo: process.env.MISEN_VEO_API_KEY,
  seedance: process.env.MISEN_SEEDANCE_API_KEY,
  wan: process.env.MISEN_WAN_API_KEY,
  hailuo: process.env.MISEN_HAILUO_API_KEY,
};

// Credit cost per provider (credits per 5s generation)
const CREDIT_COST: Record<string, number> = {
  kling: 1,
  runway: 2,
  sora: 2,
  veo: 2,
  seedance: 1,
  wan: 1,
  hailuo: 1,
};

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // 2. Parse request
    const body = await request.json();
    const { provider, prompt, negativePrompt, duration, aspectRatio, projectId, shotId } = body;

    if (!provider || !prompt || !projectId || !shotId) {
      return NextResponse.json({ error: 'Paramètres manquants (provider, prompt, projectId, shotId)' }, { status: 400 });
    }

    // 3. Check server key exists for provider
    const serverKey = SERVER_KEYS[provider];
    if (!serverKey) {
      return NextResponse.json({
        error: `Génération via crédits MISEN non disponible pour ${provider}. Utilisez votre propre clé API ou choisissez un autre modèle.`,
        code: 'PROVIDER_NOT_AVAILABLE',
        availableProviders: Object.entries(SERVER_KEYS)
          .filter(([, v]) => !!v)
          .map(([k]) => k),
      }, { status: 503 });
    }

    // 4. Calculate credit cost
    const dur = Math.min(duration || 5, 10);
    const baseCost = CREDIT_COST[provider] || 1;
    const creditCost = Math.ceil(baseCost * (dur / 5)); // 1 credit per 5s base

    // 5. Check user balance
    const { data: credits } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    const balance = credits?.balance ?? 0;
    if (balance < creditCost) {
      return NextResponse.json({
        error: 'Crédits insuffisants',
        required: creditCost,
        balance,
        buyUrl: '/settings?tab=usage',
      }, { status: 402 });
    }

    // 6. Deduct credits atomically
    const { data: deductResult } = await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: creditCost,
      p_reference_id: null,
      p_description: `MISEN Credits: ${provider} ${dur}s`,
    });

    if (deductResult === false) {
      return NextResponse.json({ error: 'Échec du débit de crédits' }, { status: 402 });
    }

    // 7. Call provider API with MISEN's server key
    // This is where the actual API call happens
    // For now, we forward to the existing generation service
    const { submitGeneration, getModelForProvider } = await import('@/lib/services/generation');

    try {
      const model = getModelForProvider(provider);
      const result = await submitGeneration({
        projectId,
        shotId,
        provider,
        prompt,
        negativePrompt,
        duration: dur,
        aspectRatio: aspectRatio || '16:9',
        // Override: use MISEN's server key instead of user's key
        providerOptions: { _serverKeyOverride: true },
      });

      // 8. Record generation
      const { data: gen } = await supabase
        .from('generations')
        .insert({
          project_id: projectId,
          user_id: user.id,
          shot_id: shotId,
          provider,
          model,
          prompt,
          negative_prompt: negativePrompt || null,
          duration: dur,
          aspect_ratio: aspectRatio || '16:9',
          status: 'pending',
          provider_job_id: result.providerJobId,
          credits_used: creditCost,
          metadata: { source: 'misen_credits', serverKey: true },
        })
        .select('id')
        .single();

      return NextResponse.json({
        jobId: gen?.id,
        status: 'pending',
        provider,
        model,
        creditsUsed: creditCost,
        remainingBalance: balance - creditCost,
        estimatedDuration: result.estimatedDuration,
      }, { status: 201 });

    } catch (genError: any) {
      // Refund credits on generation failure
      await supabase.rpc('add_credits', {
        p_user_id: user.id,
        p_amount: creditCost,
        p_type: 'refund',
        p_description: `Remboursement: erreur ${provider}`,
      });

      return NextResponse.json({
        error: `Erreur de génération: ${genError.message}`,
        creditsRefunded: creditCost,
      }, { status: 422 });
    }

  } catch (error: any) {
    console.error('[MISEN] Error in generate-credits:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
