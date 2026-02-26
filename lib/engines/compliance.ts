/**
 * MISEN V7 — Engine 7: Compliance Engine
 * @description Détection de contenu sensible (violence, nudité, langage, drogue).
 *   Flags pour les modèles IA qui ont des restrictions.
 * @origin V4 — Migré V6→V7
 */

import type { ComplianceResult, ComplianceFlag, ComplianceLevel, ParsedScene } from '../../types/engines';

interface ComplianceInput {
  scene: ParsedScene;
  sceneIndex: number;
}

const VIOLENCE_WORDS = [
  'frappe','tue','mort','sang','blessé','blessure','arme','fusil','couteau',
  'poignard','tire','coup','combat','bagarre','explosion','tombe','cadavre',
  'meurtre','assassin','guillotine','pendaison','torture','brûle','écrase',
];

const NUDITY_WORDS = [
  'nu','nue','déshabille','naked','undress','lingerie','bikini','torse nu',
  'poitrine','corps nu','douche','bain','intimate',
];

const LANGUAGE_WORDS = [
  'merde','putain','bordel','enculé','salaud','connard','nique','fuck',
  'shit','damn','bitch','bastard',
];

const DRUG_WORDS = [
  'drogue','cocaïne','héroïne','crack','joint','cannabis','marijuana',
  'seringue','sniffe','overdose','deal','dealer','shit','ecstasy',
];

const WEAPON_WORDS = [
  'fusil','pistolet','revolver','arme','grenade','bombe','missile',
  'dynamite','machette','hache','épée',
];

/**
 * Vérifie le contenu d'une scène pour le compliance IA.
 */
export function complianceCheck(input: ComplianceInput): ComplianceResult {
  const { scene, sceneIndex } = input;
  const flags: ComplianceFlag[] = [];

  const fullText = [
    ...(scene.contenu || []),
    ...scene.dialogues.map(d => d.texte),
  ].join(' ').toLowerCase();

  // Violence
  const violenceHits = VIOLENCE_WORDS.filter(w => fullText.includes(w));
  if (violenceHits.length > 0) {
    flags.push({
      type: 'violence',
      severity: violenceHits.length > 3 ? 'high' : violenceHits.length > 1 ? 'medium' : 'low',
      detail: `Mots détectés : ${violenceHits.join(', ')}`,
      scene: sceneIndex,
    });
  }

  // Nudité
  const nudityHits = NUDITY_WORDS.filter(w => fullText.includes(w));
  if (nudityHits.length > 0) {
    flags.push({
      type: 'nudite',
      severity: nudityHits.length > 2 ? 'high' : 'medium',
      detail: `Mots détectés : ${nudityHits.join(', ')}`,
      scene: sceneIndex,
    });
  }

  // Langage
  const langHits = LANGUAGE_WORDS.filter(w => fullText.includes(w));
  if (langHits.length > 0) {
    flags.push({
      type: 'langage',
      severity: langHits.length > 3 ? 'high' : 'low',
      detail: `Mots détectés : ${langHits.join(', ')}`,
      scene: sceneIndex,
    });
  }

  // Drogue
  const drugHits = DRUG_WORDS.filter(w => fullText.includes(w));
  if (drugHits.length > 0) {
    flags.push({
      type: 'drogue',
      severity: drugHits.length > 2 ? 'high' : 'medium',
      detail: `Mots détectés : ${drugHits.join(', ')}`,
      scene: sceneIndex,
    });
  }

  // Armes
  const weaponHits = WEAPON_WORDS.filter(w => fullText.includes(w));
  if (weaponHits.length > 0) {
    flags.push({
      type: 'arme',
      severity: weaponHits.length > 2 ? 'high' : 'medium',
      detail: `Mots détectés : ${weaponHits.join(', ')}`,
      scene: sceneIndex,
    });
  }

  // Sang
  if (fullText.includes('sang') || fullText.includes('saigne') || fullText.includes('hémorragie')) {
    flags.push({
      type: 'sang',
      severity: 'medium',
      detail: 'Présence de sang détectée',
      scene: sceneIndex,
    });
  }

  // ─── Score et niveau ───
  const highCount = flags.filter(f => f.severity === 'high').length;
  const medCount = flags.filter(f => f.severity === 'medium').length;

  let level: ComplianceLevel = 'OK';
  let score = 100;

  if (highCount > 0) {
    level = 'ERROR';
    score = Math.max(0, 100 - highCount * 30 - medCount * 10);
  } else if (medCount > 0) {
    level = 'WARNING';
    score = Math.max(20, 100 - medCount * 15);
  } else if (flags.length > 0) {
    level = 'WARNING';
    score = Math.max(50, 100 - flags.length * 5);
  }

  return { level, flags, score };
}
