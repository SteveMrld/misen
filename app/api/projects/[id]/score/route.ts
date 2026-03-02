// ============================================================================
// MISEN V10 — POST /api/projects/[id]/score
// AI Music Score Generation
//
// Flow:
//   1. Run score-composer engine on analysis data
//   2. For each cue, call Suno API (or fallback provider)
//   3. Return cue sheet + generation job IDs
//
// Providers:
//   - Suno (primary): best quality, style control, 2-4 min tracks
//   - Replicate MusicGen (fallback): open-source, lower quality
//
// © 2026 Jabrilia Éditions — Confidentiel
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProject } from '@/lib/db/projects'
import { composeScore, type MusicCueSheet, type MusicCue } from '@/lib/engines/score-composer'

// ═══════════════════════════════════════════
// Suno API adapter
// ═══════════════════════════════════════════

interface SunoGenerationResult {
  cueIndex: number
  jobId: string
  status: 'pending' | 'completed' | 'failed'
  audioUrl?: string
  duration?: number
  error?: string
}

async function generateViaSuno(
  apiKey: string,
  cue: MusicCue,
  index: number,
): Promise<SunoGenerationResult> {
  try {
    const res = await fetch('https://studio-api.suno.ai/api/external/generate/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: cue.sunoPrompt,
        tags: cue.sunoStyle,
        mv: 'chirp-v4',
        title: cue.label,
        make_instrumental: true,
        generation_type: 'TEXT',
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || err.error || `Suno API error ${res.status}`)
    }

    const data = await res.json()
    const clipId = data.clips?.[0]?.id || data.id || data.job_id

    return {
      cueIndex: index,
      jobId: clipId,
      status: 'pending',
    }
  } catch (err: any) {
    return {
      cueIndex: index,
      jobId: '',
      status: 'failed',
      error: err.message,
    }
  }
}

// ═══════════════════════════════════════════
// Fallback: Browser-based generation preview
// Uses Web Audio API synthesis — no external API needed
// Provides a preview soundtrack until real generation completes
// ═══════════════════════════════════════════

function buildSynthPreviewParams(cue: MusicCue) {
  // Map musical parameters to Web Audio synthesis instructions
  // This gets sent to the client for real-time preview
  const noteMap: Record<string, number> = {
    'C': 261.63, 'C#': 277.18, 'D': 293.66, 'Eb': 311.13,
    'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
    'Ab': 415.30, 'A': 440.00, 'Bb': 466.16, 'B': 493.88,
  }

  const modeIntervals: Record<string, number[]> = {
    'major':      [0, 2, 4, 5, 7, 9, 11],
    'minor':      [0, 2, 3, 5, 7, 8, 10],
    'dorian':     [0, 2, 3, 5, 7, 9, 10],
    'phrygian':   [0, 1, 3, 5, 7, 8, 10],
    'lydian':     [0, 2, 4, 6, 7, 9, 11],
    'mixolydian': [0, 2, 4, 5, 7, 9, 10],
    'aeolian':    [0, 2, 3, 5, 7, 8, 10],
    'locrian':    [0, 1, 3, 5, 6, 8, 10],
  }

  const rootFreq = noteMap[cue.key] || 261.63
  const intervals = modeIntervals[cue.mode] || modeIntervals.minor

  // Generate scale frequencies across 2 octaves
  const scaleFreqs: number[] = []
  for (let octave = 0; octave < 2; octave++) {
    for (const interval of intervals) {
      scaleFreqs.push(rootFreq * Math.pow(2, (interval + octave * 12) / 12))
    }
  }

  // Dynamics → gain
  const dynamicsGain: Record<string, number> = {
    'ppp': 0.05, 'pp': 0.1, 'p': 0.18, 'mp': 0.28,
    'mf': 0.4, 'f': 0.55, 'ff': 0.7, 'fff': 0.85,
  }

  // Texture → oscillator type + pattern
  const textureConfig: Record<string, { type: OscillatorType; pattern: string }> = {
    'silence':     { type: 'sine', pattern: 'none' },
    'drone':       { type: 'sine', pattern: 'sustained' },
    'sparse':      { type: 'triangle', pattern: 'arpeggio-slow' },
    'arpeggiated': { type: 'triangle', pattern: 'arpeggio-med' },
    'rhythmic':    { type: 'sawtooth', pattern: 'arpeggio-fast' },
    'layered':     { type: 'sine', pattern: 'chord-progression' },
    'orchestral':  { type: 'sawtooth', pattern: 'chord-progression' },
    'chaotic':     { type: 'sawtooth', pattern: 'random' },
  }

  const texConf = textureConfig[cue.texture] || textureConfig.sparse

  return {
    rootFreq,
    scaleFreqs,
    tempo: cue.tempo,
    gain: dynamicsGain[cue.dynamics] || 0.3,
    oscillatorType: texConf.type,
    pattern: texConf.pattern,
    duration: cue.duration,
    fadeIn: cue.transitionIn === 'fade-in' || cue.transitionIn === 'crossfade',
    fadeOut: cue.transitionOut === 'fade-out' || cue.transitionOut === 'decay',
    reverbMix: cue.texture === 'orchestral' ? 0.6 : cue.texture === 'drone' ? 0.8 : 0.3,
  }
}

// ═══════════════════════════════════════════
// POST handler
// ═══════════════════════════════════════════

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

    const body = await request.json().catch(() => ({}))
    const { analysis, generateAudio = false, cueIndices } = body

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis data required' }, { status: 400 })
    }

    // ═══ Phase 1: Compose the score ═══
    const cueSheet = composeScore(analysis)

    if (cueSheet.cues.length === 0) {
      return NextResponse.json({ error: 'No scenes to score' }, { status: 400 })
    }

    // ═══ Phase 2: Generate audio if requested ═══
    let generations: SunoGenerationResult[] = []

    if (generateAudio) {
      // Check for Suno key
      const { data: sunoKey } = await supabase
        .from('api_keys')
        .select('api_key')
        .eq('user_id', user.id)
        .eq('provider', 'suno')
        .single()

      if (sunoKey?.api_key) {
        // Generate selected cues or all
        const targetCues = cueIndices
          ? cueSheet.cues.filter((_: MusicCue, i: number) => cueIndices.includes(i))
          : cueSheet.cues

        // Sequential generation with rate limiting
        for (const cue of targetCues) {
          const result = await generateViaSuno(sunoKey.api_key, cue, cue.sceneIndex)
          generations.push(result)

          // Rate limit: 2s between requests
          if (targetCues.indexOf(cue) < targetCues.length - 1) {
            await new Promise(r => setTimeout(r, 2000))
          }
        }
      } else {
        return NextResponse.json({
          cueSheet,
          synthPreviews: cueSheet.cues.map(c => buildSynthPreviewParams(c)),
          error: 'No Suno API key configured. Showing synth preview. Add your key in Settings → API Keys.',
          generations: [],
        })
      }
    }

    // ═══ Phase 3: Build synth previews for all cues ═══
    const synthPreviews = cueSheet.cues.map(c => buildSynthPreviewParams(c))

    return NextResponse.json({
      cueSheet,
      synthPreviews,
      generations,
    })

  } catch (error: any) {
    console.error('[MISEN] Score generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ═══════════════════════════════════════════
// GET — Check Suno generation status
// ═══════════════════════════════════════════

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    if (!jobId) {
      return NextResponse.json({ error: 'jobId required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Auth required' }, { status: 401 })
    }

    const { data: sunoKey } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('user_id', user.id)
      .eq('provider', 'suno')
      .single()

    if (!sunoKey?.api_key) {
      return NextResponse.json({ error: 'No Suno key' }, { status: 400 })
    }

    const res = await fetch(`https://studio-api.suno.ai/api/external/clips/?ids=${jobId}`, {
      headers: { 'Authorization': `Bearer ${sunoKey.api_key}` },
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Suno status error ${res.status}` }, { status: 502 })
    }

    const data = await res.json()
    const clip = Array.isArray(data) ? data[0] : data

    return NextResponse.json({
      jobId,
      status: clip?.status === 'complete' ? 'completed'
        : clip?.status === 'error' ? 'failed'
        : 'processing',
      audioUrl: clip?.audio_url || null,
      imageUrl: clip?.image_url || null,
      duration: clip?.metadata?.duration || null,
      title: clip?.title || null,
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
