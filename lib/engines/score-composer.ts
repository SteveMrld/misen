// ============================================================================
// MISEN V10 — AI Score Composer
// Cinematic music composition engine
//
// Translates the MISEN analysis pipeline into a professional film score:
//   tension curve → dynamics + harmonic tension
//   emotion → key, mode, melody character
//   pacing → tempo (BPM)
//   dramatic phase → musical structure (intro, development, climax, resolution)
//   character arcs → leitmotif suggestions
//   AI vision → genre/style/instrumentation
//
// Output: MusicCueSheet with per-scene scoring instructions + Suno-ready prompts
//
// Film scoring theory reference:
//   Hans Zimmer: tension through sustained bass drones + rhythmic pulses
//   Ennio Morricone: melodic leitmotifs for character identity
//   Jóhann Jóhannsson: minimalist texture + electronic-acoustic fusion
//   Ryuichi Sakamoto: silence as compositional element
//
// © 2026 Jabrilia Éditions — Confidentiel
// ============================================================================

import type { Emotion, DramaticPhase } from '../../types/engines'

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

export interface MusicCue {
  sceneIndex: number
  label: string
  startTime: number          // seconds from film start
  duration: number           // seconds
  // Musical parameters
  tempo: number              // BPM
  key: MusicalKey
  mode: MusicalMode
  dynamics: Dynamics
  instrumentation: string[]
  texture: TextureType
  // Descriptive
  character: string          // "haunting piano melody over sustained strings"
  moodWords: string[]        // ["melancholic", "intimate", "yearning"]
  technique: string          // "sparse arpeggios building to sustained chords"
  reference: string          // "evokes Nils Frahm's 'Says'"
  // Generation
  sunoPrompt: string         // Ready-to-send prompt for Suno API
  sunoStyle: string          // Suno style tag
  transitionIn: TransitionType
  transitionOut: TransitionType
}

export interface Leitmotif {
  character: string
  description: string        // "ascending minor third motif, piano, hesitant rhythm"
  instrument: string
  interval: string           // "minor third", "perfect fifth"
  emotion: Emotion
}

export interface MusicCueSheet {
  cues: MusicCue[]
  leitmotifs: Leitmotif[]
  globalStyle: string        // "neo-classical minimalist with electronic textures"
  globalTempo: { min: number; max: number; avg: number }
  totalDuration: number
  keySignature: string       // "D minor → F major → D minor (cycle)"
  dynamicRange: string       // "pp to ff, with strategic silence"
  scoringNotes: string       // Director-level notes for the score
}

export type MusicalKey = 'C' | 'C#' | 'D' | 'Eb' | 'E' | 'F' | 'F#' | 'G' | 'Ab' | 'A' | 'Bb' | 'B'
export type MusicalMode = 'major' | 'minor' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'aeolian' | 'locrian'
export type Dynamics = 'ppp' | 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff' | 'fff'
export type TextureType = 'silence' | 'drone' | 'sparse' | 'arpeggiated' | 'rhythmic' | 'layered' | 'orchestral' | 'chaotic'
export type TransitionType = 'hard-cut' | 'fade-in' | 'fade-out' | 'crossfade' | 'swell' | 'decay' | 'silence-gap'

// ═══════════════════════════════════════════
// Music Theory Mappings
// ═══════════════════════════════════════════

/**
 * Emotion → Musical key and mode
 * Based on historical key-emotion associations in Western classical tradition
 * + modern film scoring conventions
 */
const EMOTION_KEY_MAP: Record<Emotion, { key: MusicalKey; mode: MusicalMode; alt?: { key: MusicalKey; mode: MusicalMode } }> = {
  tension:       { key: 'D',  mode: 'phrygian',   alt: { key: 'Bb', mode: 'minor' } },
  tristesse:     { key: 'D',  mode: 'minor',      alt: { key: 'F',  mode: 'minor' } },
  colere:        { key: 'C',  mode: 'minor',      alt: { key: 'G',  mode: 'phrygian' } },
  joie:          { key: 'D',  mode: 'major',      alt: { key: 'A',  mode: 'major' } },
  peur:          { key: 'Eb', mode: 'locrian',    alt: { key: 'B',  mode: 'minor' } },
  nostalgie:     { key: 'G',  mode: 'dorian',     alt: { key: 'E',  mode: 'minor' } },
  amour:         { key: 'Ab', mode: 'major',      alt: { key: 'Eb', mode: 'lydian' } },
  mystere:       { key: 'F#', mode: 'dorian',     alt: { key: 'Bb', mode: 'mixolydian' } },
  determination: { key: 'C',  mode: 'mixolydian', alt: { key: 'G',  mode: 'major' } },
  neutre:        { key: 'C',  mode: 'major',      alt: { key: 'A',  mode: 'minor' } },
}

/**
 * Emotion → Instrumentation families
 * Layered from most intimate to most expansive
 */
const EMOTION_INSTRUMENTS: Record<Emotion, { core: string[]; accent: string[]; texture: string[] }> = {
  tension: {
    core: ['cello tremolo', 'prepared piano', 'bass clarinet'],
    accent: ['timpani rolls', 'col legno strings', 'brass stabs'],
    texture: ['reversed reverb tails', 'sub-bass drone', 'metallic resonance'],
  },
  tristesse: {
    core: ['solo piano', 'solo cello', 'english horn'],
    accent: ['muted strings', 'glass harmonica', 'music box'],
    texture: ['rain ambience', 'room tone', 'distant church bells'],
  },
  colere: {
    core: ['distorted cello', 'aggressive drums', 'brass section'],
    accent: ['electric guitar', 'anvil hits', 'taiko drums'],
    texture: ['industrial noise', 'dissonant cluster chords', 'feedback'],
  },
  joie: {
    core: ['acoustic guitar', 'marimba', 'flute'],
    accent: ['ukulele', 'glockenspiel', 'pizzicato strings'],
    texture: ['birdsong', 'wind chimes', 'bright pad'],
  },
  peur: {
    core: ['sul ponticello strings', 'bass flute', 'waterphone'],
    accent: ['prepared piano', 'bowed cymbal', 'cluster chords'],
    texture: ['breathing sounds', 'heartbeat pulse', 'infrasound drone'],
  },
  nostalgie: {
    core: ['solo piano', 'accordion', 'solo violin'],
    accent: ['music box', 'harmonica', 'nylon guitar'],
    texture: ['vinyl crackle', 'analog tape hiss', 'distant radio'],
  },
  amour: {
    core: ['solo piano', 'solo violin', 'harp'],
    accent: ['celesta', 'strings legato', 'french horn'],
    texture: ['warm reverb', 'breath', 'soft pad'],
  },
  mystere: {
    core: ['glass marimba', 'bass clarinet', 'prepared piano'],
    accent: ['hang drum', 'tubular bells', 'celesta'],
    texture: ['reversed piano', 'granular synthesis', 'binaural beats'],
  },
  determination: {
    core: ['drums', 'cello ostinato', 'brass'],
    accent: ['snare build', 'electric bass', 'power chords'],
    texture: ['rhythmic pulse', 'synth arpeggio', 'crowd murmur'],
  },
  neutre: {
    core: ['ambient piano', 'soft strings', 'pad'],
    accent: ['wind', 'subtle percussion'],
    texture: ['room tone', 'air'],
  },
}

/**
 * Pacing → Tempo (BPM)
 */
const PACING_TEMPO: Record<string, { min: number; max: number }> = {
  slow:     { min: 50, max: 72 },
  moderate: { min: 72, max: 100 },
  fast:     { min: 100, max: 140 },
  frenetic: { min: 140, max: 180 },
}

/**
 * Dramatic phase → Musical structure and texture
 */
const PHASE_STRUCTURE: Record<DramaticPhase, {
  texture: TextureType
  dynamicBase: Dynamics
  technique: string
  transitionIn: TransitionType
  transitionOut: TransitionType
}> = {
  exposition: {
    texture: 'sparse',
    dynamicBase: 'pp',
    technique: 'establishing theme, simple statements, breath between phrases',
    transitionIn: 'fade-in',
    transitionOut: 'crossfade',
  },
  developpement: {
    texture: 'layered',
    dynamicBase: 'mp',
    technique: 'theme variation, counterpoint introduction, building complexity',
    transitionIn: 'crossfade',
    transitionOut: 'swell',
  },
  climax: {
    texture: 'orchestral',
    dynamicBase: 'ff',
    technique: 'full orchestration, thematic collision, maximum harmonic tension',
    transitionIn: 'swell',
    transitionOut: 'decay',
  },
  resolution: {
    texture: 'arpeggiated',
    dynamicBase: 'p',
    technique: 'theme recapitulation in major, tension release, breathing room',
    transitionIn: 'decay',
    transitionOut: 'fade-out',
  },
  denouement: {
    texture: 'drone',
    dynamicBase: 'pp',
    technique: 'final theme fragment, fading to silence, unresolved or resolved',
    transitionIn: 'fade-in',
    transitionOut: 'fade-out',
  },
}

/**
 * Intensity → Dynamics mapping (0-100 → ppp to fff)
 */
function intensityToDynamics(intensity: number): Dynamics {
  if (intensity < 10) return 'ppp'
  if (intensity < 20) return 'pp'
  if (intensity < 35) return 'p'
  if (intensity < 50) return 'mp'
  if (intensity < 65) return 'mf'
  if (intensity < 80) return 'f'
  if (intensity < 92) return 'ff'
  return 'fff'
}

/**
 * Genre → Scoring style reference
 */
const GENRE_SCORE_STYLE: Record<string, string> = {
  'psychological drama':    'neo-classical minimalist, Jóhann Jóhannsson, sparse and haunting',
  'noir':                   'jazz noir, saxophone, brushed drums, walking bass, smoky atmosphere',
  'thriller':               'Hans Zimmer tension, BWAAAM, ticking clock motifs, Dunkirk-style',
  'romance':                'Alexandre Desplat elegance, waltz time, chamber orchestra warmth',
  'horror':                 'Mica Levi dissonance, Under the Skin, microtonal strings, silence as weapon',
  'documentary':            'Max Richter contemplative, The Leftovers, piano and strings, emotional gravity',
  'action':                 'Ludwig Göransson percussive, Tenet, rhythmic complexity, analog synths',
  'comedy':                 'Alexandre Desplat playful, Wes Anderson quirky, pizzicato and woodwinds',
  'science-fiction':        'Vangelis Blade Runner, synth pads, electronic textures, cosmic scale',
  'fantasy':                'Howard Shore grandeur, leitmotifs, full orchestra, Celtic influences',
  'experimental':           'Mica Levi + Jonny Greenwood, There Will Be Blood, avant-garde textures',
}

// ═══════════════════════════════════════════
// Mood word generator
// ═══════════════════════════════════════════

const MOOD_VOCABULARY: Record<Emotion, string[]> = {
  tension:       ['suspenseful', 'uneasy', 'taut', 'gripping', 'claustrophobic', 'suffocating'],
  tristesse:     ['melancholic', 'sorrowful', 'aching', 'fragile', 'tender', 'broken'],
  colere:        ['furious', 'volatile', 'explosive', 'relentless', 'savage', 'visceral'],
  joie:          ['exuberant', 'radiant', 'euphoric', 'playful', 'luminous', 'effervescent'],
  peur:          ['dread', 'creeping', 'unsettling', 'nightmarish', 'paranoid', 'chilling'],
  nostalgie:     ['wistful', 'bittersweet', 'longing', 'faded', 'distant', 'remembering'],
  amour:         ['intimate', 'yearning', 'tender', 'passionate', 'devoted', 'breathless'],
  mystere:       ['enigmatic', 'otherworldly', 'hypnotic', 'ethereal', 'cryptic', 'liminal'],
  determination: ['resolute', 'driving', 'unstoppable', 'ascending', 'heroic', 'defiant'],
  neutre:        ['ambient', 'neutral', 'observational', 'atmospheric', 'still', 'blank'],
}

// ═══════════════════════════════════════════
// Main Composer Function
// ═══════════════════════════════════════════

export function composeScore(analysis: any): MusicCueSheet {
  const scenes = analysis?.scenes || []
  const plans = analysis?.plans || []
  const tension = analysis?.tension
  const characterBible = analysis?.characterBible || []
  const aiVision = analysis?.aiVision

  if (scenes.length === 0) {
    return {
      cues: [],
      leitmotifs: [],
      globalStyle: '',
      globalTempo: { min: 0, max: 0, avg: 0 },
      totalDuration: 0,
      keySignature: '',
      dynamicRange: '',
      scoringNotes: '',
    }
  }

  // ─── Detect global scoring style ───
  const genre = (aiVision?.genre || '').toLowerCase()
  let globalStyle = 'cinematic orchestral with electronic textures'
  for (const [key, style] of Object.entries(GENRE_SCORE_STYLE)) {
    if (genre.includes(key)) { globalStyle = style; break }
  }

  // ─── Build leitmotifs for main characters ───
  const leitmotifs: Leitmotif[] = characterBible.slice(0, 4).map((char: any) => {
    const name = char.personnage || char.name || 'Unknown'
    const emotion = findCharacterDominantEmotion(name, plans)
    const keyInfo = EMOTION_KEY_MAP[emotion]
    const instruments = EMOTION_INSTRUMENTS[emotion]

    return {
      character: name,
      description: `${instruments.core[0]} motif in ${keyInfo.key} ${keyInfo.mode}, reflecting ${emotion}`,
      instrument: instruments.core[0],
      interval: getLeitmotifInterval(emotion),
      emotion,
    }
  })

  // ─── Compose cue for each scene ───
  let currentTime = 0
  const cues: MusicCue[] = []
  const tempos: number[] = []

  for (let si = 0; si < scenes.length; si++) {
    const scene = scenes[si]
    const tensionPoint = tension?.curve?.[si]
    const scenePlans = plans.filter((p: any) => (p.sceneIndex ?? 0) === si)
    const sceneDuration = scenePlans.reduce((s: number, p: any) => s + (p.estimatedDuration || p.duree || 4), 0) || 5

    // Get emotional data
    const emotion: Emotion = tensionPoint?.emotion
      || (scenePlans[0]?.aiEmotion)
      || (scenePlans[0]?.emotion)
      || 'neutre'
    const intensity: number = tensionPoint?.tension ?? scenePlans[0]?.aiIntensity ?? 50
    const phase: DramaticPhase = tensionPoint?.phase || 'developpement'
    const pacing = scenePlans[0]?.aiPacing || intensityToPacing(intensity)

    // Musical parameters
    const keyInfo = EMOTION_KEY_MAP[emotion]
    const useAlt = si > 0 && cues[si - 1]?.key === keyInfo.key // Avoid key repetition
    const finalKey = useAlt && keyInfo.alt ? keyInfo.alt : keyInfo
    const instruments = EMOTION_INSTRUMENTS[emotion]
    const phaseInfo = PHASE_STRUCTURE[phase]
    const pacingRange = PACING_TEMPO[pacing] || PACING_TEMPO.moderate
    const tempo = Math.round(pacingRange.min + (intensity / 100) * (pacingRange.max - pacingRange.min))
    tempos.push(tempo)

    // Dynamics: blend intensity-based + phase-based
    const dynamicsByIntensity = intensityToDynamics(intensity)
    const dynamics = blendDynamics(dynamicsByIntensity, phaseInfo.dynamicBase, phase)

    // Texture
    const texture = phase === 'climax' && intensity > 80 ? 'orchestral'
      : phase === 'climax' ? 'layered'
      : intensity < 20 ? 'silence'
      : phaseInfo.texture

    // Build instrumentation based on intensity
    const activeInstruments: string[] = [
      ...instruments.core.slice(0, Math.max(1, Math.ceil(intensity / 40))),
      ...(intensity > 50 ? instruments.accent.slice(0, Math.ceil((intensity - 50) / 30)) : []),
      ...(intensity > 70 ? instruments.texture.slice(0, 1) : []),
    ]

    // Mood words
    const moodWords = MOOD_VOCABULARY[emotion].slice(0, 3)
    if (aiVision?.tone) {
      const toneWord = aiVision.tone.split(' ')[0]
      if (toneWord && !moodWords.includes(toneWord)) moodWords.push(toneWord)
    }

    // Cinematic character description
    const character = buildMusicCharacterDesc(emotion, phase, intensity, activeInstruments, sceneDuration)

    // AI-enhanced scoring (if available)
    const aiScene = analysis?.plans?.find((p: any) => p.sceneIndex === si)
    const aiSoundscape = aiScene?.aiSoundscape || ''

    // Build reference
    const reference = buildScoreReference(emotion, phase, intensity, globalStyle)

    // Transition logic
    const transitionIn = si === 0 ? 'fade-in' as TransitionType : phaseInfo.transitionIn
    const transitionOut = si === scenes.length - 1 ? 'fade-out' as TransitionType : phaseInfo.transitionOut

    // ─── Build Suno prompt ───
    const sunoPrompt = buildSunoPrompt({
      emotion, intensity, tempo, key: finalKey.key, mode: finalKey.mode,
      instruments: activeInstruments, moodWords, phase, texture,
      aiSoundscape, sceneDuration, character, globalStyle,
    })

    const sunoStyle = buildSunoStyle(emotion, phase, globalStyle)

    cues.push({
      sceneIndex: si,
      label: scene.titre || scene.heading || `Cue ${si + 1}`,
      startTime: currentTime,
      duration: sceneDuration,
      tempo,
      key: finalKey.key,
      mode: finalKey.mode,
      dynamics,
      instrumentation: activeInstruments,
      texture,
      character,
      moodWords,
      technique: phaseInfo.technique,
      reference,
      sunoPrompt,
      sunoStyle,
      transitionIn,
      transitionOut,
    })

    currentTime += sceneDuration
  }

  // ─── Build global metadata ───
  const sortedTempos = [...tempos].sort((a, b) => a - b)
  const keySequence = cues.map(c => `${c.key} ${c.mode}`).join(' → ')
  const dynamicRange = `${cues[0]?.dynamics || 'pp'} to ${cues.find(c => c.dynamics === 'ff' || c.dynamics === 'fff')?.dynamics || 'f'}`

  // Scoring notes
  const scoringNotes = buildScoringNotes(analysis, cues, leitmotifs, globalStyle)

  return {
    cues,
    leitmotifs,
    globalStyle,
    globalTempo: {
      min: sortedTempos[0] || 60,
      max: sortedTempos[sortedTempos.length - 1] || 120,
      avg: Math.round(tempos.reduce((a, b) => a + b, 0) / Math.max(tempos.length, 1)),
    },
    totalDuration: currentTime,
    keySignature: keySequence,
    dynamicRange,
    scoringNotes,
  }
}

// ═══════════════════════════════════════════
// Suno Prompt Builder
// ═══════════════════════════════════════════

interface SunoPromptParams {
  emotion: Emotion
  intensity: number
  tempo: number
  key: MusicalKey
  mode: MusicalMode
  instruments: string[]
  moodWords: string[]
  phase: DramaticPhase
  texture: TextureType
  aiSoundscape: string
  sceneDuration: number
  character: string
  globalStyle: string
}

function buildSunoPrompt(p: SunoPromptParams): string {
  const parts: string[] = []

  // Style and mood
  parts.push(`${p.moodWords.join(', ')} cinematic score`)

  // Instrumentation
  if (p.instruments.length > 0) {
    parts.push(`featuring ${p.instruments.slice(0, 4).join(', ')}`)
  }

  // Musical parameters
  parts.push(`${p.tempo} BPM, ${p.key} ${p.mode}`)

  // Dynamics and texture
  const dynamicDesc = p.intensity > 75 ? 'powerful and full'
    : p.intensity > 50 ? 'building intensity'
    : p.intensity > 25 ? 'gentle and intimate'
    : 'barely audible, whispered'
  parts.push(dynamicDesc)

  // Character
  parts.push(p.character)

  // Phase-specific
  if (p.phase === 'climax') parts.push('emotional climax, most intense moment')
  if (p.phase === 'exposition') parts.push('opening theme, establishing mood')
  if (p.phase === 'denouement') parts.push('final resolution, fading to silence')

  // AI soundscape integration
  if (p.aiSoundscape) {
    parts.push(`ambient elements: ${p.aiSoundscape}`)
  }

  // Quality
  parts.push('film score quality, professional orchestration, emotional depth')

  return parts.join('. ').replace(/\.\s*\./g, '.') + '.'
}

function buildSunoStyle(emotion: Emotion, phase: DramaticPhase, globalStyle: string): string {
  const baseStyles: Record<Emotion, string> = {
    tension:       'cinematic tension, thriller soundtrack',
    tristesse:     'melancholic film score, emotional piano',
    colere:        'intense orchestral, aggressive score',
    joie:          'uplifting cinematic, bright orchestral',
    peur:          'horror score, dark ambient',
    nostalgie:     'nostalgic film score, bittersweet piano',
    amour:         'romantic film score, intimate strings',
    mystere:       'mysterious cinematic, ethereal ambient',
    determination: 'epic cinematic, heroic orchestral',
    neutre:        'ambient film score, atmospheric',
  }

  return baseStyles[emotion] || 'cinematic orchestral'
}

// ═══════════════════════════════════════════
// Helper functions
// ═══════════════════════════════════════════

function findCharacterDominantEmotion(name: string, plans: any[]): Emotion {
  const charPlans = plans.filter((p: any) =>
    (p.personnages || []).some((n: string) => n.toLowerCase() === name.toLowerCase())
  )
  if (charPlans.length === 0) return 'neutre'

  const emotionCounts: Record<string, number> = {}
  for (const p of charPlans) {
    const e = p.aiEmotion || p.emotion || 'neutre'
    emotionCounts[e] = (emotionCounts[e] || 0) + 1
  }

  return Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0][0] as Emotion
}

function getLeitmotifInterval(emotion: Emotion): string {
  const intervals: Record<Emotion, string> = {
    tension: 'tritone',
    tristesse: 'minor second descending',
    colere: 'minor seventh',
    joie: 'major third ascending',
    peur: 'minor second ascending (chromatic)',
    nostalgie: 'perfect fourth descending',
    amour: 'major sixth ascending',
    mystere: 'augmented fourth',
    determination: 'perfect fifth ascending',
    neutre: 'unison',
  }
  return intervals[emotion]
}

function intensityToPacing(intensity: number): string {
  if (intensity < 25) return 'slow'
  if (intensity < 55) return 'moderate'
  if (intensity < 80) return 'fast'
  return 'frenetic'
}

function blendDynamics(byIntensity: Dynamics, byPhase: Dynamics, phase: DramaticPhase): Dynamics {
  const order: Dynamics[] = ['ppp', 'pp', 'p', 'mp', 'mf', 'f', 'ff', 'fff']
  const iIdx = order.indexOf(byIntensity)
  const pIdx = order.indexOf(byPhase)
  // Weight intensity more during climax, phase more during exposition
  const weight = phase === 'climax' ? 0.7 : phase === 'exposition' ? 0.3 : 0.5
  const blended = Math.round(iIdx * weight + pIdx * (1 - weight))
  return order[Math.min(Math.max(blended, 0), order.length - 1)]
}

function buildMusicCharacterDesc(
  emotion: Emotion, phase: DramaticPhase, intensity: number,
  instruments: string[], duration: number
): string {
  const mainInstr = instruments[0] || 'piano'

  if (intensity < 15) return `near-silence, ${mainInstr} breathes a single note, vast empty space`
  if (intensity < 30) return `delicate ${mainInstr} phrases, space between notes, contemplative stillness`
  if (intensity < 50) return `${mainInstr} carries a gentle melody, other instruments weave underneath`
  if (intensity < 70) return `${mainInstr} and ${instruments[1] || 'strings'} in dialogue, growing emotional weight`
  if (intensity < 85) return `full ensemble, ${mainInstr} leads the charge, building relentlessly`
  return `overwhelming sonic force, ${mainInstr} screaming over orchestral wall of sound`
}

function buildScoreReference(emotion: Emotion, phase: DramaticPhase, intensity: number, style: string): string {
  const refs: Record<Emotion, string[]> = {
    tension:       ["Zimmer's Dunkirk ticking clock", "Greenwood's There Will Be Blood strings", "Reznor's Social Network pulse"],
    tristesse:     ["Sakamoto's The Revenant elegy", "Richter's On the Nature of Daylight", "Nyman's The Piano"],
    colere:        ["Zimmer's Dark Knight percussion", "Göransson's Black Panther drums", "Greenwood's Phantom Thread fury"],
    joie:          ["Desplat's Grand Budapest playfulness", "Morricone's Cinema Paradiso nostalgia", "Danna's Little Miss Sunshine"],
    peur:          ["Levi's Under the Skin", "Ligeti's 2001 choir", "Mansell's Requiem For a Dream descent"],
    nostalgie:     ["Morricone's Cinema Paradiso", "Frahm's Says", "Tiersen's Amélie waltz"],
    amour:         ["Desplat's Shape of Water", "Morricone's Love Theme", "Marianelli's Atonement"],
    mystere:       ["Reznor's Gone Girl", "Jóhannsson's Arrival", "Cliff Martinez's Solaris"],
    determination: ["Göransson's Creed training", "Zimmer's Interstellar organ", "Williams' Schindler's Theme"],
    neutre:        ["Eno's Music for Films", "Sakamoto's async", "Stars of the Lid's ambient"],
  }

  const options = refs[emotion] || refs.neutre
  return options[Math.min(Math.floor(intensity / 35), options.length - 1)]
}

function buildScoringNotes(analysis: any, cues: MusicCue[], leitmotifs: Leitmotif[], style: string): string {
  const vision = analysis?.aiVision
  const parts: string[] = []

  parts.push(`Global scoring approach: ${style}.`)

  if (vision?.rhythmNotes) {
    parts.push(`Rhythm: ${vision.rhythmNotes}.`)
  }

  if (vision?.thematicCore) {
    parts.push(`The score should embody: "${vision.thematicCore}".`)
  }

  if (leitmotifs.length > 0) {
    parts.push(`Leitmotifs: ${leitmotifs.map(l => `${l.character} (${l.instrument}, ${l.interval})`).join('; ')}.`)
  }

  const climaxCue = cues.find(c => c.dynamics === 'ff' || c.dynamics === 'fff')
  if (climaxCue) {
    parts.push(`Musical climax at cue "${climaxCue.label}" (${climaxCue.tempo} BPM, ${climaxCue.key} ${climaxCue.mode}).`)
  }

  // Strategic silence
  const silentCues = cues.filter(c => c.texture === 'silence')
  if (silentCues.length > 0) {
    parts.push(`Strategic silence in ${silentCues.length} scene(s) — let the image breathe without music.`)
  }

  parts.push(`Total score duration: ${cues.reduce((s, c) => s + c.duration, 0).toFixed(0)}s across ${cues.length} cues.`)

  return parts.join(' ')
}
