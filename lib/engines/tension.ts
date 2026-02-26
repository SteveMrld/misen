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

  // Arc global
  const firstTension = curve[0]?.tension || 0;
  const lastTension = curve[curve.length - 1]?.tension || 0;
  let globalArc = 'plat';
  if (maxTension > 70 && lastTension < 40) globalArc = 'classique (montée-climax-résolution)';
  else if (maxTension > 70 && lastTension > 60) globalArc = 'crescendo (tension maintenue)';
  else if (firstTension > 60 && lastTension < 30) globalArc = 'décroissant (résolution progressive)';
  else if (maxTension < 40) globalArc = 'contemplatif (tension basse)';

  // Moyenne
  const avgTension = Math.round(
    curve.reduce((sum, p) => sum + p.tension, 0) / curve.length
  );

  return { curve, climax: climaxIndex, phases, globalArc, avgTension };
}
