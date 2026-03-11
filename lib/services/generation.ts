// ============================================================================
// MISEN V8 — Generation Service
// Session 1 : Service unifié de génération vidéo — 7 providers
// Extends V7 generation.ts (Kling/Runway/Sora/Veo) + Seedance/Wan/Hailuo
// © 2026 Jabrilia Éditions — Confidentiel
// ============================================================================

import {
  VideoProvider,
  VideoModel,
  GenerationRequest,
  ProviderSubmitResponse,
  ProviderStatusResponse,
  GenerationStatus,
  PROVIDER_MODEL_MAP,
  PROVIDER_CAPABILITIES,
  calculateCredits,
} from '@/lib/types/generation';

// ---------------------------------------------------------------------------
// 1. Environment Config
// ---------------------------------------------------------------------------

interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  version?: string;
}

function getProviderConfig(provider: VideoProvider): ProviderConfig {
  const configs: Record<VideoProvider, () => ProviderConfig> = {
    kling: () => ({
      apiKey: process.env.FAL_API_KEY ?? process.env.KLING_API_KEY ?? 'd776f40b-b23b-467a-b06d-7887cc2f7455:9dce9b2d6d144684da308d07b558b55c',
      baseUrl: 'https://queue.fal.run',
    }),
    runway: () => ({
      apiKey: process.env.RUNWAY_API_KEY ?? '',
      baseUrl: 'https://api.dev.runwayml.com/v1',
      version: '2024-11-06',
    }),
    sora: () => ({
      apiKey: process.env.OPENAI_API_KEY ?? '',
      baseUrl: 'https://api.openai.com/v1',
    }),
    veo: () => ({
      apiKey: process.env.GOOGLE_AI_API_KEY ?? '',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    }),
    seedance: () => ({
      apiKey: process.env.SEEDANCE_API_KEY ?? '',
      baseUrl: 'https://api.seedance.com/v2',
    }),
    wan: () => ({
      apiKey: process.env.WAN_API_KEY ?? '',
      baseUrl: 'https://api.wan.ai/v1',
    }),
    hailuo: () => ({
      apiKey: process.env.HAILUO_API_KEY ?? '',
      baseUrl: 'https://api.hailuo.ai/v1',
    }),
  };

  const config = configs[provider]();
  if (!config.apiKey) {
    throw new GenerationError(
      `Missing API key for provider: ${provider}. Set the corresponding env variable.`,
      provider,
      'CONFIG_ERROR'
    );
  }
  return config;
}

// ---------------------------------------------------------------------------
// 2. Custom Error
// ---------------------------------------------------------------------------

export class GenerationError extends Error {
  constructor(
    message: string,
    public provider: VideoProvider,
    public code: string,
    public retryable: boolean = false,
  ) {
    super(message);
    this.name = 'GenerationError';
  }
}

// ---------------------------------------------------------------------------
// 3. Provider Adapters
// ---------------------------------------------------------------------------

interface ProviderAdapter {
  submit(req: GenerationRequest, config: ProviderConfig): Promise<ProviderSubmitResponse>;
  checkStatus(providerJobId: string, config: ProviderConfig): Promise<ProviderStatusResponse>;
  cancel?(providerJobId: string, config: ProviderConfig): Promise<void>;
}

// ── 3.1 Kling via fal.ai ────────────────────────────────────────────────────
// Utilise fal.ai comme proxy pay-as-you-go pour Kling 2.1 Master
// Auth: Authorization: Key {FAL_API_KEY}
// Submit : POST https://queue.fal.run/fal-ai/kling-video/v2/master/text-to-video
// Status : GET  https://queue.fal.run/fal-ai/kling-video/requests/{requestId}/status
// Result : GET  https://queue.fal.run/fal-ai/kling-video/requests/{requestId}

const FAL_KLING_TEXT_URL = 'https://queue.fal.run/fal-ai/kling-video/v2/master/text-to-video';
const FAL_KLING_IMG_URL  = 'https://queue.fal.run/fal-ai/kling-video/v2/master/image-to-video';
const FAL_BASE           = 'https://queue.fal.run/fal-ai/kling-video';

const klingAdapter: ProviderAdapter = {
  async submit(req, config) {
    const endpoint = req.referenceImageUrl ? FAL_KLING_IMG_URL : FAL_KLING_TEXT_URL;

    const body: Record<string, unknown> = {
      prompt: req.prompt,
      negative_prompt: req.negativePrompt ?? '',
      duration: req.duration <= 5 ? '5' : '10',
      aspect_ratio: req.aspectRatio || '16:9',
    };

    if (req.referenceImageUrl) {
      body.image_url = req.referenceImageUrl;
    }

    const res = await fetchProvider(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    // fal.ai retourne { request_id, status, response_url, status_url }
    const requestId = data.request_id ?? data.requestId;
    if (!requestId) {
      throw new GenerationError(
        `fal.ai Kling: pas de request_id. Réponse: ${JSON.stringify(data)}`,
        'kling', 'SUBMIT_ERROR'
      );
    }
    return {
      providerJobId: requestId,
      estimatedDuration: req.duration * 12,
    };
  },

  async checkStatus(providerJobId, config) {
    // 1. Vérifier le statut
    const statusRes = await fetchProvider(
      `${FAL_BASE}/requests/${providerJobId}/status`,
      { headers: { 'Authorization': `Key ${config.apiKey}` } }
    );
    const statusData = await statusRes.json();
    const falStatus: string = statusData.status ?? 'IN_QUEUE';

    // Si complété → récupérer le résultat
    if (falStatus === 'COMPLETED') {
      const resultRes = await fetchProvider(
        `${FAL_BASE}/requests/${providerJobId}`,
        { headers: { 'Authorization': `Key ${config.apiKey}` } }
      );
      const result = await resultRes.json();
      const videoUrl = result.video?.url ?? result.video_url ?? result.output?.video?.url;
      return {
        status: 'completed',
        resultUrl: videoUrl,
        thumbnailUrl: undefined,
        progress: 100,
      };
    }

    return {
      status: mapFalStatus(falStatus),
      progress: falStatus === 'IN_PROGRESS' ? 50 : 10,
      errorMessage: statusData.error ?? statusData.detail,
    };
  },

  async cancel(providerJobId, config) {
    await fetchProvider(`${FAL_BASE}/requests/${providerJobId}/cancel`, {
      method: 'PUT',
      headers: { 'Authorization': `Key ${config.apiKey}` },
    }).catch(() => {}); // non-bloquant
  },
};

function mapFalStatus(status: string): GenerationStatus {
  const map: Record<string, GenerationStatus> = {
    IN_QUEUE: 'pending',
    IN_PROGRESS: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
  };
  return map[status] ?? 'processing';
}

function mapKlingStatus(status: string): GenerationStatus {
  const map: Record<string, GenerationStatus> = {
    submitted: 'pending',
    processing: 'processing',
    succeed: 'completed',
    failed: 'failed',
    cancelled: 'cancelled',
  };
  return map[status] ?? 'processing';
}

// ── 3.2 Runway Gen-4.5 ─────────────────────────────────────────────────────

const runwayAdapter: ProviderAdapter = {
  async submit(req, config) {
    const body: Record<string, unknown> = {
      model: 'gen4_turbo',
      promptText: req.prompt,
      duration: req.duration,
      ratio: req.aspectRatio.replace(':', ':'),
      watermark: false,
    };

    if (req.referenceImageUrl) {
      body.promptImage = req.referenceImageUrl;
    }

    const res = await fetchProvider(`${config.baseUrl}/image_to_video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        ...(config.version ? { 'X-Runway-Version': config.version } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return {
      providerJobId: data.id,
      estimatedDuration: 120,
    };
  },

  async checkStatus(providerJobId, config) {
    const res = await fetchProvider(`${config.baseUrl}/tasks/${providerJobId}`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        ...(config.version ? { 'X-Runway-Version': config.version } : {}),
      },
    });

    const data = await res.json();

    return {
      status: mapRunwayStatus(data.status),
      progress: data.progress ? Math.round(data.progress * 100) : undefined,
      resultUrl: data.output?.[0],
      errorMessage: data.failure ?? data.failureCode,
    };
  },

  async cancel(providerJobId, config) {
    await fetchProvider(`${config.baseUrl}/tasks/${providerJobId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        ...(config.version ? { 'X-Runway-Version': config.version } : {}),
      },
    });
  },
};

function mapRunwayStatus(status: string): GenerationStatus {
  const map: Record<string, GenerationStatus> = {
    PENDING: 'pending',
    THROTTLED: 'pending',
    RUNNING: 'processing',
    SUCCEEDED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
  };
  return map[status] ?? 'processing';
}

// ── 3.3 Sora 2 ─────────────────────────────────────────────────────────────

const soraAdapter: ProviderAdapter = {
  async submit(req, config) {
    const body = {
      model: 'sora-2',
      input: {
        prompt: req.prompt,
        ...(req.referenceImageUrl ? { image_url: req.referenceImageUrl } : {}),
      },
      parameters: {
        duration: req.duration,
        aspect_ratio: req.aspectRatio,
        n: 1,
      },
    };

    const res = await fetchProvider(`${config.baseUrl}/videos/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return {
      providerJobId: data.id,
      estimatedDuration: 180,
    };
  },

  async checkStatus(providerJobId, config) {
    const res = await fetchProvider(
      `${config.baseUrl}/videos/generations/${providerJobId}`,
      {
        headers: { 'Authorization': `Bearer ${config.apiKey}` },
      }
    );

    const data = await res.json();

    return {
      status: mapSoraStatus(data.status),
      progress: data.status === 'in_progress' ? (data.progress ?? 50) : undefined,
      resultUrl: data.data?.[0]?.url,
      thumbnailUrl: data.data?.[0]?.thumbnail_url,
      errorMessage: data.error?.message,
    };
  },
};

function mapSoraStatus(status: string): GenerationStatus {
  const map: Record<string, GenerationStatus> = {
    queued: 'pending',
    in_progress: 'processing',
    completed: 'completed',
    failed: 'failed',
    cancelled: 'cancelled',
  };
  return map[status] ?? 'processing';
}

// ── 3.4 Veo 3.1 ────────────────────────────────────────────────────────────

const veoAdapter: ProviderAdapter = {
  async submit(req, config) {
    const body = {
      model: 'veo-3.1',
      contents: [{
        parts: [
          { text: req.prompt },
          ...(req.referenceImageUrl
            ? [{ inline_data: { mime_type: 'image/png', url: req.referenceImageUrl } }]
            : []),
        ],
      }],
      generationConfig: {
        videoDuration: `${req.duration}s`,
        aspectRatio: req.aspectRatio,
        numberOfVideos: 1,
        includeAudio: true,
      },
    };

    const res = await fetchProvider(
      `${config.baseUrl}/models/veo-3.1:generateContent`,
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': config.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    const operationName = data.name ?? data.operationName;

    return {
      providerJobId: operationName,
      estimatedDuration: 120,
    };
  },

  async checkStatus(providerJobId, config) {
    const res = await fetchProvider(
      `${config.baseUrl}/operations/${providerJobId}`,
      {
        headers: { 'x-goog-api-key': config.apiKey },
      }
    );

    const data = await res.json();

    if (data.done) {
      if (data.error) {
        return {
          status: 'failed' as GenerationStatus,
          errorMessage: data.error.message,
        };
      }
      const video = data.response?.generatedVideos?.[0];
      return {
        status: 'completed' as GenerationStatus,
        resultUrl: video?.uri ?? video?.video?.uri,
        thumbnailUrl: video?.thumbnail?.uri,
      };
    }

    return {
      status: 'processing' as GenerationStatus,
      progress: data.metadata?.progress
        ? Math.round(data.metadata.progress * 100)
        : undefined,
    };
  },
};

// ── 3.5 Seedance 2.0 (NOUVEAU V8) ──────────────────────────────────────────

const seedanceAdapter: ProviderAdapter = {
  async submit(req, config) {
    const body: Record<string, unknown> = {
      model: 'seedance-2.0',
      prompt: req.prompt,
      negative_prompt: req.negativePrompt ?? '',
      duration: req.duration,
      aspect_ratio: req.aspectRatio,
      fps: 24,
      resolution: '2k',
      audio: {
        enabled: true,
        mode: 'auto',
      },
    };

    if (req.referenceImageUrl) {
      body.reference_image = {
        url: req.referenceImageUrl,
        influence: 0.8,
      };
    }

    if (req.referenceVideoUrl) {
      body.reference_video = {
        url: req.referenceVideoUrl,
        mode: 'style_transfer',
      };
    }

    if (req.seed !== undefined) {
      body.seed = req.seed;
    }

    const res = await fetchProvider(`${config.baseUrl}/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return {
      providerJobId: data.generation_id ?? data.id,
      estimatedDuration: req.duration * 8,
    };
  },

  async checkStatus(providerJobId, config) {
    const res = await fetchProvider(
      `${config.baseUrl}/generations/${providerJobId}`,
      {
        headers: { 'Authorization': `Bearer ${config.apiKey}` },
      }
    );

    const data = await res.json();

    return {
      status: mapSeedanceStatus(data.status),
      progress: data.progress ?? undefined,
      resultUrl: data.output?.video_url,
      thumbnailUrl: data.output?.thumbnail_url,
      errorMessage: data.error?.message ?? data.error_message,
    };
  },

  async cancel(providerJobId, config) {
    await fetchProvider(`${config.baseUrl}/generations/${providerJobId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${config.apiKey}` },
    });
  },
};

function mapSeedanceStatus(status: string): GenerationStatus {
  const map: Record<string, GenerationStatus> = {
    queued: 'pending',
    pending: 'pending',
    generating: 'processing',
    processing: 'processing',
    completed: 'completed',
    success: 'completed',
    failed: 'failed',
    error: 'failed',
    cancelled: 'cancelled',
  };
  return map[status] ?? 'processing';
}

// ── 3.6 Wan 2.5 (NOUVEAU V8) ───────────────────────────────────────────────

const wanAdapter: ProviderAdapter = {
  async submit(req, config) {
    const body: Record<string, unknown> = {
      model: 'wan-2.5',
      prompt: req.prompt,
      duration: req.duration,
      aspect_ratio: req.aspectRatio,
      resolution: '1080p',
      fps: 16,
    };

    if (req.referenceImageUrl) {
      body.image_url = req.referenceImageUrl;
    }

    if (req.negativePrompt) {
      body.negative_prompt = req.negativePrompt;
    }

    const res = await fetchProvider(`${config.baseUrl}/video/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return {
      providerJobId: data.task_id ?? data.id,
      estimatedDuration: req.duration * 12,
    };
  },

  async checkStatus(providerJobId, config) {
    const res = await fetchProvider(
      `${config.baseUrl}/video/status/${providerJobId}`,
      {
        headers: { 'Authorization': `Bearer ${config.apiKey}` },
      }
    );

    const data = await res.json();

    return {
      status: mapWanStatus(data.status),
      progress: data.progress ?? undefined,
      resultUrl: data.result?.video_url ?? data.video_url,
      thumbnailUrl: data.result?.cover_url ?? data.cover_url,
      errorMessage: data.message ?? data.error,
    };
  },
};

function mapWanStatus(status: string): GenerationStatus {
  const map: Record<string, GenerationStatus> = {
    pending: 'pending',
    queued: 'pending',
    running: 'processing',
    processing: 'processing',
    success: 'completed',
    completed: 'completed',
    failed: 'failed',
    error: 'failed',
  };
  return map[status] ?? 'processing';
}

// ── 3.7 Hailuo 2.3 (NOUVEAU V8) ────────────────────────────────────────────

const hailuoAdapter: ProviderAdapter = {
  async submit(req, config) {
    const body: Record<string, unknown> = {
      model: 'hailuo-2.3',
      prompt: req.prompt,
      duration: req.duration,
      aspect_ratio: req.aspectRatio,
      resolution: '1080p',
      enable_audio: true,
    };

    if (req.negativePrompt) {
      body.negative_prompt = req.negativePrompt;
    }

    const res = await fetchProvider(`${config.baseUrl}/video/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return {
      providerJobId: data.id ?? data.generation_id,
      estimatedDuration: req.duration * 10,
    };
  },

  async checkStatus(providerJobId, config) {
    const res = await fetchProvider(
      `${config.baseUrl}/video/generations/${providerJobId}`,
      {
        headers: { 'Authorization': `Bearer ${config.apiKey}` },
      }
    );

    const data = await res.json();

    return {
      status: mapHailuoStatus(data.status),
      progress: data.progress ?? undefined,
      resultUrl: data.video?.url ?? data.result_url,
      thumbnailUrl: data.video?.thumbnail ?? data.thumbnail_url,
      errorMessage: data.error?.message ?? data.error_msg,
    };
  },
};

function mapHailuoStatus(status: string): GenerationStatus {
  const map: Record<string, GenerationStatus> = {
    pending: 'pending',
    queued: 'pending',
    processing: 'processing',
    generating: 'processing',
    completed: 'completed',
    success: 'completed',
    failed: 'failed',
    error: 'failed',
  };
  return map[status] ?? 'processing';
}

// ---------------------------------------------------------------------------
// 4. Adapter Registry
// ---------------------------------------------------------------------------

const ADAPTERS: Record<VideoProvider, ProviderAdapter> = {
  kling: klingAdapter,
  runway: runwayAdapter,
  sora: soraAdapter,
  veo: veoAdapter,
  seedance: seedanceAdapter,
  wan: wanAdapter,
  hailuo: hailuoAdapter,
};

// ---------------------------------------------------------------------------
// 5. Public API — Generation Service
// ---------------------------------------------------------------------------

/**
 * Submit a video generation request to the specified provider.
 * Returns the provider job ID for subsequent polling.
 */
export async function submitGeneration(
  req: GenerationRequest
): Promise<ProviderSubmitResponse> {
  const adapter = ADAPTERS[req.provider];
  if (!adapter) {
    throw new GenerationError(
      `Unknown provider: ${req.provider}`,
      req.provider,
      'UNKNOWN_PROVIDER'
    );
  }

  // Validate capabilities
  const caps = PROVIDER_CAPABILITIES[req.provider];
  if (req.duration > caps.maxDuration) {
    throw new GenerationError(
      `Duration ${req.duration}s exceeds max ${caps.maxDuration}s for ${req.provider}`,
      req.provider,
      'DURATION_EXCEEDED'
    );
  }

  if (req.referenceImageUrl && !caps.supportsImageRef) {
    throw new GenerationError(
      `${req.provider} does not support image references`,
      req.provider,
      'IMAGE_REF_UNSUPPORTED'
    );
  }

  if (req.referenceVideoUrl && !caps.supportsVideoRef) {
    throw new GenerationError(
      `${req.provider} does not support video references`,
      req.provider,
      'VIDEO_REF_UNSUPPORTED'
    );
  }

  const config = getProviderConfig(req.provider);

  try {
    return await adapter.submit(req, config);
  } catch (error) {
    if (error instanceof GenerationError) throw error;

    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new GenerationError(
      `Generation submission failed for ${req.provider}: ${message}`,
      req.provider,
      'SUBMIT_FAILED',
      true
    );
  }
}

/**
 * Check the status of an existing generation job.
 */
export async function checkGenerationStatus(
  provider: VideoProvider,
  providerJobId: string
): Promise<ProviderStatusResponse> {
  const adapter = ADAPTERS[provider];
  if (!adapter) {
    throw new GenerationError(
      `Unknown provider: ${provider}`,
      provider,
      'UNKNOWN_PROVIDER'
    );
  }

  const config = getProviderConfig(provider);

  try {
    return await adapter.checkStatus(providerJobId, config);
  } catch (error) {
    if (error instanceof GenerationError) throw error;

    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new GenerationError(
      `Status check failed for ${provider}: ${message}`,
      provider,
      'STATUS_CHECK_FAILED',
      true
    );
  }
}

/**
 * Cancel a running generation (if supported by the provider).
 */
export async function cancelGeneration(
  provider: VideoProvider,
  providerJobId: string
): Promise<void> {
  const adapter = ADAPTERS[provider];
  if (!adapter?.cancel) {
    throw new GenerationError(
      `Cancellation not supported for ${provider}`,
      provider,
      'CANCEL_UNSUPPORTED'
    );
  }

  const config = getProviderConfig(provider);
  await adapter.cancel(providerJobId, config);
}

/**
 * Get model string for a provider.
 */
export function getModelForProvider(provider: VideoProvider): VideoModel {
  return PROVIDER_MODEL_MAP[provider];
}

// ---------------------------------------------------------------------------
// 6. HTTP Helper with retry
// ---------------------------------------------------------------------------

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function fetchProvider(
  url: string,
  init?: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(30_000),
      });

      // Rate limited — retry
      if (res.status === 429 && attempt < retries) {
        const retryAfter = parseInt(res.headers.get('Retry-After') ?? '5', 10);
        await sleep(retryAfter * 1000);
        continue;
      }

      // Server error — retry
      if (res.status >= 500 && attempt < retries) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
      }

      return res;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < retries) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw lastError ?? new Error('Request failed after retries');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
