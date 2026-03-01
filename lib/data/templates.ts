// ═══════════════════════════════════════════
// MISEN V9 — Templates Scénarios Professionnels
// ═══════════════════════════════════════════

export interface ScenarioTemplate {
  id: string
  category: 'luxury' | 'shortFilm' | 'musicVideo' | 'educational' | 'gameTrailer' | 'corporate'
  title: { fr: string; en: string }
  genre: { fr: string; en: string }
  tagline: { fr: string; en: string }
  color: string
  icon: string
  script: string
  style_preset: string
  stats: { scenes: number; plans: number; chars: number; cost: string; duration: string }
  analysis: {
    scenes: { heading: string; summary: string }[]
    plans: {
      shotType: string
      cameraMove: string
      modelId: string
      estimatedDuration: number
      estimatedCost: number
      sceneIndex: number
      basePrompt: string
    }[]
    tension: {
      curve: { scene: number; tension: number }[]
      arc: string
      mean: number
    }
    characterBible: { name: string; apparence: string; traits: string[] }[]
    continuity: { score: number; alerts: { type: string; severity: string }[] }
    compliance: { level: string; score: number; flags: any[] }
    costTotal: number
  }
}

export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  // ─── 1. PUBLICITÉ LUXE — PARFUM ───
  {
    id: 'luxe-parfum',
    category: 'luxury',
    title: { fr: 'Éclat d\'Or', en: 'Golden Radiance' },
    genre: { fr: 'Publicité · Parfum luxe · 30s', en: 'Ad · Luxury Perfume · 30s' },
    tagline: { fr: 'L\'essence de l\'éternel.', en: 'The essence of eternity.' },
    color: '#D4AF37',
    icon: '✨',
    script: `EXT. DÉSERT DORÉ — COUCHER DE SOLEIL

Des dunes à perte de vue. Lumière dorée rasante. Le vent soulève des grains de sable comme de la poussière d'étoiles.

Une FEMME (30) apparaît au sommet d'une dune. Robe fluide dorée. Elle avance avec assurance.

EXT. OASIS — CRÉPUSCULE

L'eau reflète le ciel. La femme s'agenouille, touche l'eau du bout des doigts. Des rides dorées se propagent.

INSERT — FLACON

Le flacon émerge de l'eau. Design épuré, verre ambré. La lumière joue sur ses facettes.

SUPER: ÉCLAT D'OR — L'essence de l'éternel.

EXT. DÉSERT — NUIT ÉTOILÉE

La femme regarde les étoiles. Le flacon dans sa main. Plan large final sur le désert illuminé par la lune.`,
    style_preset: 'cinematique',
    stats: { scenes: 4, plans: 8, chars: 1, cost: '$3.20', duration: '32s' },
    analysis: {
      scenes: [
        { heading: 'EXT. DÉSERT DORÉ — COUCHER DE SOLEIL', summary: 'Introduction visuelle, dunes et lumière dorée' },
        { heading: 'EXT. OASIS — CRÉPUSCULE', summary: 'Moment intime avec l\'eau' },
        { heading: 'INSERT — FLACON', summary: 'Product shot' },
        { heading: 'EXT. DÉSERT — NUIT ÉTOILÉE', summary: 'Plan final, ouverture cosmique' },
      ],
      plans: [
        { shotType: 'Plan large', cameraMove: 'drone-forward', modelId: 'Kling 3.0', estimatedDuration: 4.5, estimatedCost: 0.23, sceneIndex: 0, basePrompt: 'Sweeping aerial shot of golden desert dunes at sunset, sand particles in golden light, cinematic lens flare, warm amber tones, 8K' },
        { shotType: 'Plan moyen', cameraMove: 'tracking', modelId: 'Runway Gen-4.5', estimatedDuration: 3.5, estimatedCost: 0.26, sceneIndex: 0, basePrompt: 'Elegant woman in flowing gold dress appearing at dune crest, backlit sunset, wind in fabric, luxury fashion aesthetic, shallow depth of field' },
        { shotType: 'Plan large', cameraMove: 'crane-down', modelId: 'Sora 2', estimatedDuration: 4.0, estimatedCost: 0.32, sceneIndex: 1, basePrompt: 'Crystal clear oasis reflecting twilight sky, woman kneeling at water edge, golden ripples spreading, dreamlike atmosphere' },
        { shotType: 'Gros plan', cameraMove: 'fixe', modelId: 'Veo 3.1', estimatedDuration: 3.0, estimatedCost: 0.18, sceneIndex: 1, basePrompt: 'Extreme close-up of fingertips touching water surface, golden ripples, reflection of face, luxury cosmetic aesthetic' },
        { shotType: 'Insert', cameraMove: 'rotation', modelId: 'Hailuo 2.3', estimatedDuration: 3.5, estimatedCost: 0.12, sceneIndex: 2, basePrompt: 'Perfume bottle emerging from water in slow motion, amber glass catching light, luxury product photography, black background transition' },
        { shotType: 'Très gros plan', cameraMove: 'macro-track', modelId: 'Runway Gen-4.5', estimatedDuration: 2.5, estimatedCost: 0.19, sceneIndex: 2, basePrompt: 'Light refracting through amber perfume bottle facets, golden caustics, product hero shot, luxury minimalism' },
        { shotType: 'Plan moyen', cameraMove: 'steadicam', modelId: 'Kling 3.0', estimatedDuration: 4.0, estimatedCost: 0.20, sceneIndex: 3, basePrompt: 'Woman gazing at starlit sky in desert, holding perfume bottle, moonlight on skin, celestial atmosphere, silver and gold palette' },
        { shotType: 'Plan large', cameraMove: 'drone-pull-back', modelId: 'Sora 2', estimatedDuration: 5.0, estimatedCost: 0.40, sceneIndex: 3, basePrompt: 'Final wide shot desert under full moon, lone figure silhouette, vast starry sky, epic scale, brand typography overlay space' },
      ],
      tension: {
        curve: [{ scene: 0, tension: 40 }, { scene: 1, tension: 65 }, { scene: 2, tension: 85 }, { scene: 3, tension: 55 }],
        arc: 'pyramid',
        mean: 61,
      },
      characterBible: [
        { name: 'La Femme', apparence: 'Femme 30 ans, élégante, robe dorée fluide, peau lumineuse', traits: ['grâce', 'mystère', 'assurance'] },
      ],
      continuity: { score: 95, alerts: [] },
      compliance: { level: 'OK', score: 100, flags: [] },
      costTotal: 1.90,
    },
  },

  // ─── 2. COURT-MÉTRAGE DRAME ───
  {
    id: 'court-drame',
    category: 'shortFilm',
    title: { fr: 'L\'Horloge Muette', en: 'The Silent Clock' },
    genre: { fr: 'Court-métrage · Drame · 3min', en: 'Short Film · Drama · 3min' },
    tagline: { fr: 'Le temps ne guérit pas. Il attend.', en: 'Time doesn\'t heal. It waits.' },
    color: '#64748B',
    icon: '🎬',
    script: `INT. ATELIER D'HORLOGER — MATIN

Un atelier poussiéreux. Des centaines d'horloges aux murs. Toutes arrêtées.

PAUL (65), horloger retraité, entre avec un café. Il s'assied devant son établi. Ses mains tremblent légèrement.

Il ouvre un tiroir. Une montre à gousset. Gravée : "À mon fils — Papa".

PAUL
(murmure)
Encore un matin sans toi.

FLASHBACK — EXT. PARC — JOUR (20 ANS PLUS TÔT)

PAUL (45) apprend à LUCAS (8) à remonter une montre mécanique.

LUCAS
Papa, pourquoi les montres s'arrêtent ?

PAUL
Parce qu'elles ont besoin qu'on prenne soin d'elles.

LUCAS
Comme nous ?

PAUL
(souriant)
Exactement comme nous.

INT. ATELIER — JOUR (PRÉSENT)

Paul prend ses outils. Pour la première fois, il commence à réparer la montre à gousset. Ses mains ne tremblent plus.

Tic. Tac. Tic. Tac.

Le son remplit l'atelier. Paul ferme les yeux. Un sourire.

Autour de lui, une à une, les horloges reprennent vie.

FIN`,
    style_preset: 'cinematique',
    stats: { scenes: 4, plans: 10, chars: 2, cost: '$4.50', duration: '3m10s' },
    analysis: {
      scenes: [
        { heading: 'INT. ATELIER D\'HORLOGER — MATIN', summary: 'Introduction du personnage et de l\'espace' },
        { heading: 'FLASHBACK — EXT. PARC — JOUR', summary: 'Mémoire avec le fils' },
        { heading: 'INT. ATELIER — JOUR (PRÉSENT)', summary: 'Réparation et renaissance' },
        { heading: 'FINALE — Horloges reprennent vie', summary: 'Climax émotionnel' },
      ],
      plans: [
        { shotType: 'Plan large', cameraMove: 'travelling-lent', modelId: 'Runway Gen-4.5', estimatedDuration: 5.0, estimatedCost: 0.38, sceneIndex: 0, basePrompt: 'Dusty watchmaker workshop, hundreds of stopped clocks on walls, morning light through window, cinematic warm tones, shallow DOF' },
        { shotType: 'Plan moyen', cameraMove: 'fixe', modelId: 'Veo 3.1', estimatedDuration: 4.0, estimatedCost: 0.24, sceneIndex: 0, basePrompt: 'Elderly watchmaker sitting at workbench, trembling hands holding coffee, surrounded by silent clocks, intimate portrait lighting' },
        { shotType: 'Insert', cameraMove: 'rack-focus', modelId: 'Kling 3.0', estimatedDuration: 3.0, estimatedCost: 0.15, sceneIndex: 0, basePrompt: 'Close-up pocket watch engraved "À mon fils - Papa", drawer opening, dust particles in light beam, sentimental object' },
        { shotType: 'Gros plan', cameraMove: 'fixe', modelId: 'Veo 3.1', estimatedDuration: 3.5, estimatedCost: 0.21, sceneIndex: 0, basePrompt: 'Close-up elderly man whispering, tear forming in eye, natural window light, raw emotion, 85mm portrait lens' },
        { shotType: 'Plan moyen', cameraMove: 'steadicam', modelId: 'Kling 3.0', estimatedDuration: 5.0, estimatedCost: 0.25, sceneIndex: 1, basePrompt: 'Father teaching young boy to wind mechanical watch in sunlit park, warm golden hour, 1990s clothing, nostalgic atmosphere' },
        { shotType: 'Gros plan', cameraMove: 'fixe', modelId: 'Veo 3.1', estimatedDuration: 4.5, estimatedCost: 0.27, sceneIndex: 1, basePrompt: 'Child and father hands together on pocket watch, dialogue scene, natural park bokeh, emotional connection, lip sync' },
        { shotType: 'Plan rapproché', cameraMove: 'dolly-in', modelId: 'Runway Gen-4.5', estimatedDuration: 6.0, estimatedCost: 0.45, sceneIndex: 2, basePrompt: 'Watchmaker repairing pocket watch with steady hands, precision tools, macro detail, determination in eyes, dramatic lighting shift' },
        { shotType: 'Très gros plan', cameraMove: 'fixe', modelId: 'Hailuo 2.3', estimatedDuration: 3.0, estimatedCost: 0.11, sceneIndex: 2, basePrompt: 'Extreme close-up watch gears beginning to turn, ticking sound implied, golden mechanism, slow motion, satisfying mechanical detail' },
        { shotType: 'Gros plan', cameraMove: 'fixe', modelId: 'Kling 3.0', estimatedDuration: 3.5, estimatedCost: 0.18, sceneIndex: 3, basePrompt: 'Elderly man closing eyes with peaceful smile, soft light on face, emotional catharsis, single tear of joy' },
        { shotType: 'Plan large', cameraMove: 'crane-up', modelId: 'Sora 2', estimatedDuration: 6.0, estimatedCost: 0.48, sceneIndex: 3, basePrompt: 'Workshop clocks restarting one by one, cascading movement, magical realism, warm light spreading, crane shot revealing hundreds of ticking clocks' },
      ],
      tension: {
        curve: [{ scene: 0, tension: 35 }, { scene: 1, tension: 60 }, { scene: 2, tension: 75 }, { scene: 3, tension: 90 }],
        arc: 'ascending',
        mean: 65,
      },
      characterBible: [
        { name: 'Paul', apparence: 'Homme 65 ans, cheveux gris, lunettes d\'horloger, mains marquées', traits: ['mélancolie', 'précision', 'tendresse'] },
        { name: 'Lucas', apparence: 'Garçon 8 ans, curieux, flashback années 90', traits: ['innocence', 'curiosité'] },
      ],
      continuity: { score: 90, alerts: [{ type: 'Raccord temporel flashback/présent', severity: 'low' }] },
      compliance: { level: 'OK', score: 100, flags: [] },
      costTotal: 2.72,
    },
  },

  // ─── 3. CLIP MUSICAL ───
  {
    id: 'clip-musical',
    category: 'musicVideo',
    title: { fr: 'Neon Hearts', en: 'Neon Hearts' },
    genre: { fr: 'Clip musical · Electro-pop · 60s', en: 'Music Video · Electro-pop · 60s' },
    tagline: { fr: 'Danser dans la lumière.', en: 'Dancing in the light.' },
    color: '#EC4899',
    icon: '🎵',
    script: `EXT. VILLE — NUIT

Néons. Pluie. Reflets multicolores sur l'asphalte mouillé.

MIA (25) danse seule au milieu d'un carrefour vide. Pas de musique visible — elle entend ce que nous entendons.

SÉQUENCE CHORÉGRAPHIÉE — RUELLE

Mia traverse une ruelle. Chaque pas déclenche une explosion de lumière néon au sol. Rose. Bleu. Violet.

Des DANSEURS apparaissent derrière elle, un par un, synchronisés.

INT. ENTREPÔT ABANDONNÉ

Fumée. Stroboscopes. Le groupe danse ensemble. Énergie maximale.

Au climax, Mia s'arrête. Tout s'arrête. Noir.

Un seul néon s'allume : un cœur rose.

EXT. TOIT — AUBE

Mia seule sur un toit. La ville s'éveille. Elle sourit.`,
    style_preset: 'onirique',
    stats: { scenes: 4, plans: 8, chars: 1, cost: '$3.80', duration: '62s' },
    analysis: {
      scenes: [
        { heading: 'EXT. VILLE — NUIT', summary: 'Ouverture urbaine néon' },
        { heading: 'SÉQUENCE CHORÉGRAPHIÉE — RUELLE', summary: 'Performance chorégraphique' },
        { heading: 'INT. ENTREPÔT ABANDONNÉ', summary: 'Climax danse de groupe' },
        { heading: 'EXT. TOIT — AUBE', summary: 'Résolution calme' },
      ],
      plans: [
        { shotType: 'Plan large', cameraMove: 'drone-descend', modelId: 'Sora 2', estimatedDuration: 5.0, estimatedCost: 0.40, sceneIndex: 0, basePrompt: 'Neon-lit city intersection at night, rain-slicked streets, colorful reflections, cyberpunk atmosphere, overhead drone descending' },
        { shotType: 'Plan moyen', cameraMove: 'orbite', modelId: 'Seedance 2.0', estimatedDuration: 8.0, estimatedCost: 0.48, sceneIndex: 0, basePrompt: 'Young woman dancing alone at empty crossroads, fluid contemporary dance, neon reflections on wet ground, 360 orbit camera, rain' },
        { shotType: 'Travelling', cameraMove: 'tracking-lateral', modelId: 'Seedance 2.0', estimatedDuration: 8.0, estimatedCost: 0.48, sceneIndex: 1, basePrompt: 'Dancer moving through neon alley, each step triggers neon light explosion on ground, pink blue purple, magical realism, lateral tracking' },
        { shotType: 'Plan large', cameraMove: 'steadicam', modelId: 'Kling 3.0', estimatedDuration: 6.0, estimatedCost: 0.30, sceneIndex: 1, basePrompt: 'Backup dancers appearing one by one behind lead, synchronized choreography in neon alley, dramatic silhouettes' },
        { shotType: 'Plan moyen', cameraMove: 'handheld', modelId: 'Seedance 2.0', estimatedDuration: 10.0, estimatedCost: 0.60, sceneIndex: 2, basePrompt: 'Group dance in abandoned warehouse, smoke machines, strobe lights, maximum energy, contemporary dance, wide dynamic range' },
        { shotType: 'Gros plan', cameraMove: 'whip-pan', modelId: 'Runway Gen-4.5', estimatedDuration: 3.0, estimatedCost: 0.23, sceneIndex: 2, basePrompt: 'Close-up dancer face in strobe light, sweat drops, intense expression, freeze moment, everything stops, darkness' },
        { shotType: 'Insert', cameraMove: 'fixe', modelId: 'Wan 2.5', estimatedDuration: 4.0, estimatedCost: 0.16, sceneIndex: 2, basePrompt: 'Single pink neon heart sign illuminating in darkness, minimal, pulsing glow, symbolic, clean background' },
        { shotType: 'Plan large', cameraMove: 'crane-up', modelId: 'Sora 2', estimatedDuration: 8.0, estimatedCost: 0.64, sceneIndex: 3, basePrompt: 'Woman on rooftop at dawn, city awakening below, warm sunrise light replacing neon, peaceful smile, crane ascending to reveal skyline' },
      ],
      tension: {
        curve: [{ scene: 0, tension: 50 }, { scene: 1, tension: 70 }, { scene: 2, tension: 95 }, { scene: 3, tension: 30 }],
        arc: 'climactic',
        mean: 61,
      },
      characterBible: [
        { name: 'Mia', apparence: 'Femme 25 ans, tenue urbaine stylisée, sneakers néon', traits: ['énergie', 'liberté', 'magnétisme'] },
      ],
      continuity: { score: 88, alerts: [{ type: 'Raccord costume ruelle/entrepôt', severity: 'low' }] },
      compliance: { level: 'OK', score: 100, flags: [] },
      costTotal: 3.29,
    },
  },

  // ─── 4. VIDÉO ÉDUCATIVE ───
  {
    id: 'educatif',
    category: 'educational',
    title: { fr: 'L\'Océan Invisible', en: 'The Invisible Ocean' },
    genre: { fr: 'Vidéo éducative · Sciences · 2min', en: 'Educational · Science · 2min' },
    tagline: { fr: 'Ce que l\'œil ne voit pas.', en: 'What the eye can\'t see.' },
    color: '#06B6D4',
    icon: '🎓',
    script: `EXT. OCÉAN — JOUR — VUE AÉRIENNE

Un océan calme vu d'en haut. Surface bleue infinie.

NARRATEUR (V.O.)
Sous cette surface, un monde invisible travaille pour nous. Chaque jour.

TRANSITION — PLONGÉE SOUS-MARINE

La caméra plonge sous l'eau. Révélation du monde sous-marin.

NARRATEUR (V.O.)
Le phytoplancton. Microscopique. Essentiel.

ANIMATION — INFOGRAPHIE

Schéma animé : le phytoplancton absorbe le CO2, produit 50% de l'oxygène terrestre.

NARRATEUR (V.O.)
50% de l'oxygène que vous respirez vient de l'océan. Pas des forêts.

EXT. OCÉAN — COUCHER DE SOLEIL

Retour à la surface. Lumière dorée sur l'eau.

NARRATEUR (V.O.)
Protéger l'océan, c'est protéger chaque respiration.

SUPER: L'Océan Invisible — Partagez cette connaissance.`,
    style_preset: 'documentaire',
    stats: { scenes: 4, plans: 7, chars: 0, cost: '$2.60', duration: '2m05s' },
    analysis: {
      scenes: [
        { heading: 'EXT. OCÉAN — JOUR — VUE AÉRIENNE', summary: 'Ouverture aérienne océan' },
        { heading: 'TRANSITION — PLONGÉE SOUS-MARINE', summary: 'Révélation monde sous-marin' },
        { heading: 'ANIMATION — INFOGRAPHIE', summary: 'Données scientifiques animées' },
        { heading: 'EXT. OCÉAN — COUCHER DE SOLEIL', summary: 'Conclusion émotionnelle' },
      ],
      plans: [
        { shotType: 'Plan large aérien', cameraMove: 'drone-forward', modelId: 'Kling 3.0', estimatedDuration: 5.0, estimatedCost: 0.25, sceneIndex: 0, basePrompt: 'Aerial view of calm deep blue ocean, infinite surface, morning light, documentary cinematography, 4K drone shot' },
        { shotType: 'Plan séquence', cameraMove: 'plongée', modelId: 'Sora 2', estimatedDuration: 8.0, estimatedCost: 0.64, sceneIndex: 1, basePrompt: 'Camera diving from ocean surface underwater, transition from blue sky to underwater world, sunlight rays penetrating, reveal marine life, seamless single shot' },
        { shotType: 'Macro', cameraMove: 'tracking', modelId: 'Runway Gen-4.5', estimatedDuration: 5.0, estimatedCost: 0.38, sceneIndex: 1, basePrompt: 'Microscopic phytoplankton in ocean water, bioluminescent, extreme macro photography, scientific beauty, floating particles in blue' },
        { shotType: 'Animation', cameraMove: 'fixe', modelId: 'Wan 2.5', estimatedDuration: 8.0, estimatedCost: 0.32, sceneIndex: 2, basePrompt: 'Animated infographic: phytoplankton absorbing CO2 molecules, producing O2 bubbles, clean motion graphics, blue and green palette, data visualization' },
        { shotType: 'Animation', cameraMove: 'zoom-out', modelId: 'Wan 2.5', estimatedDuration: 6.0, estimatedCost: 0.24, sceneIndex: 2, basePrompt: 'Animated diagram showing 50% oxygen comes from ocean, Earth split view forest vs ocean, percentage counter, educational motion design' },
        { shotType: 'Plan large', cameraMove: 'drone-pull-back', modelId: 'Kling 3.0', estimatedDuration: 6.0, estimatedCost: 0.30, sceneIndex: 3, basePrompt: 'Ocean surface at golden sunset, calm waves reflecting orange light, contemplative mood, documentary conclusion, wide cinematic framing' },
        { shotType: 'Plan large', cameraMove: 'fixe', modelId: 'Hailuo 2.3', estimatedDuration: 4.0, estimatedCost: 0.14, sceneIndex: 3, basePrompt: 'Final title card over ocean sunset, clean typography space, brand overlay, call to action, warm golden tones fading to black' },
      ],
      tension: {
        curve: [{ scene: 0, tension: 25 }, { scene: 1, tension: 55 }, { scene: 2, tension: 70 }, { scene: 3, tension: 45 }],
        arc: 'informative',
        mean: 49,
      },
      characterBible: [],
      continuity: { score: 98, alerts: [] },
      compliance: { level: 'OK', score: 100, flags: [] },
      costTotal: 2.27,
    },
  },

  // ─── 5. TRAILER JEU VIDÉO ───
  {
    id: 'game-trailer',
    category: 'gameTrailer',
    title: { fr: 'EXODUS — Réveil', en: 'EXODUS — Awakening' },
    genre: { fr: 'Trailer · Jeu vidéo · Action-RPG · 45s', en: 'Trailer · Video Game · Action-RPG · 45s' },
    tagline: { fr: 'Le dernier monde. Le premier combat.', en: 'The last world. The first fight.' },
    color: '#EF4444',
    icon: '🎮',
    script: `EXT. MONDE POST-APOCALYPTIQUE — NUIT

Ruines d'une mégapole. Ciel rouge sang. Végétation mutante envahit les buildings.

TEXTE À L'ÉCRAN: "2187. L'humanité a perdu."

EXT. CRATÈRE — AUBE

Au centre d'un cratère, une capsule s'ouvre. KAI (25) émerge. Armure biomécanique. Yeux luminescents.

KAI (V.O.)
Ils pensaient que c'était fini. Ils avaient tort.

SÉQUENCE D'ACTION — MONTAGE RAPIDE

Kai combat des créatures mutantes. Épée plasma. Bouclier énergétique. Mouvements fluides.

Alternance de plans rapides : course sur les toits, saut entre buildings, explosion.

EXT. SOMMET — CRÉPUSCULE

Kai se tient au sommet du plus haut building. Vue sur le monde dévasté.

KAI (V.O.)
Ce monde n'est pas mort. Il attend.

LOGO: EXODUS — 2026

TEXTE: "Pre-order now"`,
    style_preset: 'cinematique',
    stats: { scenes: 4, plans: 9, chars: 1, cost: '$4.10', duration: '48s' },
    analysis: {
      scenes: [
        { heading: 'EXT. MONDE POST-APOCALYPTIQUE — NUIT', summary: 'Establishing shot monde dévasté' },
        { heading: 'EXT. CRATÈRE — AUBE', summary: 'Réveil du protagoniste' },
        { heading: 'SÉQUENCE D\'ACTION — MONTAGE', summary: 'Séquence combat dynamique' },
        { heading: 'EXT. SOMMET — CRÉPUSCULE', summary: 'Hero shot final' },
      ],
      plans: [
        { shotType: 'Plan large', cameraMove: 'drone-forward', modelId: 'Sora 2', estimatedDuration: 5.0, estimatedCost: 0.40, sceneIndex: 0, basePrompt: 'Post-apocalyptic megacity ruins, blood-red sky, mutant vegetation overtaking skyscrapers, cinematic wide shot, dramatic lighting, AAA game quality' },
        { shotType: 'Plan moyen', cameraMove: 'dolly-in', modelId: 'Kling 3.0', estimatedDuration: 4.0, estimatedCost: 0.20, sceneIndex: 1, basePrompt: 'Biomechanical capsule opening in crater, steam rising, first light of dawn, sci-fi atmosphere, dramatic reveal' },
        { shotType: 'Gros plan', cameraMove: 'fixe', modelId: 'Runway Gen-4.5', estimatedDuration: 3.0, estimatedCost: 0.23, sceneIndex: 1, basePrompt: 'Hero character emerging from capsule, luminescent eyes activating, biomechanical armor details, face reveal, intense expression' },
        { shotType: 'Plan moyen', cameraMove: 'tracking-rapide', modelId: 'Seedance 2.0', estimatedDuration: 4.0, estimatedCost: 0.24, sceneIndex: 2, basePrompt: 'Warrior fighting mutant creatures with plasma sword, dynamic combat choreography, energy shield blocking, fast-paced action' },
        { shotType: 'Plan large', cameraMove: 'handheld', modelId: 'Kling 3.0', estimatedDuration: 3.0, estimatedCost: 0.15, sceneIndex: 2, basePrompt: 'Parkour across ruined rooftops, jumping between buildings, explosion in background, action movie pacing, dynamic camera' },
        { shotType: 'Plan rapproché', cameraMove: 'whip-pan', modelId: 'Sora 2', estimatedDuration: 2.5, estimatedCost: 0.20, sceneIndex: 2, basePrompt: 'Quick cuts montage: plasma sword slash, energy shield impact, mutant creature close-up, sparks flying, intense combat' },
        { shotType: 'Plan moyen', cameraMove: 'slow-motion', modelId: 'Runway Gen-4.5', estimatedDuration: 3.5, estimatedCost: 0.26, sceneIndex: 2, basePrompt: 'Hero mid-air between buildings in slow motion, cape flowing, city burning below, epic action pose, cinematic slow-mo' },
        { shotType: 'Plan large', cameraMove: 'crane-up', modelId: 'Sora 2', estimatedDuration: 5.0, estimatedCost: 0.40, sceneIndex: 3, basePrompt: 'Hero standing atop tallest building, devastated world panorama, wind in hair, sunset behind, epic hero shot, AAA game cinematic' },
        { shotType: 'Titre', cameraMove: 'fixe', modelId: 'Wan 2.5', estimatedDuration: 4.0, estimatedCost: 0.16, sceneIndex: 3, basePrompt: 'Game logo EXODUS appearing with particle effects, metallic text, red energy glow, dark background, pre-order call to action' },
      ],
      tension: {
        curve: [{ scene: 0, tension: 45 }, { scene: 1, tension: 60 }, { scene: 2, tension: 95 }, { scene: 3, tension: 70 }],
        arc: 'action-peak',
        mean: 68,
      },
      characterBible: [
        { name: 'Kai', apparence: 'Homme 25 ans, armure biomécanique noire/bleue, yeux luminescents', traits: ['détermination', 'force', 'résilience'] },
      ],
      continuity: { score: 85, alerts: [{ type: 'Raccord armure entre plans rapides', severity: 'medium' }] },
      compliance: { level: 'OK', score: 95, flags: [{ type: 'Violence stylisée — acceptable pour rating T', severity: 'low' }] },
      costTotal: 2.24,
    },
  },

  // ─── 6. FILM CORPORATE ───
  {
    id: 'corporate',
    category: 'corporate',
    title: { fr: 'Horizon', en: 'Horizon' },
    genre: { fr: 'Film corporate · Tech · 90s', en: 'Corporate Film · Tech · 90s' },
    tagline: { fr: 'Construire demain, ensemble.', en: 'Building tomorrow, together.' },
    color: '#3B82F6',
    icon: '🏢',
    script: `INT. BUREAU MODERNE — MATIN

Open space lumineux. Grande baie vitrée sur la ville.

NARRATEUR (V.O.)
Chez Horizon, nous croyons que la technologie doit servir l'humain.

Plan sur des COLLABORATEURS travaillant ensemble. Diversité. Sourires. Écrans avec des data.

INT. LABORATOIRE R&D — JOUR

Des INGÉNIEURS testent un prototype. Hologrammes. Concentration et enthousiasme.

NARRATEUR (V.O.)
Notre équipe R&D repousse les limites chaque jour.

EXT. TERRASSE ROOFTOP — FIN DE JOURNÉE

L'équipe célèbre un lancement. Vue panoramique sur la ville.

NARRATEUR (V.O.)
Innovation. Collaboration. Impact.

SUPER: HORIZON — Building tomorrow, together.
SUPER: horizon-tech.com`,
    style_preset: 'documentaire',
    stats: { scenes: 3, plans: 7, chars: 0, cost: '$2.10', duration: '1m32s' },
    analysis: {
      scenes: [
        { heading: 'INT. BUREAU MODERNE — MATIN', summary: 'Culture d\'entreprise et équipe' },
        { heading: 'INT. LABORATOIRE R&D — JOUR', summary: 'Innovation et R&D' },
        { heading: 'EXT. TERRASSE ROOFTOP — FIN DE JOURNÉE', summary: 'Célébration et conclusion' },
      ],
      plans: [
        { shotType: 'Plan large', cameraMove: 'steadicam', modelId: 'Kling 3.0', estimatedDuration: 6.0, estimatedCost: 0.30, sceneIndex: 0, basePrompt: 'Modern bright open office, floor-to-ceiling windows, city skyline view, morning light, corporate but warm atmosphere, diverse team' },
        { shotType: 'Plan moyen', cameraMove: 'tracking', modelId: 'Runway Gen-4.5', estimatedDuration: 5.0, estimatedCost: 0.38, sceneIndex: 0, basePrompt: 'Diverse team collaborating around screens showing data dashboards, genuine smiles, natural interactions, modern workspace, warm corporate' },
        { shotType: 'Plan moyen', cameraMove: 'dolly-in', modelId: 'Kling 3.0', estimatedDuration: 5.0, estimatedCost: 0.25, sceneIndex: 1, basePrompt: 'Engineers testing prototype in R&D lab, holographic displays, concentration and excitement, high-tech environment, blue accent lighting' },
        { shotType: 'Insert', cameraMove: 'macro', modelId: 'Hailuo 2.3', estimatedDuration: 3.0, estimatedCost: 0.11, sceneIndex: 1, basePrompt: 'Close-up hands interacting with holographic interface, data visualization, futuristic tech detail, clean corporate aesthetic' },
        { shotType: 'Plan moyen', cameraMove: 'fixe', modelId: 'Veo 3.1', estimatedDuration: 4.0, estimatedCost: 0.24, sceneIndex: 1, basePrompt: 'Engineer explaining prototype to team, enthusiastic presentation, lab background, natural dialogue moment, corporate documentary style' },
        { shotType: 'Plan large', cameraMove: 'drone-orbit', modelId: 'Sora 2', estimatedDuration: 6.0, estimatedCost: 0.48, sceneIndex: 2, basePrompt: 'Team celebrating product launch on rooftop terrace, city panorama, golden hour, champagne toast, genuine joy, orbit drone shot' },
        { shotType: 'Plan large', cameraMove: 'crane-up', modelId: 'Kling 3.0', estimatedDuration: 5.0, estimatedCost: 0.25, sceneIndex: 2, basePrompt: 'Final wide shot rooftop with company logo overlay, sunset skyline, inspirational corporate ending, space for typography' },
      ],
      tension: {
        curve: [{ scene: 0, tension: 30 }, { scene: 1, tension: 55 }, { scene: 2, tension: 50 }],
        arc: 'steady',
        mean: 45,
      },
      characterBible: [],
      continuity: { score: 95, alerts: [] },
      compliance: { level: 'OK', score: 100, flags: [] },
      costTotal: 2.01,
    },
  },
]
