// ============================================================================
// MISEN V8 — GET /api/generate/status
// Session 1 : Route de polling pour le statut de génération vidéo
// © 2026 Jabrilia Éditions — Confidentiel
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

import {
  checkGenerationStatus,
  cancelGeneration,
  GenerationError,
} from '@/lib/services/generation';
import type {
  VideoProvider,
  GenerationStatus,
  GenerateStatusResponse,
} from '@/lib/types/generation';

// ---------------------------------------------------------------------------
// GET /api/generate/status?jobId=xxx
// Polls the provider and updates DB record
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'jobId parameter required' }, { status: 400 });
    }

    // 1. Fetch generation record
    const { data: generation, error: fetchError } = await supabase
      .from('generations')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !generation) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 });
    }

    // 2. If already terminal, return cached result
    if (['completed', 'failed', 'cancelled'].includes(generation.status)) {
      const response: GenerateStatusResponse = {
        jobId: generation.id,
        status: generation.status as GenerationStatus,
        resultUrl: generation.result_url,
        thumbnailUrl: generation.thumbnail_url,
        errorMessage: generation.error_message,
        creditsUsed: generation.credits_used,
        updatedAt: generation.updated_at,
      };
      return NextResponse.json(response);
    }

    // 3. Poll provider for fresh status
    const providerStatus = await checkGenerationStatus(
      generation.provider as VideoProvider,
      generation.provider_job_id
    );

    // 4. Update DB if status changed
    const statusChanged = providerStatus.status !== generation.status;
    const hasResult = providerStatus.resultUrl && !generation.result_url;

    if (statusChanged || hasResult) {
      const updates: Record<string, unknown> = {
        status: providerStatus.status,
        updated_at: new Date().toISOString(),
      };

      if (providerStatus.resultUrl) {
        updates.result_url = providerStatus.resultUrl;
      }
      if (providerStatus.thumbnailUrl) {
        updates.thumbnail_url = providerStatus.thumbnailUrl;
      }
      if (providerStatus.errorMessage) {
        updates.error_message = providerStatus.errorMessage;
      }

      // If failed, refund credits
      if (providerStatus.status === 'failed' && generation.credits_used > 0) {
        await supabase.rpc('refund_credits', {
          p_user_id: session.user.id,
          p_amount: generation.credits_used,
          p_reference_id: generation.id,
          p_description: `Refund: generation failed (${generation.provider})`,
        });
        updates.credits_used = 0;
      }

      await supabase
        .from('generations')
        .update(updates)
        .eq('id', jobId);
    }

    // 5. Response
    const response: GenerateStatusResponse = {
      jobId: generation.id,
      status: providerStatus.status,
      progress: providerStatus.progress,
      resultUrl: providerStatus.resultUrl ?? generation.result_url,
      thumbnailUrl: providerStatus.thumbnailUrl ?? generation.thumbnail_url,
      errorMessage: providerStatus.errorMessage ?? generation.error_message,
      creditsUsed: providerStatus.status === 'failed' ? 0 : generation.credits_used,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof GenerationError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          retryable: error.retryable,
        },
        { status: 502 }
      );
    }

    console.error('[MISEN] Error in GET /api/generate/status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/generate/status?jobId=xxx — Cancel generation
// ---------------------------------------------------------------------------

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'jobId parameter required' }, { status: 400 });
    }

    // 1. Fetch generation
    const { data: generation } = await supabase
      .from('generations')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', session.user.id)
      .single();

    if (!generation) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 });
    }

    if (['completed', 'failed', 'cancelled'].includes(generation.status)) {
      return NextResponse.json(
        { error: `Cannot cancel generation with status: ${generation.status}` },
        { status: 409 }
      );
    }

    // 2. Cancel with provider
    try {
      await cancelGeneration(
        generation.provider as VideoProvider,
        generation.provider_job_id
      );
    } catch {
      // Some providers don't support cancel — continue anyway
    }

    // 3. Update DB
    await supabase
      .from('generations')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    // 4. Refund credits
    if (generation.credits_used > 0) {
      await supabase.rpc('refund_credits', {
        p_user_id: session.user.id,
        p_amount: generation.credits_used,
        p_reference_id: generation.id,
        p_description: `Refund: generation cancelled (${generation.provider})`,
      });
    }

    return NextResponse.json({
      jobId,
      status: 'cancelled',
      creditsRefunded: generation.credits_used,
    });

  } catch (error) {
    console.error('[MISEN] Error in DELETE /api/generate/status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
