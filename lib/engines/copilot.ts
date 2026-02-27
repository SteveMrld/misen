// ═══════════════════════════════════════════
// MISEN V7 — AI COPILOT ENGINE
// Force de proposition créative avec références cinéma
// ═══════════════════════════════════════════

export interface CopilotSuggestion {
  id: string;
  type: 'technique' | 'reference' | 'improvement' | 'music' | 'pacing' | 'visual';
  icon: string;
  title: string;
  message: string;
  reference?: string;
  confidence: number;
}

const REFS: Record<string, { film: string; dir: string; year: number; desc: string }[]> = {
  miroir: [
    { film: 'Black Swan', dir: 'Aronofsky', year: 2010, desc: 'le reflet comme dédoublement psychologique' },
    { film: 'Taxi Driver', dir: 'Scorsese', year: 1976, desc: 'confrontation avec soi-même devant le miroir' },
    { film: 'Mirror', dir: 'Tarkovsky', year: 1975, desc: 'le miroir comme portail entre mémoire et réalité' },
  ],
  flashback: [
    { film: 'Eternal Sunshine', dir: 'Gondry', year: 2004, desc: 'flashbacks qui se décomposent comme des souvenirs réels' },
    { film: 'Memento', dir: 'Nolan', year: 2000, desc: 'structure inversée, mémoire comme fil narratif' },
    { film: 'The Tree of Life', dir: 'Malick', year: 2011, desc: 'flashbacks poétiques, fragments d\'enfance' },
  ],
  jumeaux: [
    { film: 'Dead Ringers', dir: 'Cronenberg', year: 1988, desc: 'gémellité comme piège identitaire' },
    { film: 'The Prestige', dir: 'Nolan', year: 2006, desc: 'le double comme obsession et sacrifice' },
    { film: 'Us', dir: 'Peele', year: 2019, desc: 'le double comme ombre de soi' },
  ],
  eau: [
    { film: 'Apocalypse Now', dir: 'Coppola', year: 1979, desc: 'la rivière comme voyage initiatique irréversible' },
    { film: 'The Thin Red Line', dir: 'Malick', year: 1998, desc: 'la nature comme miroir de l\'âme' },
    { film: 'Beasts of the Southern Wild', dir: 'Zeitlin', year: 2012, desc: 'l\'eau comme force primordiale' },
  ],
  deuil: [
    { film: 'Manchester by the Sea', dir: 'Lonergan', year: 2016, desc: 'deuil silencieux dans les gestes quotidiens' },
    { film: 'Three Colors: Blue', dir: 'Kieślowski', year: 1993, desc: 'le deuil par la musique et la lumière bleue' },
    { film: 'Ordinary People', dir: 'Redford', year: 1980, desc: 'culpabilité du survivant' },
  ],
  planSeq: [
    { film: 'Birdman', dir: 'Iñárritu', year: 2014, desc: 'plan-séquence épousant le flux de conscience' },
    { film: '1917', dir: 'Mendes', year: 2019, desc: 'plan-séquence continu pour l\'immersion' },
    { film: 'Goodfellas', dir: 'Scorsese', year: 1990, desc: 'le Copacabana shot — entrée dans un monde' },
  ],
  nuit: [
    { film: 'Collateral', dir: 'Mann', year: 2004, desc: 'LA nocturne en numérique, lumières urbaines' },
    { film: 'Drive', dir: 'Refn', year: 2011, desc: 'néons, silence, violence soudaine' },
    { film: 'Eyes Wide Shut', dir: 'Kubrick', year: 1999, desc: 'la nuit comme espace de transgression' },
  ],
  amour: [
    { film: 'In the Mood for Love', dir: 'Wong Kar-wai', year: 2000, desc: 'désir contenu dans des couloirs étroits' },
    { film: 'Before Sunrise', dir: 'Linklater', year: 1995, desc: 'dialogue comme chorégraphie amoureuse' },
    { film: 'Amour', dir: 'Haneke', year: 2012, desc: 'l\'amour dans sa forme la plus dépouillée' },
  ],
};

const MUSIC = [
  { mood: 'mélancolique', items: ['Piano solo ambient', 'Cordes en mineur', 'Guitare fingerpicking'], via: 'Suno / Epidemic Sound' },
  { mood: 'tension', items: ['Drone basse fréquence', 'Percussions crescendo', 'Synthé dissonant'], via: 'Udio / Artlist' },
  { mood: 'espoir', items: ['Cordes montantes majeur', 'Piano + violoncelle', 'Chorale éthérée'], via: 'Suno / Mubert' },
  { mood: 'mystère', items: ['Celesta et harpe', 'Ambient électronique', 'Woodwind solo'], via: 'Mubert / Epidemic' },
  { mood: 'action', items: ['Percussions orchestrales', 'Cuivres héroïques', 'Electronic bass'], via: 'Artlist / Udio' },
  { mood: 'intimité', items: ['Guitare nylon solo', 'Voix a cappella', 'Clavecin et silence'], via: 'Suno / Epidemic' },
];

function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }

export function generateCopilotSuggestions(analysis: any, scriptText: string): CopilotSuggestion[] {
  const sugs: CopilotSuggestion[] = [];
  const plans = analysis?.plans || [];
  const scenes = analysis?.scenes || [];
  const tension = analysis?.tension || {};
  const s = scriptText.toLowerCase();
  let id = 0;

  // Pattern → Film references
  const patterns: [string[], string, string][] = [
    [['miroir','reflet','se regarde'], 'miroir', 'Motif du miroir'],
    [['flashback','enfance','souvenir','passé'], 'flashback', 'Transition temporelle'],
    [['jumeau','frère','double','identique'], 'jumeaux', 'Thème du double'],
    [['rivière','eau','fleuve','caillou','mer','océan'], 'eau', 'Symbolique de l\'eau'],
    [['hôpital','mort','deuil','perte','funérailles'], 'deuil', 'Traitement du deuil'],
    [['nuit','noir','sombre','obscurité'], 'nuit', 'Atmosphère nocturne'],
    [['amour','aimer','baiser','tendresse'], 'amour', 'Registre amoureux'],
  ];

  for (const [kws, key, title] of patterns) {
    if (kws.some(k => s.includes(k)) && REFS[key]) {
      const r = pick(REFS[key]);
      sugs.push({
        id: `cop-${id++}`, type: 'reference', icon: '🎬', title,
        message: `Ce motif me fait penser à ${r.film} (${r.dir}, ${r.year}) — ${r.desc}. Cette référence pourrait enrichir votre traitement visuel.`,
        reference: `${r.film} (${r.year})`, confidence: 0.85,
      });
    }
  }

  // Pacing
  if (plans.length > 3) {
    const durs = plans.map((p: any) => p.estimatedDuration || 4);
    const avg = durs.reduce((a: number, b: number) => a + b, 0) / durs.length;
    const v = durs.reduce((a: number, b: number) => a + Math.pow(b - avg, 2), 0) / durs.length;
    if (v < 0.5 && plans.length > 5) sugs.push({ id: `cop-${id++}`, type: 'pacing', icon: '📏', title: 'Rythme monotone', message: 'Vos plans ont des durées similaires. Un plan court (1.5s) suivi d\'un plan long (8s) crée un contraste saisissant.', confidence: 0.8 });
    if (v > 3) sugs.push({ id: `cop-${id++}`, type: 'pacing', icon: '✨', title: 'Excellent contraste rythmique', message: 'L\'alternance temps forts / respirations est vivante. Signature des grands monteurs.', confidence: 0.85 });
  }

  // Shot variety
  const shots = new Set(plans.map((p: any) => p.shotType).filter(Boolean));
  if (shots.size <= 2 && plans.length > 4) sugs.push({ id: `cop-${id++}`, type: 'technique', icon: '📐', title: 'Variez vos cadrages', message: 'Seulement 1-2 types de plans. Osez le gros plan sur les mains, le plan d\'ensemble pour contextualiser. Le cinéma respire par le contraste.', confidence: 0.82 });

  // Long scene → plan-séquence
  const long = scenes.filter((sc: any) => (sc.plans?.length || 0) > 5);
  if (long.length > 0) { const r = pick(REFS.planSeq); sugs.push({ id: `cop-${id++}`, type: 'technique', icon: '🎥', title: 'Plan-séquence possible', message: `"${long[0]?.heading || ''}" a beaucoup de découpes. Un plan-séquence à la ${r.film} (${r.dir}) — ${r.desc} — donnerait plus de fluidité.`, reference: `${r.film} (${r.year})`, confidence: 0.75 }); }

  // Music
  if (tension?.avgTension !== undefined) {
    let mood = tension.avgTension > 70 ? 'tension' : tension.avgTension > 50 ? 'action' : tension.avgTension > 30 ? 'mystère' : tension.avgTension > 15 ? 'intimité' : 'mélancolique';
    const m = MUSIC.find(x => x.mood === mood) || MUSIC[0];
    sugs.push({ id: `cop-${id++}`, type: 'music', icon: '🎵', title: 'Suggestion musicale', message: `Ambiance ${mood} : ${m.items.join(', ')}. Générables via ${m.via}.`, confidence: 0.7 });
  }

  // Opening / closing
  if (scenes[0]?.heading?.includes('INT')) sugs.push({ id: `cop-${id++}`, type: 'visual', icon: '🎭', title: 'L\'ouverture', message: 'Film en intérieur. Un plan d\'établissement extérieur avant d\'entrer ancre le spectateur dans le lieu.', confidence: 0.65 });
  if (s.includes('fin') && scenes.length > 2) sugs.push({ id: `cop-${id++}`, type: 'visual', icon: '🔚', title: 'Écho début/fin', message: 'Pensez à un écho entre première et dernière image. Le monde est le même, mais le regard a changé.', confidence: 0.72 });
  if (tension?.avgTension > 50) sugs.push({ id: `cop-${id++}`, type: 'technique', icon: '🤫', title: 'Le pouvoir du silence', message: 'Un moment sans musique ni dialogue, juste le bruit ambiant, peut être le plus puissant du film.', reference: 'No Country for Old Men (2007)', confidence: 0.68 });

  return sugs.sort((a, b) => b.confidence - a.confidence);
}
