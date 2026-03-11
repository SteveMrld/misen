/**
 * MISEN V14.4 — Expert Panel
 * @description Panel d'experts virtuels qui évaluent chaque projet
 *   comme de vrais professionnels du cinéma et de la publicité.
 *   
 *   Chaque expert a son propre cadre d'évaluation, ses références,
 *   ses critères, et son style de feedback.
 */

// ─── Types ───

export interface ExpertProfile {
  id: string
  name: string
  role: string
  speciality: string
  experience: string
  references: string[]
  evaluationCriteria: EvaluationCriterion[]
  style: 'rigoureux' | 'créatif' | 'commercial' | 'technique' | 'narratif'
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

// ─── Expert Profiles ───

export const EXPERTS: ExpertProfile[] = [
  {
    id: 'director',
    name: 'Expert Réalisation',
    role: 'Directeur artistique / Réalisateur',
    speciality: 'Mise en scène, narration visuelle, direction d\'acteurs',
    experience: 'Évalue comme un réalisateur avec 20 ans de festivals',
    references: ['Villeneuve', 'Kubrick', 'Scorsese', 'Ozu', 'Wong Kar-wai'],
    evaluationCriteria: [
      { id: 'narrative_structure', label: 'Structure narrative', weight: 0.20, description: 'Arc dramatique, setup/payoff, cohérence du récit' },
      { id: 'visual_storytelling', label: 'Narration visuelle', weight: 0.20, description: 'Chaque plan raconte-t-il quelque chose ? Pas de plan gratuit.' },
      { id: 'shot_choices', label: 'Choix de plans', weight: 0.20, description: 'Les cadrages servent-ils l\'émotion ? Gros plan = intimité, plan large = solitude, etc.' },
      { id: 'pacing', label: 'Rythme', weight: 0.15, description: 'Alternance tension/respiration, durée des plans adaptée au propos' },
      { id: 'emotional_arc', label: 'Arc émotionnel', weight: 0.15, description: 'Le spectateur ressent-il quelque chose ? Progression émotionnelle cohérente.' },
      { id: 'originality', label: 'Originalité', weight: 0.10, description: 'Évite les clichés ? Apporte un regard singulier ?' },
    ],
    style: 'créatif',
  },
  {
    id: 'dop',
    name: 'Expert Image',
    role: 'Directeur de la photographie',
    speciality: 'Lumière, cadrage, optiques, mouvements caméra',
    experience: 'Évalue comme un DOP qui a tourné 50 films',
    references: ['Roger Deakins', 'Emmanuel Lubezki', 'Hoyte van Hoytema', 'Robert Richardson'],
    evaluationCriteria: [
      { id: 'lighting', label: 'Éclairage', weight: 0.20, description: 'Direction de lumière cohérente, source justifiée, ambiance créée par la lumière' },
      { id: 'framing', label: 'Cadrage', weight: 0.20, description: 'Composition, règle des tiers, headroom, leading lines, symétrie/asymétrie intentionnelle' },
      { id: 'camera_movement', label: 'Mouvement caméra', weight: 0.20, description: 'Chaque mouvement est-il justifié dramatiquement ? Travelling = suivi, dolly-in = tension, fixe = contemplation' },
      { id: 'lens_choice', label: 'Choix d\'optique', weight: 0.15, description: 'Grand-angle = espace/déformation, télé = compression/isolement, macro = détail intime' },
      { id: 'color_palette', label: 'Palette chromatique', weight: 0.15, description: 'Cohérence colorimétrique, température, contraste, grade intentionnel' },
      { id: 'continuity', label: 'Continuité visuelle', weight: 0.10, description: 'Raccords lumière, raccords mouvement, axe 180°, cohérence inter-plans' },
    ],
    style: 'technique',
  },
  {
    id: 'editor',
    name: 'Expert Montage',
    role: 'Monteur / Post-production',
    speciality: 'Rythme, transitions, structure temporelle',
    experience: 'Évalue comme un monteur de longs-métrages primés',
    references: ['Thelma Schoonmaker (Scorsese)', 'Lee Smith (Nolan)', 'Walter Murch (Coppola)'],
    evaluationCriteria: [
      { id: 'cut_rhythm', label: 'Rythme de coupe', weight: 0.25, description: 'Les coupes tombent-elles au bon moment ? Respiration entre les plans ?' },
      { id: 'transitions', label: 'Transitions', weight: 0.20, description: 'Les transitions servent-elles le récit ? Cut sec = tension, fondu = passage du temps' },
      { id: 'shot_order', label: 'Ordre des plans', weight: 0.20, description: 'La séquence de plans est-elle logique visuellement et narrativement ?' },
      { id: 'duration', label: 'Durée des plans', weight: 0.15, description: 'Chaque plan reste-t-il le temps nécessaire ? Ni trop court ni trop long ?' },
      { id: 'tension_management', label: 'Gestion de tension', weight: 0.10, description: 'Le montage crée-t-il de la tension, de la surprise, de l\'émotion ?' },
      { id: 'sound_design', label: 'Design sonore', weight: 0.10, description: 'Les indications sonores sont-elles pertinentes ? Voix off, ambiance, musique ?' },
    ],
    style: 'rigoureux',
  },
  {
    id: 'ad_director',
    name: 'Expert Publicité',
    role: 'Directeur de création publicitaire',
    speciality: 'Branding, impact commercial, engagement',
    experience: 'Évalue comme un DC de grande agence (Publicis, BBDO, Wieden+Kennedy)',
    references: ['Apple (1984)', 'Nike (Just Do It)', 'Chanel N°5', 'Old Spice', 'Dove Real Beauty'],
    evaluationCriteria: [
      { id: 'hook', label: 'Hook (accroche)', weight: 0.20, description: 'Les 2 premières secondes captent-elles l\'attention ?' },
      { id: 'brand_integration', label: 'Intégration marque', weight: 0.20, description: 'Le produit/marque est-il visible au bon moment, de la bonne manière ?' },
      { id: 'emotional_trigger', label: 'Déclencheur émotionnel', weight: 0.15, description: 'Quel sentiment provoque le film ? Est-il cohérent avec la marque ?' },
      { id: 'memorability', label: 'Mémorabilité', weight: 0.15, description: 'On se souvient de quoi après ? Un plan, une phrase, une émotion ?' },
      { id: 'cta_effectiveness', label: 'Efficacité CTA', weight: 0.15, description: 'Le spectateur sait-il quoi faire après ? Le CTA est-il naturel ?' },
      { id: 'target_fit', label: 'Cohérence cible', weight: 0.15, description: 'Le ton, le style, le rythme correspondent-ils à la cible visée ?' },
    ],
    style: 'commercial',
  },
  {
    id: 'screenwriter',
    name: 'Expert Scénario',
    role: 'Scénariste / Script doctor',
    speciality: 'Dialogues, structure dramatique, personnages',
    experience: 'Évalue comme un scénariste de films primés',
    references: ['Aaron Sorkin', 'Charlie Kaufman', 'Céline Sciamma', 'Bong Joon-ho'],
    evaluationCriteria: [
      { id: 'dialogue_quality', label: 'Qualité des dialogues', weight: 0.20, description: 'Les dialogues sonnent-ils vrais ? Chaque personnage a-t-il sa voix ?' },
      { id: 'character_depth', label: 'Profondeur des personnages', weight: 0.20, description: 'Les personnages ont-ils des motivations, des contradictions, une humanité ?' },
      { id: 'show_dont_tell', label: 'Show don\'t tell', weight: 0.20, description: 'Le scénario montre-t-il plutôt qu\'il n\'explique ? Les images racontent ?' },
      { id: 'dramatic_engine', label: 'Moteur dramatique', weight: 0.15, description: 'Qu\'est-ce qui pousse l\'histoire en avant ? Conflit, désir, obstacle ?' },
      { id: 'subtext', label: 'Sous-texte', weight: 0.15, description: 'Y a-t-il des niveaux de lecture ? Ce qui n\'est pas dit est-il aussi important ?' },
      { id: 'economy', label: 'Économie d\'écriture', weight: 0.10, description: 'Chaque mot compte ? Pas de gras, pas de redondance ?' },
    ],
    style: 'narratif',
  },
]

// ─── Evaluation Engine ───

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
    if (score >= 75) strengths.push(`${criterion.label} — ${comment}`)
    if (score < 50) weaknesses.push(`${criterion.label} — ${comment}`)
    if (score < 65) {
      const rec = generateRecommendation(criterion, score, genre)
      if (rec) recommendations.push(rec)
    }
  }

  const verdict = overallScore >= 80
    ? `${expert.name} valide ce projet. La qualité cinématographique est au niveau professionnel.`
    : overallScore >= 65
    ? `${expert.name} considère ce projet prometteur avec des ajustements nécessaires.`
    : overallScore >= 50
    ? `${expert.name} identifie des problèmes structurels qui doivent être corrigés avant production.`
    : `${expert.name} recommande une réécriture significative avant de poursuivre.`

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

// ─── Criterion Evaluation Logic ───

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
    // ─── Director criteria ───
    case 'narrative_structure':
      // Corporate et pub peuvent être mono-scène — ne pas les pénaliser
      const minScenes = ['corporate', 'pub_luxe'].includes(genre) ? 1 : 2
      score = sceneCount >= 3 ? 70 : sceneCount >= minScenes ? 62 : 45
      if (tension?.globalArc?.includes('classique')) score += 15
      if (tension?.globalArc?.includes('crescendo')) score += 10
      if (tension?.globalArc?.includes('contemplatif')) score += 8
      if (tension?.climax >= 0) score += 8
      comment = sceneCount >= 3 ? 'Structure en actes détectable, arc narratif présent'
              : sceneCount >= 1 ? 'Structure narrative adaptée au format court'
              : 'Structure narrative minimale'
      break

    case 'visual_storytelling':
      score = shotTypes.size >= 3 ? 75 : shotTypes.size >= 2 ? 60 : 45
      if (planCount >= 4) score += 10
      comment = shotTypes.size >= 3 ? 'Variété de plans, narration visuelle riche' : 'Vocabulaire visuel limité'
      break

    case 'shot_choices':
      const hasCloseUp = plans.some((p: any) => ['GP', 'PR', 'TGP'].includes(p.shotType || ''))
      const hasWide = plans.some((p: any) => ['PE', 'PG', 'PA'].includes(p.shotType || ''))
      score = hasCloseUp && hasWide ? 75 : hasCloseUp || hasWide ? 60 : 45
      if (plans.some((p: any) => p.shotType === 'INSERT')) score += 10
      comment = hasCloseUp && hasWide ? 'Alternance intime/vaste, choix de plans pertinents' : 'Manque de variété dans les valeurs de plan'
      break

    case 'pacing':
      const avgDur = plans.reduce((s: number, p: any) => s + (p.estimatedDuration || 3), 0) / Math.max(planCount, 1)
      score = avgDur >= 2 && avgDur <= 6 ? 70 : 50
      if (tensionVariance > 10) score += 10
      comment = avgDur >= 2 && avgDur <= 6 ? `Rythme maîtrisé (${avgDur.toFixed(1)}s/plan moyen)` : `Rythme à ajuster (${avgDur.toFixed(1)}s/plan)`
      break

    case 'emotional_arc':
      score = tension?.avgTension > 55 ? 80 : tension?.avgTension > 35 ? 68 : 52
      if (tension?.curve?.some((c: any) => c.tension > 70)) score += 10
      if (tension?.curve?.some((c: any) => c.tension < 30) && tension?.curve?.some((c: any) => c.tension > 60)) score += 8
      comment = score >= 80 ? 'Arc émotionnel puissant avec pics et respirations'
              : score >= 65 ? 'Arc émotionnel présent, impact solide'
              : 'Impact émotionnel à renforcer'
      break

    case 'originality':
      score = scriptLength > 800 ? 75 : scriptLength > 500 ? 68 : 58
      if (script.includes('INSERT') && script.includes('FLASHBACK')) score += 10
      if (shotTypes.size >= 4) score += 5
      comment = score >= 75 ? 'Traitement singulier, regard personnel affirmé'
              : score >= 65 ? 'Évaluation sur le scénario — singularité présente'
              : 'Évaluation sur le scénario original — analyse de singularité'
      break

    // ─── DOP criteria ───
    case 'lighting':
      const hasLightingDesc = script.toLowerCase().match(/lumi[eè]re|golden.hour|cr[eé]puscule|n[eé]on|clair.obscur|contre.jour|aube|ombre|soleil|nuit|obscur|flash|spot|rétro.?éclair/)
      const hasTimeOfDay = script.toLowerCase().match(/\b(jour|nuit|matin|soir|aube|crépuscule|midi)\b/)
      score = hasLightingDesc ? 76 : hasTimeOfDay ? 65 : 58
      comment = hasLightingDesc ? 'Indications lumière présentes et cohérentes'
              : hasTimeOfDay ? 'Contexte lumineux implicite (heure du jour)'
              : 'Indications lumière à enrichir'
      break

    case 'framing':
      score = shotTypes.size >= 4 ? 80 : shotTypes.size >= 3 ? 65 : 50
      comment = `${shotTypes.size} valeurs de plan utilisées${shotTypes.size >= 4 ? ' — vocabulaire riche' : ''}`
      break

    case 'camera_movement':
      score = cameraMovements.size >= 2 ? 75 : cameraMovements.size >= 1 ? 60 : 45
      comment = cameraMovements.size >= 2 ? `${cameraMovements.size} mouvements variés` : 'Mouvements caméra à diversifier'
      break

    case 'lens_choice':
      // Logique : INSERT/GP/PR = macro/télé, PE/PG/PA = grand angle, PM = normal
      const hasMacro = plans.some((p: any) => ['INSERT', 'GP', 'PR'].includes(p.shotType || ''))
      const hasLargeAngle = plans.some((p: any) => ['TGP', 'PG', 'PA', 'PE'].includes(p.shotType || ''))
      const hasMidRange = plans.some((p: any) => ['PM', 'PA'].includes(p.shotType || ''))
      const lensVariety = [hasMacro, hasLargeAngle, hasMidRange].filter(Boolean).length
      score = lensVariety >= 3 ? 80 : lensVariety >= 2 ? 70 : 55
      comment = lensVariety >= 3 ? 'Palette optique complète (macro → grand angle)' : lensVariety >= 2 ? 'Jeu d\'optiques présent' : 'Palette optique à enrichir'
      break

    case 'color_palette': {
      const sl = script.toLowerCase()
      // Couche 1 — couleurs nommées (chaudes vs froides)
      const warmColors = sl.match(/\b(or|doré|ambre|cuivre|orange|rouge|ocre|sépia|brun|rouille|sable|miel)\b/g) || []
      const coldColors = sl.match(/\b(bleu|azur|cyan|violet|indigo|argent|blanc|gris|glacé|acier)\b/g) || []
      const darkColors = sl.match(/\b(noir|sombre|obscur|ombre|nuit|ténèbres)\b/g) || []
      const neonColors = sl.match(/\b(néon|fluo|rose|magenta|lime|électrique)\b/g) || []
      const totalColorRefs = warmColors.length + coldColors.length + darkColors.length + neonColors.length
      // Couche 2 — intentions de grade
      const hasGradeIntent = sl.match(/\b(désaturé|saturé|monochrome|sépia|viré|grade|étalon|palette|teinte|contraste|chaleur|froid)\b/)
      // Couche 3 — cohérence chromatique (une couleur dominante + une complémentaire = intentionnel)
      const hasDominantPalette = (warmColors.length >= 2 && (coldColors.length >= 1 || darkColors.length >= 1))
                               || (coldColors.length >= 2 && (warmColors.length >= 1 || darkColors.length >= 1))
                               || neonColors.length >= 2
      // Couche 4 — genre mapping (pub_luxe = attentes haute colorimétrie)
      const genreColorBonus = ['pub_luxe', 'clip_musical'].includes(genre) ? 5 : 0
      // Calcul
      score = 58
      if (totalColorRefs >= 4) score = 82
      else if (totalColorRefs >= 2) score = 74
      else if (totalColorRefs >= 1) score = 65
      if (hasDominantPalette) score += 8
      if (hasGradeIntent) score += 6
      score += genreColorBonus
      comment = score >= 80 ? `Palette chromatique riche et intentionnelle (${totalColorRefs} références couleur, cohérence dominant/complémentaire)`
              : score >= 70 ? `Palette chromatique présente (${totalColorRefs} refs) — cohérence exploitable`
              : score >= 62 ? 'Quelques références couleur — palette à affirmer'
              : 'Palette chromatique non définie — préciser la température et les dominantes'
      break
    }

    case 'continuity':
      const continuityScore = plans.length >= 3 ? 70 : 55
      score = continuityScore
      comment = plans.length >= 3 ? 'Suffisamment de plans pour évaluer la continuité' : 'Peu de plans, continuité à surveiller'
      break

    // ─── Editor criteria ───
    case 'cut_rhythm':
      score = planCount >= 4 && planCount <= 12 ? 70 : planCount >= 3 ? 60 : 45
      if (tensionVariance > 8) score += 10
      comment = `${planCount} plans — ${planCount >= 4 ? 'rythme de montage exploitable' : 'trop peu de coupes'}`
      break

    case 'transitions':
      // MISEN gère les transitions par défaut — score de base élevé
      score = planCount >= 4 ? 70 : 65
      comment = planCount >= 4 ? 'Transitions fondues recommandées — cohérent avec le style'
              : 'Transitions à définir selon le rythme souhaité'
      break

    case 'shot_order':
      // PE (plan d'ensemble) est un plan large — convention d'ouverture valide
      const startsWide = plans.length > 0 && ['TGP', 'PG', 'PA', 'PE'].includes(plans[0]?.shotType || '')
      score = startsWide ? 70 : 55
      if (plans.length > 0 && plans[plans.length - 1]?.shotType && plans[plans.length - 1].shotType !== plans[0]?.shotType) score += 10
      comment = startsWide ? 'Ouverture en plan large — convention respectée' : 'Ouverture en plan serré — choix artistique à justifier'
      break

    case 'duration':
      const durations = plans.map((p: any) => p.estimatedDuration || 3)
      const hasVariety = Math.max(...durations) - Math.min(...durations) > 1
      score = hasVariety ? 70 : 55
      comment = hasVariety ? 'Variété de durées — dynamique' : 'Durées trop uniformes'
      break

    case 'tension_management':
      // σ>10 = tension bien gérée, σ>18 = contraste dramatique fort
      score = tensionVariance > 18 ? 80 : tensionVariance > 10 ? 70 : tensionVariance > 5 ? 55 : 40
      comment = tensionVariance > 18 ? 'Gestion de tension efficace — contrastes marqués'
              : tensionVariance > 10 ? 'Tension bien gérée, quelques respirations'
              : 'Tension trop plate — manque de contrastes'
      break

    case 'sound_design':
      const hasMusicRef = script.toLowerCase().match(/musique|bande.son|ambient|silence|son|audio|soundtrack/)
      score = hasVoiceover ? 75 : hasDialogue ? 68 : hasMusicRef ? 65 : 52
      comment = hasVoiceover ? 'Voix off structurante — son narratif fort'
              : hasDialogue ? 'Dialogues présents — design sonore à préciser'
              : hasMusicRef ? 'Références musicales détectées'
              : 'Indications sonores à enrichir'
      break

    // ─── Ad Director criteria ───
    case 'hook':
      const firstPlan = plans[0]
      // PE (plan d'ensemble) est un hook cinématographique fort — panorama d'entrée
      score = firstPlan && ['TGP', 'PG', 'PE'].includes(firstPlan.shotType || '') ? 70 : 55
      if (firstPlan?.cameraMove && firstPlan.cameraMove !== 'fixe') score += 10
      comment = score >= 70 ? 'Ouverture impactante, accroche visuelle forte' : 'Hook à renforcer — les 2 premières secondes doivent capter'
      break

    case 'brand_integration':
      const hasProduct = plans.some((p: any) => p.shotType === 'INSERT') || script.toLowerCase().includes('flacon') || script.toLowerCase().includes('produit') || script.toLowerCase().includes('logo')
      score = hasProduct ? 75 : genre === 'pub_luxe' ? 40 : 60
      comment = hasProduct ? 'Produit/marque intégré dans la narration' : 'Produit absent ou trop tardif'
      break

    case 'emotional_trigger':
      score = tension?.avgTension > 60 ? 80 : tension?.avgTension > 40 ? 70 : tension?.avgTension > 25 ? 58 : 45
      if (tension?.curve?.some((c: any) => c.tension > 70)) score += 5
      comment = score >= 75 ? 'Charge émotionnelle forte, impact mémorable'
              : score >= 65 ? 'Charge émotionnelle présente'
              : 'Émotion à amplifier'
      break

    case 'memorability': {
      // Image-clé : un plan ou un moment qui reste dans la tête
      const hasStrongImage = script.match(/\b(silhouette|reflet|miroir|regard|larme|feu|fumée|vague|cendre|lumière|ombre)\b/i)
      const hasPunchline = scenes.some((sc: any) => (sc.dialogues || []).some((d: any) => {
        const text = (d.text || d.ligne || '').trim()
        return text.length > 0 && text.length < 60 // phrase courte = potentiel punchline
      }))
      const hasCrescentTension = tension?.curve && tension.curve.some((c: any) => c.tension > 75)
      const hasUniqueSetup = script.match(/\b(vertige|apesanteur|ralenti|accéléré|split|miroir|double|fantôme|invisible)\b/i)
      score = scriptLength > 500 && shotTypes.size >= 4 ? 70 : scriptLength > 300 && shotTypes.size >= 3 ? 62 : 50
      if (hasStrongImage) score += 10
      if (hasPunchline) score += 8
      if (hasCrescentTension) score += 6
      if (hasUniqueSetup) score += 8
      comment = score >= 82 ? 'Image-clé forte, concept mémorable — impact durable garanti'
              : score >= 72 ? 'Bon potentiel mémorable — image ou formule forte présente'
              : score >= 60 ? 'Mémorabilité correcte — renforcer l\'image-clé'
              : 'Mémorabilité à construire — trouver un plan ou une phrase signature'
      break
    }

    case 'cta_effectiveness':
      const hasCTA = script.toLowerCase().includes('voix off') || script.toLowerCase().includes('logo') || script.toLowerCase().includes('fin')
      score = hasCTA ? 70 : 50
      comment = hasCTA ? 'Fermeture avec signature détectée' : 'CTA/signature à renforcer'
      break

    case 'target_fit':
      // Cohérence cible : évaluation plus fine selon le genre
      score = 68
      if (genre === 'pub_luxe' && scriptLength > 200) score += 7
      if (genre === 'corporate' && hasVoiceover) score += 7
      if (genre === 'documentaire' && sceneCount >= 3) score += 7
      comment = score >= 72 ? 'Bonne adéquation cible/format détectée'
              : 'Cohérence cible évaluée sur le ton et le style du scénario'
      break

    // ─── Screenwriter criteria ───
    case 'dialogue_quality': {
      const dialogueCount = scenes.reduce((s: number, sc: any) => s + (sc.dialogues?.length || 0), 0)
      const sl = script.toLowerCase()
      // Couche 1 — présence de voix off / narrateur / dialogues directs
      const hasVO = hasVoiceover
      const hasDirectDialogue = dialogueCount >= 1
      // Couche 2 — naturalité (contractions, interruptions, hésitations)
      const hasNaturalMarkers = script.match(/\b(euh|hmm|ben|ouais|nan|putain|merde|enfin|quoi|hein|bon)\b/i)
        || script.match(/\.{3}|—|–/) // ellipses et tirets = hésitation, interruption
      // Couche 3 — distinctivité des voix (plusieurs personnages avec styles différents)
      const characterNames = characterBible.map((c: any) => (c.name || c.personnage || '').toUpperCase()).filter(Boolean)
      const distinctVoices = characterNames.filter((name: string) => {
        const lines = (script.match(new RegExp(name + '\\n([^\\n]+)', 'g')) || [])
        return lines.length >= 1
      }).length
      // Couche 4 — sous-texte dans les dialogues (questions sans réponse, silences indiqués)
      const hasSilences = script.match(/\bsilence\b|\b\.\.\.\b|SILENCE|pause/i)
      const hasSubtext = script.match(/\b(sous.entendu|regarde|hésite|sans répondre|détourne)\b/i) || hasSilences
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
      comment = score >= 80 ? `Dialogues naturels, ${distinctVoices} voix distinctes, sous-texte présent`
              : score >= 70 ? `${dialogueCount} répliques — voix exploitables, naturel présent`
              : score >= 60 ? `${dialogueCount} répliques présentes — voix à différencier davantage`
              : hasVO ? 'Voix off seule — dialogues directs à intégrer pour enrichir'
              : 'Peu ou pas de dialogues — scénario visuel pur'
      break
    }

    case 'character_depth': {
      const hasPhysicalDesc = characterBible.some((c: any) => (c.apparence || c.description || '').length > 30)
      const hasTraits = characterBible.some((c: any) => c.traits && c.traits.length >= 2)
      const hasContradiction = script.match(/\b(malgré|pourtant|mais|cependant|paradoxe|contradiction|hésite|doute)\b/i)
      score = characterBible.length >= 3 ? 75 : characterBible.length >= 2 ? 65 : characterBible.length >= 1 ? 55 : 40
      if (hasPhysicalDesc) score += 7
      if (hasTraits) score += 6
      if (hasContradiction) score += 7
      comment = score >= 80 ? `${characterBible.length} personnages profonds avec contradictions et traits distinctifs`
              : score >= 70 ? `${characterBible.length} personnages développés — bible solide`
              : score >= 58 ? `${characterBible.length} personnage(s) — approfondissement possible`
              : 'Personnages à développer — ajouter traits physiques et psychologiques'
      break
    }

    case 'show_dont_tell': {
      // Actions scénaristiques vs dialogues purs
      const actionLines = (script.match(/^[A-ZÀ-Ü][^a-z\n]{0,5}\n(?![A-Z])/gm) || []).length
      const hasInsert = script.toUpperCase().includes('INSERT')
      const hasSymbolism = script.match(/\b(symbole|métaphore|représente|évoque|rappelle|comme un|telle une)\b/i)
      const hasPureVisual = plans.some((p: any) => p.shotType === 'INSERT' || (p.prompt || '').length > 80)
      score = actionLines >= 5 ? 72 : actionLines >= 3 ? 62 : 50
      if (hasInsert) score += 10
      if (hasSymbolism) score += 8
      if (hasPureVisual) score += 6
      comment = score >= 80 ? 'Narration visuelle dominante, le film montre sans expliquer'
              : score >= 70 ? 'Bon équilibre montrer/dire — visuels forts'
              : score >= 58 ? 'Ratio action/dialogue acceptable — enrichir le visuel'
              : 'Trop de dialogue explicatif — laisser les images parler'
      break
    }

    case 'dramatic_engine':
      score = tension?.climax >= 0 ? 70 : 50
      if (tension?.globalArc?.includes('classique')) score += 10
      comment = tension?.climax >= 0 ? 'Moteur dramatique identifiable' : 'Manque de tension dramatique'
      break

    case 'subtext':
      // Sous-texte = richesse des indications + nombre de plans + diversité
      const subtextScore = (scriptLength > 600 ? 2 : scriptLength > 300 ? 1 : 0)
        + (plans.length >= 5 ? 2 : plans.length >= 3 ? 1 : 0)
        + (shotTypes.size >= 4 ? 2 : shotTypes.size >= 3 ? 1 : 0)
      score = subtextScore >= 5 ? 75 : subtextScore >= 3 ? 65 : subtextScore >= 2 ? 58 : 48
      comment = score >= 70 ? 'Sous-texte riche — narration en couches'
              : score >= 60 ? 'Sous-texte présent, richesse à développer'
              : 'Sous-texte évalué sur la richesse des indications visuelles'
      break

    case 'economy':
      const wordsPerScene = scriptLength / Math.max(sceneCount, 1)
      // Scénarios documentaire/corporate sont plus longs par nature
      const economyThresholdOk = genre === 'documentaire' || genre === 'corporate' ? 900 : 500
      const economyThresholdMed = genre === 'documentaire' || genre === 'corporate' ? 1200 : 800
      score = wordsPerScene < economyThresholdOk ? 72 : wordsPerScene < economyThresholdMed ? 62 : 47
      comment = wordsPerScene < economyThresholdOk ? 'Écriture économe, chaque mot compte' : 'Scénario à resserrer'
      break

    default:
      score = 55
      comment = 'Évaluation standard'
  }

  return { score: Math.max(0, Math.min(100, score)), comment }
}

function generateRecommendation(criterion: EvaluationCriterion, score: number, genre: string): string {
  const recs: Record<string, string> = {
    narrative_structure: 'Renforcer la structure en 3 actes : situation initiale → perturbation → résolution.',
    visual_storytelling: 'Ajouter des plans symboliques (insert, pillow shots) pour enrichir la narration visuelle.',
    shot_choices: 'Alterner systématiquement gros plans (émotion) et plans larges (contexte).',
    pacing: 'Varier la durée des plans : courts pour la tension, longs pour la contemplation.',
    emotional_arc: 'Créer au moins un pic émotionnel clair (climax) et une respiration (dénouement).',
    lighting: 'Préciser la direction de lumière dans chaque scène (golden hour, clair-obscur, néon...).',
    framing: 'Utiliser au moins 4 valeurs de plan différentes dans le découpage.',
    camera_movement: 'Justifier chaque mouvement caméra par une intention narrative.',
    hook: 'Les 2 premières secondes doivent être visuellement irrésistibles.',
    brand_integration: 'Le produit doit apparaître avant 70% du film, naturellement intégré.',
    dialogue_quality: 'Donner à chaque personnage une voix distincte — vocabulaire, rythme, ton.',
    character_depth: 'Ajouter au moins une contradiction ou un détail humain par personnage.',
  }
  return recs[criterion.id] || ''
}
