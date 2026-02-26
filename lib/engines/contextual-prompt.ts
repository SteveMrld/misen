/**
 * MISEN V7 — Engine 4: Contextual Prompt
 * @description Génère le prompt de base pour un plan avec continuité visuelle
 *   inter-plans (éclairage, costumes, météo, mouvement).
 * @origin V4 — Migré V6→V7
 */

import type {
  ParsedScene, Plan, Emotion, ContextualPromptResult,
  ShotType, CameraMove, LightingStyle,
} from '../../types/engines';

interface ContextualPromptInput {
  plan: Partial<Plan>;
  scene: ParsedScene;
  planIndex: number;
  totalPlans: number;
  previousPlan?: Partial<Plan>;
  memory?: { costume?: string; blessure?: string; position?: string };
}

/** Mapping émotion → tokens visuels */
const EMOTION_VISUAL_TOKENS: Record<Emotion, string[]> = {
  tension: ['dramatic lighting', 'sharp shadows', 'uneasy atmosphere'],
  tristesse: ['muted colors', 'soft light', 'melancholic atmosphere', 'desaturated'],
  colere: ['harsh lighting', 'red tones', 'aggressive framing', 'high contrast'],
  joie: ['warm golden light', 'bright colors', 'open framing', 'natural sunlight'],
  peur: ['dark shadows', 'low key lighting', 'ominous atmosphere', 'cold tones'],
  nostalgie: ['soft focus', 'warm sepia tones', 'golden hour light', 'dreamy haze'],
  amour: ['soft warm light', 'shallow depth of field', 'intimate framing', 'gentle bokeh'],
  mystere: ['fog', 'silhouettes', 'chiaroscuro', 'partial visibility', 'dim light'],
  determination: ['strong backlighting', 'dynamic angle', 'powerful stance', 'bold contrast'],
  neutre: ['natural lighting', 'neutral tones'],
};

/** Mapping cadrage → description anglaise */
const SHOT_DESCRIPTIONS: Record<ShotType, string> = {
  TGP: 'extreme close-up',
  GP: 'close-up',
  PR: 'medium close-up',
  PM: 'medium shot',
  PA: 'american shot',
  PE: 'wide shot',
  PG: 'extreme wide shot',
  INSERT: 'insert shot',
};

/** Mapping mouvement caméra → token */
const CAMERA_TOKENS: Record<CameraMove, string> = {
  fixe: 'static camera',
  travelling: 'tracking shot',
  panoramique: 'pan shot',
  dolly: 'dolly shot',
  steadicam: 'steadicam smooth movement',
  drone: 'aerial drone shot',
  handheld: 'handheld camera',
  crane: 'crane shot',
  zoom: 'zoom',
};

/** Mapping éclairage → token */
const LIGHTING_TOKENS: Record<LightingStyle, string> = {
  naturel: 'natural lighting',
  'clair-obscur': 'chiaroscuro lighting',
  'high-key': 'high-key bright lighting',
  'low-key': 'low-key dramatic lighting',
  neon: 'neon lighting',
  'golden-hour': 'golden hour warm light',
  'blue-hour': 'blue hour cool light',
  fluorescent: 'fluorescent harsh light',
  bougie: 'candlelight warm glow',
};

/**
 * Génère un prompt de base contextualisé pour un plan.
 */
export function contextualPrompt(input: ContextualPromptInput): ContextualPromptResult {
  const { plan, scene, planIndex, totalPlans, previousPlan, memory } = input;

  const emotion = plan.emotion || 'neutre';
  const cadrage = plan.cadrage || 'PM';
  const camera = plan.camera || 'fixe';
  const eclairage = plan.eclairage || 'naturel';

  // ─── Description de base ───
  const parts: string[] = [];

  // Cadrage
  parts.push(SHOT_DESCRIPTIONS[cadrage]);

  // Personnages
  if (plan.personnages && plan.personnages.length > 0) {
    parts.push(`of ${plan.personnages.join(' and ')}`);
  }

  // Description du plan
  if (plan.description) {
    parts.push(plan.description);
  }

  // Dialogue (si présent)
  if (plan.dialogue) {
    parts.push(`speaking: "${plan.dialogue.texte.substring(0, 80)}"`);
  }

  // Lieu
  if (scene.lieu) {
    parts.push(`in ${scene.lieu}`);
  }

  // Moment
  if (scene.moment) {
    parts.push(scene.moment.toLowerCase());
  }

  // Caméra
  parts.push(CAMERA_TOKENS[camera]);

  // Éclairage
  parts.push(LIGHTING_TOKENS[eclairage]);

  const basePrompt = parts.join(', ');

  // ─── Tokens visuels d'émotion ───
  const moodTokens = EMOTION_VISUAL_TOKENS[emotion] || [];

  // ─── Continuité visuelle ───
  const visualContinuity: string[] = [];
  if (previousPlan) {
    if (previousPlan.eclairage && previousPlan.eclairage === eclairage) {
      visualContinuity.push(`consistent ${LIGHTING_TOKENS[eclairage]}`);
    }
    if (previousPlan.personnages?.some(p => plan.personnages?.includes(p))) {
      visualContinuity.push('same character appearance as previous shot');
    }
  }

  // Mémoire personnage
  if (memory) {
    if (memory.costume) visualContinuity.push(`wearing ${memory.costume}`);
    if (memory.blessure) visualContinuity.push(`visible ${memory.blessure}`);
  }

  // ─── Environnement ───
  const environmentTokens: string[] = [];
  const contenuLower = (scene.contenu || []).join(' ').toLowerCase();
  if (contenuLower.includes('pluie') || contenuLower.includes('orage')) environmentTokens.push('rain, wet surfaces');
  if (contenuLower.includes('neige')) environmentTokens.push('snow, cold breath');
  if (contenuLower.includes('nuit') || scene.moment?.toLowerCase().includes('nuit')) environmentTokens.push('night time, dark environment');
  if (scene.type === 'EXT') environmentTokens.push('outdoor environment');
  if (scene.type === 'INT') environmentTokens.push('indoor environment');

  // ─── Note de transition ───
  let transitionNote = '';
  if (planIndex === 0) {
    transitionNote = scene.isFlashback ? 'FONDU ENCHAÎNÉ (entrée flashback)' : 'CUT — Ouverture scène';
  } else if (planIndex === totalPlans - 1) {
    transitionNote = scene.isFlashback ? 'FONDU ENCHAÎNÉ (sortie flashback)' : 'CUT — Fin de scène';
  } else if (plan.dialogue && !previousPlan?.dialogue) {
    transitionNote = 'CUT — Entrée dialogue';
  } else {
    transitionNote = 'CUT';
  }

  return { basePrompt, visualContinuity, environmentTokens, moodTokens, transitionNote };
}
