// ============================================================================
// MISEN V8 S4 — Webhooks : callbacks providers vidéo
// Reçoit les notifications de Kling, Runway, Sora, Veo etc. quand un
// clip est terminé, en échec, ou en progression.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// Provider-specific webhook secret env vars
const WEBHOOK_SECRETS: Record<string, string | undefined> = {
  kling: process.env.KLING_WEBHOOK_SECRET,
  runway: process.env.RUNWAY_WEBHOOK_SECRET,
  sora: process.env.SORA_WEBHOOK_SECRET,
  veo: process.env.VEO_WEBHOOK_SECRET,
  seedance: process.env.SEEDANCE_WEBHOOK_SECRET,
  wan: process.env.WAN_WEBHOOK_SECRET,
  hailuo: process.env.HAILUO_WEBHOOK_SECRET,
};

// ---------------------------------------------------------------------------
// Signature verification
// ---------------------------------------------------------------------------
function verifySignature(provider: string, body: string, signature: string | null): boolean {
  const secret = WEBHOOK_SECRETS[provider];
  if (!secret) return true; // No secret configured = skip verification (dev mode)
  if (!signature) return false;

  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// ---------------------------------------------------------------------------
// Normalize webhook payload from different providers
// ---------------------------------------------------------------------------
interface NormalizedPayload {
  providerJobId: string;
  status: 'processing' | 'completed' | 'failed';
  progress?: number;
  resultUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

function normalizePayload(provider: string, body: any): NormalizedPayload | null {
  try {
    switch (provider) {
      case 'kling':
        return {
          providerJobId: body.task_id || body.id,
          status: body.task_status === 'succeed' ? 'completed' : body.task_status === 'failed' ? 'failed' : 'processing',
          progress: body.task_progress,
          resultUrl: body.task_result?.videos?.[0]?.url,
          thumbnailUrl: body.task_result?.videos?.[0]?.thumbnail,
          errorMessage: body.task_status_msg,
        };

      case 'runway':
        return {
          providerJobId: body.id,
          status: body.status === 'SUCCEEDED' ? 'completed' : body.status === 'FAILED' ? 'failed' : 'processing',
          progress: body.progress ? Math.round(body.progress * 100) : undefined,
          resultUrl: body.output?.[0],
          errorMessage: body.failure || body.failureCode,
        };

      case 'sora':
        return {
          providerJobId: body.id || body.generation_id,
          status: body.status === 'complete' ? 'completed' : body.status === 'error' ? 'failed' : 'processing',
          resultUrl: body.video_url || body.output_url,
          thumbnailUrl: body.thumbnail_url,
          errorMessage: body.error?.message,
        };

      case 'veo':
        return {
          providerJobId: body.name || body.operationId,
          status: body.done && !body.error ? 'completed' : body.error ? 'failed' : 'processing',
          progress: body.metadata?.progress,
          resultUrl: body.response?.generatedSamples?.[0]?.video?.uri,
          errorMessage: body.error?.message,
        };

      case 'seedance':
        return {
          providerJobId: body.request_id || body.id,
          status: body.status === 'success' ? 'completed' : body.status === 'fail' ? 'failed' : 'processing',
          resultUrl: body.video_url,
          errorMessage: body.error_msg,
        };

      case 'wan':
        return {
          providerJobId: body.task_id,
          status: body.output?.task_status === 'SUCCEEDED' ? 'completed' : body.output?.task_status === 'FAILED' ? 'failed' : 'processing',
          resultUrl: body.output?.video_url,
          errorMessage: body.output?.message,
        };

      case 'hailuo':
        return {
          providerJobId: body.id || body.task_id,
          status: body.status === 'Success' ? 'completed' : body.status === 'Fail' ? 'failed' : 'processing',
          resultUrl: body.file_list?.[0]?.file_url,
          errorMessage: body.base_resp?.status_msg,
        };

      default:
        return null;
    }
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const provider = request.nextUrl.searchParams.get('provider');
    if (!provider || !WEBHOOK_SECRETS.hasOwnProperty(provider)) {
      return NextResponse.json({ error: 'Provider invalide' }, { status: 400 });
    }

    const rawBody = await request.text();

    // Verify signature
    const signature = request.headers.get('x-webhook-signature')
      || request.headers.get('x-signature')
      || request.headers.get('authorization');

    if (!verifySignature(provider, rawBody, signature)) {
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const payload = normalizePayload(provider, body);

    if (!payload || !payload.providerJobId) {
      return NextResponse.json({ error: 'Payload non reconnu' }, { status: 400 });
    }

    // Update generation in database
    const supabase = await createClient();

    const updateData: Record<string, any> = {
      status: payload.status,
      updated_at: new Date().toISOString(),
    };

    if (payload.progress !== undefined) updateData.progress = payload.progress;
    if (payload.resultUrl) updateData.result_url = payload.resultUrl;
    if (payload.thumbnailUrl) updateData.thumbnail_url = payload.thumbnailUrl;
    if (payload.errorMessage) updateData.error_message = payload.errorMessage;
    if (payload.status === 'completed') updateData.completed_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('generations')
      .update(updateData)
      .eq('provider_job_id', payload.providerJobId)
      .select('id, project_id, user_id')
      .single();

    if (error) {
      console.error('[Webhook] DB update error:', error);
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 });
    }

    // If completed, refund credits on failure or log success
    if (payload.status === 'failed' && data) {
      // Optionally refund credit
      try {
        await supabase.rpc('refund_credits', {
          p_user_id: data.user_id,
          p_amount: 1,
          p_reason: `Refund: ${provider} generation ${payload.providerJobId} failed`,
        });
      } catch {} // Non-blocking
    }

    return NextResponse.json({
      received: true,
      generationId: data?.id,
      status: payload.status,
    });
  } catch (error: any) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// GET for health check
export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'MISEN V8 Generation Webhooks' });
}
