import { NextRequest, NextResponse } from 'next/server'
import { AI_MODELS, MODEL_IDS, MCAP_AXES, MCAP_DEFAULT_WEIGHTS, type MCAPAxis } from '@/lib/models/ai-models'
import type { AIModelId } from '@/types/engines'

/**
 * POST /api/compare
 * Prend les paramètres d'un plan et retourne le scoring détaillé de chaque modèle
 * avec les raisons, axes, poids et le classement final.
 * 
 * C'est ça la transparence MISEN : on montre POURQUOI on recommande.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      shotType = 'PM',
      cameraMove = 'fixe',
      hasDialogue = false,
      dialogueLength = 0,
      personnageCount = 1,
      isFlashback = false,
      duration = 4,
      needsVFX = false,
      needsConsistency = false,
      sceneType = 'INT',
      intensity = 50,
      emotion = 'neutre',
    } = body

    // ─── Calculate contextual weights ───
    const weights = { ...MCAP_DEFAULT_WEIGHTS }
    const reasoning: string[] = []

    if (hasDialogue) {
      weights.lipSync = 3.0
      weights.audioGen = 2.0
      reasoning.push('Dialogue détecté → lip-sync ×3, audio ×2')
    }

    if (needsConsistency) {
      weights.consistency = 3.0
      reasoning.push('Cohérence personnage → consistency ×3')
    }

    if (cameraMove !== 'fixe') {
      weights.cameraControl = 2.5
      weights.motion = 2.0
      reasoning.push(`Mouvement caméra (${cameraMove}) → caméra ×2.5, motion ×2`)
    }

    if (needsVFX) {
      weights.vfx = 2.5
      reasoning.push('VFX requis → vfx ×2.5')
    }

    if (intensity > 70) {
      weights.physics = 2.0
      reasoning.push('Haute intensité → physique ×2')
    }

    if (duration > 8) {
      weights.maxDuration = 2.5
      reasoning.push('Plan long (>8s) → durée max ×2.5')
    }

    if (shotType === 'GP' || shotType === 'TGP') {
      weights.hands = 2.0
      weights.lipSync = Math.max(weights.lipSync, 2.0)
      reasoning.push('Gros plan → mains ×2, lip-sync ×2')
    }

    // ─── Score each model with full breakdown ───
    const modelResults: Array<{
      id: string
      name: string
      version: string
      finalScore: number
      axisScores: Array<{ axis: string; label: string; modelValue: number; weight: number; weighted: number }>
      bonus: number
      bonusReason: string
      costPer10s: number
      speciality: string
      strengths: string[]
      weaknesses: string[]
    }> = []

    const axisLabels: Record<string, string> = {
      resolution: 'Résolution',
      maxDuration: 'Durée max',
      motion: 'Mouvement',
      physics: 'Physique',
      hands: 'Mains/détails',
      lipSync: 'Lip-sync',
      cameraControl: 'Contrôle caméra',
      lighting: 'Éclairage',
      vfx: 'VFX',
      consistency: 'Cohérence',
      textRendering: 'Rendu texte',
      styleRange: 'Style',
      audioGen: 'Audio',
      speed: 'Vitesse',
    }

    for (const modelId of MODEL_IDS) {
      const model = AI_MODELS[modelId]
      let score = 0
      let totalWeight = 0
      const axisScores: Array<{ axis: string; label: string; modelValue: number; weight: number; weighted: number }> = []
      const strengths: string[] = []
      const weaknesses: string[] = []

      for (const axis of MCAP_AXES) {
        const modelValue = model[axis as keyof typeof model] as number
        const weight = weights[axis]
        const weighted = modelValue * weight
        score += weighted
        totalWeight += weight * 10

        axisScores.push({
          axis,
          label: axisLabels[axis] || axis,
          modelValue,
          weight: Math.round(weight * 10) / 10,
          weighted: Math.round(weighted * 10) / 10,
        })

        if (modelValue >= 9) strengths.push(axisLabels[axis] || axis)
        if (modelValue <= 5 && weight >= 1.0) weaknesses.push(axisLabels[axis] || axis)
      }

      let baseScore = Math.round((score / totalWeight) * 100)
      let bonus = 0
      let bonusReason = ''

      // Contextual bonuses
      if (hasDialogue && dialogueLength > 0 && modelId === 'veo3.1') {
        bonus = 15; bonusReason = 'Lip-sync dialogue natif'
      }
      if (intensity > 60 && emotion !== 'neutre' && modelId === 'sora2') {
        bonus = 10; bonusReason = 'Plans expressifs haute émotion'
      }
      if (cameraMove !== 'fixe' && !hasDialogue && modelId === 'seedance2') {
        bonus = 12; bonusReason = 'Mouvement pur optimisé'
      }
      if (needsConsistency && modelId === 'hailuo2.3') {
        bonus = 15; bonusReason = 'Cohérence personnage longue durée'
      }
      if (sceneType === 'EXT' && intensity < 50 && modelId === 'kling3') {
        bonus = 8; bonusReason = 'Réalisme physique extérieur'
      }
      if ((cameraMove === 'drone' || cameraMove === 'crane') && modelId === 'wan2.5') {
        bonus = 12; bonusReason = 'Mouvements caméra complexes'
      }
      if (isFlashback && modelId === 'runway4.5') {
        bonus = 10; bonusReason = 'Rendu stylisé flashback'
      }

      modelResults.push({
        id: modelId,
        name: model.name,
        version: model.version,
        finalScore: Math.min(100, baseScore + bonus),
        axisScores,
        bonus,
        bonusReason,
        costPer10s: model.costPer10s,
        speciality: model.speciality,
        strengths,
        weaknesses,
      })
    }

    // Sort by final score
    modelResults.sort((a, b) => b.finalScore - a.finalScore)

    return NextResponse.json({
      ranking: modelResults,
      contextWeights: Object.entries(weights).map(([axis, w]) => ({
        axis,
        label: axisLabels[axis] || axis,
        weight: Math.round(w * 10) / 10,
        isAdjusted: w !== MCAP_DEFAULT_WEIGHTS[axis as MCAPAxis],
      })),
      reasoning,
      planContext: { shotType, cameraMove, hasDialogue, dialogueLength, personnageCount, isFlashback, duration, needsVFX, needsConsistency, sceneType, intensity, emotion },
    })
  } catch (error) {
    console.error('Compare error:', error)
    return NextResponse.json({ error: 'Erreur comparaison' }, { status: 500 })
  }
}
