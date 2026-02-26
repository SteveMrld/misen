/**
 * MISEN V7 — Engine 6: Memory Engine V2
 * @description Arc émotionnel des personnages, mémorisation des états
 *   (blessure, costume, position, accessoires).
 * @origin V4 — Migré V6→V7
 */

import type { ParsedScene, IntentResult, MemoryResult, CharacterArc, CharacterState, Emotion } from '../../types/engines';

interface MemoryInput {
  scenes: ParsedScene[];
  intents: IntentResult[];
}

/**
 * Analyse les arcs psychologiques des personnages et mémorise leurs états.
 */
export function memoryEngineV2(input: MemoryInput): MemoryResult {
  const { scenes, intents } = input;

  // Collecter tous les personnages
  const allPersonnages = new Set<string>();
  for (const scene of scenes) {
    for (const p of scene.personnages || []) {
      allPersonnages.add(p);
    }
  }

  // ─── Arcs émotionnels ───
  const arcs: CharacterArc[] = [];

  for (const personnage of allPersonnages) {
    const emotionCurve: { scene: number; emotion: Emotion; intensity: number }[] = [];

    for (let i = 0; i < scenes.length; i++) {
      if (scenes[i].personnages?.includes(personnage)) {
        const intent = intents[i] || { dominantEmotion: 'neutre' as Emotion, intensity: 30 };
        emotionCurve.push({
          scene: i,
          emotion: intent.dominantEmotion,
          intensity: intent.intensity,
        });
      }
    }

    // Déterminer l'évolution narrative
    let evolution = 'stable';
    if (emotionCurve.length >= 2) {
      const first = emotionCurve[0];
      const last = emotionCurve[emotionCurve.length - 1];
      const emotions = emotionCurve.map(e => e.emotion);
      const uniqueEmotions = new Set(emotions);

      if (uniqueEmotions.size >= 3) {
        evolution = 'arc complexe (multi-émotions)';
      } else if (first.intensity < 40 && last.intensity > 70) {
        evolution = `montée : ${first.emotion} → ${last.emotion}`;
      } else if (first.intensity > 70 && last.intensity < 40) {
        evolution = `descente : ${first.emotion} → ${last.emotion}`;
      } else if (first.emotion !== last.emotion) {
        evolution = `transformation : ${first.emotion} → ${last.emotion}`;
      } else {
        evolution = `constante : ${first.emotion}`;
      }
    }

    arcs.push({ personnage, evolution, emotionCurve });
  }

  // ─── États des personnages ───
  const states: Record<string, CharacterState> = {};

  for (const personnage of allPersonnages) {
    // Trouver la dernière scène du personnage
    let lastSceneIdx = -1;
    for (let i = scenes.length - 1; i >= 0; i--) {
      if (scenes[i].personnages?.includes(personnage)) {
        lastSceneIdx = i;
        break;
      }
    }

    const lastIntent = lastSceneIdx >= 0
      ? (intents[lastSceneIdx] || { dominantEmotion: 'neutre' as Emotion })
      : { dominantEmotion: 'neutre' as Emotion };

    // Extraire les indices d'état depuis le texte
    const allContenu = scenes
      .filter(s => s.personnages?.includes(personnage))
      .flatMap(s => s.contenu || [])
      .join(' ')
      .toLowerCase();

    const costume = extractCostume(allContenu, personnage);
    const blessure = extractBlessure(allContenu);
    const accessoires = extractAccessoires(allContenu);

    states[personnage] = {
      personnage,
      derniereEmotion: lastIntent.dominantEmotion as Emotion,
      costume,
      blessure,
      position: lastSceneIdx >= 0 ? scenes[lastSceneIdx].lieu : '',
      accessoires,
    };
  }

  return { arcs, states };
}

// ─── Helpers d'extraction ───

function extractCostume(texte: string, personnage: string): string {
  const patterns = [
    /port(?:e|ant)\s+(?:un|une|des|son|sa)\s+([^.,]+)/gi,
    /vêtu(?:e)?\s+(?:d'un|de|d'une)\s+([^.,]+)/gi,
    /habillé(?:e)?\s+(?:en|de)\s+([^.,]+)/gi,
    /(?:chemise|veste|robe|costume|manteau|jean|pantalon|pull)\s*([^.,]*)/gi,
  ];

  for (const pattern of patterns) {
    const match = texte.match(pattern);
    if (match) return match[0].trim().substring(0, 60);
  }
  return '';
}

function extractBlessure(texte: string): string {
  const patterns = [
    /bless(?:é|ure)\s*([^.,]*)/gi,
    /sang\s+(?:sur|coule|perle)\s*([^.,]*)/gi,
    /cicatrice\s*([^.,]*)/gi,
    /bandage\s*([^.,]*)/gi,
  ];

  for (const pattern of patterns) {
    const match = texte.match(pattern);
    if (match) return match[0].trim().substring(0, 60);
  }
  return '';
}

function extractAccessoires(texte: string): string[] {
  const items: string[] = [];
  const patterns = [
    /tient\s+(?:un|une|son|sa)\s+(\w+)/gi,
    /porte\s+(?:un|une)\s+(montre|bague|collier|chapeau|lunettes|sac)/gi,
    /(?:mallette|valise|parapluie|téléphone|cigarette|verre|livre|lettre|photo)/gi,
  ];

  for (const pattern of patterns) {
    const matches = texte.matchAll(pattern);
    for (const match of matches) {
      const item = (match[1] || match[0]).trim();
      if (!items.includes(item)) items.push(item);
    }
  }
  return items.slice(0, 5);
}
