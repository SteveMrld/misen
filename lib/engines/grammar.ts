/**
 * MISEN V7 — Engine 2: Cinematic Grammar
 * @description Règles de séquençage des plans : cadrage, mouvement caméra,
 *   éclairage, rythme. Applique les conventions cinématographiques (règle des 30°,
 *   champ/contre-champ, pas 2 GP consécutifs, etc.).
 * @origin V4 — Migré V6→V7
 */

import type {
  Emotion, ShotType, CameraMove, CameraAngle,
  LightingStyle, GrammarResult,
} from '../../types/engines';

interface GrammarInput {
  emotion: Emotion;
  intensity: number;
  hasDialogue: boolean;
  dialogueCount: number;
  isFlashback: boolean;
  isFirstPlan: boolean;
  isLastPlan: boolean;
  previousCadrage?: ShotType;
  scenePosition: 'debut' | 'milieu' | 'fin';
  personnageCount: number;
}

/**
 * Détermine la grammaire cinématographique d'un plan.
 */
export function cinematicGrammar(input: GrammarInput): GrammarResult {
  const notes: string[] = [];
  let regleAppliquee = '';

  // ─── Cadrage ───
  let cadrage: ShotType = 'PM';

  if (input.isFirstPlan) {
    cadrage = 'PE';
    regleAppliquee = 'Plan d\'ensemble d\'ouverture (convention)';
    notes.push('Établir le lieu et l\'ambiance');
  } else if (input.isLastPlan) {
    cadrage = input.intensity > 70 ? 'GP' : 'PE';
    notes.push('Plan de clôture de scène');
  } else if (input.hasDialogue) {
    if (input.dialogueCount > 1 && input.personnageCount >= 2) {
      cadrage = 'PR';
      regleAppliquee = 'Champ/contre-champ dialogue';
      notes.push('Alternance champ/contre-champ entre les personnages');
    } else {
      cadrage = 'PM';
      regleAppliquee = 'Plan moyen dialogue simple';
    }
  } else if (input.emotion === 'tension' || input.emotion === 'peur') {
    cadrage = input.intensity > 60 ? 'GP' : 'PR';
    notes.push('Cadrage serré pour amplifier la tension');
  } else if (input.emotion === 'joie' || input.emotion === 'determination') {
    cadrage = 'PA';
    notes.push('Plan américain dynamique');
  } else if (input.emotion === 'tristesse' || input.emotion === 'nostalgie') {
    cadrage = input.intensity > 50 ? 'GP' : 'PM';
    notes.push('Cadrage intimiste');
  } else if (input.emotion === 'colere') {
    cadrage = 'TGP';
    notes.push('Très gros plan pour l\'impact émotionnel');
  }

  // Règle : pas 2 GP/TGP consécutifs
  if (input.previousCadrage && ['GP', 'TGP'].includes(input.previousCadrage) && ['GP', 'TGP'].includes(cadrage)) {
    cadrage = 'PM';
    notes.push('Règle 30° : respiration après gros plan');
    regleAppliquee = 'Évitement 2 gros plans consécutifs';
  }

  // ─── Mouvement caméra ───
  let camera: CameraMove = 'fixe';

  if (input.isFirstPlan) {
    camera = 'travelling';
    notes.push('Travelling d\'ouverture');
  } else if (input.emotion === 'tension' && input.intensity > 70) {
    camera = 'handheld';
    notes.push('Caméra épaule pour l\'instabilité');
  } else if (input.emotion === 'nostalgie' || input.isFlashback) {
    camera = 'dolly';
    notes.push('Dolly lent, mouvement mémoriel');
  } else if (input.emotion === 'joie') {
    camera = 'steadicam';
    notes.push('Steadicam fluide');
  } else if (input.emotion === 'determination') {
    camera = 'travelling';
    notes.push('Travelling avant, énergie');
  } else if (input.emotion === 'mystere') {
    camera = 'panoramique';
    notes.push('Panoramique lent, révélation progressive');
  } else if (input.isLastPlan) {
    camera = input.intensity > 50 ? 'crane' : 'fixe';
  }

  // ─── Angle ───
  let angle: CameraAngle = 'neutre';

  if (input.emotion === 'peur' || input.emotion === 'mystere') {
    angle = input.intensity > 60 ? 'dutch' : 'contre-plongee';
  } else if (input.emotion === 'determination') {
    angle = 'contre-plongee';
    notes.push('Contre-plongée héroïque');
  } else if (input.emotion === 'tristesse' && input.intensity > 60) {
    angle = 'plongee';
    notes.push('Plongée d\'écrasement');
  } else if (input.hasDialogue && input.personnageCount >= 2) {
    angle = 'OTS';
    notes.push('Over-the-shoulder pour le dialogue');
  }

  // ─── Éclairage ───
  let eclairage: LightingStyle = 'naturel';

  if (input.isFlashback) {
    eclairage = 'golden-hour';
    notes.push('Golden hour pour le souvenir');
  } else if (input.emotion === 'tension' || input.emotion === 'mystere') {
    eclairage = 'clair-obscur';
  } else if (input.emotion === 'peur') {
    eclairage = 'low-key';
  } else if (input.emotion === 'joie') {
    eclairage = 'high-key';
  } else if (input.emotion === 'tristesse') {
    eclairage = input.intensity > 50 ? 'blue-hour' : 'naturel';
  } else if (input.emotion === 'colere') {
    eclairage = 'neon';
  }

  // ─── Rythme ───
  let rythme: 'lent' | 'modere' | 'rapide' | 'frenetique' = 'modere';
  if (input.intensity > 80) rythme = 'frenetique';
  else if (input.intensity > 60) rythme = 'rapide';
  else if (input.intensity < 30) rythme = 'lent';

  // ─── Durée estimée ───
  let duree = 4; // par défaut 4 secondes
  if (cadrage === 'PE' || cadrage === 'PG') duree = 6;
  else if (cadrage === 'GP' || cadrage === 'TGP') duree = 3;
  if (input.hasDialogue) duree = Math.max(duree, 5);
  if (rythme === 'lent') duree += 2;
  if (rythme === 'frenetique') duree = Math.max(2, duree - 2);

  return { cadrage, camera, angle, eclairage, rythme, duree, notes, regleAppliquee };
}
