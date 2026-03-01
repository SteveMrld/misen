// ============================================================================
// MISEN V9 — POST /api/projects/[id]/storyboard
// Storyboard Visuel IA — Génération de vignettes par plan via DALL-E 3
// Transforme les prompts vidéo en prompts image statiques cinématographiques
// © 2026 Jabrilia Éditions — Confidentiel
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// Shot type → composition guidance
// ---------------------------------------------------------------------------

const SHOT_COMPOSITION: Record<string, string> = {
  'plan large':      'Wide establishing shot, full environment visible, subject small in frame',
  'plan moyen':      'Medium shot, subject from waist up, balanced composition',
  'gros plan':       'Close-up portrait, subject fills frame, shallow depth of field',
  'très gros plan':  'Extreme close-up, single detail fills the entire frame, macro perspective',
  'insert':          'Insert shot, isolated object detail, sharp focus on prop or element',
  'plan américain':  'American shot, subject from knees up, classic framing',
  'plan d\'ensemble': 'Full establishing shot, panoramic view, wide landscape',
  // English aliases
  'wide':            'Wide establishing shot, full environment visible',
  'medium':          'Medium shot, subject from waist up',
  'close-up':        'Close-up portrait, subject fills frame',
  'extreme close-up': 'Extreme close-up, single detail fills frame',
  'insert shot':     'Insert shot, isolated object detail',
}

// ---------------------------------------------------------------------------
// Camera angle → visual perspective
// ---------------------------------------------------------------------------

const ANGLE_TOKENS: Record<string, string> = {
  'plongee':          'high angle looking down',
  'contre-plongee':   'low angle looking up, dramatic perspective',
  'dutch':            'dutch angle, tilted frame',
  'POV':              'first person POV perspective',
  'OTS':              'over the shoulder framing',
  'neutre':           'eye-level neutral angle',
}

// ---------------------------------------------------------------------------
// Lighting → cinematographic mood
// ---------------------------------------------------------------------------

const LIGHTING_TOKENS: Record<string, string> = {
  'naturel':        'natural ambient lighting',
  'clair-obscur':   'chiaroscuro dramatic lighting, deep shadows',
  'high-key':       'high-key bright even lighting',
  'low-key':        'low-key moody dark lighting, dramatic contrast',
  'neon':           'neon-lit urban atmosphere, colored light spill',
  'golden-hour':    'golden hour warm sunlight, long shadows',
  'blue-hour':      'blue hour cool twilight ambiance',
  'fluorescent':    'harsh fluorescent overhead lighting',
  'bougie':         'candlelight warm intimate glow',
}

// ---------------------------------------------------------------------------
// Transform video prompt → static storyboard frame prompt
// ---------------------------------------------------------------------------

function transformToStoryboardPrompt(
  videoPrompt: string,
  shotType?: string,
  cameraMove?: string,
  angle?: string,
  lighting?: string,
  characterDesc?: string,
): string {
  // Strip motion-specific language
  const motionWords = [
    /\b(tracking|panning|dollying|zooming|crane|steadicam|handheld)\b/gi,
    /\b(mouvement|travelling|panoramique|travelling avant|travelling arrière)\b/gi,
    /\b(camera moves?|camera push|pull back|follow shot|arc shot)\b/gi,
    /\b(slowly|gradually|smoothly|rapidly)\s+(moves?|pans?|tracks?|dollies|zooms?)\b/gi,
    /--\s*Character References:.*$/gm,  // Strip character ref injection tags
    /\[REF:[^\]]+\]/g,
  ]

  let imagePrompt = videoPrompt
  motionWords.forEach(regex => { imagePrompt = imagePrompt.replace(regex, '') })
  imagePrompt = imagePrompt.replace(/\s{2,}/g, ' ').trim()

  // Build cinematic frame description
  const parts: string[] = [
    'Cinematic storyboard frame, professional film production still',
  ]

  // Shot composition
  const shotKey = (shotType || '').toLowerCase()
  const composition = SHOT_COMPOSITION[shotKey]
  if (composition) parts.push(composition)

  // Camera angle
  if (angle && ANGLE_TOKENS[angle]) parts.push(ANGLE_TOKENS[angle])

  // Lighting
  if (lighting && LIGHTING_TOKENS[lighting]) parts.push(LIGHTING_TOKENS[lighting])

  // Character description for consistency
  if (characterDesc) parts.push(`Character: ${characterDesc}`)

  // Original scene description (cleaned)
  parts.push(imagePrompt)

  // Quality suffix
  parts.push('16:9 aspect ratio, photorealistic, high production value, detailed cinematography, anamorphic lens look')

  return parts.join('. ').replace(/\.\s*\./g, '.').trim()
}

// ---------------------------------------------------------------------------
// POST /api/projects/[id]/storyboard
// ---------------------------------------------------------------------------

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

    // Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single()

    if (!project || project.user_id !== user.id) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Parse request
    const body = await request.json()
    const { planIndex, prompt, shotType, cameraMove, angle, lighting, characterDesc, size } = body

    if (planIndex === undefined || !prompt) {
      return NextResponse.json({ error: 'planIndex and prompt required' }, { status: 400 })
    }

    // Get user's OpenAI API key
    const { data: keyData } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('user_id', user.id)
      .eq('provider', 'openai')
      .single()

    if (!keyData?.api_key) {
      return NextResponse.json(
        { error: 'OpenAI API key required. Configure it in Settings → API Keys.' },
        { status: 403 }
      )
    }

    // Transform prompt for static frame
    const storyboardPrompt = transformToStoryboardPrompt(
      prompt, shotType, cameraMove, angle, lighting, characterDesc
    )

    // Call DALL-E 3
    const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${keyData.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: storyboardPrompt,
        n: 1,
        size: size || '1792x1024',  // 16:9-ish landscape
        quality: 'standard',
        response_format: 'b64_json',
      }),
    })

    if (!dalleResponse.ok) {
      const err = await dalleResponse.json().catch(() => ({}))
      const msg = err?.error?.message || `DALL-E API error (${dalleResponse.status})`
      return NextResponse.json({ error: msg }, { status: dalleResponse.status })
    }

    const dalleData = await dalleResponse.json()
    const b64 = dalleData?.data?.[0]?.b64_json
    const revisedPrompt = dalleData?.data?.[0]?.revised_prompt

    if (!b64) {
      return NextResponse.json({ error: 'No image returned from DALL-E' }, { status: 500 })
    }

    return NextResponse.json({
      planIndex,
      imageData: `data:image/png;base64,${b64}`,
      revisedPrompt,
      originalPrompt: storyboardPrompt,
      model: 'dall-e-3',
    })

  } catch (error: any) {
    console.error('[MISEN] Storyboard generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
