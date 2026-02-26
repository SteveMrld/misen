/**
 * MISEN V7 — Engine 13: Continuity Tracker
 * @description Alertes de rupture visuelle :
 *   MODEL_SWITCH (HIGH), CHAR_MODEL_SWITCH (CRITICAL),
 *   STYLE_BREAK, LIGHTING_BREAK, COSTUME_BREAK.
 * @origin V5 — Migré V6→V7
 */

import type { Plan, ContinuityAlert, ContinuityResult, ContinuityAlertSeverity } from '../../types/engines';

/**
 * Analyse la continuité visuelle entre tous les plans.
 */
export function continuityTracker(plans: Plan[]): ContinuityResult {
  const alerts: ContinuityAlert[] = [];

  if (plans.length < 2) {
    return { alerts: [], score: 100 };
  }

  for (let i = 1; i < plans.length; i++) {
    const prev = plans[i - 1];
    const curr = plans[i];
    const samScene = prev.sceneIndex === curr.sceneIndex;

    // ─── MODEL_SWITCH : changement de modèle entre plans consécutifs ───
    if (prev.modeleRecommande !== curr.modeleRecommande) {
      // Plus grave si même scène
      const severity: ContinuityAlertSeverity = samScene ? 'HIGH' : 'MEDIUM';
      alerts.push({
        type: 'MODEL_SWITCH',
        severity,
        planA: prev.id,
        planB: curr.id,
        detail: `Changement ${prev.modeleRecommande} → ${curr.modeleRecommande}${samScene ? ' (même scène)' : ''}`,
        suggestion: samScene
          ? `Utiliser ${prev.modeleRecommande} pour les deux plans afin de maintenir la cohérence`
          : `Transition inter-scène acceptable, vérifier le raccord visuel`,
      });
    }

    // ─── CHAR_MODEL_SWITCH : même personnage, modèle différent ───
    const sharedChars = (prev.personnages || []).filter(p => (curr.personnages || []).includes(p));
    if (sharedChars.length > 0 && prev.modeleRecommande !== curr.modeleRecommande) {
      alerts.push({
        type: 'CHAR_MODEL_SWITCH',
        severity: 'CRITICAL',
        planA: prev.id,
        planB: curr.id,
        detail: `${sharedChars.join(', ')} : modèle change ${prev.modeleRecommande} → ${curr.modeleRecommande}`,
        suggestion: `CRITIQUE : ${sharedChars[0]} sera visuellement différent. Forcer le même modèle.`,
      });
    }

    // ─── LIGHTING_BREAK : changement d'éclairage dans la même scène ───
    if (samScene && prev.eclairage !== curr.eclairage) {
      alerts.push({
        type: 'LIGHTING_BREAK',
        severity: 'MEDIUM',
        planA: prev.id,
        planB: curr.id,
        detail: `Éclairage : ${prev.eclairage} → ${curr.eclairage} dans la même scène`,
        suggestion: `Harmoniser l'éclairage ou justifier par un changement narratif (ex: lumière qui s'éteint)`,
      });
    }

    // ─── STYLE_BREAK : variation trop forte d'intensité dans la même scène ───
    if (samScene && Math.abs(prev.intensite - curr.intensite) > 40) {
      alerts.push({
        type: 'STYLE_BREAK',
        severity: 'LOW',
        planA: prev.id,
        planB: curr.id,
        detail: `Écart d'intensité : ${prev.intensite} → ${curr.intensite}`,
        suggestion: `Vérifier que le changement est justifié dramatiquement`,
      });
    }
  }

  // ─── Score de continuité ───
  let score = 100;
  for (const alert of alerts) {
    switch (alert.severity) {
      case 'CRITICAL': score -= 20; break;
      case 'HIGH': score -= 10; break;
      case 'MEDIUM': score -= 5; break;
      case 'LOW': score -= 2; break;
    }
  }
  score = Math.max(0, score);

  return { alerts, score };
}
