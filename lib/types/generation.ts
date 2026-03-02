// ============================================================================
// MISEN V8 — Generation Types
// Session 1 : Types unifiés pour le système de génération vidéo
// © 2026 Jabrilia Éditions — Confidentiel
// ============================================================================

// ---------------------------------------------------------------------------
// 1. Providers & Models
// ---------------------------------------------------------------------------

export type VideoProvider =
  | 'kling'
  | 'runway'
  | 'sora'
  | 'veo'
  | 'seedance'
  | 'wan'
  | 'hailuo';

export type VideoModel =
  | 'kling-3.0'
  | 'runway-gen-4.5'
  | 'sora-2'
  | 'veo-3.1'
  | 'seedance-2.0'
  | 'wan-2.5'
  | 'hailuo-2.3';

export const PROVIDER_MODEL_MAP: Record<VideoProvider, VideoModel> = {
  kling: 'kling-3.0',
  runway: 'runway-gen-4.5',
  sora: 'sora-2',
  veo: 'veo-3.1',
  seedance: 'seedance-2.0',
  wan: 'wan-2.5',
  hailuo: 'hailuo-2.3',
};

// ---------------------------------------------------------------------------
// 2. Provider Capabilities (from MCAP scoring)
// ---------------------------------------------------------------------------

export interface ProviderCapabilities {
  provider: VideoProvider;
  model: VideoModel;
  maxResolution: string;
  maxDuration: number;       // seconds
  fps: number;
  nativeAudio: boolean;
  costPer10s: number;        // USD
  supportedAspectRatios: AspectRatio[];
  supportsImageRef: boolean;
  supportsVideoRef: boolean;
  apiStyle: 'async-poll' | 'async-webhook' | 'sync';
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';

export const PROVIDER_CAPABILITIES: Record<VideoProvider, ProviderCapabilities> = {
  kling: {
    provider: 'kling',
    model: 'kling-3.0',
    maxResolution: '4K',
    maxDuration: 15,
    fps: 60,
    nativeAudio: true,
    costPer10s: 0.50,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    supportsImageRef: true,
    supportsVideoRef: true,
    apiStyle: 'async-poll',
  },
  runway: {
    provider: 'runway',
    model: 'runway-gen-4.5',
    maxResolution: '4K',
    maxDuration: 16,
    fps: 24,
    nativeAudio: false,
    costPer10s: 1.00,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    supportsImageRef: true,
    supportsVideoRef: false,
    apiStyle: 'async-poll',
  },
  sora: {
    provider: 'sora',
    model: 'sora-2',
    maxResolution: '1080p',
    maxDuration: 20,
    fps: 24,
    nativeAudio: true,
    costPer10s: 1.50,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    supportsImageRef: true,
    supportsVideoRef: false,
    apiStyle: 'async-poll',
  },
  veo: {
    provider: 'veo',
    model: 'veo-3.1',
    maxResolution: '4K',
    maxDuration: 8,
    fps: 24,
    nativeAudio: true,
    costPer10s: 2.50,
    supportedAspectRatios: ['16:9', '9:16', '1:1', '4:3'],
    supportsImageRef: true,
    supportsVideoRef: true,
    apiStyle: 'async-poll',
  },
  seedance: {
    provider: 'seedance',
    model: 'seedance-2.0',
    maxResolution: '2K',
    maxDuration: 15,
    fps: 24,
    nativeAudio: true,
    costPer10s: 0.60,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    supportsImageRef: true,
    supportsVideoRef: true,
    apiStyle: 'async-poll',
  },
  wan: {
    provider: 'wan',
    model: 'wan-2.5',
    maxResolution: '1080p',
    maxDuration: 10,
    fps: 16,
    nativeAudio: false,
    costPer10s: 0.30,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    supportsImageRef: true,
    supportsVideoRef: false,
    apiStyle: 'async-poll',
  },
  hailuo: {
    provider: 'hailuo',
    model: 'hailuo-2.3',
    maxResolution: '1080p',
    maxDuration: 10,
    fps: 25,
    nativeAudio: true,
    costPer10s: 0.40,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    supportsImageRef: false,
    supportsVideoRef: false,
    apiStyle: 'async-poll',
  },
};

// ---------------------------------------------------------------------------
// 3. Generation Request
// ---------------------------------------------------------------------------

export interface GenerationRequest {
  projectId: string;
  shotId: string;
  provider: VideoProvider;
  prompt: string;
  negativePrompt?: string;
  duration: number;            // seconds
  aspectRatio: AspectRatio;
  referenceImageUrl?: string;
  referenceVideoUrl?: string;
  style?: string;
  seed?: number;
  /** Provider-specific overrides */
  providerOptions?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// 4. Generation Job (DB row shape)
// ---------------------------------------------------------------------------

export type GenerationStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface GenerationJob {
  id: string;
  projectId: string;
  userId: string;
  shotId: string;
  provider: VideoProvider;
  model: VideoModel;
  prompt: string;
  negativePrompt: string | null;
  duration: number;
  aspectRatio: AspectRatio;
  referenceImageUrl: string | null;
  referenceVideoUrl: string | null;
  status: GenerationStatus;
  providerJobId: string | null;
  resultUrl: string | null;
  thumbnailUrl: string | null;
  errorMessage: string | null;
  creditsUsed: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// 5. Provider-level API responses (normalized)
// ---------------------------------------------------------------------------

export interface ProviderSubmitResponse {
  providerJobId: string;
  estimatedDuration?: number;  // seconds
}

export interface ProviderStatusResponse {
  status: GenerationStatus;
  progress?: number;           // 0-100
  resultUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
}

// ---------------------------------------------------------------------------
// 6. API route payloads
// ---------------------------------------------------------------------------

export interface GenerateRequestBody {
  projectId: string;
  shotId: string;
  provider: VideoProvider;
  prompt: string;
  negativePrompt?: string;
  duration?: number;
  aspectRatio?: AspectRatio;
  referenceImageUrl?: string;
  referenceVideoUrl?: string;
  style?: string;
  seed?: number;
  providerOptions?: Record<string, unknown>;
  characterRefImages?: { name: string; base64: string; mimeType: string }[];
}

export interface GenerateResponse {
  jobId: string;
  status: GenerationStatus;
  provider: VideoProvider;
  model: VideoModel;
  estimatedDuration?: number;
}

export interface GenerateStatusResponse {
  jobId: string;
  status: GenerationStatus;
  progress?: number;
  resultUrl?: string;
  thumbnailUrl?: string;
  errorMessage?: string;
  creditsUsed: number;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// 7. Credits
// ---------------------------------------------------------------------------

export interface CreditCost {
  provider: VideoProvider;
  baseCost: number;           // credits per generation
  perSecondCost: number;      // additional credits per second
}

export const CREDIT_COSTS: Record<VideoProvider, CreditCost> = {
  kling:    { provider: 'kling',    baseCost: 5,  perSecondCost: 0.5 },
  runway:   { provider: 'runway',   baseCost: 10, perSecondCost: 1.0 },
  sora:     { provider: 'sora',     baseCost: 15, perSecondCost: 1.5 },
  veo:      { provider: 'veo',      baseCost: 20, perSecondCost: 2.5 },
  seedance: { provider: 'seedance', baseCost: 6,  perSecondCost: 0.6 },
  wan:      { provider: 'wan',      baseCost: 3,  perSecondCost: 0.3 },
  hailuo:   { provider: 'hailuo',   baseCost: 4,  perSecondCost: 0.4 },
};

export function calculateCredits(provider: VideoProvider, duration: number): number {
  const cost = CREDIT_COSTS[provider];
  return Math.ceil(cost.baseCost + cost.perSecondCost * duration);
}
