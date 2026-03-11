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
      score = sceneCount >= 3 ? 70 : sceneCount >= 2 ? 60 : 45
      if (tension?.globalArc?.includes('classique')) score += 15
      if (tension?.climax >= 0) score += 10
      comment = sceneCount >= 3 ? 'Structure en actes détectable, arc narratif présent' : 'Structure narrative minimale'
      break

    case 'visual_storytelling':
      score = shotTypes.size >= 3 ? 75 : shotTypes.size >= 2 ? 60 : 45
      if (planCount >= 4) score += 10
      comment = shotTypes.size >= 3 ? 'Variété de plans, narration visuelle riche' : 'Vocabulaire visuel limité'
      break

    case 'shot_choices':
      const hasCloseUp = plans.some((p: any) => ['GP', 'PR'].includes(p.shotType || ''))
      const hasWide = plans.some((p: any) => ['PG', 'TGP'].includes(p.shotType || ''))
      score = hasCloseUp && hasWide ? 75 : hasCloseUp || hasWide ? 60 : 45
      if (plans.some((p: any) => p.shotType === 'INSERT')) score += 10
      comment = hasCloseUp && hasWide ? 'Alternance intime/vaste, choix de plans pertinents' : 'Manque de variété dans les valeurs de plan'
      break

    case 'pacing':
      const avgDur = plans.reduce((s: number, p: any) => s + (p.estimatedDuration || 3), 0) / Math.max(planCount, 1)
      score = avgDur >= 2 && avgDur <= 6 ? 70 : 50
      if (tensionVariance > 15) score += 10
      comment = avgDur >= 2 && avgDur <= 6 ? `Rythme maîtrisé (${avgDur.toFixed(1)}s/plan moyen)` : `Rythme à ajuster (${avgDur.toFixed(1)}s/plan)`
      break

    case 'emotional_arc':
      score = tension?.avgTension > 40 ? 65 : 50
      if (tension?.curve?.some((c: any) => c.tension > 70)) score += 15
      if (tension?.curve?.some((c: any) => c.tension < 30) && tension?.curve?.some((c: any) => c.tension > 60)) score += 10
      comment = score >= 75 ? 'Arc émotionnel puissant avec pics et respirations' : 'Impact émotionnel à renforcer'
      break

    case 'originality':
      score = scriptLength > 500 ? 65 : 55
      if (script.includes('INSERT') && script.includes('FLASHBACK')) score += 15
      comment = 'Évaluation sur le scénario original — analyse de singularité'
      break

    // ─── DOP criteria ───
    case 'lighting':
      const hasLightingDesc = script.toLowerCase().match(/lumi[eè]re|golden.hour|cr[eé]puscule|n[eé]on|clair.obscur|contre.jour|aube|ombre/)
      score = hasLightingDesc ? 75 : 55
      comment = hasLightingDesc ? 'Indications lumière présentes et cohérentes' : 'Indications lumière à enrichir'
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
      const hasLensVariety = plans.some((p: any) => p.shotType === 'INSERT' || p.shotType === 'GP') && plans.some((p: any) => p.shotType === 'TGP' || p.shotType === 'PG')
      score = hasLensVariety ? 70 : 55
      comment = hasLensVariety ? 'Jeu d\'optiques implicite (macro → grand angle)' : 'Palette optique à enrichir'
      break

    case 'color_palette':
      score = 60 // Default — hard to evaluate without actual generation
      const hasColorRef = script.toLowerCase().match(/or|bleu|rouge|noir|blanc|cuivre|violet|néon|ambre/)
      if (hasColorRef) score += 15
      comment = hasColorRef ? 'Palette chromatique intentionnelle détectée' : 'Palette couleurs à définir plus explicitement'
      break

    case 'continuity':
      const continuityScore = plans.length >= 3 ? 70 : 55
      score = continuityScore
      comment = plans.length >= 3 ? 'Suffisamment de plans pour évaluer la continuité' : 'Peu de plans, continuité à surveiller'
      break

    // ─── Editor criteria ───
    case 'cut_rhythm':
      score = planCount >= 4 && planCount <= 12 ? 70 : planCount >= 3 ? 60 : 45
      if (tensionVariance > 10) score += 10
      comment = `${planCount} plans — ${planCount >= 4 ? 'rythme de montage exploitable' : 'trop peu de coupes'}`
      break

    case 'transitions':
      score = 65 // MISEN handles transitions well by default
      comment = 'Transitions fondues recommandées — cohérent avec le style'
      break

    case 'shot_order':
      const startsWide = plans.length > 0 && ['TGP', 'PG', 'PA'].includes(plans[0]?.shotType || '')
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
      score = tensionVariance > 15 ? 75 : tensionVariance > 8 ? 60 : 45
      comment = tensionVariance > 15 ? 'Gestion de tension efficace' : 'Tension trop plate — manque de contrastes'
      break

    case 'sound_design':
      score = hasVoiceover ? 70 : hasDialogue ? 65 : 50
      comment = hasVoiceover ? 'Voix off structurante' : hasDialogue ? 'Dialogues présents' : 'Indications sonores absentes'
      break

    // ─── Ad Director criteria ───
    case 'hook':
      const firstPlan = plans[0]
      score = firstPlan && ['TGP', 'PG'].includes(firstPlan.shotType || '') ? 70 : 55
      if (firstPlan?.cameraMove && firstPlan.cameraMove !== 'fixe') score += 10
      comment = score >= 70 ? 'Ouverture impactante, accroche visuelle forte' : 'Hook à renforcer — les 2 premières secondes doivent capter'
      break

    case 'brand_integration':
      const hasProduct = plans.some((p: any) => p.shotType === 'INSERT') || script.toLowerCase().includes('flacon') || script.toLowerCase().includes('produit') || script.toLowerCase().includes('logo')
      score = hasProduct ? 75 : genre === 'pub_luxe' ? 40 : 60
      comment = hasProduct ? 'Produit/marque intégré dans la narration' : 'Produit absent ou trop tardif'
      break

    case 'emotional_trigger':
      score = tension?.avgTension > 50 ? 70 : 55
      comment = tension?.avgTension > 50 ? 'Charge émotionnelle présente' : 'Émotion à amplifier'
      break

    case 'memorability':
      score = scriptLength > 300 && shotTypes.size >= 3 ? 65 : 50
      comment = 'Score basé sur la singularité du traitement'
      break

    case 'cta_effectiveness':
      const hasCTA = script.toLowerCase().includes('voix off') || script.toLowerCase().includes('logo') || script.toLowerCase().includes('fin')
      score = hasCTA ? 70 : 50
      comment = hasCTA ? 'Fermeture avec signature détectée' : 'CTA/signature à renforcer'
      break

    case 'target_fit':
      score = 65 // Default reasonable
      comment = 'Cohérence cible évaluée sur le ton et le style du scénario'
      break

    // ─── Screenwriter criteria ───
    case 'dialogue_quality':
      const dialogueCount = scenes.reduce((s: number, sc: any) => s + (sc.dialogues?.length || 0), 0)
      score = dialogueCount >= 3 ? 70 : dialogueCount >= 1 ? 60 : hasVoiceover ? 65 : 45
      comment = dialogueCount >= 3 ? `${dialogueCount} répliques — voix distinctes détectables` : 'Peu de dialogues'
      break

    case 'character_depth':
      score = characterBible.length >= 2 ? 70 : characterBible.length >= 1 ? 60 : 45
      comment = characterBible.length >= 2 ? `${characterBible.length} personnages développés` : 'Personnages à approfondir'
      break

    case 'show_dont_tell':
      const hasAction = script.match(/\n[A-Z].*\n(?![A-Z])/g)
      score = hasAction && hasAction.length >= 3 ? 70 : 55
      comment = 'Ratio action/dialogue évalué — le visuel doit primer'
      break

    case 'dramatic_engine':
      score = tension?.climax >= 0 ? 70 : 50
      if (tension?.globalArc?.includes('classique')) score += 10
      comment = tension?.climax >= 0 ? 'Moteur dramatique identifiable' : 'Manque de tension dramatique'
      break

    case 'subtext':
      score = scriptLength > 400 ? 60 : 50
      comment = 'Sous-texte évalué sur la richesse des indications visuelles'
      break

    case 'economy':
      const wordsPerScene = scriptLength / Math.max(sceneCount, 1)
      score = wordsPerScene < 500 ? 70 : wordsPerScene < 800 ? 60 : 45
      comment = wordsPerScene < 500 ? 'Écriture économe, chaque mot compte' : 'Scénario à resserrer'
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
