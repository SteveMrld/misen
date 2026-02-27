/**
 * MISEN V7 — Configuration des 7 modèles IA vidéo
 * Matrice MCAP (Multi-Criteria AI Performance)
 * Migré depuis V6 — comportement IDENTIQUE
 */

import type { AIModelId, AIModelConfig } from '../../types/engines';

export const AI_MODELS: Record<AIModelId, AIModelConfig> = {
  'kling3': {
    id: 'kling3', name: 'Kling', version: '3.0',
    prefix: 'realistic', suffix: '', maxTokens: 400,
    negativePrefix: 'Negative:', speciality: 'Réalisme physique, descriptions directes',
    resolution: 9, maxDuration: 8, motion: 9, physics: 10,
    hands: 8, lipSync: 7, cameraControl: 8, lighting: 9,
    vfx: 7, consistency: 8, textRendering: 5, styleRange: 7,
    audioGen: 3, speed: 6, costPer10s: 0.10,
    supportsNegativePrompt: true, supportsImageToVideo: true,
    supportsCameraPath: true, maxResolution: '1080p',
  },
  'runway4.5': {
    id: 'runway4.5', name: 'Runway', version: 'Gen-4.5',
    prefix: '', suffix: '--style raw --quality 2', maxTokens: 500,
    negativePrefix: '--no', speciality: 'Style brut, descripteurs virgule',
    resolution: 9, maxDuration: 7, motion: 8, physics: 8,
    hands: 7, lipSync: 8, cameraControl: 9, lighting: 9,
    vfx: 9, consistency: 7, textRendering: 6, styleRange: 10,
    audioGen: 5, speed: 7, costPer10s: 0.15,
    supportsNegativePrompt: true, supportsImageToVideo: true,
    supportsCameraPath: true, maxResolution: '4K',
  },
  'sora2': {
    id: 'sora2', name: 'Sora', version: '2',
    prefix: '', suffix: '', maxTokens: 600,
    negativePrefix: 'Avoid:', speciality: 'Phrases narratives, séparateur point',
    resolution: 10, maxDuration: 9, motion: 9, physics: 9,
    hands: 8, lipSync: 9, cameraControl: 8, lighting: 9,
    vfx: 10, consistency: 9, textRendering: 8, styleRange: 9,
    audioGen: 7, speed: 5, costPer10s: 0.20,
    supportsNegativePrompt: true, supportsImageToVideo: true,
    supportsCameraPath: false, maxResolution: '1080p',
  },
  'veo3.1': {
    id: 'veo3.1', name: 'Veo', version: '3.1',
    prefix: '', suffix: '', maxTokens: 400,
    negativePrefix: 'Exclude:', speciality: 'Dialogue-first, émotion prioritaire',
    resolution: 9, maxDuration: 7, motion: 8, physics: 8,
    hands: 7, lipSync: 10, cameraControl: 7, lighting: 8,
    vfx: 7, consistency: 8, textRendering: 7, styleRange: 8,
    audioGen: 9, speed: 7, costPer10s: 0.12,
    supportsNegativePrompt: true, supportsImageToVideo: false,
    supportsCameraPath: false, maxResolution: '1080p',
  },
  'seedance2': {
    id: 'seedance2', name: 'Seedance', version: '2.0',
    prefix: '', suffix: '', maxTokens: 350,
    negativePrefix: 'Not:', speciality: 'Architecture unifiée audio-vidéo, mouvement, édition multimodale',
    resolution: 8, maxDuration: 6, motion: 10, physics: 9,
    hands: 6, lipSync: 7, cameraControl: 7, lighting: 7,
    vfx: 8, consistency: 8, textRendering: 4, styleRange: 7,
    audioGen: 7, speed: 9, costPer10s: 0.05,
    supportsNegativePrompt: true, supportsImageToVideo: true,
    supportsCameraPath: false, maxResolution: '1080p',
  },
  'wan2.5': {
    id: 'wan2.5', name: 'Wan', version: '2.5',
    prefix: '', suffix: '', maxTokens: 400,
    negativePrefix: '', speciality: 'Animation + mouvement caméra',
    resolution: 8, maxDuration: 8, motion: 9, physics: 7,
    hands: 7, lipSync: 6, cameraControl: 9, lighting: 8,
    vfx: 8, consistency: 7, textRendering: 5, styleRange: 9,
    audioGen: 3, speed: 8, costPer10s: 0.08,
    supportsNegativePrompt: false, supportsImageToVideo: true,
    supportsCameraPath: true, maxResolution: '1080p',
  },
  'hailuo2.3': {
    id: 'hailuo2.3', name: 'Hailuo', version: '2.3',
    prefix: '', suffix: '', maxTokens: 450,
    negativePrefix: '', speciality: 'Cohérence personnage longue durée',
    resolution: 8, maxDuration: 9, motion: 7, physics: 7,
    hands: 7, lipSync: 7, cameraControl: 6, lighting: 7,
    vfx: 6, consistency: 10, textRendering: 5, styleRange: 7,
    audioGen: 4, speed: 7, costPer10s: 0.07,
    supportsNegativePrompt: false, supportsImageToVideo: true,
    supportsCameraPath: false, maxResolution: '1080p',
  },
};

/** Liste ordonnée des IDs de modèles */
export const MODEL_IDS: AIModelId[] = Object.keys(AI_MODELS) as AIModelId[];

/** Obtenir un modèle par ID */
export function getModel(id: AIModelId): AIModelConfig {
  return AI_MODELS[id];
}

/** Axes MCAP pour le scoring */
export const MCAP_AXES = [
  'resolution', 'maxDuration', 'motion', 'physics', 'hands',
  'lipSync', 'cameraControl', 'lighting', 'vfx', 'consistency',
  'textRendering', 'styleRange', 'audioGen', 'speed',
] as const;

export type MCAPAxis = typeof MCAP_AXES[number];

/** Poids par défaut des axes MCAP */
export const MCAP_DEFAULT_WEIGHTS: Record<MCAPAxis, number> = {
  resolution: 1.0,
  maxDuration: 1.0,
  motion: 1.2,
  physics: 1.5,
  hands: 1.3,
  lipSync: 1.4,
  cameraControl: 1.1,
  lighting: 1.0,
  vfx: 0.8,
  consistency: 1.5,
  textRendering: 0.5,
  styleRange: 0.7,
  audioGen: 0.6,
  speed: 0.4,
};
