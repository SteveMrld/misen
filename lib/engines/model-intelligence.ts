/**
 * MISEN V14.4 — Model Intelligence Engine
 * @description Système d'auto-update des scores MCAP.
 *   Interroge des sources crédibles (blogs officiels, arXiv, universités, benchmarks)
 *   via Claude API + web search, analyse les résultats, et propose des mises à jour
 *   des scores avec sources et justifications.
 *
 *   Sources de confiance (priorité décroissante) :
 *   Tier 1 — Blogs officiels des entreprises (Kling, Runway, OpenAI, Google DeepMind, ByteDance)
 *   Tier 2 — Publications académiques (arXiv, MIT, Stanford, Tsinghua, Shanghai AI Lab)
 *   Tier 3 — Benchmarks indépendants (Artificial Analysis, VBench, EvalCrafter, Papers With Code)
 *   Tier 4 — Presse spécialisée (The Verge, TechCrunch, VentureBeat)
 */

// ─── Types ───

export interface ModelUpdate {
  modelId: string
  modelName: string
  currentVersion: string
  detectedVersion: string | null
  changes: ScoreChange[]
  sources: SourceRef[]
  confidence: 'high' | 'medium' | 'low'
  summary: string
  timestamp: string
}

export interface ScoreChange {
  axis: string
  axisLabel: string
  currentScore: number
  proposedScore: number
  delta: number
  reason: string
  source: string
}

export interface SourceRef {
  url: string
  title: string
  tier: 1 | 2 | 3 | 4
  type: 'official_blog' | 'arxiv' | 'benchmark' | 'press' | 'university'
  date: string
  reliability: 'verified' | 'probable' | 'unverified'
}

export interface IntelligenceReport {
  generatedAt: string
  models: ModelUpdate[]
  newModelsDetected: string[]
  marketTrends: string[]
  nextCheckRecommended: string
}

// ─── Credible source queries per model ───

export const MODEL_SOURCES: Record<string, { officialBlog: string; searchQueries: string[] }> = {
  kling3: {
    officialBlog: 'klingai.com',
    searchQueries: [
      'Kling AI video model latest version 2026',
      'Kling AI benchmark comparison video generation',
      'Kuaishou Kling video model update',
    ],
  },
  'runway4.5': {
    officialBlog: 'research.runwayml.com',
    searchQueries: [
      'Runway Gen-5 video model release 2026',
      'Runway ML latest model update benchmark',
      'Runway video generation quality comparison',
    ],
  },
  sora2: {
    officialBlog: 'openai.com/research',
    searchQueries: [
      'OpenAI Sora latest update 2026',
      'Sora video model benchmark quality',
      'OpenAI Sora 2 capabilities comparison',
    ],
  },
  'veo3.1': {
    officialBlog: 'deepmind.google',
    searchQueries: [
      'Google Veo video model update 2026',
      'DeepMind Veo latest benchmark',
      'Google Veo 3 capabilities lip sync',
    ],
  },
  seedance2: {
    officialBlog: 'bytedance.com',
    searchQueries: [
      'ByteDance Seedance video model 2026',
      'Seedance AI video generation update',
      'ByteDance video AI model benchmark',
    ],
  },
  'wan2.5': {
    officialBlog: 'github.com/alibaba',
    searchQueries: [
      'Alibaba Wan video model update 2026',
      'Wan AI open source video generation',
      'Wan 2.5 model capabilities benchmark',
    ],
  },
  'hailuo2.3': {
    officialBlog: 'hailuoai.video',
    searchQueries: [
      'MiniMax Hailuo video model 2026',
      'Hailuo AI video latest version',
      'MiniMax video generation benchmark',
    ],
  },
}

// ─── General market intelligence queries ───

export const MARKET_QUERIES = [
  'best AI video generation models ranking 2026',
  'AI video model benchmark comparison 2026',
  'VBench video generation benchmark latest results',
  'arXiv video generation survey 2026',
  'new AI video model release 2026',
]

// ─── MCAP axes definitions ───

export const MCAP_AXES = [
  { id: 'resolution', label: 'Résolution max', prompt: 'maximum resolution output (720p, 1080p, 4K)' },
  { id: 'maxDuration', label: 'Durée max', prompt: 'maximum video duration in seconds' },
  { id: 'motion', label: 'Mouvement', prompt: 'motion quality, physics, fluid movement' },
  { id: 'physics', label: 'Physique', prompt: 'physics realism (gravity, fluid, cloth, hair)' },
  { id: 'hands', label: 'Mains', prompt: 'hand and finger rendering quality' },
  { id: 'lipSync', label: 'Lip-sync', prompt: 'lip sync quality for dialogue scenes' },
  { id: 'cameraControl', label: 'Contrôle caméra', prompt: 'camera movement control (pan, tilt, dolly, orbit)' },
  { id: 'lighting', label: 'Éclairage', prompt: 'lighting quality and control' },
  { id: 'vfx', label: 'VFX', prompt: 'visual effects quality (explosions, particles, magic)' },
  { id: 'consistency', label: 'Cohérence', prompt: 'temporal consistency across frames' },
  { id: 'textRendering', label: 'Texte', prompt: 'text rendering in video (logos, titles)' },
  { id: 'styleRange', label: 'Style', prompt: 'range of visual styles supported (photorealistic, anime, 3D)' },
  { id: 'audio', label: 'Audio', prompt: 'audio generation or synchronization capabilities' },
  { id: 'speed', label: 'Vitesse', prompt: 'generation speed (seconds to generate)' },
  { id: 'cost', label: 'Coût', prompt: 'cost per second of generated video' },
  { id: 'sovereignty', label: 'Souveraineté', prompt: 'data sovereignty and hosting location (US, EU, CN)' },
]

// ─── Build the Claude prompt for model analysis ───

export function buildIntelligencePrompt(modelId: string, modelName: string, currentScores: Record<string, number>): string {
  const axes = MCAP_AXES.map(a => `- ${a.label} (${a.id}): current score ${currentScores[a.id] || 0}/100 — evaluate: ${a.prompt}`).join('\n');

  return `You are an expert AI video model analyst. Research the current state of ${modelName} (model ID: ${modelId}) and evaluate its capabilities.

Current MCAP scores (0-100 each):
${axes}

Your task:
1. Search for the latest version, updates, and benchmark results for ${modelName}
2. Compare with independent benchmarks (VBench, Artificial Analysis, EvalCrafter)
3. For each axis where the score should change, provide:
   - The axis ID
   - Proposed new score (0-100)
   - Specific reason with data/benchmark reference
   - Source URL

Respond ONLY in this JSON format (no markdown, no backticks):
{
  "detectedVersion": "string or null",
  "changes": [
    { "axis": "axisId", "proposedScore": 85, "reason": "specific reason with data", "source": "URL" }
  ],
  "sources": [
    { "url": "string", "title": "string", "type": "official_blog|arxiv|benchmark|press", "date": "YYYY-MM-DD", "reliability": "verified|probable" }
  ],
  "summary": "2-3 sentence summary of model's current state",
  "newCompetitors": ["any new models detected that we should add"]
}

Only propose changes where the score should move by 5+ points. Be conservative — only change scores when you have clear evidence. Prefer official sources and peer-reviewed benchmarks.`;
}

// ─── Merge intelligence into current scores ───

export function applyUpdates(
  currentModels: any[],
  updates: ModelUpdate[],
  autoApproveThreshold: number = 0 // 0 = manual approval only, 70+ = auto-approve high confidence
): { updatedModels: any[]; pendingReview: ModelUpdate[] } {
  const pendingReview: ModelUpdate[] = [];
  const updatedModels = [...currentModels];

  for (const update of updates) {
    if (update.changes.length === 0) continue;

    const shouldAutoApprove = autoApproveThreshold > 0 && update.confidence === 'high';

    if (shouldAutoApprove) {
      // Apply changes directly
      const modelIdx = updatedModels.findIndex(m => m.id === update.modelId);
      if (modelIdx >= 0) {
        for (const change of update.changes) {
          if (updatedModels[modelIdx].scores?.[change.axis] !== undefined) {
            updatedModels[modelIdx].scores[change.axis] = change.proposedScore;
          }
        }
        if (update.detectedVersion) {
          updatedModels[modelIdx].version = update.detectedVersion;
        }
      }
    } else {
      pendingReview.push(update);
    }
  }

  return { updatedModels, pendingReview };
}
