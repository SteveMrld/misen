// ============================================================================
// MISEN — POST /api/generate-opensource
// Generate video using open-source models (free tier)
// Uses Hugging Face Inference API — no user key needed
// © 2026 Jabrilia Éditions — Confidentiel
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { OPENSOURCE_MODELS } from '@/lib/models/opensource-models';

// HF Inference API (free tier or with MISEN's token for higher rate limits)
const HF_TOKEN = process.env.HF_API_TOKEN || '';
const HF_INFERENCE_URL = 'https://api-inference.huggingface.co/models';

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
    const { modelId, prompt, negativePrompt, projectId, shotId } = body;

    if (!modelId || !prompt) {
      return NextResponse.json({ error: 'modelId et prompt requis' }, { status: 400 });
    }

    // 3. Validate model
    const model = OPENSOURCE_MODELS[modelId];
    if (!model) {
      return NextResponse.json({
        error: `Modèle open-source inconnu: ${modelId}`,
        availableModels: Object.keys(OPENSOURCE_MODELS),
      }, { status: 400 });
    }

    // 4. Rate limit check (max 5 free generations per day per user)
    const today = new Date().toISOString().slice(0, 10);
    const { data: todayGens } = await supabase
      .from('generations')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00Z`)
      .eq('metadata->>source', 'opensource');

    const dailyCount = todayGens?.length || 0;
    const DAILY_LIMIT = 5;
    if (dailyCount >= DAILY_LIMIT) {
      return NextResponse.json({
        error: `Limite de ${DAILY_LIMIT} générations gratuites/jour atteinte. Achetez des crédits pour continuer.`,
        errorEn: `Daily limit of ${DAILY_LIMIT} free generations reached. Buy credits to continue.`,
        limit: DAILY_LIMIT,
        used: dailyCount,
        upgradeUrl: '/settings?tab=usage',
      }, { status: 429 });
    }

    // 5. Call Hugging Face Inference API
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (HF_TOKEN) {
      headers['Authorization'] = `Bearer ${HF_TOKEN}`;
    }

    // Record generation attempt
    const { data: gen } = await supabase
      .from('generations')
      .insert({
        project_id: projectId || null,
        user_id: user.id,
        shot_id: shotId || 'opensource-gen',
        provider: 'huggingface',
        model: `${model.name} ${model.version}`,
        prompt,
        negative_prompt: negativePrompt || null,
        duration: model.maxDuration,
        aspect_ratio: '16:9',
        status: 'pending',
        credits_used: 0,
        metadata: {
          source: 'opensource',
          modelId: model.id,
          modelPath: model.modelPath,
          provider: model.provider,
          dailyCount: dailyCount + 1,
          dailyLimit: DAILY_LIMIT,
        },
      })
      .select('id')
      .single();

    // 6. Submit to HF Inference API
    // Note: Video generation on HF is async — we get a job ID and poll
    try {
      const hfResp = await fetch(`${HF_INFERENCE_URL}/${model.modelPath}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            negative_prompt: negativePrompt || undefined,
            num_inference_steps: 25,
            guidance_scale: 7.5,
          },
        }),
      });

      if (hfResp.status === 503) {
        // Model is loading — this is normal for cold starts on HF
        const loadInfo = await hfResp.json().catch(() => ({}));
        const estimatedTime = loadInfo.estimated_time || 120;

        if (gen?.id) {
          await supabase
            .from('generations')
            .update({
              status: 'processing',
              metadata: {
                source: 'opensource',
                modelId: model.id,
                modelPath: model.modelPath,
                hfStatus: 'loading',
                estimatedLoadTime: estimatedTime,
              },
            })
            .eq('id', gen.id);
        }

        return NextResponse.json({
          jobId: gen?.id,
          status: 'loading',
          message: {
            fr: `Le modèle ${model.name} est en cours de chargement (~${Math.round(estimatedTime)}s). Les modèles open-source peuvent prendre 1-3 minutes au premier lancement.`,
            en: `Model ${model.name} is loading (~${Math.round(estimatedTime)}s). Open-source models may take 1-3 minutes on first launch.`,
          },
          model: `${model.name} ${model.version}`,
          free: true,
          remainingToday: DAILY_LIMIT - dailyCount - 1,
        }, { status: 202 });
      }

      if (!hfResp.ok) {
        const errData = await hfResp.json().catch(() => ({}));

        if (gen?.id) {
          await supabase
            .from('generations')
            .update({ status: 'failed', error: errData.error || 'HF API error' })
            .eq('id', gen.id);
        }

        return NextResponse.json({
          error: errData.error || `Erreur ${model.name}: ${hfResp.status}`,
          model: `${model.name} ${model.version}`,
          hint: {
            fr: 'Les modèles open-source sont parfois indisponibles. Réessayez dans quelques minutes ou utilisez les crédits MISEN pour une génération garantie.',
            en: 'Open-source models are sometimes unavailable. Retry in a few minutes or use MISEN credits for guaranteed generation.',
          },
        }, { status: 422 });
      }

      // Success — HF returns the video directly for some models, or a job ID for async
      const contentType = hfResp.headers.get('content-type') || '';

      if (contentType.includes('video') || contentType.includes('octet-stream')) {
        // Direct video response — store it
        // In production, upload to Supabase Storage
        if (gen?.id) {
          await supabase
            .from('generations')
            .update({ status: 'completed', completed_at: new Date().toISOString() })
            .eq('id', gen.id);
        }

        return NextResponse.json({
          jobId: gen?.id,
          status: 'completed',
          model: `${model.name} ${model.version}`,
          free: true,
          remainingToday: DAILY_LIMIT - dailyCount - 1,
        }, { status: 201 });
      }

      // Async response
      if (gen?.id) {
        await supabase
          .from('generations')
          .update({ status: 'processing' })
          .eq('id', gen.id);
      }

      return NextResponse.json({
        jobId: gen?.id,
        status: 'processing',
        model: `${model.name} ${model.version}`,
        free: true,
        remainingToday: DAILY_LIMIT - dailyCount - 1,
      }, { status: 202 });

    } catch (genErr: any) {
      if (gen?.id) {
        await supabase
          .from('generations')
          .update({ status: 'failed', error: genErr.message })
          .eq('id', gen.id);
      }

      return NextResponse.json({
        error: genErr.message,
        hint: {
          fr: 'Erreur de connexion au modèle open-source. Réessayez ou utilisez les crédits MISEN.',
          en: 'Connection error to open-source model. Retry or use MISEN credits.',
        },
      }, { status: 422 });
    }

  } catch (error: any) {
    console.error('[MISEN] Error in generate-opensource:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET — Check remaining free generations for today
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const today = new Date().toISOString().slice(0, 10);
    const { data: todayGens } = await supabase
      .from('generations')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00Z`)
      .eq('metadata->>source', 'opensource');

    const used = todayGens?.length || 0;
    const DAILY_LIMIT = 5;

    return NextResponse.json({
      dailyLimit: DAILY_LIMIT,
      used,
      remaining: Math.max(0, DAILY_LIMIT - used),
      models: Object.values(OPENSOURCE_MODELS).map(m => ({
        id: m.id,
        name: `${m.name} ${m.version}`,
        speciality: m.speciality,
        maxResolution: m.maxResolution,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
