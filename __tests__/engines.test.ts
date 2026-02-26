/**
 * MISEN V7 — Tests unitaires pour les 13 moteurs
 * Objectif : ≥114 tests (parité V6 + edge cases TypeScript)
 * 
 * Exécution : npx vitest run __tests__/engines.test.ts
 * ou : npx jest __tests__/engines.test.ts
 *
 * NOTE : Ce fichier utilise une syntaxe compatible Vitest ET Jest.
 */

import { intentEngine } from '../lib/engines/intent';
import { cinematicGrammar } from '../lib/engines/grammar';
import { tensionCurve } from '../lib/engines/tension';
import { contextualPrompt } from '../lib/engines/contextual-prompt';
import { recEngineV2 } from '../lib/engines/rec-engine';
import { memoryEngineV2 } from '../lib/engines/memory-engine';
import { complianceCheck } from '../lib/engines/compliance';
import { buildCharacterBible } from '../lib/engines/character-bible';
import { buildStyleBible } from '../lib/engines/style-bible';
import { consistencyInject } from '../lib/engines/consistency-inject';
import { modelSyntaxAdapter } from '../lib/engines/model-syntax';
import { negativePromptEngine } from '../lib/engines/negative-prompt';
import { continuityTracker } from '../lib/engines/continuity-tracker';
import { parseScript } from '../lib/parser/script-parser';
import { runPipeline } from '../lib/engines/pipeline';
import { AI_MODELS, MODEL_IDS } from '../lib/models/ai-models';
import type { ParsedScene, Plan, IntentResult } from '../types/engines';

// ═══════════════════════════════════════════
// DONNÉES DE TEST
// ═══════════════════════════════════════════

const SCRIPT_LES_DEUX_RIVES = `INT. APPARTEMENT D'ADRIEN - MATIN
Adrien se réveille en sursaut. La sueur perle sur son front.
Il regarde deux photos identiques posées sur la table de nuit.
Le miroir de la salle de bain est brisé. Les morceaux reflètent son visage fragmenté.

ADRIEN
(murmure)
« Encore ce rêve... »

EXT. BORD DE RIVIÈRE - JOUR (FLASHBACK)
Deux garçons courent sur la berge. L'eau brille sous le soleil.
Ils lancent des cailloux. Les cercles se rejoignent.

ADRIEN ENFANT
« On sera toujours ensemble. »

LUCAS ENFANT
« Toujours. Promesse de rivière. »

INT. HÔPITAL - JOUR
Adrien entre dans la chambre. Lucas est allongé, pâle.
Adrien s'assoit au bord du lit. Il tend la main.

ADRIEN
(voix tremblante)
« Je suis là. »

INT. SALLE DE CINÉMA - NUIT
La salle est vide. Adrien est seul au milieu.
L'écran projette des images de leur enfance.

ADRIEN
« Vous êtes seul ? »

EXT. RIVIÈRE - NUIT
Adrien marche le long de la rivière.
Il pose un caillou sur la pierre plate.
Le courant emporte les reflets de la lune.
Silence.`;

// Helper pour créer des scènes de test
function makeScene(overrides: Partial<ParsedScene> = {}): ParsedScene {
  return {
    index: 0, titre: 'INT. TEST - JOUR', lieu: 'TEST', moment: 'JOUR',
    type: 'INT', contenu: ['Action test'], dialogues: [],
    personnages: ['MARC'], isFlashback: false, dureeEstimee: 10,
    ...overrides,
  };
}

function makePlan(overrides: Partial<Plan> = {}): Plan {
  return {
    id: 'S1P1', sceneIndex: 0, planIndex: 0,
    description: 'Test plan', cadrage: 'PM', camera: 'fixe',
    angle: 'neutre', eclairage: 'naturel', duree: 4,
    personnages: ['MARC'], emotion: 'neutre', intensite: 30,
    modeleRecommande: 'kling3', scoreModele: 70,
    prompt: 'test prompt', negativePrompt: 'test negative',
    tips: [],
    ...overrides,
  };
}

// ═══════════════════════════════════════════
// ENGINE 1: INTENT ENGINE (20 tests)
// ═══════════════════════════════════════════

describe('Engine 1: Intent Engine', () => {
  test('retourne un IntentResult valide', () => {
    const r = intentEngine('Marc pleure dans le silence.');
    expect(r).toHaveProperty('dominantEmotion');
    expect(r).toHaveProperty('emotions');
    expect(r).toHaveProperty('intensity');
    expect(r).toHaveProperty('symbols');
    expect(r).toHaveProperty('rhetoric');
    expect(r).toHaveProperty('subtext');
  });

  test('détecte la tristesse', () => {
    const r = intentEngine('Il pleure seul dans le vide. Larmes et solitude.');
    expect(r.dominantEmotion).toBe('tristesse');
    expect(r.emotions.tristesse).toBeGreaterThan(50);
  });

  test('détecte la tension', () => {
    const r = intentEngine('Il hésite, tremble, retient son souffle. Silence.');
    expect(r.dominantEmotion).toBe('tension');
  });

  test('détecte la colère', () => {
    const r = intentEngine('Il crie, frappe la table ! Rage et fureur !');
    expect(r.dominantEmotion).toBe('colere');
  });

  test('détecte la joie', () => {
    const r = intentEngine('Elle rit, sourit, danse dans la lumière.');
    expect(r.dominantEmotion).toBe('joie');
  });

  test('détecte la peur', () => {
    const r = intentEngine('Il recule dans le noir, une ombre menace.');
    expect(r.dominantEmotion).toBe('peur');
  });

  test('détecte la nostalgie', () => {
    const r = intentEngine('Souvenir d\'enfance. Autrefois. Jadis. Flashback.');
    expect(r.dominantEmotion).toBe('nostalgie');
  });

  test('détecte l\'amour', () => {
    const r = intentEngine('Elle effleure sa main, murmure tendrement.');
    expect(r.dominantEmotion).toBe('amour');
  });

  test('détecte le mystère', () => {
    const r = intentEngine('Une silhouette floue disparait... Étrange présence...');
    expect(r.dominantEmotion).toBe('mystere');
  });

  test('détecte la détermination', () => {
    const r = intentEngine('Il se lève, affronte le danger, résolu. Il avance.');
    expect(r.dominantEmotion).toBe('determination');
  });

  test('retourne neutre pour texte vide', () => {
    const r = intentEngine('');
    expect(r.dominantEmotion).toBe('neutre');
  });

  test('intensité 0-100', () => {
    const r = intentEngine('Texte avec émotion forte : pleure, crie, explose !');
    expect(r.intensity).toBeGreaterThanOrEqual(0);
    expect(r.intensity).toBeLessThanOrEqual(100);
  });

  test('bonus flashback → nostalgie', () => {
    const r = intentEngine('Scène normale.', { isFlashback: true });
    expect(r.emotions.nostalgie).toBeGreaterThan(0);
  });

  test('détecte le symbole miroir', () => {
    const r = intentEngine('Le miroir se brise.');
    expect(r.symbols.some(s => s.symbol === 'miroir')).toBe(true);
  });

  test('détecte le symbole eau', () => {
    const r = intentEngine('La rivière coule doucement.');
    expect(r.symbols.some(s => s.symbol === 'eau')).toBe(true);
  });

  test('détecte le symbole cycle', () => {
    const r = intentEngine('Tout recommence. Le cercle se referme.');
    expect(r.symbols.some(s => s.symbol === 'cycle')).toBe(true);
  });

  test('détecte les figures de rhétorique (suspension)', () => {
    const r = intentEngine('Il attend... Le silence est long...');
    expect(r.rhetoric.some(rh => rh.figure === 'suspension')).toBe(true);
  });

  test('subtext contient le symbole principal', () => {
    const r = intentEngine('Le miroir reflète le vide.');
    expect(r.subtext.length).toBeGreaterThan(0);
  });

  test('gère les caractères spéciaux français', () => {
    const r = intentEngine('L\'éclat de lumière traverse la fenêtre. Où est-il ?');
    expect(r).toHaveProperty('dominantEmotion');
  });

  test('intensité augmente avec les exclamations', () => {
    const r1 = intentEngine('Il crie.');
    const r2 = intentEngine('Il crie ! Il hurle ! Non !');
    expect(r2.emotions.colere).toBeGreaterThanOrEqual(r1.emotions.colere);
  });
});

// ═══════════════════════════════════════════
// ENGINE 2: CINEMATIC GRAMMAR (12 tests)
// ═══════════════════════════════════════════

describe('Engine 2: Cinematic Grammar', () => {
  test('plan d\'ouverture = PE', () => {
    const r = cinematicGrammar({
      emotion: 'neutre', intensity: 30, hasDialogue: false, dialogueCount: 0,
      isFlashback: false, isFirstPlan: true, isLastPlan: false,
      scenePosition: 'debut', personnageCount: 1,
    });
    expect(r.cadrage).toBe('PE');
  });

  test('dialogue → PR ou PM', () => {
    const r = cinematicGrammar({
      emotion: 'neutre', intensity: 30, hasDialogue: true, dialogueCount: 2,
      isFlashback: false, isFirstPlan: false, isLastPlan: false,
      scenePosition: 'milieu', personnageCount: 2,
    });
    expect(['PR', 'PM']).toContain(r.cadrage);
  });

  test('tension haute → GP', () => {
    const r = cinematicGrammar({
      emotion: 'tension', intensity: 80, hasDialogue: false, dialogueCount: 0,
      isFlashback: false, isFirstPlan: false, isLastPlan: false,
      scenePosition: 'milieu', personnageCount: 1,
    });
    expect(r.cadrage).toBe('GP');
  });

  test('pas 2 GP consécutifs', () => {
    const r = cinematicGrammar({
      emotion: 'tension', intensity: 80, hasDialogue: false, dialogueCount: 0,
      isFlashback: false, isFirstPlan: false, isLastPlan: false,
      previousCadrage: 'GP', scenePosition: 'milieu', personnageCount: 1,
    });
    expect(r.cadrage).toBe('PM');
  });

  test('flashback → dolly + golden-hour', () => {
    const r = cinematicGrammar({
      emotion: 'nostalgie', intensity: 50, hasDialogue: false, dialogueCount: 0,
      isFlashback: true, isFirstPlan: false, isLastPlan: false,
      scenePosition: 'milieu', personnageCount: 1,
    });
    expect(r.camera).toBe('dolly');
    expect(r.eclairage).toBe('golden-hour');
  });

  test('tension élevée → handheld', () => {
    const r = cinematicGrammar({
      emotion: 'tension', intensity: 80, hasDialogue: false, dialogueCount: 0,
      isFlashback: false, isFirstPlan: false, isLastPlan: false,
      scenePosition: 'milieu', personnageCount: 1,
    });
    expect(r.camera).toBe('handheld');
  });

  test('retourne toutes les propriétés', () => {
    const r = cinematicGrammar({
      emotion: 'neutre', intensity: 30, hasDialogue: false, dialogueCount: 0,
      isFlashback: false, isFirstPlan: false, isLastPlan: false,
      scenePosition: 'milieu', personnageCount: 1,
    });
    expect(r).toHaveProperty('cadrage');
    expect(r).toHaveProperty('camera');
    expect(r).toHaveProperty('angle');
    expect(r).toHaveProperty('eclairage');
    expect(r).toHaveProperty('rythme');
    expect(r).toHaveProperty('duree');
    expect(r.duree).toBeGreaterThan(0);
  });

  test('rythme frénétique si intensité > 80', () => {
    const r = cinematicGrammar({
      emotion: 'colere', intensity: 90, hasDialogue: false, dialogueCount: 0,
      isFlashback: false, isFirstPlan: false, isLastPlan: false,
      scenePosition: 'milieu', personnageCount: 1,
    });
    expect(r.rythme).toBe('frenetique');
  });

  test('OTS pour dialogue 2 personnages', () => {
    const r = cinematicGrammar({
      emotion: 'neutre', intensity: 30, hasDialogue: true, dialogueCount: 3,
      isFlashback: false, isFirstPlan: false, isLastPlan: false,
      scenePosition: 'milieu', personnageCount: 2,
    });
    expect(r.angle).toBe('OTS');
  });

  test('contre-plongée pour détermination', () => {
    const r = cinematicGrammar({
      emotion: 'determination', intensity: 70, hasDialogue: false, dialogueCount: 0,
      isFlashback: false, isFirstPlan: false, isLastPlan: false,
      scenePosition: 'milieu', personnageCount: 1,
    });
    expect(r.angle).toBe('contre-plongee');
  });

  test('peur → low-key', () => {
    const r = cinematicGrammar({
      emotion: 'peur', intensity: 60, hasDialogue: false, dialogueCount: 0,
      isFlashback: false, isFirstPlan: false, isLastPlan: false,
      scenePosition: 'milieu', personnageCount: 1,
    });
    expect(r.eclairage).toBe('low-key');
  });

  test('durée augmente pour dialogue', () => {
    const r = cinematicGrammar({
      emotion: 'neutre', intensity: 30, hasDialogue: true, dialogueCount: 1,
      isFlashback: false, isFirstPlan: false, isLastPlan: false,
      scenePosition: 'milieu', personnageCount: 1,
    });
    expect(r.duree).toBeGreaterThanOrEqual(5);
  });
});

// ═══════════════════════════════════════════
// ENGINE 3: TENSION CURVE (10 tests)
// ═══════════════════════════════════════════

describe('Engine 3: Tension Curve', () => {
  const scenes = [
    makeScene({ index: 0, titre: 'INT. A', contenu: ['Intro calme'] }),
    makeScene({ index: 1, titre: 'INT. B', contenu: ['Conflit violent explosion crie'] }),
    makeScene({ index: 2, titre: 'EXT. C', contenu: ['Resolution douce'] }),
  ];
  const intents: IntentResult[] = [
    intentEngine('Intro calme matin.'),
    intentEngine('Conflit violent ! Explosion ! Il crie, frappe !'),
    intentEngine('Resolution douce, silence paisible.'),
  ];

  test('curve.length === scenes.length', () => {
    const r = tensionCurve({ scenes, intents });
    expect(r.curve.length).toBe(3);
  });

  test('climax >= 0', () => {
    const r = tensionCurve({ scenes, intents });
    expect(r.climax).toBeGreaterThanOrEqual(0);
  });

  test('phases.length === scenes.length', () => {
    const r = tensionCurve({ scenes, intents });
    expect(r.phases.length).toBe(3);
  });

  test('tension 0-100', () => {
    const r = tensionCurve({ scenes, intents });
    for (const p of r.curve) {
      expect(p.tension).toBeGreaterThanOrEqual(0);
      expect(p.tension).toBeLessThanOrEqual(100);
    }
  });

  test('climax sur la scène de conflit', () => {
    const r = tensionCurve({ scenes, intents });
    expect(r.climax).toBe(1); // La scène de conflit
  });

  test('avgTension calculée', () => {
    const r = tensionCurve({ scenes, intents });
    expect(r.avgTension).toBeGreaterThan(0);
  });

  test('globalArc non vide', () => {
    const r = tensionCurve({ scenes, intents });
    expect(r.globalArc.length).toBeGreaterThan(0);
  });

  test('delta calculé', () => {
    const r = tensionCurve({ scenes, intents });
    expect(r.curve[0].delta).toBe(0); // Premier point
    expect(typeof r.curve[1].delta).toBe('number');
  });

  test('scènes vides → résultat vide', () => {
    const r = tensionCurve({ scenes: [], intents: [] });
    expect(r.curve.length).toBe(0);
    expect(r.climax).toBe(-1);
  });

  test('une seule scène', () => {
    const r = tensionCurve({ scenes: [scenes[0]], intents: [intents[0]] });
    expect(r.curve.length).toBe(1);
  });
});

// ═══════════════════════════════════════════
// ENGINE 4: CONTEXTUAL PROMPT (8 tests)
// ═══════════════════════════════════════════

describe('Engine 4: Contextual Prompt', () => {
  test('retourne un basePrompt non vide', () => {
    const r = contextualPrompt({
      plan: { cadrage: 'PM', camera: 'fixe', eclairage: 'naturel', emotion: 'neutre', personnages: ['MARC'] },
      scene: makeScene(), planIndex: 0, totalPlans: 3,
    });
    expect(r.basePrompt.length).toBeGreaterThan(10);
  });

  test('inclut le personnage', () => {
    const r = contextualPrompt({
      plan: { cadrage: 'GP', personnages: ['MARC'], emotion: 'tristesse' },
      scene: makeScene(), planIndex: 0, totalPlans: 1,
    });
    expect(r.basePrompt).toContain('MARC');
  });

  test('moodTokens non vides pour émotion', () => {
    const r = contextualPrompt({
      plan: { emotion: 'tension', cadrage: 'PM' },
      scene: makeScene(), planIndex: 0, totalPlans: 1,
    });
    expect(r.moodTokens.length).toBeGreaterThan(0);
  });

  test('flashback → FONDU ENCHAÎNÉ', () => {
    const r = contextualPrompt({
      plan: { cadrage: 'PM' },
      scene: makeScene({ isFlashback: true }), planIndex: 0, totalPlans: 1,
    });
    expect(r.transitionNote).toContain('FONDU');
  });

  test('continuité costume depuis mémoire', () => {
    const r = contextualPrompt({
      plan: { cadrage: 'PM', personnages: ['MARC'] },
      scene: makeScene(), planIndex: 1, totalPlans: 3,
      memory: { costume: 'chemise bleue' },
    });
    expect(r.visualContinuity.some(v => v.includes('chemise bleue'))).toBe(true);
  });

  test('EXT → outdoor token', () => {
    const r = contextualPrompt({
      plan: { cadrage: 'PE' },
      scene: makeScene({ type: 'EXT' }), planIndex: 0, totalPlans: 1,
    });
    expect(r.environmentTokens.some(t => t.includes('outdoor'))).toBe(true);
  });

  test('dialogue inclus dans le prompt', () => {
    const r = contextualPrompt({
      plan: { cadrage: 'PR', dialogue: { personnage: 'MARC', texte: 'Bonjour' }, personnages: ['MARC'] },
      scene: makeScene(), planIndex: 0, totalPlans: 1,
    });
    expect(r.basePrompt).toContain('Bonjour');
  });

  test('dernier plan → transitionNote fin', () => {
    const r = contextualPrompt({
      plan: { cadrage: 'PE' },
      scene: makeScene(), planIndex: 2, totalPlans: 3,
    });
    expect(r.transitionNote).toContain('Fin');
  });
});

// ═══════════════════════════════════════════
// ENGINE 5: REC ENGINE V2 (10 tests)
// ═══════════════════════════════════════════

describe('Engine 5: Rec Engine V2', () => {
  test('retourne un modèle recommandé valide', () => {
    const r = recEngineV2({
      emotion: 'neutre', intensity: 30, cadrage: 'PM', camera: 'fixe',
      hasDialogue: false, dialogueLength: 0, personnageCount: 1,
      isFlashback: false, duree: 4, needsVFX: false, needsConsistency: false,
      sceneType: 'INT',
    });
    expect(MODEL_IDS).toContain(r.recommended);
  });

  test('scores pour les 7 modèles', () => {
    const r = recEngineV2({
      emotion: 'neutre', intensity: 30, cadrage: 'PM', camera: 'fixe',
      hasDialogue: false, dialogueLength: 0, personnageCount: 1,
      isFlashback: false, duree: 4, needsVFX: false, needsConsistency: false,
      sceneType: 'INT',
    });
    expect(Object.keys(r.scores).length).toBe(7);
  });

  test('dialogue → veo3.1 favorisé', () => {
    const r = recEngineV2({
      emotion: 'neutre', intensity: 30, cadrage: 'PR', camera: 'fixe',
      hasDialogue: true, dialogueLength: 50, personnageCount: 2,
      isFlashback: false, duree: 5, needsVFX: false, needsConsistency: false,
      sceneType: 'INT',
    });
    expect(r.scores['veo3.1']).toBeGreaterThan(50);
  });

  test('consistance → hailuo favorisé', () => {
    const r = recEngineV2({
      emotion: 'neutre', intensity: 30, cadrage: 'PM', camera: 'fixe',
      hasDialogue: false, dialogueLength: 0, personnageCount: 2,
      isFlashback: false, duree: 4, needsVFX: false, needsConsistency: true,
      sceneType: 'INT',
    });
    expect(r.scores['hailuo2.3']).toBeGreaterThan(40);
  });

  test('mouvement pur → seedance favorisé', () => {
    const r = recEngineV2({
      emotion: 'determination', intensity: 60, cadrage: 'PA', camera: 'travelling',
      hasDialogue: false, dialogueLength: 0, personnageCount: 1,
      isFlashback: false, duree: 4, needsVFX: false, needsConsistency: false,
      sceneType: 'EXT',
    });
    expect(r.scores['seedance2']).toBeGreaterThan(40);
  });

  test('scores entre 0 et 100', () => {
    const r = recEngineV2({
      emotion: 'tension', intensity: 80, cadrage: 'GP', camera: 'handheld',
      hasDialogue: false, dialogueLength: 0, personnageCount: 1,
      isFlashback: false, duree: 3, needsVFX: true, needsConsistency: true,
      sceneType: 'INT',
    });
    for (const score of Object.values(r.scores)) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  test('reasoning non vide', () => {
    const r = recEngineV2({
      emotion: 'tension', intensity: 80, cadrage: 'GP', camera: 'handheld',
      hasDialogue: true, dialogueLength: 30, personnageCount: 1,
      isFlashback: false, duree: 5, needsVFX: false, needsConsistency: true,
      sceneType: 'INT',
    });
    expect(r.reasoning.length).toBeGreaterThan(0);
  });

  test('alternatives contient 2 modèles', () => {
    const r = recEngineV2({
      emotion: 'neutre', intensity: 30, cadrage: 'PM', camera: 'fixe',
      hasDialogue: false, dialogueLength: 0, personnageCount: 1,
      isFlashback: false, duree: 4, needsVFX: false, needsConsistency: false,
      sceneType: 'INT',
    });
    expect(r.alternatives.length).toBe(2);
  });

  test('drone → wan2.5 favorisé', () => {
    const r = recEngineV2({
      emotion: 'neutre', intensity: 30, cadrage: 'PG', camera: 'drone',
      hasDialogue: false, dialogueLength: 0, personnageCount: 0,
      isFlashback: false, duree: 6, needsVFX: false, needsConsistency: false,
      sceneType: 'EXT',
    });
    expect(r.scores['wan2.5']).toBeGreaterThan(50);
  });

  test('tips non vides pour cas complexe', () => {
    const r = recEngineV2({
      emotion: 'colere', intensity: 90, cadrage: 'TGP', camera: 'handheld',
      hasDialogue: true, dialogueLength: 100, personnageCount: 2,
      isFlashback: false, duree: 8, needsVFX: true, needsConsistency: true,
      sceneType: 'INT',
    });
    expect(r.tips.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════
// ENGINE 6: MEMORY ENGINE V2 (8 tests)
// ═══════════════════════════════════════════

describe('Engine 6: Memory Engine V2', () => {
  const scenes = [
    makeScene({ index: 0, personnages: ['ADRIEN'], contenu: ['Adrien pleure.'] }),
    makeScene({ index: 1, personnages: ['ADRIEN', 'LUCAS'], contenu: ['Adrien et Lucas rient.'] }),
    makeScene({ index: 2, personnages: ['ADRIEN'], contenu: ['Adrien part résolu.'] }),
  ];
  const intents = scenes.map(s => intentEngine((s.contenu || []).join(' ')));

  test('arcs pour chaque personnage', () => {
    const r = memoryEngineV2({ scenes, intents });
    expect(r.arcs.length).toBe(2); // ADRIEN + LUCAS
  });

  test('states pour chaque personnage', () => {
    const r = memoryEngineV2({ scenes, intents });
    expect(r.states['ADRIEN']).toBeDefined();
    expect(r.states['LUCAS']).toBeDefined();
  });

  test('arc contient emotionCurve', () => {
    const r = memoryEngineV2({ scenes, intents });
    const adrienArc = r.arcs.find(a => a.personnage === 'ADRIEN');
    expect(adrienArc!.emotionCurve.length).toBe(3); // Présent dans 3 scènes
  });

  test('evolution non vide', () => {
    const r = memoryEngineV2({ scenes, intents });
    const adrienArc = r.arcs.find(a => a.personnage === 'ADRIEN');
    expect(adrienArc!.evolution.length).toBeGreaterThan(0);
  });

  test('derniereEmotion définie', () => {
    const r = memoryEngineV2({ scenes, intents });
    expect(r.states['ADRIEN'].derniereEmotion).toBeDefined();
  });

  test('position = lieu dernière scène', () => {
    const r = memoryEngineV2({ scenes, intents });
    expect(r.states['ADRIEN'].position).toBe('TEST');
  });

  test('gère 0 scènes', () => {
    const r = memoryEngineV2({ scenes: [], intents: [] });
    expect(r.arcs.length).toBe(0);
  });

  test('LUCAS apparaît dans 1 scène', () => {
    const r = memoryEngineV2({ scenes, intents });
    const lucasArc = r.arcs.find(a => a.personnage === 'LUCAS');
    expect(lucasArc!.emotionCurve.length).toBe(1);
  });
});

// ═══════════════════════════════════════════
// ENGINE 7: COMPLIANCE (8 tests)
// ═══════════════════════════════════════════

describe('Engine 7: Compliance Engine', () => {
  test('scène propre → OK', () => {
    const r = complianceCheck({ scene: makeScene({ contenu: ['Marc entre dans le bureau.'] }), sceneIndex: 0 });
    expect(r.level).toBe('OK');
    expect(r.score).toBe(100);
  });

  test('violence → flags', () => {
    const r = complianceCheck({ scene: makeScene({ contenu: ['Il frappe, du sang coule. Il tue.'] }), sceneIndex: 0 });
    expect(r.flags.some(f => f.type === 'violence')).toBe(true);
  });

  test('nudité → WARNING', () => {
    const r = complianceCheck({ scene: makeScene({ contenu: ['Elle se déshabille.'] }), sceneIndex: 0 });
    expect(r.level).not.toBe('OK');
  });

  test('langage → flags', () => {
    const r = complianceCheck({ scene: makeScene({ dialogues: [{ personnage: 'A', texte: 'Merde ! Putain !' }] }), sceneIndex: 0 });
    expect(r.flags.some(f => f.type === 'langage')).toBe(true);
  });

  test('drogue → flags', () => {
    const r = complianceCheck({ scene: makeScene({ contenu: ['Il sniffe de la cocaïne.'] }), sceneIndex: 0 });
    expect(r.flags.some(f => f.type === 'drogue')).toBe(true);
  });

  test('arme → flags', () => {
    const r = complianceCheck({ scene: makeScene({ contenu: ['Il sort un pistolet.'] }), sceneIndex: 0 });
    expect(r.flags.some(f => f.type === 'arme')).toBe(true);
  });

  test('score diminue avec la gravité', () => {
    const r = complianceCheck({
      scene: makeScene({ contenu: ['Violence extrême. Il tue, frappe, détruit. Sang partout. Cadavre.'] }),
      sceneIndex: 0,
    });
    expect(r.score).toBeLessThan(70);
  });

  test('flags contiennent le numéro de scène', () => {
    const r = complianceCheck({ scene: makeScene({ contenu: ['Il frappe.'] }), sceneIndex: 3 });
    if (r.flags.length > 0) {
      expect(r.flags[0].scene).toBe(3);
    }
  });
});

// ═══════════════════════════════════════════
// ENGINES 8-9: BIBLES (8 tests)
// ═══════════════════════════════════════════

describe('Engine 8-9: Character & Style Bibles', () => {
  test('Character Bible pour chaque personnage', () => {
    const r = buildCharacterBible({
      personnages: ['ADRIEN', 'LUCAS'],
      scenes: [makeScene({ personnages: ['ADRIEN', 'LUCAS'] })],
      scriptText: 'Adrien, 30 ans, cheveux bruns.',
    });
    expect(r.length).toBe(2);
    expect(r[0].personnage).toBe('ADRIEN');
  });

  test('tokensParModele pour 7 modèles', () => {
    const r = buildCharacterBible({
      personnages: ['MARC'],
      scenes: [makeScene()],
      scriptText: 'Marc entre.',
    });
    expect(Object.keys(r[0].tokensParModele).length).toBe(7);
  });

  test('Style Bible cinematique', () => {
    const r = buildStyleBible({ preset: 'cinematique' });
    expect(r.preset).toBe('cinematique');
    expect(r.tokensUniversels).toContain('cinematic');
  });

  test('Style Bible noir', () => {
    const r = buildStyleBible({ preset: 'noir' });
    expect(r.tokensUniversels).toContain('noir');
  });

  test('Style Bible documentaire', () => {
    const r = buildStyleBible({ preset: 'documentaire' });
    expect(r.tokensUniversels).toContain('documentary');
  });

  test('Style Bible onirique', () => {
    const r = buildStyleBible({ preset: 'onirique' });
    expect(r.tokensUniversels).toContain('dreamlike');
  });

  test('Style Bible custom', () => {
    const r = buildStyleBible({ preset: 'custom', customPalette: 'rouge et or' });
    expect(r.palette).toContain('rouge et or');
  });

  test('tokensParModele style pour 7 modèles', () => {
    const r = buildStyleBible({ preset: 'cinematique' });
    expect(Object.keys(r.tokensParModele).length).toBe(7);
  });
});

// ═══════════════════════════════════════════
// ENGINES 10-12: PROMPT PIPELINE (10 tests)
// ═══════════════════════════════════════════

describe('Engines 10-12: Consistency + Syntax + Negative', () => {
  const charBible = buildCharacterBible({ personnages: ['MARC'], scenes: [makeScene()], scriptText: 'Marc.' });
  const styleBible = buildStyleBible({ preset: 'cinematique' });

  test('consistencyInject enrichit le prompt', () => {
    const r = consistencyInject({
      basePrompt: 'medium shot of person',
      characterBible: charBible, styleBible,
      modelId: 'kling3', personnages: ['MARC'],
    });
    expect(r.enrichedPrompt.length).toBeGreaterThan('medium shot of person'.length);
  });

  test('injectedCharacterTokens non vide', () => {
    const r = consistencyInject({
      basePrompt: 'test', characterBible: charBible, styleBible,
      modelId: 'sora2', personnages: ['MARC'],
    });
    expect(r.injectedCharacterTokens.length).toBeGreaterThan(0);
  });

  test('injectedStyleTokens non vide', () => {
    const r = consistencyInject({
      basePrompt: 'test', characterBible: charBible, styleBible,
      modelId: 'sora2', personnages: ['MARC'],
    });
    expect(r.injectedStyleTokens.length).toBeGreaterThan(0);
  });

  test('modelSyntaxAdapter retourne modelId', () => {
    const r = modelSyntaxAdapter({ prompt: 'test prompt', modelId: 'kling3' });
    expect(r.modelId).toBe('kling3');
  });

  test('kling3 ajoute prefix realistic', () => {
    const r = modelSyntaxAdapter({ prompt: 'a scene', modelId: 'kling3' });
    expect(r.adaptedPrompt.toLowerCase()).toContain('realistic');
  });

  test('runway ajoute suffix', () => {
    const r = modelSyntaxAdapter({ prompt: 'a scene', modelId: 'runway4.5' });
    expect(r.adaptedPrompt).toContain('--style raw');
  });

  test('truncation si trop long', () => {
    const longPrompt = Array(500).fill('word').join(' ');
    const r = modelSyntaxAdapter({ prompt: longPrompt, modelId: 'kling3' });
    expect(r.truncated).toBe(true);
  });

  test('negativePrompt contient le prefix modèle', () => {
    const r = negativePromptEngine({
      modelId: 'kling3', cadrage: 'PM', emotion: 'neutre',
      hasDialogue: false, isNight: false, hasMovement: false,
    });
    expect(r.negativePrompt).toContain('Negative:');
  });

  test('negativePrompt dialogue → lip tokens', () => {
    const r = negativePromptEngine({
      modelId: 'sora2', cadrage: 'PR', emotion: 'neutre',
      hasDialogue: true, isNight: false, hasMovement: false,
    });
    expect(r.contextualTokens.some(t => t.includes('mouth') || t.includes('lip'))).toBe(true);
  });

  test('negativePrompt nuit → anti-overexposed', () => {
    const r = negativePromptEngine({
      modelId: 'veo3.1', cadrage: 'PE', emotion: 'mystere',
      hasDialogue: false, isNight: true, hasMovement: false,
    });
    expect(r.contextualTokens.some(t => t.includes('overexposed'))).toBe(true);
  });
});

// ═══════════════════════════════════════════
// ENGINE 13: CONTINUITY TRACKER (8 tests)
// ═══════════════════════════════════════════

describe('Engine 13: Continuity Tracker', () => {
  test('pas d\'alerte si même modèle', () => {
    const plans = [
      makePlan({ id: 'S1P1', modeleRecommande: 'kling3', personnages: ['MARC'] }),
      makePlan({ id: 'S1P2', modeleRecommande: 'kling3', personnages: ['MARC'] }),
    ];
    const r = continuityTracker(plans);
    expect(r.alerts.filter(a => a.type === 'MODEL_SWITCH').length).toBe(0);
  });

  test('MODEL_SWITCH détecté', () => {
    const plans = [
      makePlan({ id: 'S1P1', modeleRecommande: 'kling3' }),
      makePlan({ id: 'S1P2', modeleRecommande: 'sora2' }),
    ];
    const r = continuityTracker(plans);
    expect(r.alerts.some(a => a.type === 'MODEL_SWITCH')).toBe(true);
  });

  test('CHAR_MODEL_SWITCH = CRITICAL', () => {
    const plans = [
      makePlan({ id: 'S1P1', modeleRecommande: 'kling3', personnages: ['MARC'] }),
      makePlan({ id: 'S1P2', modeleRecommande: 'sora2', personnages: ['MARC'] }),
    ];
    const r = continuityTracker(plans);
    expect(r.alerts.some(a => a.type === 'CHAR_MODEL_SWITCH' && a.severity === 'CRITICAL')).toBe(true);
  });

  test('LIGHTING_BREAK même scène', () => {
    const plans = [
      makePlan({ id: 'S1P1', sceneIndex: 0, eclairage: 'naturel' }),
      makePlan({ id: 'S1P2', sceneIndex: 0, eclairage: 'neon' }),
    ];
    const r = continuityTracker(plans);
    expect(r.alerts.some(a => a.type === 'LIGHTING_BREAK')).toBe(true);
  });

  test('score diminue avec les alertes', () => {
    const plans = [
      makePlan({ id: 'S1P1', modeleRecommande: 'kling3', personnages: ['MARC'] }),
      makePlan({ id: 'S1P2', modeleRecommande: 'sora2', personnages: ['MARC'] }),
    ];
    const r = continuityTracker(plans);
    expect(r.score).toBeLessThan(100);
  });

  test('score 100 si parfait', () => {
    const plans = [
      makePlan({ id: 'S1P1', modeleRecommande: 'kling3' }),
      makePlan({ id: 'S1P2', modeleRecommande: 'kling3' }),
    ];
    const r = continuityTracker(plans);
    expect(r.score).toBe(100);
  });

  test('1 plan → score 100', () => {
    const r = continuityTracker([makePlan()]);
    expect(r.score).toBe(100);
  });

  test('0 plans → score 100', () => {
    const r = continuityTracker([]);
    expect(r.score).toBe(100);
  });
});

// ═══════════════════════════════════════════
// PARSER V2 + FOUNTAIN (12 tests)
// ═══════════════════════════════════════════

describe('Parser V2 + Fountain', () => {
  test('parse INT./EXT. standard', () => {
    const r = parseScript('INT. BUREAU - JOUR\nMarc entre.\n\nEXT. RUE - NUIT\nIl marche.');
    expect(r.scenes.length).toBe(2);
    expect(r.scenes[0].type).toBe('INT');
    expect(r.scenes[1].type).toBe('EXT');
  });

  test('parse INTÉRIEUR/EXTÉRIEUR', () => {
    const r = parseScript('INTÉRIEUR BUREAU - MATIN\nAction.');
    expect(r.scenes.length).toBeGreaterThanOrEqual(1);
  });

  test('extrait les personnages des dialogues', () => {
    const r = parseScript('INT. A - JOUR\n\nMARC\nBonjour.\n\nCLAIRE\nSalut.');
    expect(r.personnages).toContain('MARC');
    expect(r.personnages).toContain('CLAIRE');
  });

  test('stats correctes', () => {
    const r = parseScript(SCRIPT_LES_DEUX_RIVES);
    expect(r.stats.totalScenes).toBeGreaterThanOrEqual(4);
    expect(r.stats.totalDialogues).toBeGreaterThan(0);
    expect(r.stats.personnagesCount).toBeGreaterThan(0);
  });

  test('détecte les flashbacks', () => {
    const r = parseScript(SCRIPT_LES_DEUX_RIVES);
    const flashback = r.scenes.find(s => s.isFlashback);
    expect(flashback).toBeDefined();
  });

  test('scènes numérotées', () => {
    const r = parseScript('1. INT. BUREAU - JOUR\nAction.\n\n2. EXT. RUE - NUIT\nAction.');
    expect(r.scenes.length).toBe(2);
  });

  test('dialogue français « guillemets »', () => {
    const r = parseScript('INT. A - JOUR\nMarc : « Bonjour »');
    // Au minimum le contenu doit être parsé
    expect(r.scenes.length).toBeGreaterThanOrEqual(1);
  });

  test('durée estimée > 0', () => {
    const r = parseScript(SCRIPT_LES_DEUX_RIVES);
    expect(r.stats.dureeEstimee).toBeGreaterThan(0);
  });

  test('gère texte vide', () => {
    const r = parseScript('');
    expect(r.scenes.length).toBe(0);
  });

  test('INT/EXT combiné', () => {
    const r = parseScript('INT./EXT. VOITURE - JOUR\nIl conduit.');
    expect(r.scenes.length).toBe(1);
  });

  test('Les deux rives : ≥ 4 scènes', () => {
    const r = parseScript(SCRIPT_LES_DEUX_RIVES);
    expect(r.scenes.length).toBeGreaterThanOrEqual(4);
  });

  test('didascalie parsée', () => {
    const r = parseScript('INT. A - JOUR\n\nMARC\n(murmure)\nBonjour.');
    const dialogue = r.scenes[0]?.dialogues[0];
    if (dialogue) {
      expect(dialogue.didascalie).toBe('murmure');
    }
  });
});

// ═══════════════════════════════════════════
// PIPELINE COMPLET (8 tests)
// ═══════════════════════════════════════════

describe('Pipeline complet', () => {
  test('analyse Les deux rives', () => {
    const r = runPipeline(SCRIPT_LES_DEUX_RIVES);
    expect(r.scenes.length).toBeGreaterThanOrEqual(4);
    expect(r.plans.length).toBeGreaterThan(0);
    expect(r.characters.length).toBeGreaterThan(0);
  });

  test('tension curve générée', () => {
    const r = runPipeline(SCRIPT_LES_DEUX_RIVES);
    expect(r.tension.curve.length).toBe(r.scenes.length);
  });

  test('chaque plan a un prompt', () => {
    const r = runPipeline(SCRIPT_LES_DEUX_RIVES);
    for (const plan of r.plans) {
      expect(plan.prompt.length).toBeGreaterThan(0);
    }
  });

  test('coût total > 0', () => {
    const r = runPipeline(SCRIPT_LES_DEUX_RIVES);
    expect(r.costTotal).toBeGreaterThan(0);
  });

  test('continuity score calculé', () => {
    const r = runPipeline(SCRIPT_LES_DEUX_RIVES);
    expect(r.continuity.score).toBeGreaterThanOrEqual(0);
    expect(r.continuity.score).toBeLessThanOrEqual(100);
  });

  test('character bible pour Adrien', () => {
    const r = runPipeline(SCRIPT_LES_DEUX_RIVES);
    const adrien = r.characterBible.find(c => c.personnage === 'ADRIEN');
    expect(adrien).toBeDefined();
  });

  test('style bible cinematique par défaut', () => {
    const r = runPipeline(SCRIPT_LES_DEUX_RIVES);
    expect(r.styleBible.preset).toBe('cinematique');
  });

  test('costByScene.length === scenes.length', () => {
    const r = runPipeline(SCRIPT_LES_DEUX_RIVES);
    expect(r.costByScene.length).toBe(r.scenes.length);
  });
});

// ═══════════════════════════════════════════
// MODÈLES IA CONFIG (6 tests)
// ═══════════════════════════════════════════

describe('AI Models Config', () => {
  test('7 modèles configurés', () => {
    expect(MODEL_IDS.length).toBe(7);
  });

  test('chaque modèle a un ID valide', () => {
    for (const id of MODEL_IDS) {
      expect(AI_MODELS[id]).toBeDefined();
      expect(AI_MODELS[id].id).toBe(id);
    }
  });

  test('Kling 3.0 présent', () => {
    expect(AI_MODELS['kling3'].name).toBe('Kling');
    expect(AI_MODELS['kling3'].version).toBe('3.0');
  });

  test('Sora 2 présent', () => {
    expect(AI_MODELS['sora2'].name).toBe('Sora');
  });

  test('chaque modèle a un coût > 0', () => {
    for (const id of MODEL_IDS) {
      expect(AI_MODELS[id].costPer10s).toBeGreaterThan(0);
    }
  });

  test('maxTokens raisonnables', () => {
    for (const id of MODEL_IDS) {
      expect(AI_MODELS[id].maxTokens).toBeGreaterThanOrEqual(300);
      expect(AI_MODELS[id].maxTokens).toBeLessThanOrEqual(1000);
    }
  });
});
