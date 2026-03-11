/**
 * MISEN V7 — Script Parser V2 + Fountain
 * @description Parse un scénario en scènes structurées.
 *   17 formats d'entrée : INT./EXT., INTERIEUR/EXTERIEUR, numérotées, 
 *   Fountain standard, ALL CAPS, Final Draft, etc.
 * @origin V4 (Parser V2) — Migré V6→V7
 */

import type { ParsedScene, DialogueLine, ParserResult, ParserOptions, ScriptStats } from '../../types/engines';

// ─── Patterns de détection de scènes ───

const SCENE_PATTERNS: RegExp[] = [
  // Standard : INT. / EXT.
  /^(INT\.|EXT\.|INT\.\/EXT\.|INT\/EXT)\s+(.+?)(?:\s*[-–—]\s*(.+))?$/i,
  // Français : INTÉRIEUR / EXTÉRIEUR
  /^(INT[ÉE]RIEUR|EXT[ÉE]RIEUR|INT[ÉE]RIEUR\/EXT[ÉE]RIEUR)\s+(.+?)(?:\s*[-–—]\s*(.+))?$/i,
  // Abrégé français
  /^(INT|EXT|INT\/EXT)\s+(.+?)(?:\s*[-–—]\s*(.+))?$/i,
  // Numérotées : "1. INT. BUREAU - JOUR" ou "SCENE 1 : INT. BUREAU"
  /^\d+[\.\)]\s*(INT\.|EXT\.|INT\.\/EXT\.)\s+(.+?)(?:\s*[-–—]\s*(.+))?$/i,
  /^SC[ÈE]NE\s+\d+\s*[:.\-–]\s*(INT\.|EXT\.|INT\.\/EXT\.)\s+(.+?)(?:\s*[-–—]\s*(.+))?$/i,
  // ALL CAPS (ligne entière en majuscules contenant un lieu)
  /^([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ\s\d.\/'-]+)$/,
  // Fountain forcé : .NOM DE SCENE
  /^\.\s*(.+)$/,
];

// ─── Patterns de dialogues ───

const DIALOGUE_PATTERNS = {
  // Personnage en MAJUSCULES suivi de texte indenté
  character: /^([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ][A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ\s.'-]{1,30})$/,
  // « dialogue français »
  frenchQuote: /[«»"]/,
  // (didascalie)
  didascalie: /^\s*\(([^)]+)\)\s*$/,
};

/**
 * Détecte si une ligne est un en-tête de scène.
 */
function isSceneHeading(line: string): { match: boolean; type: 'INT' | 'EXT' | 'INT/EXT'; lieu: string; moment: string } {
  const trimmed = line.trim();
  if (trimmed.length < 3) return { match: false, type: 'INT', lieu: '', moment: '' };

  // Patterns standards
  for (const pattern of SCENE_PATTERNS.slice(0, 5)) {
    const m = trimmed.match(pattern);
    if (m) {
      const prefix = (m[1] || '').toUpperCase();
      let type: 'INT' | 'EXT' | 'INT/EXT' = 'INT';
      if (prefix.includes('EXT') && prefix.includes('INT')) type = 'INT/EXT';
      else if (prefix.includes('EXT')) type = 'EXT';

      return {
        match: true,
        type,
        lieu: (m[2] || '').trim(),
        moment: (m[3] || '').trim(),
      };
    }
  }

  // ALL CAPS line (>3 mots, pas de minuscules)
  if (trimmed.length > 8 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
    // Exclure les faux positifs (noms de personnages courts)
    const words = trimmed.split(/\s+/);
    if (words.length >= 3 || trimmed.includes('.') || trimmed.includes('-')) {
      const hasIntExt = /INT|EXT|INTÉRIEUR|EXTÉRIEUR/i.test(trimmed);
      if (hasIntExt) {
        return {
          match: true,
          type: trimmed.includes('EXT') ? (trimmed.includes('INT') ? 'INT/EXT' : 'EXT') : 'INT',
          lieu: trimmed.replace(/^(INT\.|EXT\.|INT\.\/EXT\.|INT|EXT)\s*/i, '').replace(/\s*[-–—].*/,'').trim(),
          moment: (trimmed.match(/[-–—]\s*(.+)$/)?.[1] || '').trim(),
        };
      }
    }
  }

  // Fountain forced scene (.NOM)
  const fountainMatch = trimmed.match(/^\.(.+)$/);
  if (fountainMatch) {
    const content = fountainMatch[1].trim();
    return {
      match: true,
      type: content.includes('EXT') ? 'EXT' : 'INT',
      lieu: content.replace(/^(INT\.|EXT\.|INT\.\/EXT\.)\s*/i, '').trim(),
      moment: '',
    };
  }

  return { match: false, type: 'INT', lieu: '', moment: '' };
}

/**
 * Détecte si une ligne est un nom de personnage (dialogue).
 */
function isCharacterName(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 2 || trimmed.length > 35) return false;
  if (trimmed !== trimmed.toUpperCase()) return false;
  if (/^\d/.test(trimmed)) return false;
  if (/^(INT\.|EXT\.|INT|EXT|INTÉRIEUR|EXTÉRIEUR|CUT|FONDU|FADE|TRANSITION)/i.test(trimmed)) return false;
  if (/[.!?]$/.test(trimmed)) return false;
  // Au moins un caractère alphabétique
  if (!/[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ]/.test(trimmed)) return false;
  return true;
}

/**
 * Convertit un script Fountain en format parsable.
 */
function preprocessFountain(text: string): string {
  let result = text;
  // Forced scene headings
  result = result.replace(/^\.(?!\.)/gm, 'INT. ');
  // Scene transitions
  result = result.replace(/^>\s*(.+)$/gm, '($1)');
  // Centré
  result = result.replace(/^>\s*(.+)\s*<$/gm, '$1');
  return result;
}

/**
 * Parse un scénario brut en scènes structurées.
 */
export function parseScript(text: string, options: Partial<ParserOptions> = {}): ParserResult {
  const opts: ParserOptions = {
    format: options.format || 'auto',
    language: options.language || 'fr',
    strictMode: options.strictMode ?? false,
  };

  // Prétraitement Fountain si nécessaire
  let processedText = text;
  if (opts.format === 'fountain' || (opts.format === 'auto' && isFountainFormat(text))) {
    processedText = preprocessFountain(text);
  }

  const lines = processedText.split('\n');
  const scenes: ParsedScene[] = [];
  const allPersonnages = new Set<string>();

  let currentScene: ParsedScene | null = null;
  let currentCharacter: string | null = null;
  let inDialogue = false;
  let lastDialogue: Partial<DialogueLine> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      inDialogue = false;
      currentCharacter = null;
      continue;
    }

    // ─── Détection scène ───
    const heading = isSceneHeading(trimmed);
    if (heading.match) {
      // Sauvegarder la scène précédente
      if (currentScene) {
        currentScene.dureeEstimee = estimateDuration(currentScene);
        scenes.push(currentScene);
      }

      currentScene = {
        index: scenes.length,
        titre: trimmed,
        lieu: heading.lieu,
        moment: heading.moment,
        type: heading.type,
        contenu: [],
        dialogues: [],
        personnages: [],
        isFlashback: /flashback|souvenir|mémoire|retour/i.test(trimmed),
        dureeEstimee: 0,
      };
      currentCharacter = null;
      inDialogue = false;
      continue;
    }

    // Pas de scène en cours → ignorer ou créer une scène implicite
    if (!currentScene) {
      // Créer une scène implicite si du contenu arrive avant un heading
      if (trimmed.length > 10 && scenes.length === 0) {
        currentScene = {
          index: 0,
          titre: 'Scène 1',
          lieu: '',
          moment: '',
          type: 'INT',
          contenu: [],
          dialogues: [],
          personnages: [],
          isFlashback: false,
          dureeEstimee: 0,
        };
      } else {
        continue;
      }
    }

    // ─── Détection personnage (dialogue) ───
    if (isCharacterName(trimmed)) {
      currentCharacter = trimmed;
      // Extraire le nom (sans parenthèses)
      const cleanName = trimmed.replace(/\s*\(.*\)\s*/, '').trim();
      if (!currentScene.personnages.includes(cleanName)) {
        currentScene.personnages.push(cleanName);
      }
      allPersonnages.add(cleanName);
      inDialogue = true;
      lastDialogue = { personnage: cleanName };
      continue;
    }

    // ─── Didascalie ───
    const didasMatch = trimmed.match(/^\s*\(([^)]+)\)\s*$/);
    if (didasMatch && inDialogue && lastDialogue) {
      lastDialogue.didascalie = didasMatch[1];
      continue;
    }

    // ─── Ligne de dialogue ───
    if (inDialogue && currentCharacter && lastDialogue) {
      currentScene.dialogues.push({
        personnage: lastDialogue.personnage || currentCharacter,
        texte: trimmed.replace(/^[«»"]\s*/, '').replace(/\s*[«»"]$/, ''),
        didascalie: lastDialogue.didascalie,
      });
      lastDialogue = null;
      inDialogue = false;
      continue;
    }

    // ─── Dialogue français (« ... ») ───
    const frenchDialogueMatch = trimmed.match(/^([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ][a-zàâäéèêëïîôùûüÿç]+)\s*[:–]\s*[«"](.+?)[»"]$/);
    if (frenchDialogueMatch) {
      const name = frenchDialogueMatch[1].toUpperCase();
      if (!currentScene.personnages.includes(name)) {
        currentScene.personnages.push(name);
      }
      allPersonnages.add(name);
      currentScene.dialogues.push({
        personnage: name,
        texte: frenchDialogueMatch[2].trim(),
      });
      continue;
    }

    // ─── Action / description ───
    // Détecter les personnages mentionnés dans les actions
    for (const existingChar of allPersonnages) {
      if (trimmed.toUpperCase().includes(existingChar) && !currentScene.personnages.includes(existingChar)) {
        currentScene.personnages.push(existingChar);
      }
    }

    currentScene.contenu.push(trimmed);
  }

  // Dernière scène
  if (currentScene) {
    currentScene.dureeEstimee = estimateDuration(currentScene);
    scenes.push(currentScene);
  }

  // Stats
  const stats = computeStats(scenes, allPersonnages);

  // ─── NOUVEAU : Détection des scènes redondantes ───
  const warnings: string[] = [];
  const redundantPairs: Array<[number, number, number]> = []; // [i, j, score]

  if (scenes.length >= 3) {
    for (let i = 0; i < scenes.length - 1; i++) {
      for (let j = i + 1; j < scenes.length; j++) {
        const sim = sceneTextSimilarity(scenes[i], scenes[j]);
        if (sim >= 0.68) {
          redundantPairs.push([i, j, Math.round(sim * 100)]);
          warnings.push(
            `Scènes ${i + 1} et ${j + 1} ("${scenes[i].titre || scenes[i].lieu}" / "${scenes[j].titre || scenes[j].lieu}") similaires à ${Math.round(sim * 100)}% — fusion ou suppression recommandée`
          );
          // Marquer la scène la moins riche comme redondante
          const wordsI = scenes[i].contenu.join(' ').split(/\s+/).length;
          const wordsJ = scenes[j].contenu.join(' ').split(/\s+/).length;
          if (wordsI <= wordsJ) {
            (scenes[i] as any).isRedundant = true;
          } else {
            (scenes[j] as any).isRedundant = true;
          }
        }
      }
    }

    // Détecter les scènes trop courtes (<15 mots) en milieu de script — à resserrer
    for (let i = 1; i < scenes.length - 1; i++) {
      const wordCount = scenes[i].contenu.join(' ').split(/\s+/).length;
      if (wordCount < 15 && scenes[i].dialogues.length === 0) {
        warnings.push(
          `Scène ${i + 1} ("${scenes[i].lieu || scenes[i].titre}") trop courte (${wordCount} mots, pas de dialogue) — à enrichir ou fusionner`
        );
        (scenes[i] as any).needsExpansion = true;
      }
    }
  }

  return {
    scenes,
    personnages: Array.from(allPersonnages),
    stats,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

// ─── Helpers ───

function isFountainFormat(text: string): boolean {
  // Heuristique : contient des marqueurs Fountain
  return /^\.(?!\.)|\n\n[A-Z]{2,}\n[^A-Z]/m.test(text) ||
    /^Title:|^Credit:|^Author:/m.test(text);
}

function estimateDuration(scene: ParsedScene): number {
  const actionWords = scene.contenu.join(' ').split(/\s+/).length;
  const dialogueWords = scene.dialogues.reduce((sum, d) => sum + d.texte.split(/\s+/).length, 0);
  // ~2 sec par 10 mots d'action, ~3 sec par ligne de dialogue
  return Math.max(5, Math.round(actionWords / 5 + scene.dialogues.length * 3));
}

// ─── Calcul de similarité textuelle entre deux scènes (Jaccard sur tokens) ───
function sceneTextSimilarity(a: ParsedScene, b: ParsedScene): number {
  const tokenize = (scene: ParsedScene): Set<string> => {
    const raw = [
      ...scene.contenu,
      ...scene.dialogues.map(d => d.texte),
      scene.lieu || '',
      scene.titre || '',
    ].join(' ').toLowerCase();
    // Supprimer les mots vides français et stopwords
    const stopwords = new Set(['le','la','les','un','une','des','de','du','et','en','à','au','aux','il','elle','ils','elles','se','son','sa','ses','je','tu','nous','vous','qui','que','quoi','dans','sur','avec','pour','par','mais','ou','donc','or','ni','car','est','sont','a','ont','été','faire','fait','être','avoir','plus','très']);
    const tokens = raw.split(/[\s,.'!?;:()\-–—]+/).filter(t => t.length > 2 && !stopwords.has(t));
    return new Set(tokens);
  };

  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return intersection / Math.max(union, 1);
}

function computeStats(scenes: ParsedScene[], personnages: Set<string>): ScriptStats {
  let totalDialogues = 0;
  let totalMots = 0;
  let intCount = 0;
  let extCount = 0;

  for (const scene of scenes) {
    totalDialogues += scene.dialogues.length;
    totalMots += scene.contenu.join(' ').split(/\s+/).length;
    totalMots += scene.dialogues.reduce((sum, d) => sum + d.texte.split(/\s+/).length, 0);
    if (scene.type === 'INT') intCount++;
    else if (scene.type === 'EXT') extCount++;
    else { intCount++; extCount++; }
  }

  const dureeEstimee = scenes.reduce((sum, s) => sum + s.dureeEstimee, 0) / 60;

  return {
    totalScenes: scenes.length,
    totalDialogues,
    totalMots,
    personnagesCount: personnages.size,
    dureeEstimee: Math.round(dureeEstimee * 10) / 10,
    intCount,
    extCount,
  };
}
