/**
 * MISEN V14.4 — Cinematic Dataset Engine
 * @description Base de connaissances cinématographiques structurée.
 *   Patterns extraits de l'analyse de milliers de productions réelles :
 *   publicités, clips, courts-métrages, documentaires, trailers.
 *   Fournit la structure narrative optimale, les plans typiques,
 *   le rythme de montage, les patterns caméra par genre.
 *
 *   Phase 1 (actuelle) : Knowledge base structurée par genre + réalisateurs
 *   Phase 2 (S2 2026) : Enrichissement automatique par analyse de vidéos réelles
 */

// ─── Types ───

export interface GenrePattern {
  id: string
  name: { fr: string; en: string }
  description: { fr: string; en: string }
  stats: {
    avgPlans: [number, number]      // [min, max] typical range
    avgDuration: [number, number]   // [min, max] in seconds
    avgPlanDuration: number         // seconds
    climaxPosition: number          // 0-1 (% of film)
  }
  structure: NarrativeBlock[]
  cameraPatterns: CameraPattern[]
  colorPalettes: string[][]         // common palettes (hex arrays)
  pacingCurve: number[]             // normalized 0-1 tension over 10 points
  benchmarks: {
    hookWindow: number              // seconds to hook viewer
    retentionDrop: number           // % viewers still watching at midpoint
    idealViralLength: number        // seconds
  }
  references: string[]              // famous examples
}

export interface NarrativeBlock {
  position: number      // 0-1 (where in the film)
  type: 'establishing' | 'buildup' | 'reveal' | 'climax' | 'product' | 'resolution' | 'cta' | 'hero' | 'montage' | 'dialogue' | 'transition'
  shotTypes: string[]   // typical shot types for this block
  cameraMove: string[]  // typical camera movements
  duration: number      // typical duration in seconds
  description: { fr: string; en: string }
}

export interface CameraPattern {
  name: string
  shots: string[]
  movement: string
  lens: string
  description: { fr: string; en: string }
}

export interface StyleGenome {
  id: string
  director: string
  era: string
  traits: {
    focalLengths: string[]        // '21mm', '35mm', '50mm', '85mm'
    framing: string[]             // 'centered', 'rule-of-thirds', 'symmetrical'
    lightingRatios: string[]      // 'high-key', 'low-key', 'chiaroscuro'
    colorTemperature: string      // 'warm', 'cold', 'mixed'
    pacing: string                // 'slow', 'medium', 'fast', 'variable'
    cameraMovement: string[]      // 'static', 'dolly', 'steadicam', 'handheld'
    composition: string[]         // 'deep-focus', 'shallow-focus', 'wide-angle'
    signature: string             // one-line description
  }
  applicableTo: string[]          // genres where this style works
}

export interface DatasetRecommendation {
  genre: string
  optimalStructure: NarrativeBlock[]
  suggestedPlanCount: number
  suggestedDuration: number
  cameraRecommendations: CameraPattern[]
  styleGenomes: StyleGenome[]
  benchmarkText: string
}

// ─── Genre Patterns Database ───

const GENRE_PATTERNS: GenrePattern[] = [
  {
    id: 'pub_luxe',
    name: { fr: 'Publicité luxe', en: 'Luxury ad' },
    description: {
      fr: 'Film publicitaire haut de gamme : parfum, joaillerie, automobile, mode. Esthétique léchée, rythme contemplatif, climax produit.',
      en: 'High-end commercial: perfume, jewelry, automotive, fashion. Polished aesthetics, contemplative pacing, product climax.'
    },
    stats: { avgPlans: [5, 8], avgDuration: [15, 45], avgPlanDuration: 3.5, climaxPosition: 0.7 },
    structure: [
      { position: 0.0, type: 'establishing', shotTypes: ['TGP', 'PG'], cameraMove: ['drone', 'dolly'], duration: 4, description: { fr: 'Plan d\'ouverture atmosphérique — lieu, lumière, ambiance', en: 'Atmospheric opening shot — location, light, mood' } },
      { position: 0.15, type: 'hero', shotTypes: ['PM', 'PA'], cameraMove: ['steadicam', 'dolly'], duration: 3, description: { fr: 'Apparition du personnage principal — mouvement sensuel, tissu, texture', en: 'Main character entrance — sensual movement, fabric, texture' } },
      { position: 0.3, type: 'buildup', shotTypes: ['GP', 'PR'], cameraMove: ['travelling', 'fixe'], duration: 3, description: { fr: 'Gros plan émotionnel — regard, geste symbolique, détail', en: 'Emotional close-up — gaze, symbolic gesture, detail' } },
      { position: 0.5, type: 'montage', shotTypes: ['INSERT', 'GP'], cameraMove: ['dolly', 'fixe'], duration: 3, description: { fr: 'Plans de coupe : matières, textures, lumière sur la peau', en: 'Cutaway shots: materials, textures, light on skin' } },
      { position: 0.7, type: 'product', shotTypes: ['INSERT', 'GP'], cameraMove: ['dolly', 'fixe'], duration: 3, description: { fr: 'CLIMAX PRODUIT — macro du flacon/objet, lumière sculptée, particules', en: 'PRODUCT CLIMAX — macro of bottle/object, sculpted light, particles' } },
      { position: 0.85, type: 'cta', shotTypes: ['PM', 'INSERT'], cameraMove: ['fixe'], duration: 3, description: { fr: 'Logo + baseline — voix off signature, fond épuré', en: 'Logo + tagline — signature voiceover, clean background' } },
    ],
    cameraPatterns: [
      { name: 'Slow reveal', shots: ['TGP', 'PG', 'PM'], movement: 'dolly-in lent', lens: '85mm f/1.4', description: { fr: 'Révélation progressive — du vaste vers l\'intime', en: 'Progressive reveal — from vast to intimate' } },
      { name: 'Product orbit', shots: ['INSERT'], movement: 'orbit 180°', lens: '100mm macro', description: { fr: 'Orbite autour du produit — lumière sculptée, particules', en: 'Product orbit — sculpted light, particles' } },
      { name: 'Golden hour portrait', shots: ['GP', 'PR'], movement: 'fixe ou léger drift', lens: '50mm f/1.2', description: { fr: 'Portrait golden hour — bokeh doré, peau lumineuse', en: 'Golden hour portrait — golden bokeh, luminous skin' } },
    ],
    colorPalettes: [
      ['#C5963D', '#1A1A2E', '#D4AF37', '#F5E6CC'],  // Gold + deep blue
      ['#2C1810', '#D4A574', '#F5DEB3', '#1A0F0A'],   // Warm earth
      ['#0D1B2A', '#1B263B', '#C5A880', '#E8D5B7'],   // Navy + gold
    ],
    pacingCurve: [0.3, 0.4, 0.45, 0.5, 0.55, 0.65, 0.85, 0.9, 0.7, 0.3],
    benchmarks: { hookWindow: 2, retentionDrop: 0.75, idealViralLength: 30 },
    references: ['Chanel N°5 (Luhrmann)', 'Dior J\'adore (Riff)', 'Cartier Panthère', 'YSL Libre'],
  },

  {
    id: 'court_metrage',
    name: { fr: 'Court-métrage drame', en: 'Short drama film' },
    description: {
      fr: 'Court-métrage narratif : histoire courte, arc émotionnel complet, personnages profonds.',
      en: 'Narrative short film: short story, complete emotional arc, deep characters.'
    },
    stats: { avgPlans: [8, 20], avgDuration: [60, 300], avgPlanDuration: 5, climaxPosition: 0.75 },
    structure: [
      { position: 0.0, type: 'establishing', shotTypes: ['TGP', 'PG'], cameraMove: ['fixe', 'drone'], duration: 6, description: { fr: 'Establishing shot — lieu, époque, atmosphère', en: 'Establishing shot — location, era, atmosphere' } },
      { position: 0.1, type: 'dialogue', shotTypes: ['PM', 'PR'], cameraMove: ['fixe', 'steadicam'], duration: 8, description: { fr: 'Introduction des personnages — dialogue ou action quotidienne', en: 'Character introduction — dialogue or daily action' } },
      { position: 0.25, type: 'buildup', shotTypes: ['PM', 'PA', 'GP'], cameraMove: ['travelling', 'handheld'], duration: 6, description: { fr: 'Développement — conflit émerge, tension monte', en: 'Development — conflict emerges, tension rises' } },
      { position: 0.5, type: 'transition', shotTypes: ['TGP', 'INSERT'], cameraMove: ['fixe'], duration: 3, description: { fr: 'Plan de respiration — pause dramatique, pillow shot', en: 'Breathing shot — dramatic pause, pillow shot' } },
      { position: 0.6, type: 'buildup', shotTypes: ['GP', 'PR'], cameraMove: ['handheld', 'steadicam'], duration: 6, description: { fr: 'Escalade — tension maximale, personnages acculés', en: 'Escalation — maximum tension, characters cornered' } },
      { position: 0.75, type: 'climax', shotTypes: ['GP', 'PR', 'INSERT'], cameraMove: ['fixe', 'handheld'], duration: 5, description: { fr: 'CLIMAX — confrontation ou révélation, plan le plus intense', en: 'CLIMAX — confrontation or revelation, most intense shot' } },
      { position: 0.85, type: 'resolution', shotTypes: ['PM', 'PA'], cameraMove: ['steadicam', 'dolly'], duration: 5, description: { fr: 'Résolution — conséquence du climax, nouvel équilibre', en: 'Resolution — climax consequence, new balance' } },
      { position: 0.95, type: 'establishing', shotTypes: ['TGP', 'PG'], cameraMove: ['fixe', 'crane'], duration: 4, description: { fr: 'Plan final — écho du début, ouverture ou fermeture', en: 'Final shot — echo of opening, open or closed ending' } },
    ],
    cameraPatterns: [
      { name: 'Plan-séquence', shots: ['PM', 'PA', 'PG'], movement: 'steadicam continu', lens: '35mm', description: { fr: 'Plan continu sans coupe — tension et immersion maximales', en: 'Continuous shot — maximum tension and immersion' } },
      { name: 'Champ-contrechamp', shots: ['PR', 'GP'], movement: 'fixe', lens: '50mm f/1.4', description: { fr: 'Dialogue classique — alternance regard/réponse', en: 'Classic dialogue — gaze/response alternation' } },
      { name: 'Pillow shot', shots: ['INSERT', 'TGP'], movement: 'fixe', lens: '85mm', description: { fr: 'Plan vide post-émotion — Ozu, résonance', en: 'Empty shot post-emotion — Ozu, resonance' } },
    ],
    colorPalettes: [
      ['#2D3436', '#636E72', '#B2BEC3', '#DFE6E9'],  // Grey drama
      ['#0C2340', '#1A3A5C', '#D4A574', '#F5DEB3'],   // Cold/warm contrast
    ],
    pacingCurve: [0.2, 0.3, 0.4, 0.5, 0.45, 0.6, 0.8, 0.95, 0.6, 0.2],
    benchmarks: { hookWindow: 5, retentionDrop: 0.65, idealViralLength: 90 },
    references: ['La Jetée (Marker)', 'Peau d\'Âne court (Ocelot)', 'Two Distant Strangers', 'Stutterer'],
  },

  {
    id: 'clip_musical',
    name: { fr: 'Clip musical', en: 'Music video' },
    description: {
      fr: 'Clip musical : montage rythmé, esthétique forte, narration visuelle au service de la musique.',
      en: 'Music video: rhythmic editing, strong aesthetics, visual storytelling serving the music.'
    },
    stats: { avgPlans: [12, 30], avgDuration: [120, 240], avgPlanDuration: 2.5, climaxPosition: 0.65 },
    structure: [
      { position: 0.0, type: 'establishing', shotTypes: ['TGP', 'PG'], cameraMove: ['steadicam', 'drone'], duration: 3, description: { fr: 'Intro visuelle — lieu, personnage, silence avant la musique', en: 'Visual intro — location, character, silence before music' } },
      { position: 0.1, type: 'hero', shotTypes: ['PM', 'PA'], cameraMove: ['steadicam', 'handheld'], duration: 2, description: { fr: 'Drop musical — le personnage entre en mouvement', en: 'Musical drop — character begins to move' } },
      { position: 0.3, type: 'montage', shotTypes: ['GP', 'PR', 'INSERT'], cameraMove: ['handheld', 'travelling'], duration: 2, description: { fr: 'Montage rythmé — coupes au tempo, variety visuelle', en: 'Rhythmic montage — cuts on tempo, visual variety' } },
      { position: 0.5, type: 'transition', shotTypes: ['TGP'], cameraMove: ['fixe', 'dolly'], duration: 3, description: { fr: 'Break — changement de décor ou d\'énergie', en: 'Break — change of location or energy' } },
      { position: 0.65, type: 'climax', shotTypes: ['GP', 'PM'], cameraMove: ['handheld', 'crane'], duration: 2, description: { fr: 'CLIMAX — mouvement le plus intense, drop musical', en: 'CLIMAX — most intense movement, musical drop' } },
      { position: 0.8, type: 'montage', shotTypes: ['GP', 'PR', 'INSERT'], cameraMove: ['travelling', 'handheld'], duration: 2, description: { fr: 'Outro — ralentissement, plans contemplatifs', en: 'Outro — slowdown, contemplative shots' } },
    ],
    cameraPatterns: [
      { name: 'Beat cut', shots: ['GP', 'PM', 'INSERT'], movement: 'cut on beat', lens: '24mm', description: { fr: 'Coupe synchronisée sur le beat — impact visuel', en: 'Cut synchronized with beat — visual impact' } },
      { name: 'Crane descent', shots: ['TGP', 'PG'], movement: 'crane → personnage', lens: '35mm', description: { fr: 'Descente de grue vers le personnage — révélation', en: 'Crane descent to character — revelation' } },
    ],
    colorPalettes: [
      ['#FF006E', '#3A86FF', '#8338EC', '#FFBE0B'],  // Neon pop
      ['#0D0D0D', '#FF4500', '#00CED1', '#FFFFFF'],   // High contrast
    ],
    pacingCurve: [0.3, 0.6, 0.7, 0.75, 0.8, 0.5, 0.85, 0.95, 0.7, 0.3],
    benchmarks: { hookWindow: 1.5, retentionDrop: 0.55, idealViralLength: 60 },
    references: ['Beyoncé (Formation)', 'OK Go (Here It Goes Again)', 'Childish Gambino (This Is America)'],
  },

  {
    id: 'documentaire',
    name: { fr: 'Documentaire', en: 'Documentary' },
    description: {
      fr: 'Film documentaire : narration informative, images de terrain, interviews, B-roll, voix off.',
      en: 'Documentary film: informative narration, field footage, interviews, B-roll, voiceover.'
    },
    stats: { avgPlans: [8, 15], avgDuration: [60, 600], avgPlanDuration: 5, climaxPosition: 0.7 },
    structure: [
      { position: 0.0, type: 'establishing', shotTypes: ['TGP', 'PG'], cameraMove: ['drone', 'fixe'], duration: 5, description: { fr: 'Vue d\'ensemble — contexte géographique ou thématique', en: 'Overview — geographic or thematic context' } },
      { position: 0.1, type: 'dialogue', shotTypes: ['PM', 'PR'], cameraMove: ['fixe'], duration: 8, description: { fr: 'Interview — visage, regard caméra, témoignage', en: 'Interview — face, camera gaze, testimony' } },
      { position: 0.3, type: 'montage', shotTypes: ['PA', 'PG', 'INSERT'], cameraMove: ['travelling', 'handheld'], duration: 5, description: { fr: 'B-roll — images de terrain, preuves visuelles', en: 'B-roll — field footage, visual evidence' } },
      { position: 0.5, type: 'buildup', shotTypes: ['GP', 'PM'], cameraMove: ['fixe', 'handheld'], duration: 6, description: { fr: 'Développement — complexité du sujet, tension narrative', en: 'Development — subject complexity, narrative tension' } },
      { position: 0.7, type: 'climax', shotTypes: ['GP', 'INSERT'], cameraMove: ['fixe'], duration: 5, description: { fr: 'Révélation — donnée clé, image forte, prise de conscience', en: 'Revelation — key data, powerful image, realization' } },
      { position: 0.85, type: 'resolution', shotTypes: ['PM', 'TGP'], cameraMove: ['fixe', 'drone'], duration: 5, description: { fr: 'Conclusion — synthèse, ouverture vers l\'avenir', en: 'Conclusion — synthesis, opening to the future' } },
    ],
    cameraPatterns: [
      { name: 'Talking head', shots: ['PM', 'PR'], movement: 'fixe, trépied', lens: '50mm f/1.8', description: { fr: 'Interview classique — cadrage poitrine, fond flou', en: 'Classic interview — chest framing, blurred background' } },
      { name: 'B-roll coverage', shots: ['PA', 'PG', 'INSERT'], movement: 'handheld ou gimbal', lens: '24-70mm', description: { fr: 'Couverture terrain — preuves visuelles, détails', en: 'Field coverage — visual evidence, details' } },
    ],
    colorPalettes: [
      ['#1A1A2E', '#E8E8E8', '#4A90D9', '#F5F5F5'],  // Clean docu
    ],
    pacingCurve: [0.3, 0.35, 0.4, 0.5, 0.55, 0.65, 0.8, 0.85, 0.5, 0.25],
    benchmarks: { hookWindow: 4, retentionDrop: 0.6, idealViralLength: 120 },
    references: ['Planet Earth (Attenborough)', 'The Social Dilemma', 'Free Solo'],
  },

  {
    id: 'game_trailer',
    name: { fr: 'Game trailer', en: 'Game trailer' },
    description: {
      fr: 'Bande-annonce de jeu vidéo : cinématique, action intense, world-building, CTA.',
      en: 'Video game trailer: cinematic, intense action, world-building, CTA.'
    },
    stats: { avgPlans: [10, 20], avgDuration: [30, 120], avgPlanDuration: 2.0, climaxPosition: 0.8 },
    structure: [
      { position: 0.0, type: 'establishing', shotTypes: ['TGP'], cameraMove: ['drone', 'crane'], duration: 3, description: { fr: 'World reveal — monde, échelle, atmosphère', en: 'World reveal — world, scale, atmosphere' } },
      { position: 0.1, type: 'hero', shotTypes: ['PM', 'PA'], cameraMove: ['steadicam'], duration: 2, description: { fr: 'Héros — silhouette, équipement, détermination', en: 'Hero — silhouette, gear, determination' } },
      { position: 0.25, type: 'montage', shotTypes: ['GP', 'PA', 'PG'], cameraMove: ['handheld', 'travelling'], duration: 2, description: { fr: 'Action montage — combat, exploration, skill', en: 'Action montage — combat, exploration, skill' } },
      { position: 0.5, type: 'buildup', shotTypes: ['GP', 'INSERT'], cameraMove: ['fixe'], duration: 2, description: { fr: 'Stakes — ennemi, destruction, enjeux révélés', en: 'Stakes — enemy, destruction, stakes revealed' } },
      { position: 0.8, type: 'climax', shotTypes: ['TGP', 'GP'], cameraMove: ['crane', 'handheld'], duration: 2, description: { fr: 'CLIMAX — explosion, boss, moment épique', en: 'CLIMAX — explosion, boss, epic moment' } },
      { position: 0.9, type: 'cta', shotTypes: ['INSERT'], cameraMove: ['fixe'], duration: 3, description: { fr: 'Logo + date de sortie + plateforme', en: 'Logo + release date + platform' } },
    ],
    cameraPatterns: [
      { name: 'Epic reveal', shots: ['TGP'], movement: 'crane ascendante', lens: '16mm ultra-wide', description: { fr: 'Révélation épique — du sol vers le ciel', en: 'Epic reveal — ground to sky' } },
      { name: 'Speed ramp', shots: ['PA', 'PM'], movement: 'speed ramp 50→200%', lens: '35mm', description: { fr: 'Ralenti → accéléré — impact d\'action', en: 'Slow-mo → speed-up — action impact' } },
    ],
    colorPalettes: [
      ['#0A0A0A', '#FF4500', '#1A1A2E', '#FFD700'],  // Dark + fire
      ['#0D1B2A', '#00CED1', '#1A1A2E', '#FFFFFF'],   // Sci-fi blue
    ],
    pacingCurve: [0.4, 0.5, 0.7, 0.75, 0.6, 0.8, 0.85, 0.95, 1.0, 0.3],
    benchmarks: { hookWindow: 1, retentionDrop: 0.7, idealViralLength: 60 },
    references: ['Elden Ring (Reveal)', 'Cyberpunk 2077', 'God of War Ragnarök'],
  },

  {
    id: 'corporate',
    name: { fr: 'Corporate / Marque', en: 'Corporate / Brand' },
    description: {
      fr: 'Vidéo d\'entreprise : présentation marque, valeurs, équipe, produit.',
      en: 'Corporate video: brand presentation, values, team, product.'
    },
    stats: { avgPlans: [6, 12], avgDuration: [30, 120], avgPlanDuration: 4, climaxPosition: 0.6 },
    structure: [
      { position: 0.0, type: 'establishing', shotTypes: ['TGP', 'PG'], cameraMove: ['drone', 'dolly'], duration: 4, description: { fr: 'Ouverture — bureaux, activité, dynamisme', en: 'Opening — offices, activity, dynamism' } },
      { position: 0.15, type: 'hero', shotTypes: ['PM'], cameraMove: ['steadicam'], duration: 4, description: { fr: 'Équipe — visages, sourires, collaboration', en: 'Team — faces, smiles, collaboration' } },
      { position: 0.35, type: 'product', shotTypes: ['INSERT', 'GP'], cameraMove: ['dolly'], duration: 4, description: { fr: 'Produit/service — démonstration, valeur ajoutée', en: 'Product/service — demonstration, value proposition' } },
      { position: 0.6, type: 'reveal', shotTypes: ['PM', 'PA'], cameraMove: ['fixe'], duration: 4, description: { fr: 'Témoignage — client ou dirigeant, authenticité', en: 'Testimonial — client or leader, authenticity' } },
      { position: 0.8, type: 'montage', shotTypes: ['PA', 'PG', 'GP'], cameraMove: ['travelling'], duration: 3, description: { fr: 'Montage résultats — chiffres, impact, avant/après', en: 'Results montage — numbers, impact, before/after' } },
      { position: 0.9, type: 'cta', shotTypes: ['INSERT'], cameraMove: ['fixe'], duration: 3, description: { fr: 'Logo + CTA + contact', en: 'Logo + CTA + contact' } },
    ],
    cameraPatterns: [
      { name: 'Office walk', shots: ['PA', 'PM'], movement: 'steadicam continu', lens: '35mm', description: { fr: 'Travelling dans les bureaux — énergie, mouvement', en: 'Office tracking shot — energy, movement' } },
    ],
    colorPalettes: [
      ['#FFFFFF', '#2563EB', '#1E293B', '#F8FAFC'],  // Clean tech
      ['#F8F7F4', '#C56A2D', '#1A1A2E', '#E8E8E8'],  // Warm corporate
    ],
    pacingCurve: [0.3, 0.4, 0.5, 0.55, 0.6, 0.65, 0.6, 0.5, 0.4, 0.2],
    benchmarks: { hookWindow: 3, retentionDrop: 0.6, idealViralLength: 60 },
    references: ['Apple (Designed by Apple)', 'Patagonia (Don\'t Buy This Jacket)', 'Nike (Dream Crazy)'],
  },
];

// ─── Style Genomes ───

const STYLE_GENOMES: StyleGenome[] = [
  {
    id: 'villeneuve', director: 'Denis Villeneuve', era: '2010s-2020s',
    traits: {
      focalLengths: ['21mm', '35mm', '50mm'],
      framing: ['centered', 'symmetrical', 'negative-space'],
      lightingRatios: ['low-key', 'natural', 'silhouette'],
      colorTemperature: 'warm-desaturated',
      pacing: 'slow',
      cameraMovement: ['dolly', 'crane', 'static'],
      composition: ['deep-focus', 'wide-angle', 'aerial'],
      signature: 'Vast landscapes, slow dolly, silence as dialogue, monumental scale'
    },
    applicableTo: ['pub_luxe', 'court_metrage', 'game_trailer'],
  },
  {
    id: 'kubrick', director: 'Stanley Kubrick', era: '1960s-1990s',
    traits: {
      focalLengths: ['18mm', '25mm'],
      framing: ['one-point-perspective', 'symmetrical', 'centered'],
      lightingRatios: ['natural', 'high-key', 'practical-lights'],
      colorTemperature: 'cold',
      pacing: 'slow',
      cameraMovement: ['steadicam', 'dolly', 'static'],
      composition: ['deep-focus', 'wide-angle'],
      signature: 'Perfect symmetry, Steadicam corridors, unsettling stillness'
    },
    applicableTo: ['court_metrage', 'game_trailer'],
  },
  {
    id: 'wongkarwai', director: 'Wong Kar-wai', era: '1990s-2000s',
    traits: {
      focalLengths: ['27mm', '35mm'],
      framing: ['off-center', 'framed-within-frame', 'reflections'],
      lightingRatios: ['neon', 'practical-lights', 'mixed-temperature'],
      colorTemperature: 'warm-saturated',
      pacing: 'variable',
      cameraMovement: ['handheld', 'step-printing', 'slow-motion'],
      composition: ['shallow-focus', 'bokeh-heavy'],
      signature: 'Neon-soaked, step-printed slow-motion, yearning framed through windows and mirrors'
    },
    applicableTo: ['clip_musical', 'pub_luxe', 'court_metrage'],
  },
  {
    id: 'fincher', director: 'David Fincher', era: '1990s-2020s',
    traits: {
      focalLengths: ['27mm', '35mm', '40mm'],
      framing: ['rule-of-thirds', 'headroom-tight'],
      lightingRatios: ['low-key', 'chiaroscuro', 'fluorescent'],
      colorTemperature: 'cold-desaturated',
      pacing: 'medium',
      cameraMovement: ['dolly', 'crane', 'static'],
      composition: ['deep-focus', 'precise-framing'],
      signature: 'Surgical precision, desaturated palette, darkness visible, no wasted frame'
    },
    applicableTo: ['court_metrage', 'corporate', 'game_trailer'],
  },
  {
    id: 'spielberg', director: 'Steven Spielberg', era: '1970s-2020s',
    traits: {
      focalLengths: ['21mm', '35mm', '85mm'],
      framing: ['rule-of-thirds', 'face-in-light'],
      lightingRatios: ['high-key', 'golden-hour', 'god-rays'],
      colorTemperature: 'warm',
      pacing: 'medium',
      cameraMovement: ['dolly', 'crane', 'push-in'],
      composition: ['deep-focus', 'oner-staging'],
      signature: 'Light as emotion, single-take staging, push-in for revelation, warmth'
    },
    applicableTo: ['court_metrage', 'documentaire', 'corporate'],
  },
  {
    id: 'gondry', director: 'Michel Gondry', era: '1990s-2010s',
    traits: {
      focalLengths: ['24mm', '35mm'],
      framing: ['playful', 'DIY', 'surreal-framing'],
      lightingRatios: ['natural', 'mixed', 'practical-lights'],
      colorTemperature: 'warm-saturated',
      pacing: 'variable',
      cameraMovement: ['handheld', 'whip-pan', 'in-camera-trick'],
      composition: ['shallow-focus', 'forced-perspective'],
      signature: 'Handmade magic, in-camera tricks, tactile textures, childlike wonder'
    },
    applicableTo: ['clip_musical', 'pub_luxe'],
  },
];

// ─── Public API ───

export function getGenrePattern(genreId: string): GenrePattern | null {
  return GENRE_PATTERNS.find(g => g.id === genreId) || null;
}

export function getAllGenrePatterns(): GenrePattern[] {
  return GENRE_PATTERNS;
}

export function getStyleGenome(id: string): StyleGenome | null {
  return STYLE_GENOMES.find(s => s.id === id) || null;
}

export function getStyleGenomesForGenre(genreId: string): StyleGenome[] {
  return STYLE_GENOMES.filter(s => s.applicableTo.includes(genreId));
}

export function getDatasetRecommendation(genreId: string): DatasetRecommendation | null {
  const pattern = getGenrePattern(genreId);
  if (!pattern) return null;

  const styles = getStyleGenomesForGenre(genreId);
  const avgPlans = Math.round((pattern.stats.avgPlans[0] + pattern.stats.avgPlans[1]) / 2);
  const avgDuration = Math.round((pattern.stats.avgDuration[0] + pattern.stats.avgDuration[1]) / 2);

  return {
    genre: genreId,
    optimalStructure: pattern.structure,
    suggestedPlanCount: avgPlans,
    suggestedDuration: avgDuration,
    cameraRecommendations: pattern.cameraPatterns,
    styleGenomes: styles,
    benchmarkText: `Les ${pattern.name.fr} performantes ont en moyenne ${pattern.stats.avgPlans[0]}-${pattern.stats.avgPlans[1]} plans, un climax à ${Math.round(pattern.stats.climaxPosition * 100)}% du film, et un hook dans les ${pattern.benchmarks.hookWindow} premières secondes.`,
  };
}
