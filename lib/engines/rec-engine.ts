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

  // Veo excelle en dialogue — Audio natif confirmé (Google I/O, Gemini API docs)
  if (input.hasDialogue && input.dialogueLength > 0) {
    scores['veo3.1'] = Math.min(100, scores['veo3.1'] + 20);
    tips.push('Veo 3.1 — audio natif (dialogues + SFX synchronisés, source: Gemini API docs)');
  }

  // Sora pour les scènes expressives — VFX leader (Arena.ai Elo ranking)
  if (input.intensity > 60 && input.emotion !== 'neutre') {
    scores['sora2'] = Math.min(100, scores['sora2'] + 15);
    tips.push('Sora 2 — plans expressifs haute émotion (Arena.ai top Elo)');
  }
  // Sora also strong for VFX-heavy scenes
  if (input.needsVFX) {
    scores['sora2'] = Math.min(100, scores['sora2'] + 12);
    tips.push('Sora 2 — VFX cinématiques (leader Arena.ai)');
  }

  // Seedance architecture unifiée audio-vidéo (ByteDance Seed docs)
  if (input.camera !== 'fixe' && !input.hasDialogue) {
    scores['seedance2'] = Math.min(100, scores['seedance2'] + 15);
    tips.push('Seedance 2.0 — mouvement pur, architecture unifiée (source: seed.bytedance.com)');
  }
  // Seedance aussi pour dialogue grâce à audio natif
  if (input.hasDialogue) {
    scores['seedance2'] = Math.min(100, scores['seedance2'] + 8);
    tips.push('Seedance 2.0 — génération audio-vidéo conjointe (source: seed.bytedance.com)');
  }

  // Hailuo pour la cohérence longue durée — Community + Video-MME
  if (input.needsConsistency) {
    scores['hailuo2.3'] = Math.min(100, scores['hailuo2.3'] + 15);
    tips.push('Hailuo 2.3 — cohérence personnage longue durée (community consensus)');
  }

  // Kling pour le réalisme physique + MULTI-SHOT natif (Annexe 1-C, Kuaishou 2026)
  if (input.sceneType === 'EXT' && input.intensity < 50) {
    scores['kling3'] = Math.min(100, scores['kling3'] + 8);
    tips.push('Kling 3.0 — réalisme physique extérieur (benchmarks physics)');
  }
  // Kling multi-shot: 6 cuts cohérents en 16s (source: Annexe 1-C)
  if (input.duree > 8) {
    scores['kling3'] = Math.min(100, scores['kling3'] + 10);
    tips.push('Kling 3.0 — multi-shot natif, 4K 60fps, idéal plans longs (source: Kuaishou 2026)');
  }
  // Kling pour mouvement rapide (Physics → Sora/Kling)
  if (input.intensity > 70 && input.camera !== 'fixe') {
    scores['kling3'] = Math.min(100, scores['kling3'] + 8);
    tips.push('Kling 3.0 — Motion Master pour mouvement rapide + physique (PhysicsBench)');
  }

  // Veo pour narratif long — ScaleLong Story Score leader (Annexe 1-C)
  if (input.duree > 6 && input.hasDialogue) {
    scores['veo3.1'] = Math.min(100, scores['veo3.1'] + 10);
    tips.push('Veo 3.1 — leader narratif long, ScaleLong Story Score (source: Annexe 1-C)');
  }

  // Wan pour l'animation/caméra
  if (input.camera === 'drone' || input.camera === 'crane') {
    scores['wan2.5'] = Math.min(100, scores['wan2.5'] + 12);
    tips.push('Wan 2.5 — mouvements caméra complexes (camera path API)');
  }

  // Runway pour le style + contrôle géométrique (Gen-4.5: I2V, keyframes, V2V)
  if (input.isFlashback) {
    scores['runway4.5'] = Math.min(100, scores['runway4.5'] + 15);
    tips.push('Runway Gen-4.5 — rendu stylisé flashback (modes contrôle I2V/keyframes)');
  }
  // Runway pour style range et direction artistique
  if (input.cadrage === 'GP' || input.cadrage === 'TGP') {
    scores['runway4.5'] = Math.min(100, scores['runway4.5'] + 10);
    tips.push('Runway Gen-4.5 — direction artistique portraits/gros plans');
  }
  // Runway pour vitesse/bas coût social (Annexe 1-C expert grid)
  if (input.duree <= 4 && !input.needsVFX && !input.hasDialogue) {
    scores['runway4.5'] = Math.min(100, scores['runway4.5'] + 10);
    tips.push('Runway Gen-4.5 — vitesse/bas coût optimal pour contenu court (TTFT/Throughput)');
  }

  // Wan for camera path + animation style
  if (input.camera === 'drone' || input.camera === 'crane') {
    scores['wan2.5'] = Math.min(100, scores['wan2.5'] + 12);
    tips.push('Wan 2.5 — trajectoire caméra drone/crane (camera path natif)');
  }

  // Multi-personnages → Seedance/Veo (Annexe 1-C: cohérence)
  if (input.personnageCount >= 2) {
    scores['seedance2'] = Math.min(100, scores['seedance2'] + 8);
    scores['veo3.1'] = Math.min(100, scores['veo3.1'] + 6);
    tips.push('Multi-personnages → Seedance 2.0 (édition multimodale) + Veo 3.1 (cohérence narrative)');
  }

  // ─── FAILURE MODE ROUTING (pénalités) ───
  // Source: Annexe 1-B, stratégie routing par failure modes

  // Dialogue sans audio natif → pénaliser les modèles sans audio
  if (input.hasDialogue && input.dialogueLength > 0) {
    // Seuls Sora 2, Veo 3.1 et Seedance 2.0 ont l'audio natif
    scores['kling3'] = Math.max(0, scores['kling3'] - 8);
    scores['wan2.5'] = Math.max(0, scores['wan2.5'] - 10);
    scores['hailuo2.3'] = Math.max(0, scores['hailuo2.3'] - 5);
    reasoning.push('Dialogue → pénalité modèles sans audio natif (T2VSafetyBench)');
  }

  // Mouvements caméra complexes → pénaliser modèles faibles en dynamique temporelle
  if (input.camera === 'steadicam' || input.camera === 'crane' || input.camera === 'drone') {
    scores['hailuo2.3'] = Math.max(0, scores['hailuo2.3'] - 6);
    reasoning.push('Caméra complexe → pénalité modèles faibles en dynamique (T2VBench/DEVIL)');
  }

  // Longue durée → pénaliser modèles à durée limitée
  if (input.duree > 6) {
    scores['seedance2'] = Math.max(0, scores['seedance2'] - 5);
    reasoning.push('Plan long → pénalité modèles durée max limitée');
  }

  // ─── Classement ───
  const sorted = MODEL_IDS
    .map(id => ({ id, score: scores[id] }))
    .sort((a, b) => b.score - a.score);

  const recommended = sorted[0].id;
  const alternatives = sorted.slice(1, 3).map(s => s.id);

  return { recommended, scores, reasoning, tips, alternatives };
}
