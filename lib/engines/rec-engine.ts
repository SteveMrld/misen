/**
 * MISEN V7 — Engine 5: Rec Engine V2
 * @description Matrice MCAP V2 — recommande le meilleur modèle IA pour chaque plan
 *   selon 22 axes contextuels (résolution, durée, caméra, cohérence personnage, style...).
 * @origin V4 — Migré V6→V7
 */

import type { AIModelId, RecResult, Emotion, ShotType, CameraMove } from '../../types/engines';
import { AI_MODELS, MODEL_IDS, MCAP_AXES, MCAP_DEFAULT_WEIGHTS, type MCAPAxis } from '../models/ai-models';

interface RecInput {
  emotion: Emotion;
  intensity: number;
  cadrage: ShotType;
  camera: CameraMove;
  hasDialogue: boolean;
  dialogueLength: number;
  personnageCount: number;
  isFlashback: boolean;
  duree: number;
  needsVFX: boolean;
  needsConsistency: boolean;
  sceneType: 'INT' | 'EXT' | 'INT/EXT';
}

/**
 * Recommande le meilleur modèle IA pour un plan donné.
 */
export function recEngineV2(input: RecInput): RecResult {
  const scores: Record<AIModelId, number> = {} as Record<AIModelId, number>;
  const reasoning: string[] = [];
  const tips: string[] = [];

  // ─── Calcul des poids contextuels ───
  const weights = { ...MCAP_DEFAULT_WEIGHTS };

  // Ajuster les poids selon le contexte
  if (input.hasDialogue) {
    weights.lipSync = 3.0;
    weights.audioGen = 2.0;
    reasoning.push('Dialogue détecté : lip-sync et audio prioritaires');
  }

  if (input.needsConsistency) {
    weights.consistency = 3.0;
    reasoning.push('Cohérence personnage requise');
  }

  if (input.camera !== 'fixe') {
    weights.cameraControl = 2.5;
    weights.motion = 2.0;
    reasoning.push(`Mouvement caméra (${input.camera}) : contrôle caméra valorisé`);
  }

  if (input.needsVFX) {
    weights.vfx = 2.5;
    reasoning.push('VFX requis');
  }

  if (input.intensity > 70) {
    weights.physics = 2.0;
    reasoning.push('Haute intensité : physique réaliste importante');
  }

  if (input.duree > 8) {
    weights.maxDuration = 2.5;
    reasoning.push('Plan long : durée max valorisée');
  }

  if (input.cadrage === 'GP' || input.cadrage === 'TGP') {
    weights.hands = 2.0;
    weights.lipSync = 2.0;
    reasoning.push('Gros plan : détails mains/visage critiques');
  }

  // ─── Score chaque modèle ───
  for (const modelId of MODEL_IDS) {
    const model = AI_MODELS[modelId];
    let score = 0;
    let totalWeight = 0;

    for (const axis of MCAP_AXES) {
      const modelScore = model[axis as keyof typeof model] as number;
      const weight = weights[axis];
      score += modelScore * weight;
      totalWeight += weight * 10; // max possible per axis is 10
    }

    // Normaliser à 0-100
    scores[modelId] = Math.round((score / totalWeight) * 100);
  }

  // ─── Bonus contextuels par modèle ───

  // Veo excelle en dialogue
  if (input.hasDialogue && input.dialogueLength > 0) {
    scores['veo3.1'] = Math.min(100, scores['veo3.1'] + 15);
    tips.push('Veo 3.1 excelle en lip-sync dialogue');
  }

  // Sora pour les scènes expressives
  if (input.intensity > 60 && input.emotion !== 'neutre') {
    scores['sora2'] = Math.min(100, scores['sora2'] + 10);
    tips.push('Sora 2 pour les plans expressifs haute émotion');
  }

  // Seedance pour le mouvement pur
  if (input.camera !== 'fixe' && !input.hasDialogue) {
    scores['seedance2'] = Math.min(100, scores['seedance2'] + 12);
    tips.push('Seedance 2 optimisé pour le mouvement pur');
  }

  // Hailuo pour la cohérence longue durée
  if (input.needsConsistency) {
    scores['hailuo2.3'] = Math.min(100, scores['hailuo2.3'] + 15);
    tips.push('Hailuo 2.3 pour la cohérence personnage');
  }

  // Kling pour le réalisme physique
  if (input.sceneType === 'EXT' && input.intensity < 50) {
    scores['kling3'] = Math.min(100, scores['kling3'] + 8);
    tips.push('Kling 3.0 pour le réalisme physique extérieur');
  }

  // Wan pour l'animation/caméra
  if (input.camera === 'drone' || input.camera === 'crane') {
    scores['wan2.5'] = Math.min(100, scores['wan2.5'] + 12);
    tips.push('Wan 2.5 pour les mouvements caméra complexes');
  }

  // Runway pour le style
  if (input.isFlashback) {
    scores['runway4.5'] = Math.min(100, scores['runway4.5'] + 10);
    tips.push('Runway Gen-4.5 pour le rendu stylisé flashback');
  }

  // ─── Classement ───
  const sorted = MODEL_IDS
    .map(id => ({ id, score: scores[id] }))
    .sort((a, b) => b.score - a.score);

  const recommended = sorted[0].id;
  const alternatives = sorted.slice(1, 3).map(s => s.id);

  return { recommended, scores, reasoning, tips, alternatives };
}
