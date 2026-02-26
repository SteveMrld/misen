/**
 * MISEN V7 — Engine 1: Intent Engine
 * @description Détecte l'intention émotionnelle par scène :
 *   émotion dominante, intensité, symboles visuels, figures de style, sous-texte.
 * @origin V4 — Migré V6→V7 (comportement identique)
 */

import type { Emotion, IntentResult, SymbolDetection, RhetoricDetection } from '../../types/engines';

// ─── Lexique émotionnel ───

const EMOTION_LEXICON: Record<Emotion, string[]> = {
  tension: ['hésiter','hésite','tremble','serre','crispe','retient','souffle','silence','immobile','fige','suspend','attend','guette','retient son souffle'],
  tristesse: ['pleure','larme','sanglot','vide','absence','manque','seul','solitude','perdu','deuil','mort','disparu','fantôme','sombre','éteint'],
  colere: ['crie','hurle','frappe','claque','rage','fureur','explose','violent','brise','détruit','renverse','arrache'],
  joie: ['rire','sourit','éclate','bonheur','lumière','danse','embrasse','célèbre','rayonne','chante','saute'],
  peur: ['recule','fuit','court','ombre','noir','menace','danger','panique','terrifié','angoisse','tremble','sursaut'],
  nostalgie: ['souvenir','enfance','autrefois','jadis','flashback','mémoire','promesse','époque','avant','regret','temps'],
  amour: ['regarde','caresse','tend','touche','effleure','enlace','murmure','intime','doux','tendre','embrasse','étreint'],
  mystere: ['devine','ombre','silhouette','flou','disparait','apparait','présence','fantôme','étrange','inexplicable','mystérieux'],
  determination: ['avance','décide','lève','affronte','regarde droit','pas','ferme','résolu','marche','fonce','debout'],
  neutre: [],
};

// ─── Symboles visuels ───

interface SymbolPattern {
  pattern: RegExp;
  symbol: string;
  meaning: string;
}

const SYMBOL_PATTERNS: SymbolPattern[] = [
  { pattern: /deux\s+\w+\s+identiques/gi, symbol: 'dédoublement', meaning: 'obsession de la gémellité, refus de la séparation' },
  { pattern: /miroir/gi, symbol: 'miroir', meaning: 'confrontation à soi-même, dualité intérieure' },
  { pattern: /eau|rivière|fleuve|mer|cascade/gi, symbol: 'eau', meaning: 'passage, mémoire, flux du temps' },
  { pattern: /vide|absence|place\s+vide/gi, symbol: 'vide', meaning: "présence de l'absent, deuil non résolu" },
  { pattern: /lumière|ombre|noir|nuit/gi, symbol: 'lumière-ombre', meaning: 'dualité conscient/inconscient' },
  { pattern: /porte|seuil|couloir|fenêtre/gi, symbol: 'passage', meaning: 'transition, choix, entre-deux' },
  { pattern: /sang|rouge|feu|brûle/gi, symbol: 'feu-sang', meaning: 'violence intérieure, passion destructrice' },
  { pattern: /ciel|étoile|lune|soleil/gi, symbol: 'cosmos', meaning: 'transcendance, destin' },
  { pattern: /enfant|enfance|petit|gamin|garçon/gi, symbol: 'enfance', meaning: 'innocence perdue, origine' },
  { pattern: /cercle|boucle|retour|recommence|rejoint/gi, symbol: 'cycle', meaning: 'éternel retour, clôture narrative' },
  { pattern: /caillou|pierre|roche/gi, symbol: 'pierre', meaning: 'permanence, mémoire gravée' },
  { pattern: /ensemble|jamais|toujours|promesse/gi, symbol: 'serment', meaning: 'lien indéfectible, engagement absolu' },
  { pattern: /escalier|montée|descente|hauteur/gi, symbol: 'verticalité', meaning: 'ascension ou chute, hiérarchie morale' },
  { pattern: /horloge|montre|temps|heure/gi, symbol: 'temps', meaning: 'urgence, mortalité, fugacité' },
];

// ─── Figures de rhétorique ───

interface RhetoricPattern {
  pattern: RegExp;
  figure: string;
  effect: string;
}

const RHETORIC_PATTERNS: RhetoricPattern[] = [
  { pattern: /(\b\w{4,}\b).*\1/gi, figure: 'répétition', effect: 'insistance, obsession' },
  { pattern: /comme\s+un|tel\s+un|semblable/gi, figure: 'comparaison', effect: 'mise en image, poétisation' },
  { pattern: /silence.*bruit|bruit.*silence|noir.*lumière|lumière.*noir/gi, figure: 'antithèse', effect: 'tension dramatique par opposition' },
  { pattern: /\.\.\./g, figure: 'suspension', effect: 'non-dit, tension, attente' },
  { pattern: /!\s*$/gm, figure: 'exclamation', effect: 'émotion forte, cri intérieur' },
  { pattern: /\?\s*$/gm, figure: 'interrogation', effect: 'doute, quête, incertitude' },
];

// ─── Moteur principal ───

export interface IntentOptions {
  isFlashback?: boolean;
  previousEmotion?: Emotion;
}

/**
 * Analyse l'intention émotionnelle d'un texte de scène.
 * @param texte - Le contenu textuel de la scène (actions + dialogues concaténés)
 * @param options - Options contextuelles
 * @returns IntentResult avec émotion dominante, intensité, symboles, rhétorique
 */
export function intentEngine(texte: string, options: IntentOptions = {}): IntentResult {
  const lower = texte.toLowerCase();
  const mots = lower.split(/\s+/);

  // Score chaque émotion
  const emotions: Record<Emotion, number> = {
    tension: 0, tristesse: 0, colere: 0, joie: 0, peur: 0,
    nostalgie: 0, amour: 0, mystere: 0, determination: 0, neutre: 0,
  };

  for (const [emotion, lexique] of Object.entries(EMOTION_LEXICON)) {
    for (const mot of lexique) {
      const regex = new RegExp(mot, 'gi');
      const matches = lower.match(regex);
      if (matches) {
        emotions[emotion as Emotion] += matches.length * 15;
      }
    }
  }

  // Bonus flashback → nostalgie
  if (options.isFlashback) {
    emotions.nostalgie += 30;
  }

  // Bonus ponctuation
  const exclamations = (texte.match(/!/g) || []).length;
  const interrogations = (texte.match(/\?/g) || []).length;
  const suspensions = (texte.match(/\.\.\./g) || []).length;
  emotions.colere += exclamations * 5;
  emotions.tension += interrogations * 5;
  emotions.mystere += suspensions * 8;

  // Normaliser à 100 max
  const maxScore = Math.max(...Object.values(emotions), 1);
  for (const key of Object.keys(emotions) as Emotion[]) {
    emotions[key] = Math.min(100, Math.round((emotions[key] / maxScore) * 100));
  }

  // Émotion dominante
  let dominantEmotion: Emotion = 'neutre';
  let maxVal = 0;
  for (const [emotion, score] of Object.entries(emotions)) {
    if (score > maxVal && emotion !== 'neutre') {
      maxVal = score;
      dominantEmotion = emotion as Emotion;
    }
  }

  // Intensité globale (moyenne pondérée des top 3)
  const sortedEmotions = Object.entries(emotions)
    .filter(([k]) => k !== 'neutre')
    .sort((a, b) => b[1] - a[1]);
  const top3 = sortedEmotions.slice(0, 3);
  const intensity = Math.min(100, Math.round(
    top3.reduce((sum, [, v]) => sum + v, 0) / Math.max(top3.length, 1)
  ));

  // Si aucune émotion détectée
  if (maxVal === 0) {
    emotions.neutre = 50;
    dominantEmotion = 'neutre';
  }

  // Détecter symboles
  const symbols: SymbolDetection[] = [];
  for (const sp of SYMBOL_PATTERNS) {
    const matches = texte.match(sp.pattern);
    if (matches && matches.length > 0) {
      symbols.push({
        symbol: sp.symbol,
        meaning: sp.meaning,
        occurrences: matches.length,
      });
    }
  }

  // Détecter figures de rhétorique
  const rhetoric: RhetoricDetection[] = [];
  for (const rp of RHETORIC_PATTERNS) {
    const matches = texte.match(rp.pattern);
    if (matches && matches.length > 0) {
      rhetoric.push({
        figure: rp.figure,
        example: matches[0].substring(0, 60),
        effect: rp.effect,
      });
    }
  }

  // Sous-texte
  let subtext = '';
  if (symbols.length > 0) {
    subtext = `Symbolique ${symbols[0].symbol} : ${symbols[0].meaning}`;
    if (symbols.length > 1) {
      subtext += ` | ${symbols[1].symbol} : ${symbols[1].meaning}`;
    }
  }
  if (options.isFlashback) {
    subtext = `[FLASHBACK] ${subtext}`;
  }

  return {
    dominantEmotion,
    emotions,
    intensity,
    symbols,
    rhetoric,
    subtext,
  };
}
