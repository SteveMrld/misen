/**
 * MISEN V7 — Engine 10: Consistency Inject
 * @description Enrichit le prompt avec tokens [Character NOM] + [Style] injectés automatiquement.
 * @origin V5 — Migré V6→V7
 */

import type { AIModelId, CharacterBibleEntry, StyleBibleResult, ConsistencyInjectResult } from '../../types/engines';

interface ConsistencyInjectInput {
  basePrompt: string;
  characterBible: CharacterBibleEntry[];
  styleBible: StyleBibleResult;
  modelId: AIModelId;
  personnages: string[];
}

/**
 * Injecte les tokens de cohérence (personnage + style) dans le prompt de base.
 */
export function consistencyInject(input: ConsistencyInjectInput): ConsistencyInjectResult {
  const { basePrompt, characterBible, styleBible, modelId, personnages } = input;

  const injectedCharacterTokens: string[] = [];
  const injectedStyleTokens: string[] = [];
  const parts: string[] = [basePrompt];

  // ─── Injection tokens personnages ───
  for (const name of personnages) {
    const entry = characterBible.find(e => e.personnage === name);
    if (entry) {
      const token = entry.tokensParModele[modelId] || entry.tokensUniversels;
      if (token) {
        parts.push(token);
        injectedCharacterTokens.push(token);
      }
    }
  }

  // ─── Injection tokens style ───
  const styleToken = styleBible.tokensParModele[modelId] || styleBible.tokensUniversels;
  if (styleToken) {
    parts.push(styleToken);
    injectedStyleTokens.push(styleToken);
  }

  const enrichedPrompt = parts.join(', ');

  return { enrichedPrompt, injectedCharacterTokens, injectedStyleTokens };
}
