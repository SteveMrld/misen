/**
 * MISEN V7 — Engine 9: Style Bible
 * @description Tokens visuels globaux : palette, éclairage, grain, contraste.
 *   4 presets cinématiques + custom. Tokens adaptés par modèle.
 * @origin V5 — Migré V6→V7
 */

import type { StylePreset, StyleBibleResult, AIModelId } from '../../types/engines';
import { MODEL_IDS, AI_MODELS } from '../models/ai-models';

interface StyleBibleInput {
  preset: StylePreset | 'custom';
  customPalette?: string;
  customEclairage?: string;
  customGrain?: string;
  customContraste?: string;
}

const STYLE_PRESETS: Record<StylePreset, Omit<StyleBibleResult, 'tokensParModele'>> = {
  cinematique: {
    preset: 'cinematique',
    palette: 'warm amber tones, deep blacks, selective color, film stock look',
    eclairage: 'dramatic side lighting, motivated light sources, practical lights',
    grain: '35mm film grain, subtle texture, organic noise',
    contraste: 'high dynamic range, deep shadows, rich highlights',
    tokensUniversels: 'cinematic film look, 35mm film grain, warm amber palette, dramatic lighting, anamorphic lens, shallow depth of field',
  },
  documentaire: {
    preset: 'documentaire',
    palette: 'natural colors, realistic skin tones, neutral white balance',
    eclairage: 'natural available light, documentary style, practical lighting only',
    grain: 'digital clean, minimal noise, sharp detail',
    contraste: 'natural contrast, true-to-life exposure',
    tokensUniversels: 'documentary style, natural lighting, realistic colors, handheld feel, available light, raw authentic look',
  },
  noir: {
    preset: 'noir',
    palette: 'monochrome, deep blacks, silver highlights, desaturated',
    eclairage: 'hard shadows, venetian blind lighting, single key light, noir shadows',
    grain: 'heavy grain, high ISO look, textured',
    contraste: 'extreme contrast, crushed blacks, blown highlights',
    tokensUniversels: 'film noir style, black and white, hard shadows, high contrast, venetian blind light, mysterious atmosphere',
  },
  onirique: {
    preset: 'onirique',
    palette: 'pastel tones, ethereal colors, soft saturation, dreamlike palette',
    eclairage: 'diffused soft light, hazy atmosphere, overexposed edges',
    grain: 'soft grain, gaussian blur edges, dreamy texture',
    contraste: 'low contrast, lifted blacks, soft highlights, airy',
    tokensUniversels: 'dreamlike ethereal atmosphere, soft pastel colors, diffused light, hazy glow, surreal, floating quality',
  },
};

/**
 * Construit la bible de style visuel.
 */
export function buildStyleBible(input: StyleBibleInput): StyleBibleResult {
  let base: Omit<StyleBibleResult, 'tokensParModele'>;

  if (input.preset === 'custom') {
    base = {
      preset: 'custom',
      palette: input.customPalette || 'natural colors',
      eclairage: input.customEclairage || 'natural lighting',
      grain: input.customGrain || 'clean digital',
      contraste: input.customContraste || 'natural contrast',
      tokensUniversels: [
        input.customPalette || 'natural colors',
        input.customEclairage || 'natural lighting',
        input.customGrain || 'clean digital',
      ].join(', '),
    };
  } else {
    base = STYLE_PRESETS[input.preset];
  }

  // Adapter les tokens par modèle
  const tokensParModele: Record<AIModelId, string> = {} as Record<AIModelId, string>;

  for (const modelId of MODEL_IDS) {
    tokensParModele[modelId] = adaptStyleToModel(modelId, base.tokensUniversels);
  }

  return { ...base, tokensParModele };
}

function adaptStyleToModel(modelId: AIModelId, universalTokens: string): string {
  const model = AI_MODELS[modelId];

  switch (modelId) {
    case 'kling3':
      return `realistic ${universalTokens}`;
    case 'runway4.5':
      return `${universalTokens} ${model.suffix}`;
    case 'sora2':
      return universalTokens.split(', ').join('. ');
    case 'veo3.1':
      return `visual style: ${universalTokens}`;
    case 'seedance2':
      // Seedance aime les prompts courts
      return universalTokens.split(', ').slice(0, 3).join(', ');
    default:
      return universalTokens;
  }
}
