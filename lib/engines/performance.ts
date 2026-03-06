/**
 * MISEN V14.4 — Performance Engine
 * @description Prédit la performance marketing/engagement d'un plan de production.
 *   Analyse : hook timing, product visibility, rythme, CTA placement,
 *   rétention estimée, potentiel viral, impact émotionnel.
 *   Basé sur les best practices publicitaires et narratives.
 */

import type { Plan, ParsedScene, TensionResult } from '../../types/engines';

// ─── Types ───

export interface PerformanceScore {
  global: number              // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  dimensions: {
    hook: PerformanceDimension
    retention: PerformanceDimension
    emotional: PerformanceDimension
    pacing: PerformanceDimension
    productVisibility: PerformanceDimension
    ctaPlacement: PerformanceDimension
    viralPotential: PerformanceDimension
  }
  alerts: PerformanceAlert[]
  suggestions: string[]
  benchmarkComparison: string  // "Above average for luxury ads" etc.
}

export interface PerformanceDimension {
  score: number   // 0-100
  label: string
  detail: string
}

export interface PerformanceAlert {
  severity: 'critical' | 'warning' | 'info'
  message: string
  fix: string
}

interface PerformanceInput {
  plans: Plan[]
  scenes: ParsedScene[]
  tension: TensionResult
  genre?: string  // 'pub_luxe' | 'court_metrage' | 'clip_musical' | 'documentaire' | 'corporate' | 'game_trailer'
  targetDuration?: number  // seconds
}

// ─── Performance rules by genre ───

const GENRE_RULES: Record<string, { hookWindow: number; productBefore: number; idealPlanCount: [number, number]; idealPacing: number; ctaPosition: number }> = {
  pub_luxe:       { hookWindow: 2, productBefore: 0.4, idealPlanCount: [5, 8], idealPacing: 3.5, ctaPosition: 0.85 },
  corporate:      { hookWindow: 3, productBefore: 0.3, idealPlanCount: [5, 10], idealPacing: 4.0, ctaPosition: 0.9 },
  clip_musical:   { hookWindow: 1.5, productBefore: 1.0, idealPlanCount: [8, 20], idealPacing: 2.5, ctaPosition: 0.95 },
  court_metrage:  { hookWindow: 5, productBefore: 1.0, idealPlanCount: [6, 15], idealPacing: 4.5, ctaPosition: 1.0 },
  documentaire:   { hookWindow: 4, productBefore: 1.0, idealPlanCount: [6, 12], idealPacing: 5.0, ctaPosition: 0.95 },
  game_trailer:   { hookWindow: 1, productBefore: 0.5, idealPlanCount: [8, 16], idealPacing: 2.0, ctaPosition: 0.9 },
}

// ─── Engine ───

export function performanceEngine(input: PerformanceInput): PerformanceScore {
  const { plans, scenes, tension, genre = 'pub_luxe' } = input;
  const rules = GENRE_RULES[genre] || GENRE_RULES.pub_luxe;
  const alerts: PerformanceAlert[] = [];
  const suggestions: string[] = [];

  const totalDuration = plans.reduce((s, p) => s + (p.estimatedDuration || 3), 0);
  const planCount = plans.length;

  // ─── 1. HOOK (les premières secondes captent-elles l'attention ?) ───
  let hookScore = 50;
  if (plans.length > 0) {
    const firstPlan = plans[0];
    const firstDuration = firstPlan.estimatedDuration || 3;

    // Bonus if first shot is visually strong
    const strongFirstShot = ['GP', 'TGP', 'INSERT'].includes(firstPlan.shotType || '');
    if (strongFirstShot) hookScore += 15;

    // Bonus if camera movement in first shot
    if (firstPlan.cameraMove && firstPlan.cameraMove !== 'fixe') hookScore += 10;

    // Check if hook is within genre window
    if (firstDuration <= rules.hookWindow) hookScore += 15;
    else {
      hookScore -= 10;
      alerts.push({ severity: 'warning', message: `Premier plan trop long (${firstDuration}s > ${rules.hookWindow}s)`, fix: 'Raccourcir le premier plan pour capter l\'attention immédiatement.' });
    }

    // Bonus for strong emotion in first scene
    const firstIntent = scenes[0];
    if (firstIntent) {
      const strongEmotions = ['tension', 'mystere', 'determination', 'peur'];
      // Check scene content for strong opening words
      const contenu = (firstIntent.contenu || []).join(' ').toLowerCase();
      if (contenu.includes('lumière') || contenu.includes('apparaît') || contenu.includes('surgit')) hookScore += 10;
    }
  }
  hookScore = Math.max(0, Math.min(100, hookScore));

  // ─── 2. RÉTENTION (la structure maintient-elle l'attention ?) ───
  let retentionScore = 50;

  // Tension curve variety
  if (tension?.curve && tension.curve.length > 1) {
    const tensions = tension.curve.map(c => c.tension);
    const variance = Math.sqrt(tensions.reduce((s, t) => s + Math.pow(t - (tension.avgTension || 50), 2), 0) / tensions.length);
    // Good variance = good retention (neither flat nor chaotic)
    if (variance > 15 && variance < 40) retentionScore += 20;
    else if (variance > 10) retentionScore += 10;
    else {
      alerts.push({ severity: 'warning', message: 'Tension trop plate', fix: 'Ajouter des variations de rythme : alterner gros plans intenses et plans larges contemplatifs.' });
    }
  }

  // Plan variety (different shot types = better retention)
  const shotTypes = new Set(plans.map(p => p.shotType || p.cadrage));
  if (shotTypes.size >= 3) retentionScore += 15;
  else if (shotTypes.size >= 2) retentionScore += 5;
  else {
    suggestions.push('Varier les types de plans (gros plan, plan large, insert) pour maintenir l\'attention.');
  }

  // Camera movement variety
  const movements = new Set(plans.filter(p => p.cameraMove && p.cameraMove !== 'fixe').map(p => p.cameraMove));
  if (movements.size >= 2) retentionScore += 10;

  retentionScore = Math.max(0, Math.min(100, retentionScore));

  // ─── 3. IMPACT ÉMOTIONNEL ───
  let emotionalScore = 50;

  if (tension) {
    // Climax present
    if (tension.climax >= 0 && tension.curve && tension.curve[tension.climax]) {
      const climaxTension = tension.curve[tension.climax].tension;
      if (climaxTension > 70) emotionalScore += 25;
      else if (climaxTension > 50) emotionalScore += 15;
      else emotionalScore += 5;
    }

    // Arc quality
    if (tension.globalArc?.includes('classique')) emotionalScore += 15;
    else if (tension.globalArc?.includes('crescendo')) emotionalScore += 10;
    else if (tension.globalArc?.includes('contemplatif')) emotionalScore += 5;
  }

  // Dialogue presence (emotional connection)
  const hasDialogue = scenes.some(s => (s.dialogues?.length || 0) > 0);
  if (hasDialogue) emotionalScore += 10;

  emotionalScore = Math.max(0, Math.min(100, emotionalScore));

  // ─── 4. PACING (rythme adapté au genre) ───
  let pacingScore = 50;
  const avgPlanDuration = totalDuration / Math.max(planCount, 1);

  // Compare to genre ideal
  const pacingDelta = Math.abs(avgPlanDuration - rules.idealPacing);
  if (pacingDelta < 0.5) pacingScore += 30;
  else if (pacingDelta < 1.5) pacingScore += 15;
  else {
    pacingScore -= 10;
    if (avgPlanDuration > rules.idealPacing + 1) {
      suggestions.push(`Rythme trop lent pour ce genre. Durée moyenne ${avgPlanDuration.toFixed(1)}s vs ${rules.idealPacing}s recommandé.`);
    } else {
      suggestions.push(`Rythme très rapide. Durée moyenne ${avgPlanDuration.toFixed(1)}s vs ${rules.idealPacing}s recommandé.`);
    }
  }

  // Plan count in range
  if (planCount >= rules.idealPlanCount[0] && planCount <= rules.idealPlanCount[1]) pacingScore += 20;
  else if (planCount < rules.idealPlanCount[0]) {
    alerts.push({ severity: 'info', message: `Peu de plans (${planCount}) pour ce genre`, fix: `Les ${genre.replace('_', ' ')} ont généralement ${rules.idealPlanCount[0]}-${rules.idealPlanCount[1]} plans.` });
  }

  pacingScore = Math.max(0, Math.min(100, pacingScore));

  // ─── 5. PRODUCT VISIBILITY (pour les pubs) ───
  let productScore = 50;
  if (genre === 'pub_luxe' || genre === 'corporate' || genre === 'game_trailer') {
    // Check for INSERT or product-related plans
    const insertPlans = plans.filter(p => (p.shotType === 'INSERT') || (p.finalPrompt || p.prompt || '').toLowerCase().match(/produit|flacon|logo|marque|product|brand|bottle/));
    const firstInsertIndex = plans.findIndex(p => (p.shotType === 'INSERT') || (p.finalPrompt || p.prompt || '').toLowerCase().match(/produit|flacon|logo|product/));

    if (insertPlans.length > 0) {
      productScore += 20;
      // Check timing
      const insertPosition = firstInsertIndex / Math.max(planCount - 1, 1);
      if (insertPosition <= rules.productBefore) productScore += 20;
      else {
        alerts.push({ severity: 'critical', message: `Produit visible trop tard (plan ${firstInsertIndex + 1}/${planCount})`, fix: `Le produit devrait apparaître avant ${Math.round(rules.productBefore * 100)}% du film.` });
      }
    } else {
      productScore = 20;
      alerts.push({ severity: 'critical', message: 'Aucun plan produit détecté', fix: 'Ajouter un plan INSERT macro du produit.' });
    }

    // Multiple product shots = good
    if (insertPlans.length >= 2) productScore += 10;
  } else {
    // Non-commercial genres — not applicable, neutral score
    productScore = 70;
  }
  productScore = Math.max(0, Math.min(100, productScore));

  // ─── 6. CTA PLACEMENT ───
  let ctaScore = 50;
  const lastPlan = plans[plans.length - 1];
  if (lastPlan) {
    // Check if last plan has voiceover/text/CTA elements
    const lastPrompt = (lastPlan.finalPrompt || lastPlan.prompt || '').toLowerCase();
    const hasCTA = lastPrompt.match(/logo|titre|texte|brand|call|cta|voix off|slogan|tagline|nom/);
    if (hasCTA) ctaScore += 30;
    else {
      suggestions.push('Ajouter un plan de fermeture avec logo/slogan/CTA.');
    }

    // Last plan should be at the right position
    const lastIsShort = (lastPlan.estimatedDuration || 3) <= 3;
    if (lastIsShort) ctaScore += 10;
  }

  // Voiceover in last scene
  const lastScene = scenes[scenes.length - 1];
  if (lastScene && (lastScene.dialogues?.length || 0) > 0) ctaScore += 10;

  ctaScore = Math.max(0, Math.min(100, ctaScore));

  // ─── 7. VIRAL POTENTIAL ───
  let viralScore = 40;

  // Strong opening
  if (hookScore > 70) viralScore += 15;

  // Emotional peak
  if (emotionalScore > 70) viralScore += 15;

  // Short duration (viral = short)
  if (totalDuration <= 30) viralScore += 15;
  else if (totalDuration <= 60) viralScore += 5;

  // Visual variety
  if (shotTypes.size >= 3 && movements.size >= 2) viralScore += 10;

  // Surprise/contrast
  if (tension?.curve && tension.curve.some(c => Math.abs(c.delta) > 30)) viralScore += 5;

  viralScore = Math.max(0, Math.min(100, viralScore));

  // ─── GLOBAL SCORE ───
  const weights = {
    hook: 0.20,
    retention: 0.15,
    emotional: 0.15,
    pacing: 0.15,
    productVisibility: genre.includes('pub') || genre === 'corporate' ? 0.15 : 0.05,
    ctaPlacement: genre.includes('pub') || genre === 'corporate' ? 0.10 : 0.05,
    viralPotential: 0.10,
  };

  // Normalize weights
  const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0);

  const global = Math.round(
    (hookScore * weights.hook +
     retentionScore * weights.retention +
     emotionalScore * weights.emotional +
     pacingScore * weights.pacing +
     productScore * weights.productVisibility +
     ctaScore * weights.ctaPlacement +
     viralScore * weights.viralPotential) / totalWeight
  );

  const grade = global >= 85 ? 'A' : global >= 70 ? 'B' : global >= 55 ? 'C' : global >= 40 ? 'D' : 'F';

  // Benchmark
  const genreLabels: Record<string, string> = {
    pub_luxe: 'publicités luxe', corporate: 'vidéos corporate', clip_musical: 'clips musicaux',
    court_metrage: 'courts-métrages', documentaire: 'documentaires', game_trailer: 'game trailers',
  };
  const genreLabel = genreLabels[genre] || genre;
  const benchmarkComparison = global >= 75
    ? `Au-dessus de la moyenne des ${genreLabel} (score ${global}/100)`
    : global >= 55
    ? `Dans la moyenne des ${genreLabel} (score ${global}/100)`
    : `En dessous de la moyenne des ${genreLabel} — des optimisations sont recommandées (score ${global}/100)`;

  return {
    global,
    grade,
    dimensions: {
      hook: { score: hookScore, label: 'Hook', detail: `Captation d'attention dans les ${rules.hookWindow} premières secondes` },
      retention: { score: retentionScore, label: 'Rétention', detail: 'Capacité à maintenir l\'attention tout au long du film' },
      emotional: { score: emotionalScore, label: 'Impact émotionnel', detail: 'Intensité émotionnelle et arc dramatique' },
      pacing: { score: pacingScore, label: 'Rythme', detail: `Rythme adapté au genre (${rules.idealPacing}s/plan optimal)` },
      productVisibility: { score: productScore, label: 'Visibilité produit', detail: 'Placement et timing du produit/marque' },
      ctaPlacement: { score: ctaScore, label: 'Call-to-action', detail: 'Fermeture avec slogan/logo/CTA' },
      viralPotential: { score: viralScore, label: 'Potentiel viral', detail: 'Probabilité de partage et d\'engagement' },
    },
    alerts,
    suggestions,
    benchmarkComparison,
  };
}
