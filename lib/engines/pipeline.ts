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
import { getOpenSourceFallback } from '../models/opensource-models';
import { recEngineV2 } from './rec-engine';
import { memoryEngineV2 } from './memory-engine';
import { complianceCheck } from './compliance';
import { buildCharacterBible } from './character-bible';
import { buildStyleBible } from './style-bible';
import { consistencyInject } from './consistency-inject';
import { modelSyntaxAdapter } from './model-syntax';
import { negativePromptEngine } from './negative-prompt';
import { continuityTracker } from './continuity-tracker';
import { cameraPhysics } from './camera-physics';
import { motionDirector } from './motion-director';
import { buildWorldModel } from './world-model';
import { directorEvaluate, type DirectorVerdict } from './director-ai';
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

      // ── Stage 6b: CAMERA PHYSICS (Engine 15) ──
      const camPhysics = cameraPhysics({
        shotType: grammar.cadrage,
        cameraMove: grammar.camera,
        emotion: intent.dominantEmotion,
        intensity: intent.intensity,
        lighting: grammar.eclairage,
        hasDialogue: !!dialogue,
      });

      // ── Stage 6c: MOTION DIRECTOR (Engine 16) ──
      const motion = motionDirector({
        shotType: grammar.cadrage,
        cameraMove: grammar.camera,
        emotion: intent.dominantEmotion,
        intensity: intent.intensity,
        duration: grammar.duree,
        personnages: scene.personnages,
        hasDialogue: !!dialogue,
      });

      // ── Stage 6d: WORLD MODEL (Engine 17) ──
      const worldState = buildWorldModel({
        sceneIndex: si,
        planIndex: pi,
        personnages: scene.personnages,
        emotion: intent.dominantEmotion,
        shotType: grammar.cadrage,
        lighting: grammar.eclairage,
        description,
        previousWorldState: pi > 0 ? (plans[plans.length - 1] as any)?._worldState : undefined,
      });

      // ── Stage 6e: DIRECTOR AI pre-evaluation (Engine 14) ──
      const directorPreEval = directorEvaluate({
        plan: {
          personnages: scene.personnages,
          emotion: intent.dominantEmotion,
          cameraMove: grammar.camera,
          finalPrompt: adapted.adaptedPrompt,
          negativePrompt: neg.negativePrompt,
          modelId: rec.recommended,
          stylePreset: options.stylePreset || styleBible?.preset,
        },
      });

      // ── Calcul coût ──
      const model = AI_MODELS[rec.recommended];
      const cost = (grammar.duree / 10) * model.costPer10s;
      sceneCost += cost;
      costByModel[rec.recommended] += cost;

      // ── Enrich prompt with new engine tokens ──
      const enrichedPrompt = [
        adapted.adaptedPrompt,
        camPhysics.promptTokens,
        motion.promptTokens,
        worldState.promptTokens,
      ].filter(Boolean).join('. ');

      const planId = `S${si + 1}P${pi + 1}`;

      const planData: any = {
        id: planId,
        sceneIndex: si,
        planIndex: pi,
        description,
        cadrage: grammar.cadrage,
        shotType: grammar.cadrage,
        camera: grammar.camera,
        cameraMove: grammar.camera,
        angle: grammar.angle,
        eclairage: grammar.eclairage,
        duree: grammar.duree,
        estimatedDuration: grammar.duree,
        estimatedCost: cost,
        personnages: scene.personnages,
        dialogue,
        emotion: intent.dominantEmotion,
        intensite: intent.intensity,
        modeleRecommande: rec.recommended,
        modelId: rec.recommended,
        scoreModele: rec.scores[rec.recommended],
        prompt: enrichedPrompt,
        finalPrompt: enrichedPrompt,
        basePrompt: ctx.basePrompt,
        negativePrompt: neg.negativePrompt,
        tips: rec.tips,
        reasoning: rec.reasoning,
        alternatives: rec.alternatives,
        // New engines data
        cameraPhysics: {
          sensor: camPhysics.sensor,
          lens: camPhysics.lens,
          aperture: camPhysics.aperture,
          iso: camPhysics.iso,
          shutterAngle: camPhysics.shutterAngle,
          fps: camPhysics.fps,
          rig: camPhysics.rig,
          focusMode: camPhysics.focusMode,
          filmStock: camPhysics.filmStock,
        },
        motionPlan: {
          cameraPaths: motion.cameraPaths,
          subjectBindings: motion.subjectBindings,
        },
        worldModel: {
          entities: worldState.entities.length,
          relations: worldState.relations.length,
          continuityConstraints: worldState.continuityConstraints.length,
        },
        directorPreScore: {
          overall: Math.round(directorPreEval.score.overall),
          decision: directorPreEval.decision,
          reason: directorPreEval.reason,
        },
        // Open-source fallback
        openSourceFallback: (() => {
          try {
            const fb = getOpenSourceFallback(rec.recommended);
            return {
              modelId: fb.model.id,
              modelName: `${fb.model.name} ${fb.model.version}`,
              provider: fb.model.provider,
              modelPath: fb.model.modelPath,
              qualityDelta: fb.qualityDelta,
              score: Math.round((fb.model.resolution + fb.model.motion + fb.model.physics + fb.model.lighting + fb.model.vfx + fb.model.consistency + fb.model.styleRange) / 7 * 10),
              reasoning: fb.reasoning,
              strengths: fb.model.strengths,
              limitations: fb.model.limitations,
            };
          } catch { return null; }
        })(),
      };
      planData._worldState = worldState; // internal ref for next plan's continuity
      plans.push(planData);
    }

    costByScene.push(Math.round(sceneCost * 100) / 100);
  }

  // ═══ ÉTAPE 8 : Continuity Tracker ═══
  const continuity = continuityTracker(plans);

  // ═══ Engine Intelligence Report ═══
  const modelDistribution: Record<string, number> = {};
  const cadrageDistribution: Record<string, number> = {};
  const emotionDistribution: Record<string, number> = {};
  const cameraDistribution: Record<string, number> = {};

  for (const p of plans) {
    modelDistribution[p.modeleRecommande] = (modelDistribution[p.modeleRecommande] || 0) + 1;
    cadrageDistribution[p.cadrage] = (cadrageDistribution[p.cadrage] || 0) + 1;
    emotionDistribution[p.emotion] = (emotionDistribution[p.emotion] || 0) + 1;
    cameraDistribution[p.camera] = (cameraDistribution[p.camera] || 0) + 1;
  }

  const uniqueModels = Object.keys(modelDistribution).length;
  const dominantEmotion = Object.entries(emotionDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutre';
  const hasFlashbacks = scenes.some(s => s.isFlashback);
  const dialogueScenes = scenes.filter(s => s.dialogues.length > 0).length;
  const totalDialogues = scenes.reduce((s, sc) => s + sc.dialogues.length, 0);

  const engineInsights = [
    { engine: 'Script Parser', iconName: 'Film', status: 'done' as const, insight: `${scenes.length} scènes extraites, ${plans.length} plans décomposés`, detail: `Détection: ${scenes.filter(s => s.type === 'EXT').length} EXT, ${scenes.filter(s => s.type === 'INT').length} INT${hasFlashbacks ? ', flashbacks détectés' : ''}` },
    { engine: 'Intent Parser', iconName: 'Brain', status: 'done' as const, insight: `Émotion dominante: ${dominantEmotion}`, detail: `${Object.entries(emotionDistribution).map(([e, c]) => `${e}(${c})`).join(', ')}` },
    { engine: 'Story Tracker', iconName: 'TrendingUp', status: 'done' as const, insight: `Arc narratif: ${tension?.globalArc || 'standard'}`, detail: `Tension moyenne: ${tension?.avgTension || 0}/100, pic: ${Math.max(...(tension?.curve?.map((c: any) => c.tension) || [0]))}/100` },
    { engine: 'Character Bible', iconName: 'Users', status: personnages.length > 0 ? 'done' as const : 'skip' as const, insight: personnages.length > 0 ? `${personnages.length} personnage${personnages.length > 1 ? 's' : ''} profilé${personnages.length > 1 ? 's' : ''}` : 'Aucun personnage détecté', detail: personnages.length > 0 ? `Tokens de cohérence générés pour ${Object.keys(characterBible).length} personnage(s)` : '' },
    { engine: 'Style Guard', iconName: 'Wand2', status: 'done' as const, insight: `Preset: ${options.stylePreset || 'cinématique'}`, detail: `Bible de style appliquée à ${plans.length} plans` },
    { engine: 'Compliance', iconName: 'Shield', status: worstCompliance.level === 'OK' ? 'done' as const : 'warn' as const, insight: `Score: ${worstCompliance.score}/100 — ${worstCompliance.level}`, detail: worstCompliance.flags.length > 0 ? `${worstCompliance.flags.length} alerte(s)` : 'Aucun contenu problématique' },
    { engine: 'Cinematic Grammar', iconName: 'Camera', status: 'done' as const, insight: `${Object.keys(cadrageDistribution).length} types de plans, ${Object.keys(cameraDistribution).length} mouvements`, detail: `Cadrages: ${Object.entries(cadrageDistribution).map(([c, n]) => `${c}(${n})`).join(', ')}` },
    { engine: 'Contextual Prompt', iconName: 'Search', status: 'done' as const, insight: `${plans.length} prompts contextuels générés`, detail: `Adaptation au contexte narratif, éclairage, atmosphère par plan` },
    { engine: 'Consistency Inject', iconName: 'GitBranch', status: personnages.length > 0 ? 'done' as const : 'skip' as const, insight: personnages.length > 0 ? `Cohérence injectée dans ${plans.filter(p => p.personnages.length > 0).length} plans` : 'Pas de personnages à tracer', detail: 'Tokens visuels + style appliqués pour cohérence inter-plans' },
    { engine: 'Rec Engine (MCAP)', iconName: 'Cpu', status: 'done' as const, insight: `${uniqueModels} modèle${uniqueModels > 1 ? 's' : ''} sélectionné${uniqueModels > 1 ? 's' : ''} sur 7`, detail: `Distribution: ${Object.entries(modelDistribution).map(([m, n]) => `${AI_MODELS[m as AIModelId]?.name || m}(${n})`).join(', ')}` },
    { engine: 'Model Syntax', iconName: 'SlidersHorizontal', status: 'done' as const, insight: `Prompts adaptés à la syntaxe de chaque modèle`, detail: `Préfixes, suffixes, tokens négatifs spécialisés par API` },
    { engine: 'Negative Prompt', iconName: 'Eye', status: 'done' as const, insight: `${plans.length} prompts négatifs générés`, detail: `Anti-artefacts, anti-doigts, stabilisation par plan` },
    { engine: 'Continuity Tracker', iconName: 'Layers', status: continuity.score >= 80 ? 'done' as const : 'warn' as const, insight: `Score de continuité: ${continuity.score}/100`, detail: continuity.alerts?.length > 0 ? `${continuity.alerts.length} alerte(s) de raccord` : 'Continuité validée entre tous les plans' },
    { engine: 'Camera Physics', iconName: 'Aperture', status: 'done' as const, insight: `${plans.length} specs caméra générées`, detail: `Optique, capteur, ISO, shutter, rig — niveau directeur photo` },
    { engine: 'Motion Director', iconName: 'Move', status: 'done' as const, insight: `${plans.filter((p: any) => p.motionPlan).length} plans de mouvement`, detail: `Trajectoires sujets + caméra, easing, binding personnages` },
    { engine: 'World Model', iconName: 'Globe', status: 'done' as const, insight: `${plans.reduce((s: number, p: any) => s + (p.worldModel?.entities || 0), 0)} entités modélisées`, detail: `Scene graph: personnages, accessoires, lumière, environnement` },
    { engine: 'Director AI', iconName: 'Clapperboard', status: 'done' as const, insight: `Pré-évaluation: ${plans.filter((p: any) => p.directorPreScore?.decision === 'KEEP').length}/${plans.length} KEEP`, detail: `Boucle qualité KEEP/REPAIR/REGENERATE prête pour post-génération` },
  ];

  // ═══ Résultat final ═══
  const costTotal = Math.round(Object.values(costByModel).reduce((a, b) => a + b, 0) * 100) / 100;

  return {
    scenes, plans, characters: personnages,
    tension, memory,
    compliance: worstCompliance,
    continuity,
    characterBible, styleBible,
    costTotal, costByModel, costByScene,
    engineInsights,
    stats: { uniqueModels, modelDistribution, dialogueScenes, totalDialogues, dominantEmotion, hasFlashbacks },
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
