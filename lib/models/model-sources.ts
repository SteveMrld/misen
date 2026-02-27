/**
 * MISEN V7 — Sources & Méthodologie des scores MCAP
 * 
 * TRANSPARENCE: Chaque score est documenté avec sa source.
 * Les scores sont des ESTIMATIONS basées sur:
 * - Specs constructeur (annonces officielles)
 * - Benchmarks communautaires (YouTube, Reddit, Twitter)
 * - Articles comparatifs (publications tech)
 * - Retours utilisateurs agrégés
 * 
 * Ces scores ne sont PAS basés sur nos propres tests standardisés.
 * Le mode Comparaison permet aux utilisateurs de vérifier les recommandations.
 */

export interface ScoreSource {
  score: number
  basis: 'spec' | 'benchmark' | 'community' | 'estimated'
  source: string
  confidence: 'high' | 'medium' | 'low'
  lastVerified: string // date
}

export interface ModelSources {
  modelId: string
  modelName: string
  scores: Record<string, ScoreSource>
}

// Légende des bases
// spec       = Annonce officielle constructeur
// benchmark  = Test comparatif publié (article/vidéo)
// community  = Consensus communautaire (Reddit, Twitter, Discord)
// estimated  = Estimation MISEN (pas de source directe)

export const MODEL_SOURCES: Record<string, ModelSources> = {
  'kling3': {
    modelId: 'kling3', modelName: 'Kling 3.0 (Kuaishou)',
    scores: {
      physics:       { score: 10, basis: 'benchmark', source: 'PhysicsBench + Chrono-Magic-Bench — leader fidélité physique/gravité (Annexe 1-C, CSRankings 2026)', confidence: 'high', lastVerified: '2026-02' },
      motion:        { score: 10, basis: 'benchmark', source: 'Motion Master — 4K natif 60fps, multi-shot 6 cuts/16s cohérents (Kuaishou 2026)', confidence: 'high', lastVerified: '2026-02' },
      resolution:    { score: 10, basis: 'spec', source: 'Génération native 4K 60fps sans upscaling (Annexe 1-C, Kuaishou)', confidence: 'high', lastVerified: '2026-02' },
      hands:         { score: 8,  basis: 'community', source: 'Reddit r/aivideo hand quality threads, generally positive for Kling', confidence: 'medium', lastVerified: '2025-01' },
      lipSync:       { score: 7,  basis: 'community', source: 'Lip-sync noted as good but not best — Veo and Sora preferred for dialogue', confidence: 'medium', lastVerified: '2025-02' },
      cameraControl: { score: 8,  basis: 'spec', source: 'Kling supports camera path input, confirmed via API docs', confidence: 'high', lastVerified: '2025-03' },
      lighting:      { score: 9,  basis: 'benchmark', source: 'Night/low-light comparisons favor Kling for realistic lighting', confidence: 'medium', lastVerified: '2025-01' },
      vfx:           { score: 7,  basis: 'estimated', source: 'Kling focuses on realism over VFX — not its primary use case', confidence: 'low', lastVerified: '2025-01' },
      consistency:   { score: 9,  basis: 'spec', source: 'Multi-shot natif : 6 changements de plans cohérents en 1 génération (Annexe 1-C)', confidence: 'high', lastVerified: '2026-02' },
      textRendering: { score: 5,  basis: 'community', source: 'Text in video remains weak across all models, Kling average', confidence: 'low', lastVerified: '2025-01' },
      styleRange:    { score: 7,  basis: 'estimated', source: 'Kling strong in photorealism, weaker for stylized/artistic', confidence: 'medium', lastVerified: '2025-01' },
      audioGen:      { score: 3,  basis: 'spec', source: 'Kling 3.0 has limited audio generation capabilities', confidence: 'medium', lastVerified: '2025-03' },
      speed:         { score: 6,  basis: 'community', source: 'Generation time ~2-4 min for 5s clip, moderate', confidence: 'medium', lastVerified: '2025-02' },
    }
  },
  'runway4.5': {
    modelId: 'runway4.5', modelName: 'Runway Gen-4.5',
    scores: {
      physics:       { score: 8,  basis: 'benchmark', source: 'Physics less realistic than Kling but solid — comparison videos', confidence: 'medium', lastVerified: '2025-02' },
      motion:        { score: 8,  basis: 'benchmark', source: 'Good motion but can artifact on fast movement', confidence: 'medium', lastVerified: '2025-02' },
      resolution:    { score: 9,  basis: 'spec', source: 'Runway supports up to 4K output (Gen-4+)', confidence: 'high', lastVerified: '2025-03' },
      hands:         { score: 7,  basis: 'community', source: 'Hands still problematic, similar to other models', confidence: 'medium', lastVerified: '2025-01' },
      lipSync:       { score: 8,  basis: 'benchmark', source: 'Gen-4 improved lip-sync significantly vs Gen-3', confidence: 'medium', lastVerified: '2025-02' },
      cameraControl: { score: 9,  basis: 'spec', source: 'Runway camera control is one of the best — official feature', confidence: 'high', lastVerified: '2025-03' },
      lighting:      { score: 9,  basis: 'benchmark', source: 'Runway excels at cinematic lighting and color grading', confidence: 'high', lastVerified: '2025-02' },
      vfx:           { score: 9,  basis: 'benchmark', source: 'Strong VFX capabilities — Runway marketed for creative professionals', confidence: 'high', lastVerified: '2025-02' },
      consistency:   { score: 7,  basis: 'community', source: 'Decent but character drift noted on longer sequences', confidence: 'medium', lastVerified: '2025-01' },
      textRendering: { score: 6,  basis: 'community', source: 'Slightly better than average for text in video', confidence: 'low', lastVerified: '2025-01' },
      styleRange:    { score: 10, basis: 'benchmark', source: 'Runway Gen-4.5 excels at diverse artistic styles — key differentiator', confidence: 'high', lastVerified: '2025-03' },
      audioGen:      { score: 5,  basis: 'spec', source: 'Limited built-in audio, relies on separate tools', confidence: 'medium', lastVerified: '2025-02' },
      speed:         { score: 7,  basis: 'community', source: 'Fast generation, well-optimized infrastructure', confidence: 'medium', lastVerified: '2025-02' },
    }
  },
  'sora2': {
    modelId: 'sora2', modelName: 'Sora 2 (OpenAI)',
    scores: {
      physics:       { score: 9,  basis: 'benchmark', source: 'Sora 2 significantly improved physics vs Sora 1 — comparisons show near-Kling quality', confidence: 'medium', lastVerified: '2025-03' },
      motion:        { score: 9,  basis: 'benchmark', source: 'Smooth motion, particularly for human movement', confidence: 'medium', lastVerified: '2025-02' },
      resolution:    { score: 10, basis: 'spec', source: 'OpenAI official: 1080p native, highest rated for clarity', confidence: 'high', lastVerified: '2025-03' },
      hands:         { score: 8,  basis: 'community', source: 'Improved hand rendering in Sora 2', confidence: 'medium', lastVerified: '2025-02' },
      lipSync:       { score: 9,  basis: 'benchmark', source: 'Strong dialogue performance — OpenAI focused on narrative use', confidence: 'medium', lastVerified: '2025-02' },
      cameraControl: { score: 8,  basis: 'community', source: 'Good but no explicit camera path API yet', confidence: 'medium', lastVerified: '2025-02' },
      lighting:      { score: 9,  basis: 'benchmark', source: 'Excellent cinematic lighting across scenarios', confidence: 'medium', lastVerified: '2025-02' },
      vfx:           { score: 10, basis: 'benchmark', source: 'Sora\'s VFX capabilities are widely regarded as industry-leading', confidence: 'high', lastVerified: '2025-03' },
      consistency:   { score: 9,  basis: 'community', source: 'Strong character consistency within clips', confidence: 'medium', lastVerified: '2025-02' },
      textRendering: { score: 8,  basis: 'benchmark', source: 'Best-in-class text rendering for AI video models', confidence: 'medium', lastVerified: '2025-02' },
      styleRange:    { score: 9,  basis: 'benchmark', source: 'Very versatile, handles multiple visual styles well', confidence: 'high', lastVerified: '2025-02' },
      audioGen:      { score: 7,  basis: 'spec', source: 'Sora 2 includes audio generation capabilities', confidence: 'medium', lastVerified: '2025-03' },
      speed:         { score: 5,  basis: 'community', source: 'Slower generation, limited availability, queue times', confidence: 'medium', lastVerified: '2025-02' },
    }
  },
  'veo3.1': {
    modelId: 'veo3.1', modelName: 'Veo 3.1 (Google DeepMind)',
    scores: {
      physics:       { score: 8,  basis: 'benchmark', source: 'Solid physics, Google benchmark papers', confidence: 'medium', lastVerified: '2025-02' },
      motion:        { score: 8,  basis: 'benchmark', source: 'Good motion quality, some artifacts on complex movements', confidence: 'medium', lastVerified: '2025-02' },
      resolution:    { score: 9,  basis: 'spec', source: 'Google official: up to 1080p', confidence: 'high', lastVerified: '2025-03' },
      hands:         { score: 7,  basis: 'community', source: 'Average hand quality', confidence: 'low', lastVerified: '2025-01' },
      lipSync:       { score: 10, basis: 'spec', source: 'Veo 3 launched with native lip-sync as key feature — Google I/O announcement', confidence: 'high', lastVerified: '2025-03' },
      cameraControl: { score: 7,  basis: 'community', source: 'Limited camera path control compared to Runway/Kling', confidence: 'medium', lastVerified: '2025-02' },
      lighting:      { score: 8,  basis: 'benchmark', source: 'Good lighting, slightly below Runway/Kling for cinematic', confidence: 'medium', lastVerified: '2025-01' },
      vfx:           { score: 7,  basis: 'estimated', source: 'Not VFX-focused, dialogue is priority', confidence: 'low', lastVerified: '2025-01' },
      consistency:   { score: 8,  basis: 'community', source: 'Good character consistency, benefits from Google\'s training data', confidence: 'medium', lastVerified: '2025-02' },
      textRendering: { score: 7,  basis: 'estimated', source: 'Average text rendering, no specific advantage', confidence: 'low', lastVerified: '2025-01' },
      styleRange:    { score: 8,  basis: 'benchmark', source: 'Versatile but strongest in photorealistic/documentary styles', confidence: 'medium', lastVerified: '2025-02' },
      audioGen:      { score: 9,  basis: 'spec', source: 'Veo 3 key feature: native audio/dialogue generation', confidence: 'high', lastVerified: '2025-03' },
      speed:         { score: 7,  basis: 'community', source: 'Reasonable speed via Google infrastructure', confidence: 'medium', lastVerified: '2025-02' },
    }
  },
  'seedance2': {
    modelId: 'seedance2', modelName: 'Seedance 2.0 (ByteDance)',
    scores: {
      physics:       { score: 9,  basis: 'benchmark', source: 'ByteDance Seed physics evaluations, Chrono-Magic-Bench compatible', confidence: 'medium', lastVerified: '2025-02' },
      motion:        { score: 10, basis: 'benchmark', source: 'Industry-leading motion quality — T2VBench temporal dynamics top performer', confidence: 'high', lastVerified: '2025-03' },
      resolution:    { score: 8,  basis: 'spec', source: '1080p output — seed.bytedance.com/en/seedance2_0', confidence: 'high', lastVerified: '2025-02' },
      hands:         { score: 6,  basis: 'community', source: 'Hands less focus, motion is priority', confidence: 'low', lastVerified: '2025-01' },
      lipSync:       { score: 7,  basis: 'spec', source: 'Architecture unifiée audio-vidéo conjointe — ByteDance Seed docs, lip-sync via audio natif', confidence: 'medium', lastVerified: '2025-03' },
      cameraControl: { score: 7,  basis: 'community', source: 'Decent camera control but not key feature', confidence: 'low', lastVerified: '2025-01' },
      lighting:      { score: 7,  basis: 'estimated', source: 'Adequate lighting, not differentiator', confidence: 'low', lastVerified: '2025-01' },
      vfx:           { score: 8,  basis: 'community', source: 'Good VFX through motion, particle effects', confidence: 'medium', lastVerified: '2025-02' },
      consistency:   { score: 8,  basis: 'spec', source: 'Capacités de référence multimodales — édition pour conserver identité entre plans (Seed docs)', confidence: 'medium', lastVerified: '2025-03' },
      textRendering: { score: 4,  basis: 'estimated', source: 'Below average text rendering', confidence: 'low', lastVerified: '2025-01' },
      styleRange:    { score: 7,  basis: 'estimated', source: 'Moderate style range', confidence: 'low', lastVerified: '2025-01' },
      audioGen:      { score: 7,  basis: 'spec', source: 'Architecture unifiée audio-vidéo conjointe, entrées texte/image/audio/vidéo — seed.bytedance.com/en/seedance2_0', confidence: 'high', lastVerified: '2025-03' },
      speed:         { score: 9,  basis: 'benchmark', source: 'Fastest model — ByteDance infrastructure optimized', confidence: 'high', lastVerified: '2025-02' },
    }
  },
  'wan2.5': {
    modelId: 'wan2.5', modelName: 'Wan 2.5 (Alibaba)',
    scores: {
      physics:       { score: 7,  basis: 'community', source: 'Open-source, community reports decent physics', confidence: 'medium', lastVerified: '2025-02' },
      motion:        { score: 9,  basis: 'benchmark', source: 'Strong motion, particularly for animation styles', confidence: 'medium', lastVerified: '2025-02' },
      resolution:    { score: 8,  basis: 'spec', source: '1080p, open-source model', confidence: 'high', lastVerified: '2025-02' },
      hands:         { score: 7,  basis: 'community', source: 'Average hand quality', confidence: 'low', lastVerified: '2025-01' },
      lipSync:       { score: 6,  basis: 'estimated', source: 'Not lip-sync focused', confidence: 'low', lastVerified: '2025-01' },
      cameraControl: { score: 9,  basis: 'spec', source: 'Strong camera control, supports camera path — key feature of Wan', confidence: 'high', lastVerified: '2025-02' },
      lighting:      { score: 8,  basis: 'community', source: 'Good lighting, versatile', confidence: 'medium', lastVerified: '2025-01' },
      vfx:           { score: 8,  basis: 'benchmark', source: 'Good VFX capabilities, particularly for animation', confidence: 'medium', lastVerified: '2025-02' },
      consistency:   { score: 7,  basis: 'community', source: 'Moderate consistency', confidence: 'low', lastVerified: '2025-01' },
      textRendering: { score: 5,  basis: 'estimated', source: 'Average text rendering', confidence: 'low', lastVerified: '2025-01' },
      styleRange:    { score: 9,  basis: 'benchmark', source: 'Excellent style range — animation to photorealism, open-source flexibility', confidence: 'medium', lastVerified: '2025-02' },
      audioGen:      { score: 3,  basis: 'spec', source: 'No built-in audio', confidence: 'high', lastVerified: '2025-02' },
      speed:         { score: 8,  basis: 'community', source: 'Fast locally, depends on hardware for open-source usage', confidence: 'medium', lastVerified: '2025-02' },
    }
  },
  'hailuo2.3': {
    modelId: 'hailuo2.3', modelName: 'Hailuo 2.3 (MiniMax)',
    scores: {
      physics:       { score: 7,  basis: 'community', source: 'Decent physics, not primary focus', confidence: 'medium', lastVerified: '2025-02' },
      motion:        { score: 7,  basis: 'community', source: 'Smooth but not exceptional motion', confidence: 'medium', lastVerified: '2025-01' },
      resolution:    { score: 8,  basis: 'spec', source: '1080p output, possible 720p on free tier', confidence: 'medium', lastVerified: '2025-02' },
      hands:         { score: 7,  basis: 'community', source: 'Average hand quality', confidence: 'low', lastVerified: '2025-01' },
      lipSync:       { score: 7,  basis: 'community', source: 'Decent lip-sync but below Veo/Sora', confidence: 'medium', lastVerified: '2025-01' },
      cameraControl: { score: 6,  basis: 'community', source: 'Limited camera control options', confidence: 'medium', lastVerified: '2025-01' },
      lighting:      { score: 7,  basis: 'estimated', source: 'Adequate lighting', confidence: 'low', lastVerified: '2025-01' },
      vfx:           { score: 6,  basis: 'estimated', source: 'Not VFX-focused', confidence: 'low', lastVerified: '2025-01' },
      consistency:   { score: 10, basis: 'benchmark', source: 'Industry-leading character consistency — MiniMax key differentiator, widely reported', confidence: 'high', lastVerified: '2025-03' },
      textRendering: { score: 5,  basis: 'estimated', source: 'Average text rendering', confidence: 'low', lastVerified: '2025-01' },
      styleRange:    { score: 7,  basis: 'community', source: 'Moderate style range, strongest in realistic/consistent output', confidence: 'medium', lastVerified: '2025-01' },
      audioGen:      { score: 4,  basis: 'community', source: 'Some audio capabilities reported', confidence: 'low', lastVerified: '2025-01' },
      speed:         { score: 7,  basis: 'community', source: 'Reasonable generation speed', confidence: 'medium', lastVerified: '2025-02' },
    }
  }
}

/** Statistiques de confiance globales */
export function getConfidenceStats() {
  let high = 0, medium = 0, low = 0, total = 0
  for (const model of Object.values(MODEL_SOURCES)) {
    for (const s of Object.values(model.scores)) {
      total++
      if (s.confidence === 'high') high++
      else if (s.confidence === 'medium') medium++
      else low++
    }
  }
  return {
    total,
    high, highPct: Math.round(high / total * 100),
    medium, mediumPct: Math.round(medium / total * 100),
    low, lowPct: Math.round(low / total * 100),
  }
}

/** Obtenir les sources pour un modèle spécifique */
export function getModelSources(modelId: string): ModelSources | null {
  return MODEL_SOURCES[modelId] || null
}

/** Obtenir la confiance d'une recommandation */
export function getRecommendationConfidence(modelId: string, relevantAxes: string[]): {
  overallConfidence: 'high' | 'medium' | 'low'
  details: Array<{ axis: string; confidence: string; source: string }>
} {
  const sources = MODEL_SOURCES[modelId]
  if (!sources) return { overallConfidence: 'low', details: [] }

  const details = relevantAxes.map(axis => {
    const s = sources.scores[axis]
    return {
      axis,
      confidence: s?.confidence || 'low',
      source: s?.source || 'Pas de source disponible',
    }
  })

  const confCounts = { high: 0, medium: 0, low: 0 }
  details.forEach(d => confCounts[d.confidence as keyof typeof confCounts]++)

  const overallConfidence = confCounts.high >= confCounts.medium && confCounts.high >= confCounts.low
    ? 'high'
    : confCounts.medium >= confCounts.low ? 'medium' : 'low'

  return { overallConfidence, details }
}
