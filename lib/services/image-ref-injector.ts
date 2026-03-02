// ============================================================================
// MISEN V10 — Image Reference Injector
// Converts client-side base64 character reference images into
// provider-specific API payloads for visual consistency
//
// Provider support:
//   - Kling 3.0:      image_url (base64 data URI supported)
//   - Runway Gen-4.5: promptImage (base64 data URI supported)
//   - Seedance 2.0:   reference_images[] (base64 inline, up to 12)
//   - Sora 2:         image_asset (base64 inline)
//   - Veo 3.1:        inline_data with base64
//   - Wan 2.5:        reference_image (base64 inline)
//   - Hailuo 2.3:     NOT SUPPORTED (text-to-video only)
//
// © 2026 Jabrilia Éditions — Confidentiel
// ============================================================================

import type { VideoProvider } from '@/lib/types/generation'

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

export interface CharacterRefData {
  name: string
  base64: string      // Full data URL: "data:image/png;base64,..."
  mimeType: string    // "image/png", "image/jpeg", "image/webp"
}

export interface InjectedRefPayload {
  /** Extra fields to merge into the provider's request body */
  bodyExtensions: Record<string, unknown>
  /** Enhanced prompt with character consistency tokens */
  enhancedPrompt: string
  /** Which characters were injected */
  injectedCharacters: string[]
}

// ═══════════════════════════════════════════
// Parse base64 data URL
// ═══════════════════════════════════════════

function parseDataUrl(dataUrl: string): { base64: string; mimeType: string } | null {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
  if (!match) return null
  return { mimeType: match[1], base64: match[2] }
}

// ═══════════════════════════════════════════
// Provider-specific injection
// ═══════════════════════════════════════════

function injectForKling(
  refs: CharacterRefData[],
  prompt: string,
): InjectedRefPayload {
  // Kling 3.0 supports a single reference image via image_url
  // Use the first character's image (primary character)
  const primary = refs[0]
  const parsed = parseDataUrl(primary.base64)
  if (!parsed) return { bodyExtensions: {}, enhancedPrompt: prompt, injectedCharacters: [] }

  const charNames = refs.map(r => r.name)
  const consistencyNote = `Maintain exact visual appearance of ${charNames.join(', ')} from reference image`

  return {
    bodyExtensions: {
      image_url: primary.base64,  // Kling accepts data URIs
      image_weight: 0.75,
    },
    enhancedPrompt: `${prompt}. ${consistencyNote}`,
    injectedCharacters: charNames,
  }
}

function injectForRunway(
  refs: CharacterRefData[],
  prompt: string,
): InjectedRefPayload {
  // Runway Gen-4.5 supports promptImage for character consistency
  const primary = refs[0]
  const charNames = refs.map(r => r.name)

  return {
    bodyExtensions: {
      promptImage: primary.base64,  // Runway accepts data URI
    },
    enhancedPrompt: `${prompt}. Character reference: maintain exact likeness of ${charNames.join(', ')}`,
    injectedCharacters: charNames,
  }
}

function injectForSeedance(
  refs: CharacterRefData[],
  prompt: string,
): InjectedRefPayload {
  // Seedance 2.0 supports up to 12 reference images
  const refImages = refs.slice(0, 12).map((ref, i) => {
    const parsed = parseDataUrl(ref.base64)
    if (!parsed) return null
    return {
      data: parsed.base64,
      mime_type: parsed.mimeType,
      label: ref.name,
      influence: i === 0 ? 0.85 : 0.7,  // Primary char gets more influence
    }
  }).filter(Boolean)

  const charNames = refs.map(r => r.name)

  return {
    bodyExtensions: {
      reference_images: refImages,
      character_consistency: {
        enabled: true,
        mode: 'strict',
        characters: charNames,
      },
    },
    enhancedPrompt: `${prompt}. Strict character consistency for: ${charNames.join(', ')}`,
    injectedCharacters: charNames,
  }
}

function injectForSora(
  refs: CharacterRefData[],
  prompt: string,
): InjectedRefPayload {
  const primary = refs[0]
  const parsed = parseDataUrl(primary.base64)
  if (!parsed) return { bodyExtensions: {}, enhancedPrompt: prompt, injectedCharacters: [] }

  const charNames = refs.map(r => r.name)

  return {
    bodyExtensions: {
      image_asset: {
        data: parsed.base64,
        mime_type: parsed.mimeType,
      },
    },
    enhancedPrompt: `${prompt}. Maintain visual consistency with reference for: ${charNames.join(', ')}`,
    injectedCharacters: charNames,
  }
}

function injectForVeo(
  refs: CharacterRefData[],
  prompt: string,
): InjectedRefPayload {
  const primary = refs[0]
  const parsed = parseDataUrl(primary.base64)
  if (!parsed) return { bodyExtensions: {}, enhancedPrompt: prompt, injectedCharacters: [] }

  const charNames = refs.map(r => r.name)

  return {
    bodyExtensions: {
      _inlineImagePart: {
        inline_data: {
          mime_type: parsed.mimeType,
          data: parsed.base64,
        },
      },
    },
    enhancedPrompt: `${prompt}. Reference character appearance for: ${charNames.join(', ')}`,
    injectedCharacters: charNames,
  }
}

function injectForWan(
  refs: CharacterRefData[],
  prompt: string,
): InjectedRefPayload {
  const primary = refs[0]

  return {
    bodyExtensions: {
      reference_image: primary.base64,
      reference_strength: 0.8,
    },
    enhancedPrompt: `${prompt}. Character reference applied for: ${refs.map(r => r.name).join(', ')}`,
    injectedCharacters: refs.map(r => r.name),
  }
}

// ═══════════════════════════════════════════
// Main injection dispatcher
// ═══════════════════════════════════════════

const SUPPORTED_PROVIDERS: VideoProvider[] = ['kling', 'runway', 'seedance', 'sora', 'veo', 'wan']

export function isImageRefSupported(provider: VideoProvider): boolean {
  return SUPPORTED_PROVIDERS.includes(provider)
}

export function injectCharacterImages(
  provider: VideoProvider,
  characterRefs: CharacterRefData[],
  prompt: string,
): InjectedRefPayload {
  if (!characterRefs.length || !isImageRefSupported(provider)) {
    return {
      bodyExtensions: {},
      enhancedPrompt: prompt,
      injectedCharacters: [],
    }
  }

  // Filter out invalid refs
  const validRefs = characterRefs.filter(r => r.base64 && r.base64.startsWith('data:image/'))
  if (validRefs.length === 0) {
    return {
      bodyExtensions: {},
      enhancedPrompt: prompt,
      injectedCharacters: [],
    }
  }

  const injectors: Record<string, typeof injectForKling> = {
    kling: injectForKling,
    runway: injectForRunway,
    seedance: injectForSeedance,
    sora: injectForSora,
    veo: injectForVeo,
    wan: injectForWan,
  }

  const injector = injectors[provider]
  if (!injector) {
    return { bodyExtensions: {}, enhancedPrompt: prompt, injectedCharacters: [] }
  }

  return injector(validRefs, prompt)
}
