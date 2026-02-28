// ============================================================================
// MISEN V8 — POST /api/generate
// Session 1 : Route de soumission de génération vidéo
// © 2026 Jabrilia Éditions — Confidentiel
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

import {
  submitGeneration,
  getModelForProvider,
  GenerationError,
} from '@/lib/services/generation';
import {
  type GenerateRequestBody,
  type GenerateResponse,
  type VideoProvider,
  type AspectRatio,
  calculateCredits,
  PROVIDER_CAPABILITIES,
} from '@/lib/types/generation';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const VALID_PROVIDERS: VideoProvider[] = [
  'kling', 'runway', 'sora', 'veo', 'seedance', 'wan', 'hailuo',
];

const VALID_ASPECT_RATIOS: AspectRatio[] = ['16:9', '9:16', '1:1', '4:3', '3:4'];

function validateRequest(body: unknown): {
  valid: boolean;
  error?: string;
  data?: GenerateRequestBody;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body required' };
  }

  const b = body as Record<string, unknown>;

  if (!b.projectId || typeof b.projectId !== 'string') {
    return { valid: false, error: 'projectId is required' };
  }

  if (!b.shotId || typeof b.shotId !== 'string') {
    return { valid: false, error: 'shotId is required' };
  }

  if (!b.provider || !VALID_PROVIDERS.includes(b.provider as VideoProvider)) {
    return { valid: false, error: `Invalid provider. Must be one of: ${VALID_PROVIDERS.join(', ')}` };
  }

  if (!b.prompt || typeof b.prompt !== 'string' || b.prompt.trim().length === 0) {
    return { valid: false, error: 'prompt is required and must be non-empty' };
  }

  if (b.aspectRatio && !VALID_ASPECT_RATIOS.includes(b.aspectRatio as AspectRatio)) {
    return { valid: false, error: `Invalid aspectRatio. Must be one of: ${VALID_ASPECT_RATIOS.join(', ')}` };
  }

  if (b.duration !== undefined) {
    const dur = Number(b.duration);
    if (isNaN(dur) || dur <= 0 || dur > 20) {
      return { valid: false, error: 'duration must be between 1 and 20 seconds' };
    }
  }

  return {
    valid: true,
    data: {
      projectId: b.projectId as string,
      shotId: b.shotId as string,
      provider: b.provider as VideoProvider,
      prompt: (b.prompt as string).trim(),
      negativePrompt: b.negativePrompt as string | undefined,
      duration: b.duration ? Number(b.duration) : undefined,
      aspectRatio: (b.aspectRatio as AspectRatio) ?? '16:9',
      referenceImageUrl: b.referenceImageUrl as string | undefined,
      referenceVideoUrl: b.referenceVideoUrl as string | undefined,
      style: b.style as string | undefined,
      seed: b.seed ? Number(b.seed) : undefined,
      providerOptions: b.providerOptions as Record<string, unknown> | undefined,
    },
  };
}

// ---------------------------------------------------------------------------
// POST /api/generate
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const supabase = await createClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Parse & validate
    const body = await request.json().catch(() => null);
    const validation = validateRequest(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const req = validation.data;

    // 3. Check project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', req.projectId)
      .single();

    if (projectError || !project || project.user_id !== userId) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 403 }
      );
    }

    // 4. Check credits
    const caps = PROVIDER_CAPABILITIES[req.provider];
    const duration = req.duration ?? Math.min(caps.maxDuration, 10);
    const creditCost = calculateCredits(req.provider, duration);

    const { data: userCredits } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();

    const balance = userCredits?.balance ?? 0;
    if (balance < creditCost) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          required: creditCost,
          balance,
        },
        { status: 402 }
      );
    }

    // 5. Submit to provider
    const model = getModelForProvider(req.provider);
    const providerResponse = await submitGeneration({
      ...req,
      duration,
      aspectRatio: req.aspectRatio ?? '16:9',
    });

    // 6. Insert generation record
    const { data: generation, error: insertError } = await supabase
      .from('generations')
      .insert({
        project_id: req.projectId,
        user_id: userId,
        shot_id: req.shotId,
        provider: req.provider,
        model,
        prompt: req.prompt,
        negative_prompt: req.negativePrompt ?? null,
        duration,
        aspect_ratio: req.aspectRatio ?? '16:9',
        reference_image_url: req.referenceImageUrl ?? null,
        reference_video_url: req.referenceVideoUrl ?? null,
        status: 'pending',
        provider_job_id: providerResponse.providerJobId,
        credits_used: creditCost,
        metadata: {
          style: req.style,
          seed: req.seed,
          providerOptions: req.providerOptions,
          estimatedDuration: providerResponse.estimatedDuration,
        },
      })
      .select('id')
      .single();

    if (insertError || !generation) {
      console.error('[MISEN] Failed to insert generation record:', insertError);
      return NextResponse.json(
        { error: 'Failed to create generation record' },
        { status: 500 }
      );
    }

    // 7. Deduct credits
    await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_amount: creditCost,
      p_reference_id: generation.id,
      p_description: `Video generation: ${req.provider} - ${duration}s`,
    });

    // 8. Response
    const response: GenerateResponse = {
      jobId: generation.id,
      status: 'pending',
      provider: req.provider,
      model,
      estimatedDuration: providerResponse.estimatedDuration,
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    if (error instanceof GenerationError) {
      console.error(`[MISEN] GenerationError [${error.provider}]: ${error.message}`);
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          provider: error.provider,
          retryable: error.retryable,
        },
        { status: error.code === 'CONFIG_ERROR' ? 503 : 422 }
      );
    }

    console.error('[MISEN] Unexpected error in POST /api/generate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/generate — Liste les générations d'un projet
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);

    let query = supabase
      .from('generations')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch generations' }, { status: 500 });
    }

    return NextResponse.json({ generations: data ?? [] });

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
