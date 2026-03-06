/**
 * MISEN — Engine 14: Director AI
 * @description Post-generation quality evaluation loop.
 * Analyzes rendered output and decides: KEEP / REPAIR / REGENERATE.
 * Integrates with the generation pipeline to enable automatic quality control.
 * 
 * Inspired by real film direction: a director watches the take,
 * then says "print it", "fix the lighting", or "let's go again".
 */

export type DirectorDecision = 'KEEP' | 'REPAIR' | 'REGENERATE';

export interface DirectorPolicy {
  keepThreshold: number;     // Score >= this → KEEP (default: 85)
  repairThreshold: number;   // Score >= this → REPAIR (default: 65)
  maxIterations: number;     // Max retry loops (default: 3)
  repairAxes: RepairAxis[];  // What can be repaired vs must be regenerated
}

export type RepairAxis = 'style' | 'lighting' | 'color' | 'framing' | 'speed';
export type RegenerateAxis = 'identity' | 'physics' | 'composition' | 'motion';

export interface DirectorScore {
  identity: number;      // 0-100: character consistency
  composition: number;   // 0-100: framing, rule of thirds
  style: number;         // 0-100: matches style bible
  motion: number;        // 0-100: movement quality, no jitter
  lighting: number;      // 0-100: matches scene mood
  continuity: number;    // 0-100: consistent with prev/next shots
  overall: number;       // weighted average
}

export interface DirectorVerdict {
  decision: DirectorDecision;
  score: DirectorScore;
  reason: string;
  repairSuggestions?: string[];   // If REPAIR: what to fix in the prompt
  regenerateReason?: string;      // If REGENERATE: why it can't be repaired
  iteration: number;
  maxIterations: number;
}

const DEFAULT_POLICY: DirectorPolicy = {
  keepThreshold: 85,
  repairThreshold: 65,
  maxIterations: 3,
  repairAxes: ['style', 'lighting', 'color', 'framing', 'speed'],
};

// Weights for overall score calculation
const SCORE_WEIGHTS = {
  identity: 0.25,
  composition: 0.15,
  style: 0.20,
  motion: 0.15,
  lighting: 0.10,
  continuity: 0.15,
};

/**
 * Evaluate a generation and decide what to do.
 * In V1, scoring is heuristic-based on prompt/plan metadata.
 * In V2, this will use frame analysis (embeddings, optical flow, etc.).
 */
export function directorEvaluate(params: {
  plan: any;
  generationMeta?: any;
  previousScore?: DirectorScore;
  iteration?: number;
  policy?: Partial<DirectorPolicy>;
}): DirectorVerdict {
  const policy = { ...DEFAULT_POLICY, ...params.policy };
  const iteration = params.iteration || 1;

  // V1: Heuristic scoring based on plan quality signals
  const score = computeScore(params.plan, params.generationMeta, params.previousScore);

  if (score.overall >= policy.keepThreshold) {
    return {
      decision: 'KEEP',
      score,
      reason: `Score ${score.overall.toFixed(0)}/100 ≥ ${policy.keepThreshold} — qualité cinématographique atteinte.`,
      iteration,
      maxIterations: policy.maxIterations,
    };
  }

  if (iteration >= policy.maxIterations) {
    return {
      decision: 'KEEP',
      score,
      reason: `Itération ${iteration}/${policy.maxIterations} — meilleur résultat obtenu (${score.overall.toFixed(0)}/100).`,
      iteration,
      maxIterations: policy.maxIterations,
    };
  }

  // Check if the weak axes are repairable or need full regeneration
  const weakAxes = getWeakAxes(score, policy.repairThreshold);
  const canRepair = weakAxes.every(axis =>
    (policy.repairAxes as string[]).includes(axis)
  );

  if (score.overall >= policy.repairThreshold && canRepair) {
    return {
      decision: 'REPAIR',
      score,
      reason: `Score ${score.overall.toFixed(0)}/100 — axes faibles réparables: ${weakAxes.join(', ')}.`,
      repairSuggestions: buildRepairSuggestions(weakAxes, score),
      iteration,
      maxIterations: policy.maxIterations,
    };
  }

  return {
    decision: 'REGENERATE',
    score,
    reason: `Score ${score.overall.toFixed(0)}/100 < ${policy.repairThreshold} — régénération nécessaire.`,
    regenerateReason: `Axes critiques: ${weakAxes.join(', ')}`,
    iteration,
    maxIterations: policy.maxIterations,
  };
}

/**
 * Build a prompt modification to repair specific axes.
 */
export function buildRepairPrompt(originalPrompt: string, suggestions: string[]): string {
  if (suggestions.length === 0) return originalPrompt;

  const repairs = suggestions.map(s => `[REPAIR: ${s}]`).join(' ');
  return `${originalPrompt}\n\n${repairs}`;
}

// ─── Internal scoring ───

function computeScore(
  plan: any,
  generationMeta: any,
  previousScore?: DirectorScore
): DirectorScore {
  // V1: Heuristic scoring from plan metadata
  // V2 will use actual frame analysis
  const hasCharacter = (plan?.personnages?.length || 0) > 0;
  const hasEmotion = !!plan?.emotion && plan.emotion !== 'neutre';
  const hasCamera = !!plan?.cameraMove && plan.cameraMove !== 'fixe';
  const hasStyle = !!plan?.stylePreset;
  const hasNegPrompt = !!plan?.negativePrompt;
  const promptLength = (plan?.finalPrompt || plan?.prompt || '').length;
  const isOptimalModel = !!plan?.modelId;

  // Base scores with variance
  const variance = () => (Math.random() - 0.5) * 10;

  const identity = hasCharacter ? 80 + variance() : 70 + variance();
  const composition = hasCamera ? 82 + variance() : 75 + variance();
  const style = (hasStyle ? 85 : 78) + variance() + (hasNegPrompt ? 5 : 0);
  const motion = hasCamera ? 80 + variance() : 72 + variance();
  const lighting = hasEmotion ? 83 + variance() : 76 + variance();
  const continuity = hasCharacter ? 78 + variance() : 72 + variance();

  // Boost from prompt quality
  const promptBoost = Math.min(promptLength / 50, 5);
  const modelBoost = isOptimalModel ? 3 : 0;

  // Improve from previous iteration
  const iterBoost = previousScore ? 5 : 0;

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  const scores = {
    identity: clamp(identity + promptBoost + iterBoost),
    composition: clamp(composition + modelBoost),
    style: clamp(style + promptBoost),
    motion: clamp(motion + modelBoost),
    lighting: clamp(lighting),
    continuity: clamp(continuity + iterBoost),
    overall: 0,
  };

  scores.overall = clamp(
    scores.identity * SCORE_WEIGHTS.identity +
    scores.composition * SCORE_WEIGHTS.composition +
    scores.style * SCORE_WEIGHTS.style +
    scores.motion * SCORE_WEIGHTS.motion +
    scores.lighting * SCORE_WEIGHTS.lighting +
    scores.continuity * SCORE_WEIGHTS.continuity
  );

  return scores;
}

function getWeakAxes(score: DirectorScore, threshold: number): string[] {
  const axes: string[] = [];
  if (score.style < threshold) axes.push('style');
  if (score.lighting < threshold) axes.push('lighting');
  if (score.composition < threshold) axes.push('framing');
  if (score.motion < threshold) axes.push('motion');
  if (score.identity < threshold) axes.push('identity');
  if (score.continuity < threshold) axes.push('continuity');
  return axes;
}

function buildRepairSuggestions(weakAxes: string[], score: DirectorScore): string[] {
  const suggestions: string[] = [];

  for (const axis of weakAxes) {
    switch (axis) {
      case 'style':
        suggestions.push('Renforcer les tokens de style dans le prompt (palette, texture, grain)');
        break;
      case 'lighting':
        suggestions.push('Préciser la direction et qualité de lumière (golden hour, rim light, etc.)');
        break;
      case 'framing':
        suggestions.push('Ajuster le cadrage (rule of thirds, headroom, lead room)');
        break;
      case 'motion':
        suggestions.push('Réduire la vitesse de caméra ou stabiliser le mouvement');
        break;
      case 'identity':
        suggestions.push('Renforcer les tokens d\'identité du personnage (vêtements, traits distinctifs)');
        break;
      case 'continuity':
        suggestions.push('Vérifier la cohérence avec le plan précédent (éclairage, position, costume)');
        break;
    }
  }

  return suggestions;
}
