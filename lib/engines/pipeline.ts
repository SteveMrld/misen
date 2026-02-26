/**
 * MISEN V7 — Pipeline d'analyse complet
 * @description Orchestre les 13 moteurs dans le pipeline V5 à 7 étapes :
 *   BASE → CHARACTER → STYLE → CONTINUITY → MODEL_ADAPT → NEGATIVE → WEIGHTS
 * 
 * Entrée : texte brut du scénario
 * Sortie : AnalysisResult complet (scènes, plans, tension, bibles, coûts, alertes)
 */

import type {
  AnalysisResult, ParsedScene, Plan, AIModelId,
  CharacterBibleEntry, StyleBibleResult, StylePreset,
  IntentResult,
} from '../../types/engines';

import { parseScript } from '../parser/script-parser';
import { intentEngine } from './intent';
import { cinematicGrammar } from './grammar';
import { tensionCurve } from './tension';
import { contextualPrompt } from './contextual-prompt';
import { recEngineV2 } from './rec-engine';
import { memoryEngineV2 } from './memory-engine';
import { complianceCheck } from './compliance';
import { buildCharacterBible } from './character-bible';
import { buildStyleBible } from './style-bible';
import { consistencyInject } from './consistency-inject';
import { modelSyntaxAdapter } from './model-syntax';
import { negativePromptEngine } from './negative-prompt';
import { continuityTracker } from './continuity-tracker';
import { AI_MODELS } from '../models/ai-models';

export interface PipelineOptions {
  stylePreset?: StylePreset;
  customStyle?: {
    palette?: string;
    eclairage?: string;
    grain?: string;
    contraste?: string;
  };
  characterOverrides?: Partial<CharacterBibleEntry>[];
  scriptFormat?: 'fountain' | 'plain' | 'auto';
}

/**
 * Exécute le pipeline complet d'analyse sur un scénario.
 */
export function runPipeline(scriptText: string, options: PipelineOptions = {}): AnalysisResult {
  // ═══ ÉTAPE 0 : Parse du script ═══
  const parsed = parseScript(scriptText, {
    format: options.scriptFormat || 'auto',
    language: 'fr',
    strictMode: false,
  });

  const { scenes, personnages } = parsed;

  // ═══ ÉTAPE 1 : Intent Engine (par scène) ═══
  const intents: IntentResult[] = scenes.map(scene => {
    const texte = [
      ...(scene.contenu || []),
      ...scene.dialogues.map(d => d.texte),
    ].join(' ');
    return intentEngine(texte, { isFlashback: scene.isFlashback });
  });

  // ═══ ÉTAPE 2 : Tension Curve ═══
  const tension = tensionCurve({ scenes, intents });

  // ═══ ÉTAPE 3 : Memory Engine ═══
  const memory = memoryEngineV2({ scenes, intents });

  // ═══ ÉTAPE 4 : Character Bible ═══
  const characterBible = buildCharacterBible({
    personnages,
    scenes,
    scriptText,
    userOverrides: options.characterOverrides,
  });

  // ═══ ÉTAPE 5 : Style Bible ═══
  const styleBible = buildStyleBible({
    preset: options.stylePreset || 'cinematique',
    ...(options.customStyle || {}),
  });

  // ═══ ÉTAPE 6 : Compliance (par scène) ═══
  const complianceResults = scenes.map((scene, i) => complianceCheck({ scene, sceneIndex: i }));
  const worstCompliance = complianceResults.reduce((worst, c) => {
    if (c.level === 'ERROR') return c;
    if (c.level === 'WARNING' && worst.level !== 'ERROR') return c;
    return worst;
  }, complianceResults[0] || { level: 'OK' as const, flags: [], score: 100 });

  // ═══ ÉTAPE 7 : Décomposition en plans + Pipeline V5 par plan ═══
  const plans: Plan[] = [];
  const costByScene: number[] = [];
  const costByModel: Record<AIModelId, number> = {} as Record<AIModelId, number>;

  for (const modelId of Object.keys(AI_MODELS) as AIModelId[]) {
    costByModel[modelId] = 0;
  }

  for (let si = 0; si < scenes.length; si++) {
    const scene = scenes[si];
    const intent = intents[si];
    let sceneCost = 0;

    // Décomposer la scène en plans
    const planCount = computePlanCount(scene);

    for (let pi = 0; pi < planCount; pi++) {
      // ── Stage 1: BASE (Grammar + Contextual Prompt) ──
      const grammar = cinematicGrammar({
        emotion: intent.dominantEmotion,
        intensity: intent.intensity,
        hasDialogue: pi < scene.dialogues.length,
        dialogueCount: scene.dialogues.length,
        isFlashback: scene.isFlashback,
        isFirstPlan: pi === 0,
        isLastPlan: pi === planCount - 1,
        previousCadrage: plans.length > 0 ? plans[plans.length - 1].cadrage : undefined,
        scenePosition: pi === 0 ? 'debut' : pi === planCount - 1 ? 'fin' : 'milieu',
        personnageCount: scene.personnages.length,
      });

      const dialogue = pi < scene.dialogues.length ? scene.dialogues[pi] : undefined;
      const description = dialogue
        ? `${dialogue.personnage} parle`
        : (scene.contenu[pi] || scene.contenu[0] || 'Action');

      const prevPlan = plans.length > 0 ? plans[plans.length - 1] : undefined;
      const ctx = contextualPrompt({
        plan: {
          cadrage: grammar.cadrage, camera: grammar.camera,
          eclairage: grammar.eclairage, emotion: intent.dominantEmotion,
          personnages: scene.personnages, dialogue, description,
        },
        scene, planIndex: pi, totalPlans: planCount,
        previousPlan: prevPlan,
        memory: scene.personnages[0] ? memory.states[scene.personnages[0]] : undefined,
      });

      // ── Stage 2+3: CHARACTER + STYLE (Consistency Inject) ──
      // ── Stage 5: MODEL recommendation ──
      const rec = recEngineV2({
        emotion: intent.dominantEmotion,
        intensity: intent.intensity,
        cadrage: grammar.cadrage,
        camera: grammar.camera,
        hasDialogue: !!dialogue,
        dialogueLength: dialogue ? dialogue.texte.length : 0,
        personnageCount: scene.personnages.length,
        isFlashback: scene.isFlashback,
        duree: grammar.duree,
        needsVFX: false,
        needsConsistency: scene.personnages.length > 0,
        sceneType: scene.type,
      });

      const inject = consistencyInject({
        basePrompt: ctx.basePrompt,
        characterBible, styleBible,
        modelId: rec.recommended,
        personnages: scene.personnages,
      });

      // ── Stage 4+5: MODEL_ADAPT ──
      const adapted = modelSyntaxAdapter({
        prompt: inject.enrichedPrompt,
        modelId: rec.recommended,
      });

      // ── Stage 6: NEGATIVE ──
      const neg = negativePromptEngine({
        modelId: rec.recommended,
        cadrage: grammar.cadrage,
        emotion: intent.dominantEmotion,
        hasDialogue: !!dialogue,
        isNight: scene.moment?.toLowerCase().includes('nuit') || false,
        hasMovement: grammar.camera !== 'fixe',
      });

      // ── Calcul coût ──
      const model = AI_MODELS[rec.recommended];
      const cost = (grammar.duree / 10) * model.costPer10s;
      sceneCost += cost;
      costByModel[rec.recommended] += cost;

      const planId = `S${si + 1}P${pi + 1}`;

      plans.push({
        id: planId,
        sceneIndex: si,
        planIndex: pi,
        description,
        cadrage: grammar.cadrage,
        camera: grammar.camera,
        angle: grammar.angle,
        eclairage: grammar.eclairage,
        duree: grammar.duree,
        personnages: scene.personnages,
        dialogue,
        emotion: intent.dominantEmotion,
        intensite: intent.intensity,
        modeleRecommande: rec.recommended,
        scoreModele: rec.scores[rec.recommended],
        prompt: adapted.adaptedPrompt,
        negativePrompt: neg.negativePrompt,
        tips: rec.tips,
      });
    }

    costByScene.push(Math.round(sceneCost * 100) / 100);
  }

  // ═══ ÉTAPE 8 : Continuity Tracker ═══
  const continuity = continuityTracker(plans);

  // ═══ Résultat final ═══
  const costTotal = Math.round(Object.values(costByModel).reduce((a, b) => a + b, 0) * 100) / 100;

  return {
    scenes, plans, characters: personnages,
    tension, memory,
    compliance: worstCompliance,
    continuity,
    characterBible, styleBible,
    costTotal, costByModel, costByScene,
  };
}

// ─── Helpers ───

function computePlanCount(scene: ParsedScene): number {
  // Heuristique : 1 plan par dialogue + 1 plan par 3 lignes d'action + plan d'établissement
  const actionPlans = Math.max(1, Math.ceil((scene.contenu?.length || 0) / 3));
  const dialoguePlans = scene.dialogues?.length || 0;
  const total = 1 + actionPlans + dialoguePlans; // +1 pour le plan d'établissement
  return Math.min(total, 8); // Max 8 plans par scène
}
