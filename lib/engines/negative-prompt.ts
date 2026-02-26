/**
 * MISEN V7 — Engine 12: Negative Prompt Engine
 * @description Anti-tokens contextualisés par modèle (close-up, nuit, dialogue, mouvement)
 *   + défaut par modèle.
 * @origin V5 — Migré V6→V7
 */

import type { AIModelId, NegativePromptResult, ShotType, Emotion } from '../../types/engines';
import { AI_MODELS } from '../models/ai-models';

interface NegativePromptInput {
  modelId: AIModelId;
  cadrage: ShotType;
  emotion: Emotion;
  hasDialogue: boolean;
  isNight: boolean;
  hasMovement: boolean;
  styleBibleTokens?: string;
}

/** Tokens négatifs par défaut pour chaque modèle */
const MODEL_DEFAULTS: Record<AIModelId, string[]> = {
  'kling3': ['blurry', 'low quality', 'distorted', 'watermark', 'text overlay', 'cartoon', 'anime'],
  'runway4.5': ['blurry', 'pixelated', 'text', 'watermark', 'distorted faces', 'bad anatomy'],
  'sora2': ['blurry', 'low resolution', 'artifacts', 'watermark', 'deformed', 'ugly'],
  'veo3.1': ['blurry', 'silent', 'no audio', 'distorted', 'watermark', 'low quality'],
  'seedance2': ['static', 'frozen', 'blurry', 'watermark', 'text', 'low quality'],
  'wan2.5': ['blurry', 'low quality', 'watermark', 'text overlay', 'distorted'],
  'hailuo2.3': ['inconsistent character', 'changing appearance', 'blurry', 'watermark', 'low quality'],
};

/** Tokens négatifs contextuels */
const CONTEXT_NEGATIVES: Record<string, string[]> = {
  closeup: ['bad teeth', 'crossed eyes', 'extra fingers', 'deformed hands', 'asymmetric face'],
  night: ['overexposed', 'bright daylight', 'flat lighting', 'washed out'],
  dialogue: ['closed mouth when speaking', 'wrong lip movement', 'frozen face', 'no expression'],
  movement: ['static pose', 'frozen', 'rigid body', 'no motion blur'],
  tension: ['smiling', 'happy expression', 'relaxed pose', 'bright cheerful colors'],
  colere: ['calm expression', 'smiling', 'peaceful', 'soft colors'],
  joie: ['sad expression', 'dark mood', 'crying', 'gloomy'],
  tristesse: ['laughing', 'bright', 'energetic', 'cheerful'],
  peur: ['confident expression', 'relaxed', 'bright lighting', 'safe feeling'],
};

/**
 * Génère les anti-tokens négatifs pour un plan.
 */
export function negativePromptEngine(input: NegativePromptInput): NegativePromptResult {
  const { modelId, cadrage, emotion, hasDialogue, isNight, hasMovement } = input;
  const model = AI_MODELS[modelId];

  const modelDefaults = MODEL_DEFAULTS[modelId] || [];
  const contextualTokens: string[] = [];

  // Contexte cadrage
  if (['GP', 'TGP', 'PR'].includes(cadrage)) {
    contextualTokens.push(...(CONTEXT_NEGATIVES.closeup || []));
  }

  // Contexte nuit
  if (isNight) {
    contextualTokens.push(...(CONTEXT_NEGATIVES.night || []));
  }

  // Contexte dialogue
  if (hasDialogue) {
    contextualTokens.push(...(CONTEXT_NEGATIVES.dialogue || []));
  }

  // Contexte mouvement
  if (hasMovement) {
    contextualTokens.push(...(CONTEXT_NEGATIVES.movement || []));
  }

  // Contexte émotion (anti-émotion)
  if (CONTEXT_NEGATIVES[emotion]) {
    contextualTokens.push(...CONTEXT_NEGATIVES[emotion]);
  }

  // Dédupliquer
  const allTokens = [...new Set([...modelDefaults, ...contextualTokens])];

  // Formater selon le préfixe négatif du modèle
  let negativePrompt: string;
  if (model.negativePrefix) {
    negativePrompt = `${model.negativePrefix} ${allTokens.join(', ')}`;
  } else {
    // Modèles sans support négatif explicite — on les inclut en commentaire
    negativePrompt = allTokens.join(', ');
  }

  return { negativePrompt, modelDefaults, contextualTokens };
}
