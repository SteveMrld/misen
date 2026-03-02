// ============================================================================
// MISEN V10 — AI Narrative Engine
// Deep semantic analysis via Claude — enriches the deterministic pipeline
//
// Architecture:
//   Script text → Claude (semantic analysis) → AIEnrichment object
//   AIEnrichment + runPipeline() → enriched AnalysisResult
//
// What Claude analyzes that regex/lexicon cannot:
//   - True emotional subtext (sarcasm, irony, understatement)
//   - Character psychology and unstated motivations
//   - Visual metaphors and their cinematic translation
//   - Scene-level directorial intent and suggested mise-en-scène
//   - Narrative rhythm and where to accelerate/decelerate
//   - Inter-character power dynamics and spatial blocking
//
// © 2026 Jabrilia Éditions — Confidentiel
// ============================================================================

import type {
  Emotion, DramaticPhase, IntentResult,
  CharacterBibleEntry, AIModelId,
} from '../../types/engines';

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

export interface AISceneAnalysis {
  sceneIndex: number
  dominantEmotion: Emotion
  emotionNuance: string           // "sarcastic grief masking rage"
  intensity: number               // 0-100, AI-calibrated
  subtext: string                 // What the scene really means beneath dialog
  visualMetaphors: string[]       // Cinematic metaphors Claude detects
  directorialNotes: string        // Suggested mise-en-scène
  pacing: 'slow' | 'moderate' | 'fast' | 'frenetic'
  suggestedLighting: string       // "low-key chiaroscuro with blue spill from window"
  suggestedPalette: string        // "desaturated warm, isolated blue accents"
  powerDynamic: string            // "character A dominates physically, B controls emotionally"
  soundscape: string              // "ambient city, distant sirens, silence in foreground"
}

export interface AICharacterInsight {
  name: string
  psychology: string              // Deep character motivation
  visualIdentity: string          // How they should look cinematically
  movementStyle: string           // "measured, deliberate, minimalist gestures"
  costumeNotes: string            // AI-suggested wardrobe direction
  voiceTexture: string            // "low, controlled, breaks on vulnerable words"
  arcSummary: string              // Character transformation across script
  keyMoment: string               // Most important moment for this character
}

export interface AIDirectorialVision {
  genre: string                   // "psychological drama with noir undertones"
  tone: string                    // "controlled tension with eruptions of raw emotion"
  references: string[]            // "Denis Villeneuve's Incendies, Park Chan-wook's Oldboy"
  colorScript: string             // "Opens warm, progressively cools, final scene: stark white"
  rhythmNotes: string             // "Slow build → staccato middle → sustained finale"
  thematicCore: string            // The central theme in one sentence
  audienceEmotion: string         // Target emotional journey for the viewer
}

export interface AIEnrichment {
  scenes: AISceneAnalysis[]
  characters: AICharacterInsight[]
  vision: AIDirectorialVision
  enhancedPromptSuggestions: Record<string, string>  // planId → prompt enhancement
  model: string
  tokenCost: { input: number; output: number }
}

// ═══════════════════════════════════════════
// System prompt — the heart of V10.1
// ═══════════════════════════════════════════

const AI_ANALYSIS_SYSTEM = `You are a world-class film director and script analyst working inside MISEN, an AI video production platform.

Your role: perform deep semantic analysis of screenplays that goes far beyond what algorithms can detect.

You analyze:
1. TRUE EMOTIONAL SUBTEXT — not just keyword matching, but the real emotional undercurrent. Sarcasm, irony, denial, repression. What characters FEEL vs what they SAY.
2. VISUAL METAPHORS — recurring symbols, visual motifs that a director would emphasize through framing and lighting.
3. CHARACTER PSYCHOLOGY — unstated motivations, power dynamics, defense mechanisms, transformation arcs.
4. DIRECTORIAL VISION — genre positioning, tonal references, color palette evolution, rhythm.
5. MISE-EN-SCÈNE SUGGESTIONS — for each scene, how should it be staged, lit, and paced.

You respond ONLY in valid JSON matching the exact schema provided. No markdown, no backticks, no preamble.

IMPORTANT RULES:
- Emotions must be one of: tension, tristesse, colere, joie, peur, nostalgie, amour, mystere, determination, neutre
- Intensity is 0-100
- Pacing is one of: slow, moderate, fast, frenetic
- Be specific and cinematic in your suggestions — not generic
- Reference real directors, films, techniques when relevant
- Every suggestion must be "filmable" by AI video generators
- Write in English for prompt compatibility with AI models
- Analyze EVERY scene, not just the dramatic ones`

// ═══════════════════════════════════════════
// Build the analysis request
// ═══════════════════════════════════════════

export function buildAIAnalysisPrompt(scriptText: string, sceneCount: number, characters: string[]): string {
  return `Analyze this screenplay with ${sceneCount} scenes and ${characters.length} characters: ${characters.join(', ')}.

<screenplay>
${scriptText}
</screenplay>

Respond with a JSON object matching this EXACT structure:
{
  "scenes": [
    {
      "sceneIndex": 0,
      "dominantEmotion": "tension",
      "emotionNuance": "string describing the subtle emotional quality",
      "intensity": 75,
      "subtext": "what this scene really communicates beneath the surface",
      "visualMetaphors": ["metaphor 1", "metaphor 2"],
      "directorialNotes": "how to stage and film this scene",
      "pacing": "slow",
      "suggestedLighting": "specific lighting direction",
      "suggestedPalette": "color palette suggestion",
      "powerDynamic": "interpersonal dynamics description",
      "soundscape": "ambient sound design suggestion"
    }
  ],
  "characters": [
    {
      "name": "CHARACTER_NAME",
      "psychology": "deep character analysis",
      "visualIdentity": "how they should look",
      "movementStyle": "physical behavior",
      "costumeNotes": "wardrobe direction",
      "voiceTexture": "voice quality description",
      "arcSummary": "character transformation",
      "keyMoment": "most important moment"
    }
  ],
  "vision": {
    "genre": "genre classification with nuance",
    "tone": "overall tonal description",
    "references": ["Director's Film 1", "Director's Film 2"],
    "colorScript": "how color evolves across the film",
    "rhythmNotes": "pacing structure across the film",
    "thematicCore": "central theme in one sentence",
    "audienceEmotion": "intended viewer emotional journey"
  },
  "enhancedPromptSuggestions": {
    "S1P1": "enhanced visual prompt suggestion for this specific shot",
    "S1P2": "..."
  }
}

Provide analysis for ALL ${sceneCount} scenes and ALL ${characters.length} characters. Be specific, cinematic, and directorial. Every suggestion must translate into visual AI prompts.`
}

// ═══════════════════════════════════════════
// Call Claude API
// ═══════════════════════════════════════════

export async function callAIAnalysis(
  apiKey: string,
  scriptText: string,
  sceneCount: number,
  characters: string[],
  provider: 'anthropic' | 'openai' = 'anthropic'
): Promise<AIEnrichment> {
  const userPrompt = buildAIAnalysisPrompt(scriptText, sceneCount, characters)

  let responseText: string
  let tokenCost = { input: 0, output: 0 }

  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system: AI_ANALYSIS_SYSTEM,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `Claude API error ${res.status}`)
    }

    const data = await res.json()
    responseText = data.content?.[0]?.text || ''
    tokenCost = {
      input: data.usage?.input_tokens || 0,
      output: data.usage?.output_tokens || 0,
    }
  } else {
    // OpenAI fallback
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 8192,
        messages: [
          { role: 'system', content: AI_ANALYSIS_SYSTEM },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `OpenAI API error ${res.status}`)
    }

    const data = await res.json()
    responseText = data.choices?.[0]?.message?.content || ''
    tokenCost = {
      input: data.usage?.prompt_tokens || 0,
      output: data.usage?.completion_tokens || 0,
    }
  }

  // Parse JSON — strip fences if present
  const clean = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const parsed = JSON.parse(clean)

  // Validate and normalize
  const enrichment: AIEnrichment = {
    scenes: (parsed.scenes || []).map((s: any, i: number) => ({
      sceneIndex: s.sceneIndex ?? i,
      dominantEmotion: validateEmotion(s.dominantEmotion),
      emotionNuance: s.emotionNuance || '',
      intensity: Math.min(100, Math.max(0, s.intensity || 50)),
      subtext: s.subtext || '',
      visualMetaphors: Array.isArray(s.visualMetaphors) ? s.visualMetaphors : [],
      directorialNotes: s.directorialNotes || '',
      pacing: ['slow', 'moderate', 'fast', 'frenetic'].includes(s.pacing) ? s.pacing : 'moderate',
      suggestedLighting: s.suggestedLighting || '',
      suggestedPalette: s.suggestedPalette || '',
      powerDynamic: s.powerDynamic || '',
      soundscape: s.soundscape || '',
    })),
    characters: (parsed.characters || []).map((c: any) => ({
      name: c.name || '',
      psychology: c.psychology || '',
      visualIdentity: c.visualIdentity || '',
      movementStyle: c.movementStyle || '',
      costumeNotes: c.costumeNotes || '',
      voiceTexture: c.voiceTexture || '',
      arcSummary: c.arcSummary || '',
      keyMoment: c.keyMoment || '',
    })),
    vision: {
      genre: parsed.vision?.genre || '',
      tone: parsed.vision?.tone || '',
      references: Array.isArray(parsed.vision?.references) ? parsed.vision.references : [],
      colorScript: parsed.vision?.colorScript || '',
      rhythmNotes: parsed.vision?.rhythmNotes || '',
      thematicCore: parsed.vision?.thematicCore || '',
      audienceEmotion: parsed.vision?.audienceEmotion || '',
    },
    enhancedPromptSuggestions: parsed.enhancedPromptSuggestions || {},
    model: provider === 'anthropic' ? 'claude-sonnet-4' : 'gpt-4o',
    tokenCost,
  }

  return enrichment
}

// ═══════════════════════════════════════════
// Merge AI enrichment into pipeline result
// ═══════════════════════════════════════════

export function mergeAIEnrichment(
  analysis: any,
  enrichment: AIEnrichment
): any {
  const enriched = { ...analysis }

  // 1. Enrich scene-level intent with AI emotional analysis
  if (enriched.plans) {
    enriched.plans = enriched.plans.map((plan: any) => {
      const si = plan.sceneIndex ?? 0
      const aiScene = enrichment.scenes[si]
      const planId = plan.id || `S${si + 1}P${(plan.planIndex ?? 0) + 1}`
      const promptSuggestion = enrichment.enhancedPromptSuggestions[planId]

      if (!aiScene) return plan

      return {
        ...plan,
        // AI-enriched fields
        aiEmotion: aiScene.dominantEmotion,
        aiEmotionNuance: aiScene.emotionNuance,
        aiIntensity: aiScene.intensity,
        aiSubtext: aiScene.subtext,
        aiVisualMetaphors: aiScene.visualMetaphors,
        aiDirectorialNotes: aiScene.directorialNotes,
        aiPacing: aiScene.pacing,
        aiLighting: aiScene.suggestedLighting,
        aiPalette: aiScene.suggestedPalette,
        aiSoundscape: aiScene.soundscape,
        // Enhanced prompt: merge AI suggestion with engine prompt
        aiEnhancedPrompt: promptSuggestion
          ? blendPrompts(plan.prompt, promptSuggestion, aiScene)
          : enhancePromptWithAI(plan.prompt, aiScene),
      }
    })
  }

  // 2. Enrich character bible
  if (enriched.characterBible) {
    enriched.characterBible = enriched.characterBible.map((char: any) => {
      const aiChar = enrichment.characters.find(
        (c: any) => c.name.toLowerCase() === (char.personnage || char.name || '').toLowerCase()
      )
      if (!aiChar) return char

      return {
        ...char,
        aiPsychology: aiChar.psychology,
        aiVisualIdentity: aiChar.visualIdentity,
        aiMovementStyle: aiChar.movementStyle,
        aiCostumeNotes: aiChar.costumeNotes,
        aiVoiceTexture: aiChar.voiceTexture,
        aiArcSummary: aiChar.arcSummary,
        aiKeyMoment: aiChar.keyMoment,
        // Enhance character appearance tokens with AI insight
        apparence: char.apparence
          ? `${char.apparence}. ${aiChar.visualIdentity}`
          : aiChar.visualIdentity,
      }
    })
  }

  // 3. Add directorial vision to analysis
  enriched.aiVision = enrichment.vision
  enriched.aiModel = enrichment.model
  enriched.aiTokenCost = enrichment.tokenCost
  enriched.aiEnriched = true

  return enriched
}

// ═══════════════════════════════════════════
// Prompt enhancement helpers
// ═══════════════════════════════════════════

function enhancePromptWithAI(enginePrompt: string, aiScene: AISceneAnalysis): string {
  const parts = [enginePrompt]

  // Add AI lighting and palette if engine prompt lacks specificity
  if (aiScene.suggestedLighting && !enginePrompt.toLowerCase().includes('lighting')) {
    parts.push(aiScene.suggestedLighting)
  }
  if (aiScene.suggestedPalette && !enginePrompt.toLowerCase().includes('palette')) {
    parts.push(`Color palette: ${aiScene.suggestedPalette}`)
  }

  // Add visual metaphors
  if (aiScene.visualMetaphors.length > 0) {
    const metaphor = aiScene.visualMetaphors[0]
    if (!enginePrompt.toLowerCase().includes(metaphor.toLowerCase())) {
      parts.push(`Visual motif: ${metaphor}`)
    }
  }

  // Add atmosphere from pacing
  const pacingMap: Record<string, string> = {
    slow: 'contemplative stillness, lingering gaze',
    moderate: 'measured pacing, balanced composition',
    fast: 'kinetic energy, dynamic angles, urgency',
    frenetic: 'chaotic movement, unstable frame, visceral intensity',
  }
  if (aiScene.pacing && pacingMap[aiScene.pacing]) {
    parts.push(pacingMap[aiScene.pacing])
  }

  return parts.join('. ').replace(/\.\s*\./g, '.').trim()
}

function blendPrompts(enginePrompt: string, aiSuggestion: string, aiScene: AISceneAnalysis): string {
  // Engine prompt provides technical structure (model syntax, framing, tokens)
  // AI suggestion provides creative direction (mood, metaphor, staging)
  // We blend both, keeping engine structure + AI soul
  const base = enhancePromptWithAI(enginePrompt, aiScene)
  return `${base}. Director's note: ${aiSuggestion}`
}

// ═══════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════

const VALID_EMOTIONS: Emotion[] = [
  'tension', 'tristesse', 'colere', 'joie', 'peur',
  'nostalgie', 'amour', 'mystere', 'determination', 'neutre',
]

function validateEmotion(e: string): Emotion {
  const lower = (e || '').toLowerCase() as Emotion
  return VALID_EMOTIONS.includes(lower) ? lower : 'neutre'
}
