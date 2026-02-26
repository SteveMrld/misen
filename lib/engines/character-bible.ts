/**
 * MISEN V7 — Engine 8: Character Bible
 * @description Bible visuelle par personnage — tokens universels + adaptés par modèle.
 * @origin V5 — Migré V6→V7
 */

import type { ParsedScene, AIModelId, CharacterBibleEntry } from '../../types/engines';
import { AI_MODELS, MODEL_IDS } from '../models/ai-models';

interface CharacterBibleInput {
  personnages: string[];
  scenes: ParsedScene[];
  scriptText: string;
  userOverrides?: Partial<CharacterBibleEntry>[];
}

/**
 * Construit la bible visuelle pour chaque personnage.
 */
export function buildCharacterBible(input: CharacterBibleInput): CharacterBibleEntry[] {
  const { personnages, scenes, scriptText, userOverrides } = input;
  const entries: CharacterBibleEntry[] = [];

  for (const personnage of personnages) {
    // Trouver les scènes du personnage
    const scenesDuPersonnage = scenes.filter(s => s.personnages?.includes(personnage));
    const contenuAll = scenesDuPersonnage.flatMap(s => s.contenu || []).join(' ');
    const dialoguesAll = scenesDuPersonnage.flatMap(s => s.dialogues.filter(d => d.personnage === personnage));

    // Extraire les attributs
    const apparence = extractApparence(contenuAll, personnage);
    const costume = extractCostume(contenuAll);
    const traits = extractTraits(dialoguesAll.map(d => d.texte).join(' '));
    const voix = extractVoix(dialoguesAll);

    // Construire les tokens universels
    const tokensUniversels = buildUniversalTokens(personnage, apparence, costume, traits);

    // Tokens par modèle (adaptés à la syntaxe)
    const tokensParModele: Record<AIModelId, string> = {} as Record<AIModelId, string>;
    for (const modelId of MODEL_IDS) {
      tokensParModele[modelId] = adaptTokensToModel(modelId, personnage, tokensUniversels);
    }

    // Appliquer les overrides utilisateur
    const override = userOverrides?.find(o => o.personnage === personnage);
    const description = override?.description ||
      `${personnage}, personnage présent dans ${scenesDuPersonnage.length} scène(s)`;

    entries.push({
      personnage,
      description,
      apparence: override?.apparence || apparence,
      costume: override?.costume || costume,
      traits: override?.traits || traits,
      voix: override?.voix || voix,
      tokensUniversels: override?.tokensUniversels || tokensUniversels,
      tokensParModele: override?.tokensParModele || tokensParModele,
    });
  }

  return entries;
}

// ─── Helpers ───

function extractApparence(texte: string, personnage: string): string {
  const lower = texte.toLowerCase();
  const parts: string[] = [];

  // Âge
  const ageMatch = lower.match(/(\d{1,2})\s*ans/);
  if (ageMatch) parts.push(`${ageMatch[1]} ans`);

  // Cheveux
  const cheveuxMatch = lower.match(/(cheveux?\s+\w+|blonde?|brun(?:e)?|roux|rousse|châtain)/i);
  if (cheveuxMatch) parts.push(cheveuxMatch[0]);

  // Physique
  const physiqueWords = ['grand','petit','mince','fort','robuste','frêle','élancé','trapu'];
  for (const w of physiqueWords) {
    if (lower.includes(w)) { parts.push(w); break; }
  }

  return parts.length > 0 ? parts.join(', ') : 'apparence non décrite';
}

function extractCostume(texte: string): string {
  const lower = texte.toLowerCase();
  const costumePatterns = [
    /port(?:e|ant)\s+(?:un|une|des|son|sa)\s+([^.,]{3,40})/i,
    /vêtu(?:e)?\s+(?:d'|de\s+)([^.,]{3,40})/i,
    /(chemise|veste|costume|robe|manteau|jean|pantalon|pull|t-shirt|blouson)\s*([^.,]{0,30})/i,
  ];
  for (const p of costumePatterns) {
    const match = lower.match(p);
    if (match) return match[0].trim();
  }
  return '';
}

function extractTraits(dialogueText: string): string {
  const parts: string[] = [];
  const lower = dialogueText.toLowerCase();

  if (lower.includes('!')) parts.push('expressif');
  if (lower.includes('...')) parts.push('hésitant');
  if (lower.includes('?') && (lower.match(/\?/g) || []).length > 3) parts.push('curieux');
  if (lower.length > 500) parts.push('volubile');
  else if (lower.length < 100 && lower.length > 0) parts.push('taciturne');

  return parts.join(', ') || 'traits non analysés';
}

function extractVoix(dialogues: { texte: string; didascalie?: string }[]): string {
  for (const d of dialogues) {
    if (d.didascalie) {
      const lower = d.didascalie.toLowerCase();
      if (lower.includes('murmure')) return 'murmure, voix basse';
      if (lower.includes('crie') || lower.includes('hurle')) return 'voix forte, crie';
      if (lower.includes('douce') || lower.includes('tendre')) return 'voix douce';
      if (lower.includes('froid') || lower.includes('sec')) return 'voix froide, sèche';
    }
  }
  return 'voix standard';
}

function buildUniversalTokens(personnage: string, apparence: string, costume: string, traits: string): string {
  const parts = [`[Character ${personnage}]`];
  if (apparence && apparence !== 'apparence non décrite') parts.push(apparence);
  if (costume) parts.push(costume);
  if (traits && traits !== 'traits non analysés') parts.push(traits);
  return parts.join(', ');
}

function adaptTokensToModel(modelId: AIModelId, personnage: string, universalTokens: string): string {
  const model = AI_MODELS[modelId];

  switch (modelId) {
    case 'kling3':
      return `realistic ${universalTokens}`;
    case 'runway4.5':
      return universalTokens.replace(/\s+/g, ', ');
    case 'sora2':
      return `${personnage}. ${universalTokens.replace(/\[Character \w+\],?\s*/, '')}`;
    case 'veo3.1':
      return `${personnage} character: ${universalTokens.replace(/\[Character \w+\],?\s*/, '')}`;
    default:
      return universalTokens;
  }
}
