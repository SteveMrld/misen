// ============================================================================
// MISEN V10 — POST /api/projects/[id]/analyze-ai
// Hybrid Analysis: Deterministic pipeline + AI narrative enrichment
//
// Flow:
//   1. Run deterministic pipeline (instant, free)
//   2. Call Claude/GPT for deep semantic analysis (async, costs tokens)
//   3. Merge AI insights into pipeline results
//   4. Save enriched analysis
//
// © 2026 Jabrilia Éditions — Confidentiel
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProject, saveAnalysis, updateProject } from '@/lib/db/projects'
import { runPipeline } from '@/lib/engines/pipeline'
import { callAIAnalysis, mergeAIEnrichment } from '@/lib/engines/ai-narrative'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const project = await getProject(projectId)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (!project.script_text || project.script_text.trim().length === 0) {
      return NextResponse.json({ error: 'No script to analyze' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const stylePreset = body.style_preset || 'cinematique'

    // ═══ Phase 1: Deterministic pipeline (instant) ═══
    const baseResult = runPipeline(project.script_text, { stylePreset })

    // ═══ Phase 2: AI enrichment (async) ═══
    // Try Anthropic key first, then OpenAI
    let apiKey: string | null = null
    let provider: 'anthropic' | 'openai' = 'anthropic'

    const { data: anthropicKey } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('user_id', user.id)
      .eq('provider', 'anthropic')
      .single()

    if (anthropicKey?.api_key) {
      apiKey = anthropicKey.api_key
      provider = 'anthropic'
    } else {
      const { data: openaiKey } = await supabase
        .from('api_keys')
        .select('api_key')
        .eq('user_id', user.id)
        .eq('provider', 'openai')
        .single()

      if (openaiKey?.api_key) {
        apiKey = openaiKey.api_key
        provider = 'openai'
      }
    }

    // Fallback: server key
    if (!apiKey) {
      apiKey = process.env.ANTHROPIC_API_KEY || null
      provider = 'anthropic'
    }

    let finalResult = baseResult
    let aiError: string | undefined

    if (apiKey) {
      try {
        const enrichment = await callAIAnalysis(
          apiKey,
          project.script_text,
          baseResult.scenes.length,
          baseResult.characters,
          provider
        )
        finalResult = mergeAIEnrichment(baseResult, enrichment)
      } catch (err: any) {
        // AI enrichment failed — return base analysis with error note
        aiError = err.message || 'AI analysis failed'
        console.error('[MISEN] AI narrative analysis failed:', aiError)
        finalResult = {
          ...baseResult,
          aiEnriched: false,
          aiError,
        }
      }
    } else {
      finalResult = {
        ...baseResult,
        aiEnriched: false,
        aiError: 'No API key available for AI analysis',
      }
    }

    // ═══ Phase 3: Save ═══
    const analysis = await saveAnalysis(projectId, finalResult, stylePreset)

    await updateProject(projectId, {
      status: 'analyzing',
      scenes_count: finalResult.scenes?.length || 0,
    })

    return NextResponse.json({
      analysis_id: analysis.id,
      version: analysis.version,
      result: finalResult,
      aiEnriched: finalResult.aiEnriched || false,
      aiError,
      aiModel: finalResult.aiModel || undefined,
      aiTokenCost: finalResult.aiTokenCost || undefined,
    })

  } catch (error: any) {
    console.error('[MISEN] Analyze-AI error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
