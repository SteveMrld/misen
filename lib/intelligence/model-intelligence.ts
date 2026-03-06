/**
 * MISEN V14.4 — Model Intelligence Engine
 * @description Système autonome de veille et mise à jour des scores MCAP.
 *   
 *   1. MONITOR : Interroge Claude + web search pour détecter les updates
 *      de chaque modèle IA (nouvelles versions, benchmarks, pricing).
 *   2. ANALYZE : Compare les capacités annoncées aux scores MCAP actuels.
 *   3. UPDATE : Propose et applique automatiquement les mises à jour.
 *   4. LOG : Historique complet des changements dans Supabase.
 *
 *   Exécution : Vercel Cron (hebdomadaire) ou manuelle via /api/admin/model-intelligence
 */

export interface ModelIntelligenceReport {
  timestamp: string
  modelsScanned: number
  updatesFound: ModelUpdate[]
  updatesApplied: ModelUpdate[]
  errors: string[]
  nextScanRecommended: string
}

export interface ModelUpdate {
  modelId: string
  modelName: string
  field: string          // 'version' | 'resolution' | 'maxDuration' | 'lipSync' | etc.
  oldValue: string | number
  newValue: string | number
  confidence: 'high' | 'medium' | 'low'
  source: string         // URL or description of source
  reason: string         // Why this update
  autoApplied: boolean
}

export interface MCAPScoreRow {
  model_id: string
  model_name: string
  version: string
  provider: string
  scores: Record<string, number>  // 16 MCAP axes
  metadata: {
    maxResolution: string
    maxDuration: number
    pricing: string
    releaseDate: string
    lastChecked: string
    sources: string[]
  }
}

// The 16 MCAP axes
export const MCAP_AXES = [
  'resolution', 'maxDuration', 'movement', 'physics', 'hands',
  'lipSync', 'cameraControl', 'lighting', 'vfx', 'consistency',
  'textRendering', 'styleRange', 'audio', 'speed', 'cost', 'sovereignty'
] as const;

export type MCAPAxis = typeof MCAP_AXES[number];

// Current hardcoded models (will be migrated to Supabase)
export const CURRENT_MODELS: MCAPScoreRow[] = [
  {
    model_id: 'kling3', model_name: 'Kling', version: '3.0', provider: 'Kuaishou',
    scores: { resolution: 95, maxDuration: 85, movement: 95, physics: 93, hands: 82, lipSync: 70, cameraControl: 90, lighting: 88, vfx: 80, consistency: 90, textRendering: 60, styleRange: 75, audio: 40, speed: 70, cost: 65, sovereignty: 30 },
    metadata: { maxResolution: '4K', maxDuration: 10, pricing: '~$0.10/10s', releaseDate: '2025-01', lastChecked: '', sources: [] },
  },
  {
    model_id: 'runway4.5', model_name: 'Runway', version: 'Gen-4.5', provider: 'Runway AI',
    scores: { resolution: 88, maxDuration: 80, movement: 85, physics: 78, hands: 75, lipSync: 65, cameraControl: 92, lighting: 90, vfx: 85, consistency: 85, textRendering: 70, styleRange: 95, audio: 35, speed: 85, cost: 55, sovereignty: 80 },
    metadata: { maxResolution: '4K', maxDuration: 10, pricing: '~$0.05/5s', releaseDate: '2025-03', lastChecked: '', sources: [] },
  },
  {
    model_id: 'sora2', model_name: 'Sora', version: '2', provider: 'OpenAI',
    scores: { resolution: 90, maxDuration: 90, movement: 88, physics: 85, hands: 78, lipSync: 72, cameraControl: 85, lighting: 82, vfx: 95, consistency: 88, textRendering: 80, styleRange: 88, audio: 50, speed: 60, cost: 40, sovereignty: 70 },
    metadata: { maxResolution: '4K', maxDuration: 20, pricing: '~$0.15/10s', releaseDate: '2024-12', lastChecked: '', sources: [] },
  },
  {
    model_id: 'veo3.1', model_name: 'Veo', version: '3.1', provider: 'Google DeepMind',
    scores: { resolution: 90, maxDuration: 85, movement: 82, physics: 80, hands: 72, lipSync: 95, cameraControl: 78, lighting: 85, vfx: 75, consistency: 85, textRendering: 85, styleRange: 80, audio: 90, speed: 65, cost: 50, sovereignty: 75 },
    metadata: { maxResolution: '4K', maxDuration: 8, pricing: '~$0.08/8s', releaseDate: '2025-02', lastChecked: '', sources: [] },
  },
  {
    model_id: 'seedance2', model_name: 'Seedance', version: '2.0', provider: 'ByteDance',
    scores: { resolution: 82, maxDuration: 75, movement: 90, physics: 85, hands: 70, lipSync: 60, cameraControl: 75, lighting: 78, vfx: 70, consistency: 80, textRendering: 55, styleRange: 70, audio: 80, speed: 75, cost: 70, sovereignty: 25 },
    metadata: { maxResolution: '1080p', maxDuration: 8, pricing: '~$0.05/5s', releaseDate: '2025-01', lastChecked: '', sources: [] },
  },
  {
    model_id: 'wan2.5', model_name: 'Wan', version: '2.5', provider: 'Alibaba',
    scores: { resolution: 80, maxDuration: 70, movement: 85, physics: 78, hands: 68, lipSync: 55, cameraControl: 82, lighting: 75, vfx: 65, consistency: 78, textRendering: 50, styleRange: 85, audio: 30, speed: 80, cost: 85, sovereignty: 20 },
    metadata: { maxResolution: '1080p', maxDuration: 5, pricing: '~$0.02/5s', releaseDate: '2025-02', lastChecked: '', sources: [] },
  },
  {
    model_id: 'hailuo2.3', model_name: 'Hailuo', version: '2.3', provider: 'MiniMax',
    scores: { resolution: 78, maxDuration: 80, movement: 78, physics: 72, hands: 65, lipSync: 58, cameraControl: 70, lighting: 72, vfx: 60, consistency: 88, textRendering: 45, styleRange: 65, audio: 35, speed: 78, cost: 75, sovereignty: 25 },
    metadata: { maxResolution: '1080p', maxDuration: 10, pricing: '~$0.03/5s', releaseDate: '2025-01', lastChecked: '', sources: [] },
  },
];

/**
 * Build the Claude prompt for model intelligence scanning.
 * Claude will use web_search to find the latest info.
 */
export function buildIntelligencePrompt(models: MCAPScoreRow[]): string {
  const modelList = models.map(m =>
    `- ${m.model_name} ${m.version} (${m.provider}): current scores — resolution:${m.scores.resolution}, movement:${m.scores.movement}, physics:${m.scores.physics}, lipSync:${m.scores.lipSync}, vfx:${m.scores.vfx}, consistency:${m.scores.consistency}, speed:${m.scores.speed}, cost:${m.scores.cost}`
  ).join('\n');

  return `You are MISEN's Model Intelligence Engine. Your job is to scan the latest information about AI video generation models and update their performance scores.

CURRENT MODELS AND SCORES (scale 0-100):
${modelList}

THE 16 MCAP AXES:
resolution, maxDuration, movement, physics, hands, lipSync, cameraControl, lighting, vfx, consistency, textRendering, styleRange, audio, speed, cost, sovereignty

YOUR TASK:
1. Search for the latest news, updates, benchmarks, and announcements for EACH of these models.
2. Search for any NEW models that should be added (e.g. new versions, completely new players).
3. For each model, determine if any scores need updating based on new capabilities.
4. Also check for pricing changes.

RESPOND WITH ONLY a JSON object (no markdown, no backticks, no explanation):
{
  "scan_date": "ISO date",
  "updates": [
    {
      "model_id": "kling3",
      "model_name": "Kling",
      "changes": [
        { "field": "version", "old": "3.0", "new": "3.5", "confidence": "high", "source": "URL", "reason": "New version announced" },
        { "field": "scores.resolution", "old": 95, "new": 98, "confidence": "medium", "source": "URL", "reason": "Now supports 8K" }
      ]
    }
  ],
  "new_models": [
    {
      "model_id": "suggested_id",
      "model_name": "Name",
      "version": "1.0",
      "provider": "Company",
      "scores": { "resolution": 85, ... },
      "confidence": "medium",
      "source": "URL",
      "reason": "Why add this model"
    }
  ],
  "market_insights": "Brief 2-3 sentence summary of the current AI video market state",
  "next_scan_recommended": "ISO date (suggest when to scan again based on market activity)"
}

If you find no changes, return empty arrays for updates and new_models. Always include market_insights.
Be conservative with score changes — only propose changes you're confident about based on real evidence.`;
}

/**
 * Parse Claude's response and extract updates
 */
export function parseIntelligenceResponse(response: string, currentModels: MCAPScoreRow[]): ModelIntelligenceReport {
  const now = new Date().toISOString();
  const report: ModelIntelligenceReport = {
    timestamp: now,
    modelsScanned: currentModels.length,
    updatesFound: [],
    updatesApplied: [],
    errors: [],
    nextScanRecommended: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  try {
    // Clean response — remove markdown fences if present
    let cleaned = response.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }

    const data = JSON.parse(cleaned);

    if (data.next_scan_recommended) {
      report.nextScanRecommended = data.next_scan_recommended;
    }

    // Process updates
    if (data.updates && Array.isArray(data.updates)) {
      for (const modelUpdate of data.updates) {
        if (!modelUpdate.changes || !Array.isArray(modelUpdate.changes)) continue;

        for (const change of modelUpdate.changes) {
          const update: ModelUpdate = {
            modelId: modelUpdate.model_id,
            modelName: modelUpdate.model_name,
            field: change.field,
            oldValue: change.old,
            newValue: change.new,
            confidence: change.confidence || 'medium',
            source: change.source || 'Claude web search',
            reason: change.reason || '',
            autoApplied: change.confidence === 'high',
          };

          report.updatesFound.push(update);

          // Auto-apply high confidence updates
          if (update.confidence === 'high') {
            report.updatesApplied.push(update);
          }
        }
      }
    }

    // Process new models
    if (data.new_models && Array.isArray(data.new_models)) {
      for (const newModel of data.new_models) {
        report.updatesFound.push({
          modelId: newModel.model_id,
          modelName: newModel.model_name,
          field: 'NEW_MODEL',
          oldValue: 'N/A',
          newValue: newModel.version,
          confidence: newModel.confidence || 'medium',
          source: newModel.source || '',
          reason: newModel.reason || `New model: ${newModel.model_name}`,
          autoApplied: false, // New models always require manual validation
        });
      }
    }

    // Store market insights
    if (data.market_insights) {
      report.errors.push(`INSIGHT: ${data.market_insights}`);
    }

  } catch (e: any) {
    report.errors.push(`Parse error: ${e.message}`);
  }

  return report;
}

/**
 * Apply score updates to model data
 */
export function applyUpdates(
  currentModels: MCAPScoreRow[],
  updates: ModelUpdate[]
): MCAPScoreRow[] {
  const updated = JSON.parse(JSON.stringify(currentModels)) as MCAPScoreRow[];

  for (const update of updates) {
    if (!update.autoApplied) continue;

    const model = updated.find(m => m.model_id === update.modelId);
    if (!model) continue;

    if (update.field === 'version') {
      model.version = String(update.newValue);
    } else if (update.field.startsWith('scores.')) {
      const axis = update.field.replace('scores.', '') as MCAPAxis;
      if (MCAP_AXES.includes(axis)) {
        model.scores[axis] = Number(update.newValue);
      }
    } else if (update.field.startsWith('metadata.')) {
      const key = update.field.replace('metadata.', '');
      (model.metadata as any)[key] = update.newValue;
    }

    model.metadata.lastChecked = new Date().toISOString();
    if (update.source && !model.metadata.sources.includes(update.source)) {
      model.metadata.sources.push(update.source);
    }
  }

  return updated;
}
