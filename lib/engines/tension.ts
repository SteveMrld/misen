/**
 * MISEN V7 — Engine 3: Tension Curve
 * @description Courbe de tension dramatique : pics (climax), creux (respiration),
 *   phases dramatiques, arc global. Ajuste cadrage et rythme.
 * @origin V4 — Migré V6→V7
 */

import type { DramaticPhase, TensionResult, TensionPoint, ParsedScene, IntentResult } from '../../types/engines';

interface TensionInput {
  scenes: ParsedScene[];
  intents: IntentResult[];
}

/**
 * Calcule la courbe de tension dramatique sur l'ensemble des scènes.
 */
export function tensionCurve(input: TensionInput): TensionResult {
  const { scenes, intents } = input;

  if (scenes.length === 0) {
    return {
      curve: [], climax: -1, phases: [], globalArc: 'vide', avgTension: 0,
    };
  }

  const curve: TensionPoint[] = [];
  let maxTension = 0;
  let climaxIndex = 0;

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const intent = intents[i] || { intensity: 30, dominantEmotion: 'neutre' };

    // Calculer la tension brute
    let tension = intent.intensity;

    // Bonus dialogue conflictuel
    const dialogueCount = scene.dialogues?.length || 0;
    if (dialogueCount > 3) tension += 10;

    // Bonus mots d'action dans le contenu
    const contenuText = (scene.contenu || []).join(' ').toLowerCase();
    const actionWords = ['court','frappe','crie','explose','tombe','meurt','fuit','serre','pousse','tire'];
    for (const word of actionWords) {
      if (contenuText.includes(word)) tension += 5;
    }

    // Bonus multiplicateur émotionnel
    const emotionMultipliers: Record<string, number> = {
      tension: 1.3, colere: 1.4, peur: 1.2,
      tristesse: 0.9, joie: 0.7, amour: 0.8,
      nostalgie: 0.6, mystere: 1.1, determination: 1.2, neutre: 0.5,
    };
    const mult = emotionMultipliers[intent.dominantEmotion] || 1.0;
    tension = Math.round(tension * mult);

    // Clamp 0-100
    tension = Math.max(0, Math.min(100, tension));

    // Delta
    const delta = i > 0 ? tension - curve[i - 1].tension : 0;

    if (tension > maxTension) {
      maxTension = tension;
      climaxIndex = i;
    }

    curve.push({
      sceneIndex: i,
      tension,
      delta,
      phase: 'exposition', // sera recalculé ci-dessous
      label: scene.titre || `Scène ${i + 1}`,
    });
  }

  // ─── Assigner les phases dramatiques ───
  const total = scenes.length;
  const phases: DramaticPhase[] = [];

  for (let i = 0; i < total; i++) {
    let phase: DramaticPhase;
    const position = i / Math.max(total - 1, 1);

    if (i === climaxIndex) {
      phase = 'climax';
    } else if (position < 0.2) {
      phase = 'exposition';
    } else if (position < 0.5) {
      phase = 'developpement';
    } else if (position < 0.8 && i > climaxIndex) {
      phase = 'resolution';
    } else if (position >= 0.8 && i > climaxIndex) {
      phase = 'denouement';
    } else {
      phase = 'developpement';
    }

    curve[i].phase = phase;
    phases.push(phase);
  }

  // ─── NOUVEAU : Amplification du contraste ───
  // Si l'écart-type est trop faible (<12), la courbe est plate → on l'étire
  const mean = curve.reduce((s, p) => s + p.tension, 0) / curve.length;
  const stdDev = Math.sqrt(curve.reduce((s, p) => s + Math.pow(p.tension - mean, 2), 0) / curve.length);

  if (stdDev < 12) {
    // Stretching : amplifier les écarts par rapport à la moyenne
    const stretchFactor = stdDev < 6 ? 2.8 : 1.8;
    for (let i = 0; i < curve.length; i++) {
      const amplified = mean + (curve[i].tension - mean) * stretchFactor;
      curve[i].tension = Math.max(0, Math.min(100, Math.round(amplified)));
    }
  }

  // ─── NOUVEAU : Respirations forcées (éviter les plateaux) ───
  // Détecter les séquences de 3+ plans consécutifs sans variation (|delta| < 5)
  for (let i = 2; i < curve.length - 1; i++) {
    const isPlateauWindow =
      Math.abs(curve[i].tension - curve[i - 1].tension) < 5 &&
      Math.abs(curve[i - 1].tension - curve[i - 2].tension) < 5;

    if (isPlateauWindow) {
      // Insérer une respiration : si tension haute, creuser ; si basse, pousser
      const isTensionHigh = curve[i].tension > 55;
      const breathDrop = isTensionHigh ? -18 : 15;
      curve[i].tension = Math.max(0, Math.min(100, curve[i].tension + breathDrop));
      curve[i].delta = curve[i].tension - curve[i - 1].tension;
    }
  }

  // ─── Forcer un arc dramatique structuré pour les scripts courts (≤9 plans) ───
  if (scenes.length <= 9 && scenes.length >= 3) {
    const n = curve.length;
    const peakIdx = Math.max(1, Math.floor(n * 0.65));
    const breathIdx = Math.max(peakIdx + 1, Math.floor(n * 0.85));

    curve[0].tension = Math.min(50, Math.max(curve[0].tension, 35));

    for (let i = 1; i < peakIdx; i++) {
      const progress = i / peakIdx;
      const target = Math.round(35 + progress * 45);
      curve[i].tension = Math.min(100, Math.max(curve[i].tension, target));
    }

    curve[peakIdx].tension = Math.min(100, Math.max(curve[peakIdx].tension, 75));

    if (breathIdx < n) {
      curve[breathIdx].tension = Math.max(35, Math.min(curve[peakIdx].tension - 20, curve[breathIdx].tension));
    }

    let newMax = 0;
    for (let i = 0; i < curve.length; i++) {
      if (curve[i].tension > newMax) { newMax = curve[i].tension; climaxIndex = i; }
    }
  } else if (maxTension < 65 && scenes.length >= 4) {
    const peakIdx = Math.floor(scenes.length * 0.65);
    if (peakIdx < curve.length) {
      curve[peakIdx].tension = Math.min(100, Math.max(curve[peakIdx].tension, 72));
      if (peakIdx > 0) curve[peakIdx].delta = curve[peakIdx].tension - curve[peakIdx - 1].tension;
      let newMax = 0;
      for (let i = 0; i < curve.length; i++) {
        if (curve[i].tension > newMax) { newMax = curve[i].tension; climaxIndex = i; }
      }
    }
  }

  // Recalculer les deltas après toutes les corrections
  for (let i = 1; i < curve.length; i++) {
    curve[i].delta = curve[i].tension - curve[i - 1].tension;
  }

  // Arc global
  const firstTension = curve[0]?.tension || 0;
  const lastTension = curve[curve.length - 1]?.tension || 0;
  const finalMax = Math.max(...curve.map(p => p.tension));
  let globalArc = 'plat';
  if (finalMax > 70 && lastTension < 40) globalArc = 'classique (montée-climax-résolution)';
  else if (finalMax > 70 && lastTension > 60) globalArc = 'crescendo (tension maintenue)';
  else if (firstTension > 60 && lastTension < 30) globalArc = 'décroissant (résolution progressive)';
  else if (finalMax < 40) globalArc = 'contemplatif (tension basse)';

  // Moyenne
  const avgTension = Math.round(
    curve.reduce((sum, p) => sum + p.tension, 0) / curve.length
  );

  return { curve, climax: climaxIndex, phases, globalArc, avgTension };
}
