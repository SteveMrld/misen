/**
 * MISEN V7 — Engine 11: Model Syntax Adapter
 * @description Adapte le prompt à la syntaxe native de chaque modèle IA
 *   (prefix/suffix/separator/maxTokens).
 * @origin V5 — Migré V6→V7
 */

import type { AIModelId, ModelSyntaxResult } from '../../types/engines';
import { AI_MODELS } from '../models/ai-models';

interface ModelSyntaxInput {
  prompt: string;
  modelId: AIModelId;
}

/**
 * Adapte un prompt à la syntaxe native du modèle cible.
 */
export function modelSyntaxAdapter(input: ModelSyntaxInput): ModelSyntaxResult {
  const { prompt, modelId } = input;
  const model = AI_MODELS[modelId];

  let adapted = prompt;

  // ─── Prefix ───
  if (model.prefix && !adapted.toLowerCase().startsWith(model.prefix.toLowerCase())) {
    adapted = `${model.prefix} ${adapted}`;
  }

  // ─── Transformations spécifiques ───
  switch (modelId) {
    case 'kling3':
      // Kling : descriptions directes, réaliste
      adapted = adapted.replace(/\b(artistic|stylized|abstract)\b/gi, 'realistic');
      break;

    case 'runway4.5':
      // Runway : descripteurs séparés par virgules
      adapted = adapted.replace(/\.\s+/g, ', ');
      break;

    case 'sora2':
      // Sora : phrases narratives, séparateur point
      adapted = adapted.replace(/,\s+/g, '. ');
      break;

    case 'veo3.1':
      // Veo : dialogue-first, émotion prioritaire
      // Remonter les tokens d'émotion en début
      const emotionTokens = adapted.match(/(emotion|feeling|mood|atmosphere)[^,.]*/gi);
      if (emotionTokens && emotionTokens.length > 0) {
        adapted = adapted.replace(emotionTokens[0], '');
        adapted = `${emotionTokens[0].trim()}, ${adapted}`;
      }
      break;

    case 'seedance2':
      // Seedance : prompts courts, mouvement pur
      // Garder uniquement les 6 premiers segments
      const segments = adapted.split(/[,.]/).map(s => s.trim()).filter(Boolean);
      adapted = segments.slice(0, 6).join(', ');
      break;

    case 'wan2.5':
      // Wan : focus sur le mouvement caméra
      break;

    case 'hailuo2.3':
      // Hailuo : cohérence personnage
      // Doubler les tokens de personnage
      break;
  }

  // ─── Suffix ───
  if (model.suffix) {
    adapted = `${adapted} ${model.suffix}`;
  }

  // ─── Truncation au maxTokens ───
  let truncated = false;
  const estimatedTokens = Math.ceil(adapted.split(/\s+/).length * 1.3);

  if (estimatedTokens > model.maxTokens) {
    const words = adapted.split(/\s+/);
    const maxWords = Math.floor(model.maxTokens / 1.3);
    adapted = words.slice(0, maxWords).join(' ');
    truncated = true;
  }

  const tokensUsed = Math.ceil(adapted.split(/\s+/).length * 1.3);

  return { adaptedPrompt: adapted, modelId, tokensUsed, truncated };
}
