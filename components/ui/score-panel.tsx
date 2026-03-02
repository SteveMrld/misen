'use client'

/**
 * MISEN V10 — AI Score Panel
 * ═══════════════════════════════════════════════════════════
 * Cinematic music composition interface
 *
 * Features:
 *   - Score composition from analysis data (deterministic engine)
 *   - Web Audio synth preview (plays instantly, no API needed)
 *   - Suno AI generation for production-quality tracks
 *   - Per-cue musical visualization (key, tempo, dynamics, instruments)
 *   - Tension curve ↔ music dynamics correlation display
 *   - Leitmotif character cards
 *   - Waveform-style timeline
 *   - Full i18n FR/EN
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import {
  Music, Play, Pause, Square, Sparkles, Loader2, Download,
  Volume2, VolumeX, ChevronDown, ChevronUp, Zap, RefreshCw,
  AlertTriangle, Check, Settings, Info
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { composeScore, type MusicCueSheet, type MusicCue, type Leitmotif } from '@/lib/engines/score-composer'

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

interface ScorePanelProps {
  analysis: any
  projectId: string
  projectName?: string
}

interface SynthParams {
  rootFreq: number
  scaleFreqs: number[]
  tempo: number
  gain: number
  oscillatorType: OscillatorType
  pattern: string
  duration: number
  fadeIn: boolean
  fadeOut: boolean
  reverbMix: number
}

// ═══════════════════════════════════════════
// Color & visual mappings
// ═══════════════════════════════════════════

const EMOTION_COLORS: Record<string, string> = {
  tension:       '#ef4444',
  tristesse:     '#6366f1',
  colere:        '#dc2626',
  joie:          '#f59e0b',
  peur:          '#7c3aed',
  nostalgie:     '#8b5cf6',
  amour:         '#ec4899',
  mystere:       '#06b6d4',
  determination: '#f97316',
  neutre:        '#64748b',
}

const DYNAMICS_WIDTH: Record<string, number> = {
  'ppp': 8, 'pp': 15, 'p': 25, 'mp': 38, 'mf': 52, 'f': 68, 'ff': 82, 'fff': 96,
}

const TEXTURE_ICONS: Record<string, string> = {
  'silence': '🔇', 'drone': '〰️', 'sparse': '·  ·  ·', 'arpeggiated': '♪♫♪',
  'rhythmic': '🥁', 'layered': '≡', 'orchestral': '🎻', 'chaotic': '⚡',
}

// ═══════════════════════════════════════════
// Web Audio Synth Engine (client-side preview)
// ═══════════════════════════════════════════

class SynthEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private oscillators: OscillatorNode[] = []
  private convolver: ConvolverNode | null = null
  private playing = false

  async init() {
    if (this.ctx) return
    this.ctx = new AudioContext()
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0
    
    // Create simple reverb via convolver
    this.convolver = this.ctx.createConvolver()
    const reverbLength = this.ctx.sampleRate * 2
    const impulse = this.ctx.createBuffer(2, reverbLength, this.ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch)
      for (let i = 0; i < reverbLength; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLength, 2.5)
      }
    }
    this.convolver.buffer = impulse
    
    // Routing: oscillators → masterGain → (dry + wet reverb) → destination
    const dryGain = this.ctx.createGain()
    const wetGain = this.ctx.createGain()
    dryGain.gain.value = 0.7
    wetGain.gain.value = 0.3
    
    this.masterGain.connect(dryGain)
    this.masterGain.connect(this.convolver)
    this.convolver.connect(wetGain)
    dryGain.connect(this.ctx.destination)
    wetGain.connect(this.ctx.destination)
  }

  async playCue(params: SynthParams, onEnd?: () => void) {
    await this.init()
    this.stop()
    if (!this.ctx || !this.masterGain) return
    if (params.pattern === 'none') { onEnd?.(); return }

    this.playing = true
    const now = this.ctx.currentTime
    const dur = Math.min(params.duration, 30) // Cap preview at 30s

    // Fade in
    this.masterGain.gain.setValueAtTime(0, now)
    if (params.fadeIn) {
      this.masterGain.gain.linearRampToValueAtTime(params.gain, now + Math.min(2, dur * 0.15))
    } else {
      this.masterGain.gain.linearRampToValueAtTime(params.gain, now + 0.1)
    }

    // Schedule notes based on pattern
    const beatDur = 60 / params.tempo
    const freqs = params.scaleFreqs

    if (params.pattern === 'sustained' || params.pattern === 'drone') {
      // Drone: root + fifth, slow amplitude modulation
      this._createDrone(freqs[0], dur, params.oscillatorType)
      this._createDrone(freqs[4] || freqs[0] * 1.5, dur, 'sine')

    } else if (params.pattern.startsWith('arpeggio')) {
      const speed = params.pattern === 'arpeggio-slow' ? beatDur * 2
        : params.pattern === 'arpeggio-fast' ? beatDur * 0.5
        : beatDur
      this._createArpeggio(freqs, dur, speed, params.oscillatorType)

    } else if (params.pattern === 'chord-progression') {
      this._createChordProgression(freqs, dur, beatDur * 4, params.oscillatorType)

    } else if (params.pattern === 'random') {
      this._createRandom(freqs, dur, beatDur * 0.25, params.oscillatorType)
    }

    // Fade out
    if (params.fadeOut) {
      this.masterGain.gain.setValueAtTime(params.gain, now + dur - Math.min(2, dur * 0.2))
      this.masterGain.gain.linearRampToValueAtTime(0, now + dur)
    }

    // Schedule stop
    setTimeout(() => {
      if (this.playing) { this.stop(); onEnd?.() }
    }, dur * 1000 + 200)
  }

  private _createDrone(freq: number, dur: number, type: OscillatorType) {
    if (!this.ctx || !this.masterGain) return
    const osc = this.ctx.createOscillator()
    osc.type = type
    osc.frequency.value = freq
    // Subtle vibrato
    const lfo = this.ctx.createOscillator()
    const lfoGain = this.ctx.createGain()
    lfo.frequency.value = 0.3
    lfoGain.gain.value = freq * 0.008
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)
    lfo.start()

    osc.connect(this.masterGain)
    osc.start()
    osc.stop(this.ctx.currentTime + dur)
    lfo.stop(this.ctx.currentTime + dur)
    this.oscillators.push(osc)
  }

  private _createArpeggio(freqs: number[], dur: number, noteLen: number, type: OscillatorType) {
    if (!this.ctx || !this.masterGain) return
    const now = this.ctx.currentTime
    let t = 0
    let idx = 0
    const pattern = [0, 2, 4, 7, 4, 2] // I-III-V-octave-V-III pattern
    
    while (t < dur) {
      const osc = this.ctx.createOscillator()
      const env = this.ctx.createGain()
      osc.type = type
      const freqIdx = pattern[idx % pattern.length] % freqs.length
      osc.frequency.value = freqs[freqIdx]
      
      // Note envelope
      env.gain.setValueAtTime(0, now + t)
      env.gain.linearRampToValueAtTime(0.8, now + t + 0.02)
      env.gain.exponentialRampToValueAtTime(0.01, now + t + noteLen * 0.9)
      
      osc.connect(env)
      env.connect(this.masterGain)
      osc.start(now + t)
      osc.stop(now + t + noteLen)
      this.oscillators.push(osc)
      
      t += noteLen
      idx++
    }
  }

  private _createChordProgression(freqs: number[], dur: number, chordLen: number, type: OscillatorType) {
    if (!this.ctx || !this.masterGain) return
    const now = this.ctx.currentTime
    // I → IV → V → I progression
    const chords = [
      [0, 2, 4],    // I
      [3, 5, 0],    // IV
      [4, 6, 1],    // V
      [0, 2, 4],    // I
    ]
    let t = 0
    let chordIdx = 0
    
    while (t < dur) {
      const chord = chords[chordIdx % chords.length]
      for (const noteIdx of chord) {
        const osc = this.ctx.createOscillator()
        const env = this.ctx.createGain()
        osc.type = type === 'sawtooth' ? 'triangle' : type
        osc.frequency.value = freqs[noteIdx % freqs.length]
        env.gain.setValueAtTime(0, now + t)
        env.gain.linearRampToValueAtTime(0.4, now + t + 0.3)
        env.gain.setValueAtTime(0.35, now + t + chordLen - 0.5)
        env.gain.linearRampToValueAtTime(0.01, now + t + chordLen)
        osc.connect(env)
        env.connect(this.masterGain)
        osc.start(now + t)
        osc.stop(now + t + chordLen)
        this.oscillators.push(osc)
      }
      t += chordLen
      chordIdx++
    }
  }

  private _createRandom(freqs: number[], dur: number, noteLen: number, type: OscillatorType) {
    if (!this.ctx || !this.masterGain) return
    const now = this.ctx.currentTime
    let t = 0
    
    while (t < dur) {
      const osc = this.ctx.createOscillator()
      const env = this.ctx.createGain()
      osc.type = type
      osc.frequency.value = freqs[Math.floor(Math.random() * freqs.length)]
      env.gain.setValueAtTime(0, now + t)
      env.gain.linearRampToValueAtTime(Math.random() * 0.6 + 0.1, now + t + 0.01)
      env.gain.exponentialRampToValueAtTime(0.01, now + t + noteLen)
      osc.connect(env)
      env.connect(this.masterGain)
      osc.start(now + t)
      osc.stop(now + t + noteLen)
      this.oscillators.push(osc)
      
      t += noteLen + Math.random() * noteLen
    }
  }

  stop() {
    this.playing = false
    this.oscillators.forEach(osc => {
      try { osc.stop() } catch {}
    })
    this.oscillators = []
    if (this.masterGain) {
      try { this.masterGain.gain.setValueAtTime(0, this.ctx!.currentTime) } catch {}
    }
  }

  isPlaying() { return this.playing }

  destroy() {
    this.stop()
    this.ctx?.close().catch(() => {})
    this.ctx = null
  }
}

// ═══════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════

export function ScorePanel({ analysis, projectId, projectName }: ScorePanelProps) {
  const { t, locale } = useI18n()

  // State
  const [cueSheet, setCueSheet] = useState<MusicCueSheet | null>(null)
  const [synthParams, setSynthParams] = useState<SynthParams[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playingCue, setPlayingCue] = useState<number | null>(null)
  const [expandedCue, setExpandedCue] = useState<number | null>(null)
  const [generatingCues, setGeneratingCues] = useState<Set<number>>(new Set())
  const [generatedUrls, setGeneratedUrls] = useState<Record<number, string>>({})
  const [showLeitmotifs, setShowLeitmotifs] = useState(true)
  const [showScoringNotes, setShowScoringNotes] = useState(false)
  const [showDirection, setShowDirection] = useState(false)
  const [dirSliders, setDirSliders] = useState({
    intensity: 65, darkness: 40, tempo: 55, orchestral: 50,
    electronic: 30, acoustic: 70, tension: 50, warmth: 60,
  })
  const updateSlider = (key: string, val: number) => setDirSliders(prev => ({ ...prev, [key]: val }))
  const [hasSunoKey, setHasSunoKey] = useState(false)

  const synthRef = useRef<SynthEngine | null>(null)

  // Init synth engine
  useEffect(() => {
    synthRef.current = new SynthEngine()
    return () => { synthRef.current?.destroy() }
  }, [])

  // Check Suno key
  useEffect(() => {
    fetch('/api/keys')
      .then(r => r.ok ? r.json() : [])
      .then((keys: any[]) => {
        setHasSunoKey(keys.some((k: any) => k.provider === 'suno' && k.hasKey))
      })
      .catch(() => {})
  }, [])

  // ─── Compose Score ───
  const handleCompose = useCallback(async () => {
    if (!analysis) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/projects/${projectId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis, generateAudio: false }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setCueSheet(data.cueSheet)
      setSynthParams(data.synthPreviews || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [analysis, projectId])

  // ─── Play synth preview ───
  const playCue = useCallback((index: number) => {
    if (!synthRef.current || !synthParams[index]) return

    if (playingCue === index) {
      // Stop
      synthRef.current.stop()
      setPlayingCue(null)
      return
    }

    // Stop previous
    synthRef.current.stop()
    setPlayingCue(index)

    synthRef.current.playCue(synthParams[index], () => {
      setPlayingCue(null)
    })
  }, [playingCue, synthParams])

  // Stop on unmount
  useEffect(() => {
    return () => { synthRef.current?.stop() }
  }, [])

  // ─── Generate via Suno ───
  const generateCue = useCallback(async (index: number) => {
    setGeneratingCues(prev => new Set(prev).add(index))
    try {
      const res = await fetch(`/api/projects/${projectId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis, generateAudio: true, cueIndices: [index] }),
      })
      const data = await res.json()
      if (data.generations?.[0]?.status === 'pending') {
        // Poll for completion
        pollGeneration(data.generations[0].jobId, index)
      } else if (data.generations?.[0]?.audioUrl) {
        setGeneratedUrls(prev => ({ ...prev, [index]: data.generations[0].audioUrl }))
        setGeneratingCues(prev => { const s = new Set(prev); s.delete(index); return s })
      }
    } catch {
      setGeneratingCues(prev => { const s = new Set(prev); s.delete(index); return s })
    }
  }, [projectId, analysis])

  const pollGeneration = useCallback((jobId: string, cueIndex: number) => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/score?jobId=${jobId}`)
        const data = await res.json()
        if (data.status === 'completed' && data.audioUrl) {
          clearInterval(poll)
          setGeneratedUrls(prev => ({ ...prev, [cueIndex]: data.audioUrl }))
          setGeneratingCues(prev => { const s = new Set(prev); s.delete(cueIndex); return s })
        } else if (data.status === 'failed') {
          clearInterval(poll)
          setGeneratingCues(prev => { const s = new Set(prev); s.delete(cueIndex); return s })
        }
      } catch {
        clearInterval(poll)
        setGeneratingCues(prev => { const s = new Set(prev); s.delete(cueIndex); return s })
      }
    }, 5000)

    // Timeout after 5 min
    setTimeout(() => clearInterval(poll), 300000)
  }, [projectId])

  // ═══════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════

  if (!cueSheet) {
    return (
      <div className="space-y-4">
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/20 to-orange-500/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Music size={24} className="text-purple-400" />
          </div>
          <h2 className="text-base font-bold text-slate-200 mb-1">{t.project.score.title}</h2>
          <p className="text-xs text-slate-500 mb-5 max-w-md mx-auto">{t.project.score.subtitle}</p>

          <button onClick={handleCompose} disabled={loading || !analysis}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-500 hover:to-orange-400 disabled:opacity-40 text-white font-semibold rounded-xl inline-flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all">
            {loading ? <><Loader2 size={16} className="animate-spin" /> {t.project.score.composing}</> : <><Sparkles size={16} /> {t.project.score.compose}</>}
          </button>

          {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ═══ HEADER ═══ */}
      <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600/20 to-orange-500/20 border border-purple-500/20 flex items-center justify-center">
              <Music size={16} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-200">{t.project.score.title}</h2>
              <p className="text-[10px] text-slate-500">{cueSheet.globalStyle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowScoringNotes(!showScoringNotes)}
              className={`p-1.5 rounded-lg transition-colors ${showScoringNotes ? 'bg-purple-600/15 text-purple-400' : 'bg-dark-800 text-slate-500 hover:text-slate-400'}`}>
              <Info size={14} />
            </button>
            <button onClick={handleCompose} disabled={loading}
              className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-400 transition-colors">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>{cueSheet.cues.length} {locale === 'fr' ? 'cues musicaux' : 'music cues'}</span>
          <span className="text-slate-600">·</span>
          <span>{cueSheet.totalDuration.toFixed(0)}s</span>
          <span className="text-slate-600">·</span>
          <span>{cueSheet.globalTempo.min}–{cueSheet.globalTempo.max} BPM</span>
          <span className="text-slate-600">·</span>
          <span className="text-purple-400">{cueSheet.dynamicRange}</span>
        </div>
      </div>

      {/* ═══ SYNCHRONIZED PREVIEW PLAYER ═══ */}
      <div className="bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-dark-700">
          <Volume2 size={14} className="text-orange-400" />
          <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">{locale === 'fr' ? 'Aperçu synchronisé' : 'Synchronized Preview'}</span>
          <span className="text-[9px] text-slate-600 ml-auto">{locale === 'fr' ? 'Image + Musique' : 'Image + Music'}</span>
        </div>
        {/* Mini waveform timeline */}
        <div className="px-4 py-3">
          <div className="flex gap-0.5 h-12 rounded-lg overflow-hidden bg-dark-800">
            {cueSheet.cues.map((cue: MusicCue, i: number) => {
              const color = EMOTION_COLORS[(cue as any).emotion] || EMOTION_COLORS['neutre'] || '#666'
              const dynHeight = cue.dynamics === 'fff' ? 100 : cue.dynamics === 'ff' ? 85 : cue.dynamics === 'f' ? 70 : cue.dynamics === 'mf' ? 55 : cue.dynamics === 'mp' ? 40 : cue.dynamics === 'p' ? 30 : cue.dynamics === 'pp' ? 20 : 50
              const isActive = playingCue === i
              return (
                <button key={i}
                  onClick={() => playCue(i)}
                  className={`relative group h-full transition-all ${isActive ? 'ring-1 ring-orange-400' : ''}`}
                  style={{ flex: cue.duration, backgroundColor: color + '15' }}
                  title={`${cue.label} — ${cue.tempo} BPM — ${cue.dynamics}`}>
                  {/* Dynamics bar from bottom */}
                  <div className="absolute bottom-0 left-0 right-0 transition-all" style={{ height: dynHeight + '%', backgroundColor: color + '30' }} />
                  <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />
                  {/* Label on hover */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[7px] font-mono text-white font-bold drop-shadow">{cue.label}</span>
                    <span className="text-[6px] text-white/60">{cue.tempo}bpm</span>
                  </div>
                  {/* Playing indicator */}
                  {isActive && (
                    <div className="absolute top-1 left-1/2 -translate-x-1/2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          {/* Legend */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              {Object.entries(
                cueSheet.cues.reduce((acc: Record<string, string>, cue: any) => {
                  const e = (cue.emotion || 'neutre').toLowerCase()
                  if (!acc[e]) acc[e] = EMOTION_COLORS[e] || '#666'
                  return acc
                }, {} as Record<string, string>)
              ).map(([emotion, color]) => (
                <span key={emotion} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color as string }} />
                  <span className="text-[8px] text-slate-500">{emotion}</span>
                </span>
              ))}
            </div>
            <span className="text-[9px] text-slate-600">{locale === 'fr' ? 'Hauteur = dynamique' : 'Height = dynamics'}</span>
          </div>
        </div>
      </div>

            {/* ═══ SCORING NOTES (collapsible) ═══ */}
      {showScoringNotes && (
        <div className="bg-dark-900/50 rounded-xl border border-purple-500/10 p-4">
          <h3 className="text-[11px] font-semibold text-purple-400 uppercase tracking-wide mb-2">{locale === 'fr' ? 'Notes de direction musicale' : 'Musical Direction Notes'}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{cueSheet.scoringNotes}</p>
        </div>
      )}

      {/* ═══ MUSICAL DIRECTION SLIDERS ═══ */}
      <div className="bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
        <button onClick={() => setShowDirection(!showDirection)}
          className="flex items-center justify-between w-full px-4 py-3 hover:bg-dark-800/30 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/15 to-purple-500/15 border border-cyan-500/15 flex items-center justify-center">
              <Settings size={13} className="text-cyan-400" />
            </div>
            <div className="text-left">
              <span className="text-xs font-semibold text-slate-200 block">{locale === 'fr' ? 'Direction musicale' : 'Musical Direction'}</span>
              <span className="text-[9px] text-slate-500">{locale === 'fr' ? 'Ajustez le caractère du score' : 'Adjust the score character'}</span>
            </div>
          </div>
          {showDirection ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
        </button>
        {showDirection && (
          <div className="px-4 pb-4 space-y-4">
            <div className="h-px bg-dark-700" />
            {/* Semantic slider pairs */}
            {([
              { key: 'intensity', left: locale === 'fr' ? 'Subtil' : 'Subtle', right: locale === 'fr' ? 'Intense' : 'Intense', colorFrom: 'from-blue-500', colorTo: 'to-red-500' },
              { key: 'darkness', left: locale === 'fr' ? 'Lumineux' : 'Bright', right: locale === 'fr' ? 'Sombre' : 'Dark', colorFrom: 'from-amber-400', colorTo: 'to-indigo-600' },
              { key: 'tempo', left: 'Lento', right: 'Allegro', colorFrom: 'from-emerald-500', colorTo: 'to-orange-500' },
              { key: 'warmth', left: locale === 'fr' ? 'Froid' : 'Cold', right: locale === 'fr' ? 'Chaleureux' : 'Warm', colorFrom: 'from-cyan-400', colorTo: 'to-orange-400' },
              { key: 'tension', left: locale === 'fr' ? 'Serein' : 'Serene', right: locale === 'fr' ? 'Tendu' : 'Tense', colorFrom: 'from-green-400', colorTo: 'to-red-400' },
            ] as const).map(({ key, left, right, colorFrom, colorTo }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-slate-500">{left}</span>
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums">{dirSliders[key as keyof typeof dirSliders]}</span>
                  <span className="text-[10px] text-slate-500">{right}</span>
                </div>
                <div className="relative h-2 bg-dark-700 rounded-full">
                  <div className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${colorFrom} ${colorTo} opacity-60`} style={{ width: `${dirSliders[key as keyof typeof dirSliders]}%` }} />
                  <input type="range" min={0} max={100} value={dirSliders[key as keyof typeof dirSliders]}
                    onChange={(e) => updateSlider(key, parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md shadow-black/30 border border-dark-600 pointer-events-none"
                    style={{ left: `calc(${dirSliders[key as keyof typeof dirSliders]}% - 6px)` }} />
                </div>
              </div>
            ))}
            {/* Instrument mix */}
            <div className="pt-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">{locale === 'fr' ? 'Mix instrumental' : 'Instrument Mix'}</span>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { key: 'orchestral', label: '🎻 Orchestral', color: 'text-amber-400' },
                  { key: 'electronic', label: '🎹 Electronic', color: 'text-cyan-400' },
                  { key: 'acoustic', label: '🎸 Acoustic', color: 'text-green-400' },
                ] as const).map(({ key, label, color }) => (
                  <div key={key} className="text-center">
                    <div className="relative h-20 w-full bg-dark-800 rounded-lg overflow-hidden mb-1">
                      <div className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-current opacity-20 ${color}`}
                        style={{ height: `${dirSliders[key as keyof typeof dirSliders]}%` }} />
                      <input type="range" min={0} max={100} value={dirSliders[key as keyof typeof dirSliders]}
                        onChange={(e) => updateSlider(key, parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        style={{ writingMode: 'vertical-lr', direction: 'rtl' }} />
                      <span className="absolute inset-0 flex items-center justify-center text-lg">{label.split(' ')[0]}</span>
                    </div>
                    <span className="text-[9px] text-slate-500">{label.split(' ')[1]}</span>
                    <span className={`text-[10px] font-mono block ${color}`}>{dirSliders[key as keyof typeof dirSliders]}%</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Apply hint */}
            <p className="text-[9px] text-slate-600 text-center pt-1">{locale === 'fr' ? 'Les ajustements seront appliqués à la prochaine recomposition' : 'Adjustments will apply on next recomposition'}</p>
          </div>
        )}
      </div>

      {/* ═══ LEITMOTIFS ═══ */}
      {cueSheet.leitmotifs.length > 0 && (
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
          <button onClick={() => setShowLeitmotifs(!showLeitmotifs)}
            className="flex items-center justify-between w-full mb-2">
            <h3 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">
              Leitmotifs — {cueSheet.leitmotifs.length} {locale === 'fr' ? 'thèmes' : 'themes'}
            </h3>
            {showLeitmotifs ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
          </button>
          {showLeitmotifs && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cueSheet.leitmotifs.map((lm: Leitmotif, i: number) => (
                <div key={i} className="bg-dark-800/50 rounded-lg p-3 border border-dark-700/50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: EMOTION_COLORS[lm.emotion] || '#666' }} />
                    <span className="text-xs font-semibold text-slate-200">{lm.character}</span>
                    <span className="text-[9px] text-slate-500 ml-auto">{lm.interval}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{lm.description}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 bg-dark-700 rounded text-slate-500">{lm.instrument}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded text-white/70" style={{ backgroundColor: (EMOTION_COLORS[lm.emotion] || '#666') + '30' }}>
                      {lm.emotion}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ WAVEFORM TIMELINE ═══ */}
      <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-3">{locale === 'fr' ? 'Timeline musicale' : 'Music Timeline'}</h3>
        <div className="relative h-16 bg-dark-950 rounded-lg overflow-hidden">
          {cueSheet.cues.map((cue: MusicCue, i: number) => {
            const widthPct = (cue.duration / cueSheet.totalDuration) * 100
            const leftPct = (cue.startTime / cueSheet.totalDuration) * 100
            const heightPct = DYNAMICS_WIDTH[cue.dynamics] || 50
            const color = EMOTION_COLORS[cue.moodWords[0]?.includes('melanchol') ? 'tristesse' : 'neutre']
              || EMOTION_COLORS[Object.keys(EMOTION_COLORS).find(e => cue.moodWords.some(m => m.includes(e))) || 'neutre']
              || '#f97316'
            const isPlaying = playingCue === i
            const isGenerated = !!generatedUrls[i]

            return (
              <div key={i}
                className={`absolute bottom-0 cursor-pointer transition-all duration-200 hover:opacity-100 ${isPlaying ? 'opacity-100' : 'opacity-70'}`}
                style={{ left: `${leftPct}%`, width: `${widthPct}%`, height: `${heightPct}%` }}
                onClick={() => playCue(i)}
                title={`${cue.label} — ${cue.key} ${cue.mode} — ${cue.tempo} BPM`}>
                {/* Bar */}
                <div className="absolute inset-0 rounded-t-sm overflow-hidden"
                  style={{ backgroundColor: EMOTION_COLORS[cue.moodWords[0]?.split(' ')[0]] || '#f97316' }}>
                  {/* Animated pulse when playing */}
                  {isPlaying && (
                    <div className="absolute inset-0 animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
                  )}
                  {/* Generated indicator */}
                  {isGenerated && (
                    <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-green-400" />
                  )}
                </div>
                {/* Label */}
                {widthPct > 8 && (
                  <div className="absolute -top-4 left-0 text-[8px] text-slate-500 truncate" style={{ maxWidth: `${widthPct}%` }}>
                    {cue.label}
                  </div>
                )}
              </div>
            )
          })}
          {/* Playback indicator */}
          {playingCue !== null && (
            <div className="absolute top-0 bottom-0 w-0.5 bg-white/60 z-10 transition-all"
              style={{ left: `${((cueSheet.cues[playingCue]?.startTime || 0) / cueSheet.totalDuration) * 100}%` }} />
          )}
        </div>
        {/* Time markers */}
        <div className="flex justify-between mt-1 text-[8px] text-slate-600">
          <span>0:00</span>
          <span>{Math.floor(cueSheet.totalDuration / 60)}:{String(Math.floor(cueSheet.totalDuration % 60)).padStart(2, '0')}</span>
        </div>
      </div>

      {/* ═══ CUE LIST ═══ */}
      <div className="space-y-2">
        {cueSheet.cues.map((cue: MusicCue, i: number) => (
          <CueCard
            key={i}
            cue={cue}
            index={i}
            isPlaying={playingCue === i}
            isExpanded={expandedCue === i}
            isGenerating={generatingCues.has(i)}
            generatedUrl={generatedUrls[i]}
            hasSunoKey={hasSunoKey}
            locale={locale}
            onPlay={() => playCue(i)}
            onExpand={() => setExpandedCue(expandedCue === i ? null : i)}
            onGenerate={() => generateCue(i)}
            t={t}
          />
        ))}
      </div>

      {/* ═══ SUNO KEY WARNING ═══ */}
      {!hasSunoKey && (
        <div className="bg-dark-900/50 rounded-xl border border-purple-500/10 p-4 flex items-start gap-3">
          <Zap size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-purple-300 font-medium">{t.project.score.noKeyTitle}</p>
            <p className="text-[10px] text-purple-400/60 mt-0.5">{t.project.score.noKeyDesc}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════
// Cue Card Component
// ═══════════════════════════════════════════

function CueCard({ cue, index, isPlaying, isExpanded, isGenerating, generatedUrl, hasSunoKey, locale, onPlay, onExpand, onGenerate, t }: {
  cue: MusicCue; index: number; isPlaying: boolean; isExpanded: boolean
  isGenerating: boolean; generatedUrl?: string; hasSunoKey: boolean
  locale: string; onPlay: () => void; onExpand: () => void
  onGenerate: () => void; t: any
}) {
  const emotionColor = EMOTION_COLORS[cue.moodWords[0]?.split(' ')[0]] || '#f97316'
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playingGenerated, setPlayingGenerated] = useState(false)

  const toggleGenerated = () => {
    if (!audioRef.current) return
    if (playingGenerated) { audioRef.current.pause(); setPlayingGenerated(false) }
    else { audioRef.current.play(); setPlayingGenerated(true) }
  }

  return (
    <div className={`bg-dark-900 rounded-xl border transition-all ${isPlaying ? 'border-purple-500/40 shadow-lg shadow-purple-500/5' : 'border-dark-700 hover:border-dark-600'}`}>
      {/* Main row */}
      <div className="flex items-center gap-3 p-3">
        {/* Play button */}
        <button onClick={generatedUrl ? toggleGenerated : onPlay}
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
            isPlaying || playingGenerated ? 'bg-purple-600 text-white' : 'bg-dark-800 hover:bg-dark-700 text-slate-400'
          }`}>
          {isPlaying || playingGenerated ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500">#{index + 1}</span>
            <span className="text-xs font-medium text-slate-200 truncate">{cue.label}</span>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: emotionColor }} />
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{cue.character}</p>
        </div>

        {/* Musical params chips */}
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[9px] px-1.5 py-0.5 bg-dark-800 rounded text-slate-400 font-mono">{cue.key} {cue.mode.slice(0, 3)}</span>
          <span className="text-[9px] px-1.5 py-0.5 bg-dark-800 rounded text-slate-400 font-mono">{cue.tempo}</span>
          <span className="text-[9px] px-1.5 py-0.5 bg-dark-800 rounded text-orange-400/70 font-mono">{cue.dynamics}</span>
          <span className="text-[9px] text-slate-600">{cue.duration.toFixed(0)}s</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {generatedUrl ? (
            <span className="text-[9px] text-green-400 flex items-center gap-0.5"><Check size={10} /> Suno</span>
          ) : hasSunoKey ? (
            <button onClick={onGenerate} disabled={isGenerating}
              className="p-1.5 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 transition-colors disabled:opacity-40">
              {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
            </button>
          ) : null}
          <button onClick={onExpand}
            className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-500 transition-colors">
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Generated audio player */}
      {generatedUrl && (
        <audio ref={audioRef} src={generatedUrl} onEnded={() => setPlayingGenerated(false)} preload="metadata" />
      )}

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-0 space-y-3 border-t border-dark-800 mt-0">
          <div className="pt-3" />
          {/* Musical grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <DetailCell label={locale === 'fr' ? 'Tonalité' : 'Key'} value={`${cue.key} ${cue.mode}`} />
            <DetailCell label="Tempo" value={`${cue.tempo} BPM`} />
            <DetailCell label={locale === 'fr' ? 'Dynamique' : 'Dynamics'} value={cue.dynamics} />
            <DetailCell label="Texture" value={`${TEXTURE_ICONS[cue.texture] || ''} ${cue.texture}`} />
          </div>

          {/* Instrumentation */}
          <div>
            <p className="text-[10px] text-slate-500 mb-1">{locale === 'fr' ? 'Instrumentation' : 'Instrumentation'}</p>
            <div className="flex flex-wrap gap-1">
              {cue.instrumentation.map((instr: string, j: number) => (
                <span key={j} className="text-[9px] px-2 py-0.5 bg-dark-800 rounded-full text-slate-300 border border-dark-700">{instr}</span>
              ))}
            </div>
          </div>

          {/* Mood & reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] text-slate-500 mb-1">{locale === 'fr' ? 'Ambiance' : 'Mood'}</p>
              <div className="flex gap-1">
                {cue.moodWords.map((word: string, j: number) => (
                  <span key={j} className="text-[9px] px-1.5 py-0.5 rounded text-purple-300" style={{ backgroundColor: 'rgba(147,51,234,0.1)' }}>{word}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 mb-1">{locale === 'fr' ? 'Référence' : 'Reference'}</p>
              <p className="text-[10px] text-slate-400 italic">{cue.reference}</p>
            </div>
          </div>

          {/* Technique */}
          <div>
            <p className="text-[10px] text-slate-500 mb-1">{locale === 'fr' ? 'Technique compositionnelle' : 'Compositional Technique'}</p>
            <p className="text-[10px] text-slate-400">{cue.technique}</p>
          </div>

          {/* Transitions */}
          <div className="flex items-center gap-3 text-[9px] text-slate-500">
            <span>↗ {cue.transitionIn}</span>
            <span className="text-slate-700">→</span>
            <span>↘ {cue.transitionOut}</span>
          </div>

          {/* Suno prompt (for developers) */}
          <details className="group">
            <summary className="text-[9px] text-slate-600 cursor-pointer hover:text-slate-400">{locale === 'fr' ? 'Prompt Suno (technique)' : 'Suno Prompt (technical)'}</summary>
            <p className="mt-1 text-[9px] text-slate-500 bg-dark-950 rounded p-2 font-mono leading-relaxed">{cue.sunoPrompt}</p>
          </details>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-dark-800/50 rounded-lg p-2 border border-dark-700/30">
      <p className="text-[9px] text-slate-500 mb-0.5">{label}</p>
      <p className="text-[11px] text-slate-300 font-medium">{value}</p>
    </div>
  )
}
