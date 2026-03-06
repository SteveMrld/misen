/**
 * MISEN — Open-Source Video Models
 * Fallback layer for free/demo generation
 * Uses Hugging Face Inference API (free tier) or Replicate
 * 
 * Strategy: MISEN always recommends the OPTIMAL model.
 * The open-source fallback is shown alongside as "Alternative gratuite"
 * with a transparent quality delta so users see what they gain with premium.
 */

export interface OpenSourceModel {
  id: string
  name: string
  version: string
  provider: 'huggingface' | 'replicate'
  modelPath: string // HF model ID or Replicate model
  speciality: string
  // MCAP scores (same axes as premium models, honest scoring)
  resolution: number
  maxDuration: number
  motion: number
  physics: number
  hands: number
  lipSync: number
  cameraControl: number
  lighting: number
  vfx: number
  consistency: number
  textRendering: number
  styleRange: number
  speed: number
  costPer10s: number // always 0 for free tier
  maxResolution: string
  // What it's good/bad at (shown to user)
  strengths: { fr: string; en: string }
  limitations: { fr: string; en: string }
}

export const OPENSOURCE_MODELS: Record<string, OpenSourceModel> = {
  'wan-os': {
    id: 'wan-os',
    name: 'Wan',
    version: '2.1 (Open)',
    provider: 'huggingface',
    modelPath: 'Wan-AI/Wan2.1-T2V-14B',
    speciality: 'Meilleur modèle open-source généraliste. Animation, style, caméra.',
    resolution: 7, maxDuration: 5, motion: 8, physics: 6,
    hands: 5, lipSync: 4, cameraControl: 7, lighting: 7,
    vfx: 6, consistency: 6, textRendering: 3, styleRange: 8,
    speed: 4, costPer10s: 0,
    maxResolution: '720p',
    strengths: { fr: 'Animation stylisée, mouvement caméra, styles variés', en: 'Stylized animation, camera movement, diverse styles' },
    limitations: { fr: 'Réalisme limité, mains imprécises, max 5s', en: 'Limited realism, imprecise hands, max 5s' },
  },
  'hunyuan-os': {
    id: 'hunyuan-os',
    name: 'HunyuanVideo',
    version: '1.0 (Open)',
    provider: 'huggingface',
    modelPath: 'tencent/HunyuanVideo',
    speciality: 'Réalisme et physique. Bon pour les scènes humaines.',
    resolution: 7, maxDuration: 5, motion: 7, physics: 7,
    hands: 6, lipSync: 5, cameraControl: 6, lighting: 7,
    vfx: 5, consistency: 6, textRendering: 3, styleRange: 6,
    speed: 3, costPer10s: 0,
    maxResolution: '720p',
    strengths: { fr: 'Réalisme corporel, éclairage naturel, physique', en: 'Body realism, natural lighting, physics' },
    limitations: { fr: 'Lent, résolution limitée, pas de lip-sync', en: 'Slow, limited resolution, no lip-sync' },
  },
  'cogvideox-os': {
    id: 'cogvideox-os',
    name: 'CogVideoX',
    version: '5B (Open)',
    provider: 'huggingface',
    modelPath: 'THUDM/CogVideoX-5b',
    speciality: 'Mouvement fluide et cohérence temporelle.',
    resolution: 6, maxDuration: 6, motion: 7, physics: 6,
    hands: 5, lipSync: 3, cameraControl: 5, lighting: 6,
    vfx: 5, consistency: 7, textRendering: 2, styleRange: 6,
    speed: 5, costPer10s: 0,
    maxResolution: '720p',
    strengths: { fr: 'Cohérence temporelle, mouvement fluide', en: 'Temporal coherence, fluid motion' },
    limitations: { fr: 'Qualité visuelle moyenne, pas de contrôle caméra', en: 'Average visual quality, no camera control' },
  },
  'mochi-os': {
    id: 'mochi-os',
    name: 'Mochi 1',
    version: '1.0 (Open)',
    provider: 'huggingface',
    modelPath: 'genmo/mochi-1-preview',
    speciality: 'Rapide et léger. Bon pour le prototypage.',
    resolution: 6, maxDuration: 4, motion: 6, physics: 5,
    hands: 4, lipSync: 3, cameraControl: 4, lighting: 5,
    vfx: 4, consistency: 5, textRendering: 2, styleRange: 5,
    speed: 8, costPer10s: 0,
    maxResolution: '480p',
    strengths: { fr: 'Très rapide, bon pour tester des idées', en: 'Very fast, good for testing ideas' },
    limitations: { fr: 'Basse résolution, réalisme limité', en: 'Low resolution, limited realism' },
  },
}

export const OPENSOURCE_MODEL_IDS = Object.keys(OPENSOURCE_MODELS) as (keyof typeof OPENSOURCE_MODELS)[]

/**
 * Maps premium model strengths to the best open-source fallback.
 * Uses the same MCAP axes to find the closest match.
 */
const PREMIUM_TO_OS_MAP: Record<string, string> = {
  // Kling → best at physics/realism → HunyuanVideo (best OS realism)
  'kling3': 'hunyuan-os',
  'kling': 'hunyuan-os',
  'kling 3.0': 'hunyuan-os',
  // Runway → best at style/vfx → Wan (best OS style range)
  'runway4.5': 'wan-os',
  'runway': 'wan-os',
  'runway gen-4': 'wan-os',
  'runway gen-4.5': 'wan-os',
  // Sora → best at vfx/narrative → Wan (closest in versatility)
  'sora2': 'wan-os',
  'sora': 'wan-os',
  'sora 2': 'wan-os',
  // Veo → best at lip-sync/dialogue → HunyuanVideo (best OS human realism)
  'veo3.1': 'hunyuan-os',
  'veo': 'hunyuan-os',
  'veo 3.1': 'hunyuan-os',
  // Seedance → best at motion → CogVideoX (best OS motion coherence)
  'seedance2': 'cogvideox-os',
  'seedance': 'cogvideox-os',
  'seedance 2.0': 'cogvideox-os',
  // Wan premium → CogVideoX (different architecture, complementary)
  'wan2.5': 'cogvideox-os',
  'wan': 'cogvideox-os',
  'wan 2.5': 'cogvideox-os',
  // Hailuo → best at consistency → CogVideoX (best OS consistency)
  'hailuo2.3': 'cogvideox-os',
  'hailuo': 'cogvideox-os',
  'hailuo 2.3': 'cogvideox-os',
}

/**
 * Get the best open-source fallback for a premium model.
 * Returns the OS model + a quality delta score.
 */
export function getOpenSourceFallback(premiumModelId: string): {
  model: OpenSourceModel
  qualityDelta: number // 0-100, how much quality you lose
  reasoning: { fr: string; en: string }
} {
  const key = premiumModelId.toLowerCase()
  const osId = PREMIUM_TO_OS_MAP[key] || 'wan-os' // default to Wan (most versatile)
  const osModel = OPENSOURCE_MODELS[osId]

  // Calculate quality delta based on MCAP axes
  const premiumScores = getPremiumScores(key)
  const osScores = {
    resolution: osModel.resolution,
    motion: osModel.motion,
    physics: osModel.physics,
    lighting: osModel.lighting,
    vfx: osModel.vfx,
    consistency: osModel.consistency,
    styleRange: osModel.styleRange,
  }

  const axes = Object.keys(osScores) as (keyof typeof osScores)[]
  let totalDelta = 0
  for (const axis of axes) {
    totalDelta += Math.max(0, (premiumScores[axis] || 8) - osScores[axis])
  }
  const avgDelta = totalDelta / axes.length
  const qualityDelta = Math.round(Math.min(avgDelta * 10, 100))

  // Compute a score out of 100 for the OS model
  const osScore = Math.round(
    (osModel.resolution + osModel.motion + osModel.physics +
     osModel.lighting + osModel.vfx + osModel.consistency +
     osModel.styleRange) / 7 * 10
  )

  const premiumName = premiumModelId.split(/[0-9]/)[0] || premiumModelId

  return {
    model: osModel,
    qualityDelta,
    reasoning: {
      fr: `${osModel.name} ${osModel.version} est la meilleure alternative open-source pour ce type de plan (score ${osScore}/100). ${osModel.strengths.fr}. Limites : ${osModel.limitations.fr}.`,
      en: `${osModel.name} ${osModel.version} is the best open-source alternative for this shot type (score ${osScore}/100). ${osModel.strengths.en}. Limits: ${osModel.limitations.en}.`,
    },
  }
}

function getPremiumScores(modelId: string): Record<string, number> {
  const defaults: Record<string, Record<string, number>> = {
    kling: { resolution: 10, motion: 10, physics: 10, lighting: 9, vfx: 7, consistency: 9, styleRange: 7 },
    runway: { resolution: 9, motion: 8, physics: 8, lighting: 9, vfx: 9, consistency: 7, styleRange: 10 },
    sora: { resolution: 10, motion: 9, physics: 9, lighting: 9, vfx: 10, consistency: 9, styleRange: 9 },
    veo: { resolution: 9, motion: 8, physics: 8, lighting: 8, vfx: 7, consistency: 8, styleRange: 8 },
    seedance: { resolution: 8, motion: 10, physics: 9, lighting: 7, vfx: 8, consistency: 8, styleRange: 7 },
    wan: { resolution: 8, motion: 9, physics: 7, lighting: 8, vfx: 8, consistency: 7, styleRange: 9 },
    hailuo: { resolution: 8, motion: 7, physics: 7, lighting: 7, vfx: 6, consistency: 10, styleRange: 7 },
  }
  const base = modelId.replace(/[0-9.]/g, '').toLowerCase().trim()
  return defaults[base] || defaults.kling
}
