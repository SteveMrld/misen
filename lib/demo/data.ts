// ═══════════════════════════════════════════
// MISEN V8 — 3 Scénarios de démonstration
// ═══════════════════════════════════════════

export interface DemoScenario {
  id: string
  title: string
  genre: string
  tagline: string
  color: string
  script: string
  stats: { scenes: string; plans: string; chars: string; cost: string }
  plans: {
    src: string; label: string; shot: string; model: string; color: string
    dur: number; sub: string; direction: 'right' | 'left' | 'in' | 'out'
  }[]
  copilot: { icon: string; title: string; detail: string }[]
  subtitles: { time: string; char: string; text: string }[]
  generation: { shot: string; model: string; status: string; cost: string }[]
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  // ─── SCÉNARIO 1 : LE POIDS DES CENDRES ───
  {
    id: 'cendres',
    title: 'Le Poids des cendres',
    genre: 'Court-métrage · Drame',
    tagline: 'Deux rives. Un seul fleuve.',
    color: '#f97316',
    script: `INT. APPARTEMENT – MATIN

Un appartement parisien simple. Deux brosses à dents identiques. Deux manteaux identiques.
Mais un seul homme.

ADRIEN (30) se regarde dans le miroir. Il semble hésiter… puis parle.

ADRIEN
On y va aujourd'hui. Pas vrai ?

FLASHBACK — EXT. BORD DE RIVIÈRE – ENFANCE – JOUR

Deux garçons jumeaux de 10 ans : Adrien et Léo. Inséparables.

LÉO
On se promet un truc. Même quand on sera grands…

ADRIEN ENFANT
On fera tout ensemble.

INT. HÔPITAL – JOUR

Adrien marche dans un couloir. Une chambre : LEO MARTIN.
Une infirmière s'approche.

INFIRMIÈRE
Vous pouvez arrêter de venir… ça fait deux ans.

ADRIEN
On avait dit… ensemble.

EXT. BORD DE RIVIÈRE – NUIT

Adrien jette deux cailloux dans l'eau. Les cercles se rejoignent.

FIN`,
    stats: { scenes: '4', plans: '4', chars: '3', cost: '$1.80' },
    plans: [
      { src: '/images/sc1_fleuve.jpg', label: 'SC1-P1', shot: 'Plan large', model: 'Kling 3.0', color: '#3B82F6', dur: 4.2, sub: '', direction: 'right' },
      { src: '/images/sc1_portrait.jpg', label: 'SC1-P2', shot: 'Gros plan', model: 'Veo 3.1', color: '#10B981', dur: 3.5, sub: 'On y va aujourd\'hui. Pas vrai\u00A0?', direction: 'in' },
      { src: '/images/sc1_pont.jpg', label: 'SC2-P1', shot: 'Plan large', model: 'Sora 2', color: '#EC4899', dur: 5.0, sub: '', direction: 'right' },
      { src: '/images/sc1_couloir.jpg', label: 'SC3-P1', shot: 'Travelling', model: 'Runway Gen-4.5', color: '#8B5CF6', dur: 3.8, sub: 'On avait dit\u2026 ensemble.', direction: 'left' },
    ],
    copilot: [
      { icon: '🎬', title: 'Ça me fait penser à...', detail: 'Cinema Paradiso (Tornatore, 1988) — la scène du cinéma. Technique recommandée : lumière projetée sur les visages, contrejour de l\'écran.' },
      { icon: '🎵', title: 'Suggestion musicale', detail: 'Piano solo minimaliste type Yann Tiersen. Max Richter (On the Nature of Daylight) collerait parfaitement au thème du deuil.' },
      { icon: '📐', title: 'As-tu pensé à...', detail: 'Un plan-séquence sans coupe pour la scène de l\'hôpital. La tension continue sans montage renforcerait l\'émotion.' },
      { icon: '🪑', title: 'L\'art du vide', detail: 'Yasujirō Ozu filmait les espaces vides après le départ des personnages — les "pillow shots". La chaise vide est un personnage.' },
    ],
    subtitles: [
      { time: '0:03', char: 'ADRIEN', text: 'On y va aujourd\'hui. Pas vrai ?' },
      { time: '0:12', char: 'LÉO', text: 'On se promet un truc. Même quand on sera grands…' },
      { time: '0:16', char: 'ADRIEN', text: 'On fera tout ensemble.' },
      { time: '0:24', char: 'INFIRMIÈRE', text: 'Vous pouvez arrêter de venir… ça fait deux ans.' },
      { time: '0:28', char: 'ADRIEN', text: 'On avait dit… ensemble.' },
    ],
    generation: [
      { shot: 'PL Fleuve crépuscule', model: 'Kling 3.0', status: '✓', cost: '$0.20' },
      { shot: 'GP Portrait clair-obscur', model: 'Veo 3.1', status: '✓', cost: '$0.25' },
      { shot: 'PL Pont suspendu', model: 'Sora 2', status: '✓', cost: '$0.30' },
      { shot: 'TL Couloir hôpital', model: 'Runway Gen-4.5', status: '✓', cost: '$0.25' },
    ],
  },

  // ─── SCÉNARIO 2 : ODYSSÉE ───
  {
    id: 'odyssee',
    title: 'Odyssée',
    genre: 'Publicité · Parfum luxe',
    tagline: 'Au-delà du visible.',
    color: '#8B5CF6',
    script: `EXT. DÉSERT – AUBE

Des dunes à perte de vue. Un ciel violet-or.
Une FEMME (25) marche pieds nus dans le sable.
Sa robe bleu nuit flotte au vent.

EXT. DÉSERT – AUBE (SUITE)

Sa main effleure le sable brûlant.
Des grains dorés coulent entre ses doigts au ralenti.

INT. PALAIS – NUIT

Un couloir de marbre noir. Reflets dorés.
Elle avance, sa silhouette se reflète dans le sol.
Un flacon de parfum posé sur un piédestal.
La lumière le traverse — prismes.

Elle ferme les yeux. Puis les ouvre.
Regard caméra.

EXT. FALAISE – CRÉPUSCULE

Elle au bord d'une falaise. L'océan en contrebas.
Sa robe flotte au vent. Les étoiles apparaissent.

VOIX OFF (V.O.)
Au-delà du visible. ODYSSÉE.

FIN`,
    stats: { scenes: '4', plans: '6', chars: '1', cost: '$2.10' },
    plans: [
      { src: '/images/sc2_desert.jpg', label: 'SC1-P1', shot: 'Plan large', model: 'Kling 3.0', color: '#3B82F6', dur: 4.5, sub: '', direction: 'right' },
      { src: '/images/sc2_sable.jpg', label: 'SC1-P2', shot: 'Insert', model: 'Runway Gen-4.5', color: '#8B5CF6', dur: 3.0, sub: '', direction: 'in' },
      { src: '/images/sc2_flacon.jpg', label: 'SC2-P1', shot: 'Insert', model: 'Runway Gen-4.5', color: '#8B5CF6', dur: 3.2, sub: '', direction: 'in' },
      { src: '/images/sc2_visage.jpg', label: 'SC2-P2', shot: 'Gros plan', model: 'Veo 3.1', color: '#10B981', dur: 2.8, sub: '', direction: 'in' },
      { src: '/images/sc2_desert2.jpg', label: 'SC3-P1', shot: 'Plan large', model: 'Kling 3.0', color: '#3B82F6', dur: 4.0, sub: '', direction: 'left' },
      { src: '/images/sc2_falaise.jpg', label: 'SC3-P2', shot: 'Contre-plongée', model: 'Sora 2', color: '#EC4899', dur: 3.5, sub: 'Au-delà du visible. ODYSSÉE.', direction: 'out' },
    ],
    copilot: [
      { icon: '🎬', title: 'Référence visuelle', detail: 'Dune (Villeneuve, 2021) — la marche de Chani dans le désert. Lumière rasante à l\'aube, mouvement lent, texture du sable.' },
      { icon: '🎵', title: 'Suggestion musicale', detail: 'Nappe synthétique éthérée, style Vangelis (Blade Runner). Notes tenues, réverbération infinie, montée progressive.' },
      { icon: '💡', title: 'Cadrage produit', detail: 'Le flacon en contre-jour crée un effet prisme naturel. Technique utilisée par Ridley Scott pour les pubs Chanel N°5.' },
      { icon: '🎨', title: 'Palette chromatique', detail: 'Bleu nuit + or = luxe intemporel. Limiter les couleurs chaudes au sable et à la lumière. Le bleu de la robe doit dominer.' },
    ],
    subtitles: [
      { time: '0:18', char: 'VOIX OFF', text: 'Au-delà du visible.' },
      { time: '0:20', char: 'VOIX OFF', text: 'ODYSSÉE.' },
    ],
    generation: [
      { shot: 'PL Femme désert aube', model: 'Kling 3.0', status: '✓', cost: '$0.20' },
      { shot: 'Insert Sable doré ralenti', model: 'Runway Gen-4.5', status: '✓', cost: '$0.25' },
      { shot: 'Insert Flacon marbre', model: 'Runway Gen-4.5', status: '✓', cost: '$0.25' },
      { shot: 'GP Visage regard caméra', model: 'Veo 3.1', status: '✓', cost: '$0.25' },
      { shot: 'PL Désert silhouette', model: 'Kling 3.0', status: '✓', cost: '$0.20' },
      { shot: 'CP Falaise étoiles', model: 'Sora 2', status: '⟳', cost: '$0.30' },
    ],
  },

  // ─── SCÉNARIO 3 : PIXEL ───
  {
    id: 'pixel',
    title: 'Pixel',
    genre: 'Vidéo éducative · IA',
    tagline: 'L\'outil dépend de la main qui le tient.',
    color: '#06B6D4',
    script: `COMMENT UNE IA VOIT-ELLE LE MONDE ?

GROS PLAN — Un œil humain. L'iris se dilate.
Dans le reflet : des lignes de code qui défilent.

TRANSITION — L'iris se transforme en grille de pixels.
Zoom arrière. L'image se décompose.

NARRATEUR (V.O.)
Chaque seconde, une IA traite des millions de pixels.
Mais voir n'est pas comprendre.

LES DONNÉES COMME MATIÈRE PREMIÈRE

VUE AÉRIENNE — Une ville la nuit. Les lumières pulsent.
Les flux de données sont visibles, comme des artères lumineuses.

INSERT — Des mains tapent sur un clavier.
Des particules de lumière s'envolent des touches.

NARRATEUR (V.O.)
Les données sont le carburant. L'algorithme est le moteur.
Mais la direction… c'est vous.

L'IA AU SERVICE DE L'HUMAIN

PLAN MOYEN — Un homme devant des écrans de code.
Les reflets dansent sur ses lunettes.

CONTRE-JOUR — Une silhouette face au coucher de soleil.
Un hologramme de données flotte autour d'elle.

NARRATEUR (V.O.)
L'intelligence artificielle n'est pas une destination.
C'est un outil. Et comme tout outil…
Tout dépend de la main qui le tient.

FIN`,
    stats: { scenes: '3', plans: '4', chars: '0', cost: '$1.60' },
    plans: [
      { src: '/images/sc3_oeil.jpg', label: 'SC1-P1', shot: 'Macro', model: 'Veo 3.1', color: '#10B981', dur: 3.5, sub: 'Chaque seconde, une IA traite des millions de pixels.', direction: 'in' },
      { src: '/images/sc3_ville.jpg', label: 'SC2-P1', shot: 'Aérien', model: 'Kling 3.0', color: '#3B82F6', dur: 4.0, sub: 'Les données sont le carburant.', direction: 'right' },
      { src: '/images/sc3_homme_ecran.jpg', label: 'SC3-P1', shot: 'Plan moyen', model: 'Runway Gen-4.5', color: '#8B5CF6', dur: 3.8, sub: 'L\'algorithme est le moteur.', direction: 'left' },
      { src: '/images/sc3_silhouette.jpg', label: 'SC3-P2', shot: 'Contre-jour', model: 'Sora 2', color: '#EC4899', dur: 5.0, sub: 'Tout dépend de la main qui le tient.', direction: 'out' },
    ],
    copilot: [
      { icon: '🎬', title: 'Référence visuelle', detail: 'Ex Machina (Garland, 2014) — esthétique clean, néons froids, plans symétriques. Her (Jonze, 2013) pour la chaleur humaine.' },
      { icon: '🎵', title: 'Suggestion musicale', detail: 'Électronique organique : Ólafur Arnalds, Nils Frahm. Mélange piano + textures digitales pour symboliser la fusion homme-machine.' },
      { icon: '📐', title: 'Transition œil→pixel', detail: 'Morphing progressif avec particules. Chaque pixel de l\'iris se détache comme un point de données. Référence : titre de Westworld.' },
      { icon: '💡', title: 'Narration', detail: 'Voix posée, ni trop grave ni robotique. Ton TED Talk : accessible, pas condescendant. Pauses longues pour laisser respirer les images.' },
    ],
    subtitles: [
      { time: '0:03', char: 'NARRATEUR', text: 'Chaque seconde, une IA traite des millions de pixels.' },
      { time: '0:06', char: 'NARRATEUR', text: 'Mais voir n\'est pas comprendre.' },
      { time: '0:12', char: 'NARRATEUR', text: 'Les données sont le carburant. L\'algorithme est le moteur.' },
      { time: '0:16', char: 'NARRATEUR', text: 'Mais la direction… c\'est vous.' },
      { time: '0:22', char: 'NARRATEUR', text: 'L\'intelligence artificielle n\'est pas une destination.' },
      { time: '0:26', char: 'NARRATEUR', text: 'Tout dépend de la main qui le tient.' },
    ],
    generation: [
      { shot: 'Macro Œil iris code', model: 'Veo 3.1', status: '✓', cost: '$0.25' },
      { shot: 'Aérien Ville nuit data', model: 'Kling 3.0', status: '✓', cost: '$0.20' },
      { shot: 'PM Homme écrans code', model: 'Runway Gen-4.5', status: '✓', cost: '$0.25' },
      { shot: 'CJ Silhouette hologramme', model: 'Sora 2', status: '✓', cost: '$0.30' },
    ],
  },
]

export const DEMO_WALKTHROUGH = [
  { step: 'script', title: '1. Le script', narration: '', duration: 5000 },
  { step: 'analyse', title: '2. Analyse IA', narration: '', duration: 6000 },
  { step: 'timeline', title: '3. Timeline', narration: '', duration: 5000 },
  { step: 'copilot', title: '4. Copilote IA', narration: '', duration: 5000 },
  { step: 'media', title: '5. Médias', narration: '', duration: 5000 },
  { step: 'subtitles', title: '6. Sous-titres', narration: '', duration: 5000 },
  { step: 'generate', title: '7. Génération', narration: '', duration: 5000 },
  { step: 'result', title: '8. Votre film', narration: '', duration: 8000 },
]

// Narrations per scenario
export const NARRATIONS: Record<string, Record<string, string>> = {
  cendres: {
    script: 'MISEN analyse votre scénario. "Le Poids des cendres" — un court-métrage sur le deuil et le lien fraternel. 4 scènes, format Fountain détecté.',
    analyse: '13 moteurs travaillent en parallèle : intention émotionnelle, grammaire cinématique, personnages, tension dramatique, coûts.',
    timeline: 'Chaque plan est positionné sur la timeline avec durée, modèle IA et piste audio.',
    copilot: 'L\'assistant créatif vous guide : références cinéma, suggestions de plans, recommandations musicales.',
    media: 'Cherchez des images de référence depuis Pexels et Pixabay. Construisez votre moodboard visuel.',
    subtitles: 'Les dialogues sont extraits automatiquement en SRT/VTT. Choisissez une voix pour la narration.',
    generate: 'Chaque plan reçoit le modèle IA optimal. Un clic et Kling, Runway, Sora ou Veo produisent la vidéo.',
    result: 'Votre scénario est devenu un film. Plans montés, transitions, sous-titres synchronisés.',
  },
  odyssee: {
    script: '"Odyssée" — une publicité parfum luxe de 45 secondes. Esthétique onirique, palette bleu nuit et or.',
    analyse: '13 moteurs IA analysent le script : ambiance visuelle, cadrage produit, rythme publicitaire, coût par plan.',
    timeline: '6 plans en 21 secondes. Rythme publicitaire rapide avec pauses contemplatives sur le produit.',
    copilot: 'Références Dune, Blade Runner. Suggestions palette chromatique et cadrage produit luxe.',
    media: 'Références visuelles : déserts, architecture luxe, textures sable et marbre pour le moodboard.',
    subtitles: 'Une seule voix off finale : "Au-delà du visible." Ton éthéré, réverbération longue.',
    generate: '6 plans générés — Kling pour le mouvement, Runway pour les textures, Veo pour le portrait.',
    result: 'Votre spot publicitaire. 21 secondes de cinéma luxe, du désert aux étoiles.',
  },
  pixel: {
    script: '"Pixel" — une vidéo éducative sur l\'IA. 2 minutes, ton accessible, esthétique tech moderne.',
    analyse: 'Analyse spéciale format éducatif : rythme de narration, segmentation thématique, complexité visuelle.',
    timeline: '4 plans, transitions fluides. Rythme TED Talk : images fortes + pauses pour la narration.',
    copilot: 'Références Ex Machina, Her. Mélange esthétique froide (tech) et chaude (humain).',
    media: 'Images de référence : macro yeux, villes la nuit, interfaces code, silhouettes contemplatives.',
    subtitles: '6 segments de narration. Voix posée, ton accessible. Pauses longues entre les sections.',
    generate: '4 plans — Veo pour la macro organique, Kling pour l\'aérien, Sora pour les VFX.',
    result: 'Votre vidéo éducative. De l\'œil humain à l\'horizon digital, en 4 plans.',
  },
}
