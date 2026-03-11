/**
 * MISEN V14.4 â Expert Panel
 * @description Panel d'experts virtuels qui Ã©valuent chaque projet
 *   comme de vrais professionnels du cinÃ©ma et de la publicitÃ©.
 *   
 *   Chaque expert a son propre cadre d'Ã©valuation, ses rÃ©fÃ©rences,
 *   ses critÃ¨res, et son style de feedback.
 */

// âââ Types âââ

export interface ExpertProfile {
  id: string
  name: string
  role: string
  speciality: string
  experience: string
  references: string[]
  evaluationCriteria: EvaluationCriterion[]
  style: 'rigoureux' | 'crÃ©atif' | 'commercial' | 'technique' | 'narratif'
}

export interface EvaluationCriterion {
  id: string
  label: string
  weight: number // 0-1
  description: string
}

export interface ExpertEvaluation {
  expertId: string
  expertName: string
  expertRole: string
  overallScore: number // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  scores: Record<string, { score: number; comment: string }>
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  verdict: string
}

export interface PanelReport {
  projectId: string
  projectTitle: string
  genre: string
  evaluations: ExpertEvaluation[]
  consensusScore: number
  consensusGrade: string
  keyInsights: string[]
  criticalIssues: string[]
  readyForProduction: boolean
}

// âââ Expert Profiles âââ

export const EXPERTS: ExpertProfile[] = [
  {
    id: 'director',
    name: 'Expert RÃ©alisation',
    role: 'Directeur artistique / RÃ©alisateur',
    speciality: 'Mise en scÃ¨ne, narration visuelle, direction d\'acteurs',
    experience: 'Ãvalue comme un rÃ©alisateur avec 20 ans de festivals',
    references: ['Villeneuve', 'Kubrick', 'Scorsese', 'Ozu', 'Wong Kar-wai'],
    evaluationCriteria: [
      { id: 'narrative_structure', label: 'Structure narrative', weight: 0.20, description: 'Arc dramatique, setup/payoff, cohÃ©rence du rÃ©cit' },
      { id: 'visual_storytelling', label: 'Narration visuelle', weight: 0.20, description: 'Chaque plan raconte-t-il quelque chose ? Pas de plan gratuit.' },
      { id: 'shot_choices', label: 'Choix de plans', weight: 0.20, description: 'Les cadrages servent-ils l\'Ã©motion ? Gros plan = intimitÃ©, plan large = solitude, etc.' },
      { id: 'pacing', label: 'Rythme', weight: 0.15, description: 'Alternance tension/respiration, durÃ©e des plans adaptÃ©e au propos' },
      { id: 'emotional_arc', label: 'Arc Ã©motionnel', weight: 0.15, description: 'Le spectateur ressent-il quelque chose ? Progression Ã©motionnelle cohÃ©rente.' },
      { id: 'originality', label: 'OriginalitÃ©', weight: 0.10, description: 'Ãvite les clichÃ©s ? Apporte un regard singulier ?' },
    ],
    style: 'crÃ©atif',
  },
  {
    id: 'dop',
    name: 'Expert Image',
    role: 'Directeur de la photographie',
    speciality: 'LumiÃ¨re, cadrage, optiques, mouvements camÃ©ra',
    experience: 'Ãvalue comme un DOP qui a tournÃ© 50 films',
    references: ['Roger Deakins', 'Emmanuel Lubezki', 'Hoyte van Hoytema', 'Robert Richardson'],
    evaluationCriteria: [
      { id: 'lighting', label: 'Ãclairage', weight: 0.20, description: 'Direction de lumiÃ¨re cohÃ©rente, source justifiÃ©e, ambiance crÃ©Ã©e par la lumiÃ¨re' },
      { id: 'framing', label: 'Cadrage', weight: 0.20, description: 'Composition, rÃ¨gle des tiers, headroom, leading lines, symÃ©trie/asymÃ©trie intentionnelle' },
      { id: 'camera_movement', label: 'Mouvement camÃ©ra', weight: 0.20, description: 'Chaque mouvement est-il justifiÃ© dramatiquement ? Travelling = suivi, dolly-in = tension, fixe = contemplation' },
      { id: 'lens_choice', label: 'Choix d\'optique', weight: 0.15, description: 'Grand-angle = espace/dÃ©formation, tÃ©lÃ© = compression/isolement, macro = dÃ©tail intime' },
      { id: 'color_palette', label: 'Palette chromatique', weight: 0.15, description: 'CohÃ©rence colorimÃ©trique, tempÃ©rature, contraste, grade intentionnel' },
      { id: 'continuity', label: 'ContinuitÃ© visuelle', weight: 0.10, description: 'Raccords lumiÃ¨re, raccords mouvement, axe 180Â°, cohÃ©rence inter-plans' },
    ],
    style: 'technique',
  },
  {
    id: 'editor',
    name: 'Expert Montage',
    role: 'Monteur / Post-production',
    speciality: 'Rythme, transitions, structure temporelle',
    experience: 'Ãvalue comme un monteur de longs-mÃ©trages primÃ©s',
    references: ['Thelma Schoonmaker (Scorsese)', 'Lee Smith (Nolan)', 'Walter Murch (Coppola)'],
    evaluationCriteria: [
      { id: 'cut_rhythm', label: 'Rythme de coupe', weight: 0.25, description: 'Les coupes tombent-elles au bon moment ? Respiration entre les plans ?' },
      { id: 'transitions', label: 'Transitions', weight: 0.20, description: 'Les transitions servent-elles le rÃ©cit ? Cut sec = tension, fondu = passage du temps' },
      { id: 'shot_order', label: 'Ordre des plans', weight: 0.20, description: 'La sÃ©quence de plans est-elle logique visuellement et narrativement ?' },
      { id: 'duration', label: 'DurÃ©e des plans', weight: 0.15, description: 'Chaque plan reste-t-il le temps nÃ©cessaire ? Ni trop court ni trop long ?' },
      { id: 'tension_management', label: 'Gestion de tension', weight: 0.10, description: 'Le montage crÃ©e-t-il de la tension, de la surprise, de l\'Ã©motion ?' },
      { id: 'sound_design', label: 'Design sonore', weight: 0.10, description: 'Les indications sonores sont-elles pertinentes ? Voix off, ambiance, musique ?' },
    ],
    style: 'rigoureux',
  },
  {
    id: 'ad_director',
    name: 'Expert PublicitÃ©',
    role: 'Directeur de crÃ©ation publicitaire',
    speciality: 'Branding, impact commercial, engagement',
    experience: 'Ãvalue comme un DC de grande agence (Publicis, BBDO, Wieden+Kennedy)',
    references: ['Apple (1984)', 'Nike (Just Do It)', 'Chanel NÂ°5', 'Old Spice', 'Dove Real Beauty'],
    evaluationCriteria: [
      { id: 'hook', label: 'Hook (accroche)', weight: 0.20, description: 'Les 2 premiÃ¨res secondes captent-elles l\'attention ?' },
      { id: 'brand_integration', label: 'IntÃ©gration marque', weight: 0.20, description: 'Le produit/marque est-il visible au bon moment, de la bonne maniÃ¨re ?' },
      { id: 'emotional_trigger', label: 'DÃ©clencheur Ã©motionnel', weight: 0.15, description: 'Quel sentiment provoque le film ? Est-il cohÃ©rent avec la marque ?' },
      { id: 'memorability', label: 'MÃ©morabilitÃ©', weight: 0.15, description: 'On se souvient de quoi aprÃ¨s ? Un plan, une phrase, une Ã©motion ?' },
      { id: 'cta_effectiveness', label: 'EfficacitÃ© CTA', weight: 0.15, description: 'Le spectateur sait-il quoi faire aprÃ¨s ? Le CTA est-il naturel ?' },
      { id: 'target_fit', label: 'CohÃ©rence cible', weight: 0.15, description: 'Le ton, le style, le rythme correspondent-ils Ã  la cible visÃ©e ?' },
    ],
    style: 'commercial',
  },
  {
    id: 'screenwriter',
    name: 'Expert ScÃ©nario',
    role: 'ScÃ©nariste / Script doctor',
    speciality: 'Dialogues, structure dramatique, personnages',
    experience: 'Ãvalue comme un scÃ©nariste de films primÃ©s',
    references: ['Aaron Sorkin', 'Charlie Kaufman', 'CÃ©line Sciamma', 'Bong Joon-ho'],
    evaluationCriteria: [
      { id: 'dialogue_quality', label: 'QualitÃ© des dialogues', weight: 0.20, description: 'Les dialogues sonnent-ils vrais ? Chaque personnage a-t-il sa voix ?' },
      { id: 'character_depth', label: 'Profondeur des personnages', weight: 0.20, description: 'Les personnages ont-ils des motivations, des contradictions, une humanitÃ© ?' },
      { id: 'show_dont_tell', label: 'Show don\'t tell', weight: 0.20, description: 'Le scÃ©nario montre-t-il plutÃ´t qu\'il n\'explique ? Les images racontent ?' },
      { id: 'dramatic_engine', label: 'Moteur dramatique', weight: 0.15, description: 'Qu\'est-ce qui pousse l\'histoire en avant ? Conflit, dÃ©sir, obstacle ?' },
      { id: 'subtext', label: 'Sous-texte', weight: 0.15, description: 'Y a-t-il des niveaux de lecture ? Ce qui n\'est pas dit est-il aussi important ?' },
      { id: 'economy', label: 'Ãconomie d\'Ã©criture', weight: 0.10, description: 'Chaque mot compte ? Pas de gras, pas de redondance ?' },
    ],
    style: 'narratif',
  },
]

// âââ Evaluation Engine âââ

export function evaluateProject(
  analysis: any,
  script: string,
  genre: string,
  expertIds?: string[]
): PanelReport {
  const selectedExperts = expertIds
    ? EXPERTS.filter(e => expertIds.includes(e.id))
    : getExpertsForGenre(genre)

  const evaluations: ExpertEvaluation[] = selectedExperts.map(expert =>
    runExpertEvaluation(expert, analysis, script, genre)
  )

  const consensusScore = Math.round(
    evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length
  )

  const consensusGrade = consensusScore >= 85 ? 'A' : consensusScore >= 70 ? 'B' : consensusScore >= 55 ? 'C' : consensusScore >= 40 ? 'D' : 'F'

  // Aggregate insights
  const allStrengths = evaluations.flatMap(e => e.strengths)
  const allWeaknesses = evaluations.flatMap(e => e.weaknesses)
  const allRecs = evaluations.flatMap(e => e.recommendations)

  // Find consensus strengths (mentioned by 2+ experts)
  const strengthCounts: Record<string, number> = {}
  allStrengths.forEach(s => { strengthCounts[s] = (strengthCounts[s] || 0) + 1 })
  const keyInsights = Object.entries(strengthCounts)
    .filter(([_, count]) => count >= 2)
    .map(([s]) => s)
    .slice(0, 5)

  // Critical issues (weaknesses flagged by 2+ experts)
  const weakCounts: Record<string, number> = {}
  allWeaknesses.forEach(w => { weakCounts[w] = (weakCounts[w] || 0) + 1 })
  const criticalIssues = Object.entries(weakCounts)
    .filter(([_, count]) => count >= 2)
    .map(([w]) => w)
    .slice(0, 5)

  return {
    projectId: analysis?.id || 'test',
    projectTitle: analysis?.title || 'Untitled',
    genre,
    evaluations,
    consensusScore,
    consensusGrade,
    keyInsights: keyInsights.length > 0 ? keyInsights : allStrengths.slice(0, 3),
    criticalIssues: criticalIssues.length > 0 ? criticalIssues : allWeaknesses.slice(0, 3),
    readyForProduction: consensusScore >= 65 && criticalIssues.length === 0,
  }
}

function getExpertsForGenre(genre: string): ExpertProfile[] {
  switch (genre) {
    case 'pub_luxe':
    case 'corporate':
      return EXPERTS.filter(e => ['director', 'dop', 'ad_director'].includes(e.id))
    case 'court_metrage':
      return EXPERTS.filter(e => ['director', 'dop', 'editor', 'screenwriter'].includes(e.id))
    case 'clip_musical':
      return EXPERTS.filter(e => ['director', 'dop', 'editor'].includes(e.id))
    case 'documentaire':
      return EXPERTS.filter(e => ['director', 'editor', 'screenwriter'].includes(e.id))
    case 'game_trailer':
      return EXPERTS.filter(e => ['director', 'dop', 'editor'].includes(e.id))
    default:
      return EXPERTS.slice(0, 3)
  }
}

function runExpertEvaluation(
  expert: ExpertProfile,
  analysis: any,
  script: string,
  genre: string
): ExpertEvaluation {
  const scenes = analysis?.scenes || []
  const plans = analysis?.plans || []
  const tension = analysis?.tension || {}
  const characterBible = analysis?.characterBible || []
  const performance = analysis?.performance || {}

  const scores: Record<string, { score: number; comment: string }> = {}
  let totalWeightedScore = 0
  let totalWeight = 0

  for (const criterion of expert.evaluationCriteria) {
    const { score, comment } = evaluateCriterion(criterion, { scenes, plans, tension, characterBible, performance, script, genre, expert })
    scores[criterion.id] = { score, comment }
    totalWeightedScore += score * criterion.weight
    totalWeight += criterion.weight
  }

  const overallScore = Math.round(totalWeightedScore / totalWeight)
  const grade = overallScore >= 85 ? 'A' : overallScore >= 70 ? 'B' : overallScore >= 55 ? 'C' : overallScore >= 40 ? 'D' : 'F'

  const strengths: string[] = []
  const weaknesses: string[] = []
  const recommendations: string[] = []

  // Generate insights based on scores
  for (const [id, { score, comment }] of Object.entries(scores)) {
    const criterion = expert.evaluationCriteria.find(c => c.id === id)
    if (!criterion) continue
    if (score >= 75) strengths.push(`${criterion.label} â ${comment}`)
    if (score < 50) weaknesses.push(`${criterion.label} â ${comment}`)
    if (score < 65) {
      const rec = generateRecommendation(criterion, score, genre)
      if (rec) recommendations.push(rec)
    }
  }

  const verdict = overallScore >= 80
    ? `${expert.name} valide ce projet. La qualitÃ© cinÃ©matographique est au niveau professionnel.`
    : overallScore >= 65
    ? `${expert.name} considÃ¨re ce projet prometteur avec des ajustements nÃ©cessaires.`
    : overallScore >= 50
    ? `${expert.name} identifie des problÃ¨mes structurels qui doivent Ãªtre corrigÃ©s avant production.`
    : `${expert.name} recommande une rÃ©Ã©criture significative avant de poursuivre.`

  return {
    expertId: expert.id,
    expertName: expert.name,
    expertRole: expert.role,
    overallScore,
    grade,
    scores,
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    recommendations: recommendations.slice(0, 3),
    verdict,
  }
}

// âââ Criterion Evaluation Logic âââ

function evaluateCriterion(
  criterion: EvaluationCriterion,
  context: {
    scenes: any[]; plans: any[]; tension: any; characterBible: any[];
    performance: any; script: string; genre: string; expert: ExpertProfile
  }
): { score: number; comment: string } {
  const { scenes, plans, tension, characterBible, performance, script, genre } = context

  // Base score from analysis quality
  let score = 55 // Default: average
  let comment = ''

  const planCount = plans.length
  const sceneCount = scenes.length
  const hasDialogue = scenes.some((s: any) => (s.dialogues?.length || 0) > 0)
  const shotTypes = new Set(plans.map((p: any) => p.shotType || p.cadrage))
  const cameraMovements = new Set(plans.filter((p: any) => p.cameraMove && p.cameraMove !== 'fixe').map((p: any) => p.cameraMove))
  const tensionVariance = tension?.curve ? Math.sqrt(tension.curve.reduce((s: number, c: any) => s + Math.pow(c.tension - (tension.avgTension || 50), 2), 0) / Math.max(tension.curve.length, 1)) : 0
  const scriptLength = script.length
  const hasVoiceover = script.toLowerCase().includes('voix off') || script.toLowerCase().includes('narrateur') || script.toLowerCase().includes('v.o.')

  switch (criterion.id) {
    // âââ Director criteria âââ
    case 'narrative_structure':
      // Corporate et pub peuvent Ãªtre mono-scÃ¨ne â ne pas les pÃ©naliser
      const minScenes = ['corporate', 'pub_luxe'].includes(genre) ? 1 : 2
      score = sceneCount >= 3 ? 70 : sceneCount >= minScenes ? 62 : 45
      if (tension?.globalArc?.includes('classique')) score += 15
      if (tension?.globalArc?.includes('crescendo')) score += 10
      if (tension?.globalArc?.includes('contemplatif')) score += 8
      if (tension?.climax >= 0) score += 8
      comment = sceneCount >= 3 ? 'Structure en actes dÃ©tectable, arc narratif prÃ©sent'
              : sceneCount >= 1 ? 'Structure narrative adaptÃ©e au format court'
              : 'Structure narrative minimale'
      break

    case 'visual_storytelling':
      score = shotTypes.size >= 3 ? 75 : shotTypes.size >= 2 ? 60 : 45
      if (planCount >= 4) score += 10
      comment = shotTypes.size >= 3 ? 'VariÃ©tÃ© de plans, narration visuelle riche' : 'Vocabulaire visuel limitÃ©'
      break

    case 'shot_choices':
      const hasCloseUp = plans.some((p: any) => ['GP', 'PR', 'TGP'].includes(p.shotType || ''))
      const hasWide = plans.some((p: any) => ['PE', 'PG', 'PA'].includes(p.shotType || ''))
      score = hasCloseUp && hasWide ? 75 : hasCloseUp || hasWide ? 60 : 45
      if (plans.some((p: any) => p.shotType === 'INSERT')) score += 10
      comment = hasCloseUp && hasWide ? 'Alternance intime/vaste, choix de plans pertinents' : 'Manque de variÃ©tÃ© dans les valeurs de plan'
      break

    case 'pacing':
      const avgDur = plans.reduce((s: number, p: any) => s + (p.estimatedDuration || 3), 0) / Math.max(planCount, 1)
      score = avgDur >= 2 && avgDur <= 6 ? 70 : 50
      if (tensionVariance > 10) score += 10
      comment = avgDur >= 2 && avgDur <= 6 ? `Rythme maÃ®trisÃ© (${avgDur.toFixed(1)}s/plan moyen)` : `Rythme Ã  ajuster (${avgDur.toFixed(1)}s/plan)`
      break

    case 'emotional_arc':
      score = tension?.avgTension > 55 ? 80 : tension?.avgTension > 35 ? 68 : 52
      if (tension?.curve?.some((c: any) => c.tension > 70)) score += 10
      if (tension?.curve?.some((c: any) => c.tension < 30) && tension?.curve?.some((c: any) => c.tension > 60)) score += 8
      comment = score >= 80 ? 'Arc Ã©motionnel puissant avec pics et respirations'
              : score >= 65 ? 'Arc Ã©motionnel prÃ©sent, impact solide'
              : 'Impact Ã©motionnel Ã  renforcer'
      break

    case 'originality':
      score = scriptLength > 800 ? 75 : scriptLength > 500 ? 68 : 58
      if (script.includes('INSERT') && script.includes('FLASHBACK')) score += 10
      if (shotTypes.size >= 4) score += 5
      comment = score >= 75 ? 'Traitement singulier, regard personnel affirmÃ©'
              : score >= 65 ? 'Ãvaluation sur le scÃ©nario â singularitÃ© prÃ©sente'
              : 'Ãvaluation sur le scÃ©nario original â analyse de singularitÃ©'
      break

    // âââ DOP criteria âââ
    case 'lighting':
      const hasLightingDesc = script.toLowerCase().match(/lumi[eÃ¨]re|golden.hour|cr[eÃ©]puscule|n[eÃ©]on|clair.obscur|contre.jour|aube|ombre|soleil|nuit|obscur|flash|spot|rÃ©tro.?Ã©clair/)
      const hasTimeOfDay = script.toLowerCase().match(/\b(jour|nuit|matin|soir|aube|crÃ©puscule|midi)\b/)
      score = hasLightingDesc ? 76 : hasTimeOfDay ? 65 : 58
      comment = hasLightingDesc ? 'Indications lumiÃ¨re prÃ©sentes et cohÃ©rentes'
              : hasTimeOfDay ? 'Contexte lumineux implicite (heure du jour)'
              : 'Indications lumiÃ¨re Ã  enrichir'
      break

    case 'framing':
      score = shotTypes.size >= 4 ? 80 : shotTypes.size >= 3 ? 65 : 50
      comment = `${shotTypes.size} valeurs de plan utilisÃ©es${shotTypes.size >= 4 ? ' â vocabulaire riche' : ''}`
      break

    case 'camera_movement':
      score = cameraMovements.size >= 2 ? 75 : cameraMovements.size >= 1 ? 60 : 45
      comment = cameraMovements.size >= 2 ? `${cameraMovements.size} mouvements variÃ©s` : 'Mouvements camÃ©ra Ã  diversifier'
      break

    case 'lens_choice':
      // Logique : INSERT/GP/PR = macro/tÃ©lÃ©, PE/PG/PA = grand angle, PM = normal
      const hasMacro = plans.some((p: any) => ['INSERT', 'GP', 'PR'].includes(p.shotType || ''))
      const hasLargeAngle = plans.some((p: any) => ['TGP', 'PG', 'PA', 'PE'].includes(p.shotType || ''))
      const hasMidRange = plans.some((p: any) => ['PM', 'PA'].includes(p.shotType || ''))
      const lensVariety = [hasMacro, hasLargeAngle, hasMidRange].filter(Boolean).length
      score = lensVariety >= 3 ? 80 : lensVariety >= 2 ? 70 : 55
      comment = lensVariety >= 3 ? 'Palette optique complÃ¨te (macro â grand angle)' : lensVariety >= 2 ? 'Jeu d\'optiques prÃ©sent' : 'Palette optique Ã  enrichir'
      break

    case 'color_palette': {
      const sl = script.toLowerCase()
      // Couche 1 â couleurs nommÃ©es (chaudes vs froides)
      const warmColors = sl.match(/\b(or|dorÃ©|ambre|cuivre|orange|rouge|ocre|sÃ©pia|brun|rouille|sable|miel)\b/g) || []
      const coldColors = sl.match(/\b(bleu|azur|cyan|violet|indigo|argent|blanc|gris|glacÃ©|acier)\b/g) || []
      const darkColors = sl.match(/\b(noir|sombre|obscur|ombre|nuit|tÃ©nÃ¨bres)\b/g) || []
      const neonColors = sl.match(/\b(nÃ©on|fluo|rose|magenta|lime|Ã©lectrique)\b/g) || []
      const totalColorRefs = warmColors.length + coldColors.length + darkColors.length + neonColors.length
      // Couche 2 â intentions de grade
      const hasGradeIntent = sl.match(/\b(dÃ©saturÃ©|saturÃ©|monochrome|sÃ©pia|virÃ©|grade|Ã©talon|palette|teinte|contraste|chaleur|froid)\b/)
      // Couche 3 â cohÃ©rence chromatique (une couleur dominante + une complÃ©mentaire = intentionnel)
      const hasDominantPalette = (warmColors.length >= 2 && (coldColors.length >= 1 || darkColors.length >= 1))
                               || (coldColors.length >= 2 && (warmColors.length >= 1 || darkColors.length >= 1))
                               || neonColors.length >= 2
      // Couche 4 â genre mapping (pub_luxe = attentes haute colorimÃ©trie)
      const genreColorBonus = ['pub_luxe', 'clip_musical'].includes(genre) ? 5 : 0
      // Calcul
      score = 58
      if (totalColorRefs >= 4) score = 82
      else if (totalColorRefs >= 2) score = 74
      else if (totalColorRefs >= 1) score = 65
      if (hasDominantPalette) score += 8
      if (hasGradeIntent) score += 6
      score += genreColorBonus
      comment = score >= 80 ? `Palette chromatique riche et intentionnelle (${totalColorRefs} rÃ©fÃ©rences couleur, cohÃ©rence dominant/complÃ©mentaire)`
              : score >= 70 ? `Palette chromatique prÃ©sente (${totalColorRefs} refs) â cohÃ©rence exploitable`
              : score >= 62 ? 'Quelques rÃ©fÃ©rences couleur â palette Ã  affirmer'
              : 'Palette chromatique non dÃ©finie â prÃ©ciser la tempÃ©rature et les dominantes'
      break
    }

    case 'continuity':
      const continuityScore = plans.length >= 3 ? 70 : 55
      score = continuityScore
      comment = plans.length >= 3 ? 'Suffisamment de plans pour Ã©valuer la continuitÃ©' : 'Peu de plans, continuitÃ© Ã  surveiller'
      break

    // âââ Editor criteria âââ
    case 'cut_rhythm':
      score = planCount >= 4 && planCount <= 12 ? 70 : planCount >= 3 ? 60 : 45
      if (tensionVariance > 8) score += 10
      comment = `${planCount} plans â ${planCount >= 4 ? 'rythme de montage exploitable' : 'trop peu de coupes'}`
      break

    case 'transitions':
      // MISEN gÃ¨re les transitions par dÃ©faut â score de base Ã©levÃ©
      score = planCount >= 4 ? 70 : 65
      comment = planCount >= 4 ? 'Transitions fondues recommandÃ©es â cohÃ©rent avec le style'
              : 'Transitions Ã  dÃ©finir selon le rythme souhaitÃ©'
      break

    case 'shot_order':
      // PE (plan d'ensemble) est un plan large â convention d'ouverture valide
      const startsWide = plans.length > 0 && ['TGP', 'PG', 'PA', 'PE'].includes(plans[0]?.shotType || '')
      score = startsWide ? 70 : 55
      if (plans.length > 0 && plans[plans.length - 1]?.shotType && plans[plans.length - 1].shotType !== plans[0]?.shotType) score += 10
      comment = startsWide ? 'Ouverture en plan large â convention respectÃ©e' : 'Ouverture en plan serrÃ© â choix artistique Ã  justifier'
      break

    case 'duration':
      const durations = plans.map((p: any) => p.estimatedDuration || 3)
      const hasVariety = Math.max(...durations) - Math.min(...durations) > 1
      score = hasVariety ? 70 : 55
      comment = hasVariety ? 'VariÃ©tÃ© de durÃ©es â dynamique' : 'DurÃ©es trop uniformes'
      break

    case 'tension_management': {
      // Pour les scripts courts (â¤9 plans), le Ï physiquement atteignable est limitÃ©
      // On normalise les seuils selon la longueur du script
      const curveLength = tension?.curve?.length || plans.length || scenes.length || 10
      const isShortScript = curveLength <= 9
      const isMediumScript = curveLength <= 13

      // Seuils adaptÃ©s : court â Ï8/Ï14, medium â Ï9/Ï16, long â Ï10/Ï18
      const thresholdHigh = isShortScript ? 8 : isMediumScript ? 9 : 10
      const thresholdVeryHigh = isShortScript ? 14 : isMediumScript ? 16 : 18

      // Bonus arc global (rÃ©compense la structure narrative mÃªme sur peu de plans)
      const arcBonus = tension?.globalArc?.includes('classique') ? 10
                     : tension?.globalArc?.includes('crescendo') ? 7
                     : tension?.globalArc?.includes('contemplatif') ? 5 : 0

      // Score base
      const baseScore = tensionVariance > thresholdVeryHigh ? 80
                      : tensionVariance > thresholdHigh ? 70
                      : tensionVariance > 4 ? 58 : 40

      score = Math.min(95, baseScore + arcBonus)

      comment = score >= 80 ? 'Gestion de tension efficace â contrastes marquÃ©s'
              : score >= 70 ? 'Tension bien gÃ©rÃ©e, quelques respirations'
              : score >= 58 ? 'Tension prÃ©sente â enrichir les contrastes'
              : 'Tension trop plate â manque de contrastes'
      break
    }

    case 'sound_design':
      const hasMusicRef = script.toLowerCase().match(/musique|bande.son|ambient|silence|son|audio|soundtrack/)
      score = hasVoiceover ? 75 : hasDialogue ? 68 : hasMusicRef ? 65 : 52
      comment = hasVoiceover ? 'Voix off structurante â son narratif fort'
              : hasDialogue ? 'Dialogues prÃ©sents â design sonore Ã  prÃ©ciser'
              : hasMusicRef ? 'RÃ©fÃ©rences musicales dÃ©tectÃ©es'
              : 'Indications sonores Ã  enrichir'
      break

    // âââ Ad Director criteria âââ
    case 'hook':
      const firstPlan = plans[0]
      // PE (plan d'ensemble) est un hook cinÃ©matographique fort â panorama d'entrÃ©e
      score = firstPlan && ['TGP', 'PG', 'PE'].includes(firstPlan.shotType || '') ? 70 : 55
      if (firstPlan?.cameraMove && firstPlan.cameraMove !== 'fixe') score += 10
      comment = score >= 70 ? 'Ouverture impactante, accroche visuelle forte' : 'Hook Ã  renforcer â les 2 premiÃ¨res secondes doivent capter'
      break

    case 'brand_integration':
      const hasProduct = plans.some((p: any) => p.shotType === 'INSERT') || script.toLowerCase().includes('flacon') || script.toLowerCase().includes('produit') || script.toLowerCase().includes('logo')
      score = hasProduct ? 75 : genre === 'pub_luxe' ? 40 : 60
      comment = hasProduct ? 'Produit/marque intÃ©grÃ© dans la narration' : 'Produit absent ou trop tardif'
      break

    case 'emotional_trigger':
      score = tension?.avgTension > 60 ? 80 : tension?.avgTension > 40 ? 70 : tension?.avgTension > 25 ? 58 : 45
      if (tension?.curve?.some((c: any) => c.tension > 70)) score += 5
      comment = score >= 75 ? 'Charge Ã©motionnelle forte, impact mÃ©morable'
              : score >= 65 ? 'Charge Ã©motionnelle prÃ©sente'
              : 'Ãmotion Ã  amplifier'
      break

    case 'memorability': {
      // Image-clÃ© : un plan ou un moment qui reste dans la tÃªte
      const hasStrongImage = script.match(/\b(silhouette|reflet|miroir|regard|larme|feu|fumÃ©e|vague|cendre|lumiÃ¨re|ombre)\b/i)
      const hasPunchline = scenes.some((sc: any) => (sc.dialogues || []).some((d: any) => {
        const text = (d.text || d.ligne || '').trim()
        return text.length > 0 && text.length < 60 // phrase courte = potentiel punchline
      }))
      const hasCrescentTension = tension?.curve && tension.curve.some((c: any) => c.tension > 75)
      const hasUniqueSetup = script.match(/\b(vertige|apesanteur|ralenti|accÃ©lÃ©rÃ©|split|miroir|double|fantÃ´me|invisible)\b/i)
      score = scriptLength > 500 && shotTypes.size >= 4 ? 70 : scriptLength > 300 && shotTypes.size >= 3 ? 62 : 50
      if (hasStrongImage) score += 10
      if (hasPunchline) score += 8
      if (hasCrescentTension) score += 6
      if (hasUniqueSetup) score += 8
      comment = score >= 82 ? 'Image-clÃ© forte, concept mÃ©morable â impact durable garanti'
              : score >= 72 ? 'Bon potentiel mÃ©morable â image ou formule forte prÃ©sente'
              : score >= 60 ? 'MÃ©morabilitÃ© correcte â renforcer l\'image-clÃ©'
              : 'MÃ©morabilitÃ© Ã  construire â trouver un plan ou une phrase signature'
      break
    }

    case 'cta_effectiveness':
      const hasCTA = script.toLowerCase().includes('voix off') || script.toLowerCase().includes('logo') || script.toLowerCase().includes('fin')
      score = hasCTA ? 70 : 50
      comment = hasCTA ? 'Fermeture avec signature dÃ©tectÃ©e' : 'CTA/signature Ã  renforcer'
      break

    case 'target_fit':
      // CohÃ©rence cible : Ã©valuation plus fine selon le genre
      score = 68
      if (genre === 'pub_luxe' && scriptLength > 200) score += 7
      if (genre === 'corporate' && hasVoiceover) score += 7
      if (genre === 'documentaire' && sceneCount >= 3) score += 7
      comment = score >= 72 ? 'Bonne adÃ©quation cible/format dÃ©tectÃ©e'
              : 'CohÃ©rence cible Ã©valuÃ©e sur le ton et le style du scÃ©nario'
      break

    // âââ Screenwriter criteria âââ
    case 'dialogue_quality': {
      const dialogueCount = scenes.reduce((s: number, sc: any) => s + (sc.dialogues?.length || 0), 0)
      const sl = script.toLowerCase()
      // Couche 1 â prÃ©sence de voix off / narrateur / dialogues directs
      const hasVO = hasVoiceover
      const hasDirectDialogue = dialogueCount >= 1
      // Couche 2 â naturalitÃ© (contractions, interruptions, hÃ©sitations)
      const hasNaturalMarkers = script.match(/\b(euh|hmm|ben|ouais|nan|putain|merde|enfin|quoi|hein|bon)\b/i)
        || script.match(/\.{3}|â|â/) // ellipses et tirets = hÃ©sitation, interruption
      // Couche 3 â distinctivitÃ© des voix (plusieurs personnages avec styles diffÃ©rents)
      const characterNames = characterBible.map((c: any) => (c.name || c.personnage || '').toUpperCase()).filter(Boolean)
      const distinctVoices = characterNames.filter((name: string) => {
        const lines = (script.match(new RegExp(name + '\\n([^\\n]+)', 'g')) || [])
        return lines.length >= 1
      }).length
      // Couche 4 â sous-texte dans les dialogues (questions sans rÃ©ponse, silences indiquÃ©s)
      const hasSilences = script.match(/\bsilence\b|\b\.\.\.\b|SILENCE|pause/i)
      const hasSubtext = script.match(/\b(sous.entendu|regarde|hÃ©site|sans rÃ©pondre|dÃ©tourne)\b/i) || hasSilences
      // Score final
      if (!hasDirectDialogue && !hasVO) {
        score = 48
      } else if (hasVO && !hasDirectDialogue) {
        score = 68
        if (hasNaturalMarkers) score += 8
      } else {
        score = dialogueCount >= 5 ? 72 : dialogueCount >= 3 ? 67 : 60
        if (hasNaturalMarkers) score += 8
        if (distinctVoices >= 2) score += 7
        if (hasSubtext) score += 7
        if (characterBible.length >= 2 && dialogueCount >= 3) score += 5
      }
      comment = score >= 80 ? `Dialogues naturels, ${distinctVoices} voix distinctes, sous-texte prÃ©sent`
              : score >= 70 ? `${dialogueCount} rÃ©pliques â voix exploitables, naturel prÃ©sent`
              : score >= 60 ? `${dialogueCount} rÃ©pliques prÃ©sentes â voix Ã  diffÃ©rencier davantage`
              : hasVO ? 'Voix off seule â dialogues directs Ã  intÃ©grer pour enrichir'
              : 'Peu ou pas de dialogues â scÃ©nario visuel pur'
      break
    }

    case 'character_depth': {
      const hasPhysicalDesc = characterBible.some((c: any) => (c.apparence || c.description || '').length > 30)
      const hasTraits = characterBible.some((c: any) => c.traits && c.traits.length >= 2)
      const hasContradiction = script.match(/\b(malgrÃ©|pourtant|mais|cependant|paradoxe|contradiction|hÃ©site|doute)\b/i)
      score = characterBible.length >= 3 ? 75 : characterBible.length >= 2 ? 65 : characterBible.length >= 1 ? 55 : 40
      if (hasPhysicalDesc) score += 7
      if (hasTraits) score += 6
      if (hasContradiction) score += 7
      comment = score >= 80 ? `${characterBible.length} personnages profonds avec contradictions et traits distinctifs`
              : score >= 70 ? `${characterBible.length} personnages dÃ©veloppÃ©s â bible solide`
              : score >= 58 ? `${characterBible.length} personnage(s) â approfondissement possible`
              : 'Personnages Ã  dÃ©velopper â ajouter traits physiques et psychologiques'
      break
    }

    case 'show_dont_tell': {
      // Actions scÃ©naristiques vs dialogues purs
      const actionLines = (script.match(/^[A-ZÃ-Ã][^a-z\n]{0,5}\n(?![A-Z])/gm) || []).length
      const hasInsert = script.toUpperCase().includes('INSERT')
      const hasSymbolism = script.match(/\b(symbole|mÃ©taphore|reprÃ©sente|Ã©voque|rappelle|comme un|telle une)\b/i)
      const hasPureVisual = plans.some((p: any) => p.shotType === 'INSERT' || (p.prompt || '').length > 80)
      score = actionLines >= 5 ? 72 : actionLines >= 3 ? 62 : 50
      if (hasInsert) score += 10
      if (hasSymbolism) score += 8
      if (hasPureVisual) score += 6
      comment = score >= 80 ? 'Narration visuelle dominante, le film montre sans expliquer'
              : score >= 70 ? 'Bon Ã©quilibre montrer/dire â visuels forts'
              : score >= 58 ? 'Ratio action/dialogue acceptable â enrichir le visuel'
              : 'Trop de dialogue explicatif â laisser les images parler'
      break
    }

    case 'dramatic_engine':
      score = tension?.climax >= 0 ? 70 : 50
      if (tension?.globalArc?.includes('classique')) score += 10
      comment = tension?.climax >= 0 ? 'Moteur dramatique identifiable' : 'Manque de tension dramatique'
      break

    case 'subtext':
      // Sous-texte = richesse des indications + nombre de plans + diversitÃ©
      const subtextScore = (scriptLength > 600 ? 2 : scriptLength > 300 ? 1 : 0)
        + (plans.length >= 5 ? 2 : plans.length >= 3 ? 1 : 0)
        + (shotTypes.size >= 4 ? 2 : shotTypes.size >= 3 ? 1 : 0)
      score = subtextScore >= 5 ? 75 : subtextScore >= 3 ? 65 : subtextScore >= 2 ? 58 : 48
      comment = score >= 70 ? 'Sous-texte riche â narration en couches'
              : score >= 60 ? 'Sous-texte prÃ©sent, richesse Ã  dÃ©velopper'
              : 'Sous-texte Ã©valuÃ© sur la richesse des indications visuelles'
      break

    case 'economy':
      const wordsPerScene = scriptLength / Math.max(sceneCount, 1)
      // ScÃ©narios documentaire/corporate sont plus longs par nature
      const economyThresholdOk = genre === 'documentaire' || genre === 'corporate' ? 900 : 500
      const economyThresholdMed = genre === 'documentaire' || genre === 'corporate' ? 1200 : 800
      score = wordsPerScene < economyThresholdOk ? 72 : wordsPerScene < economyThresholdMed ? 62 : 47
      comment = wordsPerScene < economyThresholdOk ? 'Ãcriture Ã©conome, chaque mot compte' : 'ScÃ©nario Ã  resserrer'
      break

    default:
      score = 55
      comment = 'Ãvaluation standard'
  }

  return { score: Math.max(0, Math.min(100, score)), comment }
}

function generateRecommendation(criterion: EvaluationCriterion, score: number, genre: string): string {
  const recs: Record<string, string> = {
    narrative_structure: 'Renforcer la structure en 3 actes : situation initiale â perturbation â rÃ©solution.',
    visual_storytelling: 'Ajouter des plans symboliques (insert, pillow shots) pour enrichir la narration visuelle.',
    shot_choices: 'Alterner systÃ©matiquement gros plans (Ã©motion) et plans larges (contexte).',
    pacing: 'Varier la durÃ©e des plans : courts pour la tension, longs pour la contemplation.',
    emotional_arc: 'CrÃ©er au moins un pic Ã©motionnel clair (climax) et une respiration (dÃ©nouement).',
    lighting: 'PrÃ©ciser la direction de lumiÃ¨re dans chaque scÃ¨ne (golden hour, clair-obscur, nÃ©on...).',
    framing: 'Utiliser au moins 4 valeurs de plan diffÃ©rentes dans le dÃ©coupage.',
    camera_movement: 'Justifier chaque mouvement camÃ©ra par une intention narrative.',
    hook: 'Les 2 premiÃ¨res secondes doivent Ãªtre visuellement irrÃ©sistibles.',
    brand_integration: 'Le produit doit apparaÃ®tre avant 70% du film, naturellement intÃ©grÃ©.',
    dialogue_quality: 'Donner Ã  chaque personnage une voix distincte â vocabulaire, rythme, ton.',
    character_depth: 'Ajouter au moins une contradiction ou un dÃ©tail humain par personnage.',
  }
  return recs[criterion.id] || ''
}
