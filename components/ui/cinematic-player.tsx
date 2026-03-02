'use client'

/**
 * MISEN V12 — Cinematic Player
 * Full-screen synchronized playback: storyboard visuals + music score
 * Ken Burns effect on stills, transport controls, emotion waveform
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Play, Pause, SkipBack, SkipForward, Maximize2, Minimize2,
  Volume2, VolumeX, X, Film, Music, Clock
} from 'lucide-react'
import { StoryboardSVG } from '@/components/ui/storyboard-svg'
import { getModelColor } from '@/components/ui/model-badge'
import { useI18n } from '@/lib/i18n'

const EMOTION_COLORS: Record<string, string> = {
  tension: '#ef4444', tristesse: '#6366f1', colere: '#dc2626',
  joie: '#f59e0b', peur: '#7c3aed', nostalgie: '#8b5cf6',
  amour: '#ec4899', mystere: '#06b6d4', determination: '#f97316', neutre: '#64748b',
}

const KB_TRANSFORMS = [
  'scale(1.05) translate(-2%, -1%)',
  'scale(1.08) translate(1%, -2%)',
  'scale(1.06) translate(-1%, 1%)',
  'scale(1.07) translate(2%, -1%)',
  'scale(1.04) translate(-1%, 2%)',
]

interface CinematicPlayerProps {
  analysis: any
  projectName?: string
  demoImages?: any[]
  onClose?: () => void
}

export function CinematicPlayer({ analysis, projectName, demoImages, onClose }: CinematicPlayerProps) {
  const { locale } = useI18n()
  const fr = locale === 'fr'
  const plans = analysis?.plans || []
  const scenes = analysis?.scenes || []

  // Playback state
  const [playing, setPlaying] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)

  const plan = plans[currentIdx] || {}
  const duration = plan.estimatedDuration || 3
  const totalDuration = plans.reduce((s: number, p: any) => s + (p?.estimatedDuration || 3), 0)
  const mc = getModelColor((plan.modelId || 'kling').toLowerCase())
  const emotion = (plan.emotion || plan.emotionTag || 'neutre').toLowerCase()
  const eColor = EMOTION_COLORS[emotion] || EMOTION_COLORS.neutre

  // Global playhead
  const globalTime = useMemo(() => {
    let t = 0
    for (let i = 0; i < currentIdx; i++) t += (plans[i]?.estimatedDuration || 3)
    return t + elapsed
  }, [currentIdx, elapsed, plans])

  // Timer
  useEffect(() => {
    if (!playing) return
    timerRef.current = window.setInterval(() => {
      setElapsed(prev => {
        if (prev + 0.1 >= duration) {
          if (currentIdx < plans.length - 1) {
            setCurrentIdx(i => i + 1)
            return 0
          } else {
            setPlaying(false)
            return duration
          }
        }
        return prev + 0.1
      })
    }, 100)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [playing, duration, currentIdx, plans.length])

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p) }
      if (e.key === 'Escape' && onClose) onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'j') prev()
      if (e.key === 'k') setPlaying(p => !p)
      if (e.key === 'l') next()
      if (e.key === 'm') setMuted(m => !m)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const next = useCallback(() => {
    if (currentIdx < plans.length - 1) { setCurrentIdx(i => i + 1); setElapsed(0) }
  }, [currentIdx, plans.length])

  const prev = useCallback(() => {
    if (currentIdx > 0) { setCurrentIdx(i => i - 1); setElapsed(0) }
  }, [currentIdx])

  const seekTo = (idx: number) => { setCurrentIdx(idx); setElapsed(0) }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!fullscreen) {
      containerRef.current.requestFullscreen?.()
      setFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setFullscreen(false)
    }
  }

  const fmt = (s: number) => {
    const m = Math.floor(s / 60); const ss = Math.floor(s % 60)
    return `${m}:${ss.toString().padStart(2, '0')}`
  }

  // Scene for current plan
  const sceneIdx = plan.sceneIndex ?? 0
  const scene = scenes[sceneIdx]

  return (
    <div ref={containerRef} className="bg-dark-950 rounded-2xl border border-dark-700 overflow-hidden shadow-2xl shadow-black/60">
      {/* Cinema viewport */}
      <div className="relative aspect-video bg-black overflow-hidden">
        {/* Visual — Ken Burns on stills */}
        <div className="absolute inset-0">
          {demoImages?.[currentIdx % (demoImages.length || 1)] ? (
            <img
              key={currentIdx}
              src={demoImages[currentIdx % demoImages.length].src}
              alt={`P${currentIdx + 1}`}
              className="w-full h-full object-cover transition-none"
              style={{
                transform: playing ? KB_TRANSFORMS[currentIdx % KB_TRANSFORMS.length] : 'scale(1)',
                transition: `transform ${duration}s ease-in-out`,
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <StoryboardSVG
                shotType={plan.shotType}
                cameraMove={plan.cameraMove}
                width={640} height={360}
                modelColor={mc}
              />
            </div>
          )}
          {/* Vignette */}
          <div className="absolute inset-0 vignette opacity-70" />
        </div>

        {/* Top bar overlay */}
        <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent px-5 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white/90 font-mono tabular-nums">P{currentIdx + 1}/{plans.length}</span>
            {scene && <span className="text-[10px] text-white/40">S{sceneIdx + 1} — {scene.heading?.replace(/^(INT\.|EXT\.)\s*/i, '').substring(0, 40)}</span>}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: mc }} />
            <span className="text-[10px] text-white/50">{plan.modelId || 'kling'}</span>
            {onClose && (
              <button onClick={onClose} className="ml-2 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <X size={14} className="text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-5 py-4 z-10">
          {/* Shot info */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] text-white/70 font-medium">{plan.shotType}</span>
            {plan.cameraMove && plan.cameraMove !== 'fixe' && (
              <span className="text-[10px] text-cyan-400/70">{plan.cameraMove}</span>
            )}
            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ color: eColor, backgroundColor: eColor + '20' }}>
              {emotion}
            </span>
            <span className="text-[10px] text-white/40 ml-auto">{fmt(duration)}s</span>
          </div>

          {/* Emotion waveform bar */}
          <div className="flex gap-px h-2 rounded-full overflow-hidden mb-2">
            {plans.map((p: any, i: number) => {
              const e = (p?.emotion || p?.emotionTag || 'neutre').toLowerCase()
              const c = EMOTION_COLORS[e] || EMOTION_COLORS.neutre
              const isActive = i === currentIdx
              return (
                <div
                  key={i}
                  className={`flex-1 cursor-pointer transition-all ${isActive ? 'ring-1 ring-white/60 rounded-sm' : ''}`}
                  style={{ backgroundColor: c, opacity: isActive ? 1 : 0.35 }}
                  onClick={() => seekTo(i)}
                />
              )
            })}
          </div>
        </div>

        {/* Center play button (when paused) */}
        {!playing && (
          <button onClick={() => setPlaying(true)}
            className="absolute inset-0 flex items-center justify-center z-10 group">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500/80 to-orange-600/80 hover:from-orange-400 hover:to-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/30 transition-transform group-hover:scale-110">
              <Play size={24} fill="white" className="text-white ml-1" />
            </div>
          </button>
        )}
      </div>

      {/* Transport bar */}
      <div className="flex items-center gap-3 px-5 py-3 bg-dark-900 border-t border-dark-700">
        <button onClick={prev} className="p-1.5 rounded hover:bg-white/5"><SkipBack size={16} className="text-slate-400" /></button>
        <button onClick={() => setPlaying(!playing)} className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/15">
          {playing ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white ml-0.5" />}
        </button>
        <button onClick={next} className="p-1.5 rounded hover:bg-white/5"><SkipForward size={16} className="text-slate-400" /></button>

        <span className="text-[11px] text-slate-300 font-mono tabular-nums w-10 text-right">{fmt(globalTime)}</span>

        {/* Seek bar */}
        <div className="flex-1 relative h-1.5 bg-dark-700 rounded-full cursor-pointer group"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            const pct = (e.clientX - r.left) / r.width
            const targetTime = pct * totalDuration
            let acc = 0
            for (let i = 0; i < plans.length; i++) {
              const d = plans[i]?.estimatedDuration || 3
              if (acc + d > targetTime) { setCurrentIdx(i); setElapsed(targetTime - acc); break }
              acc += d
            }
          }}>
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all" style={{ width: `${(globalTime / totalDuration) * 100}%` }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `calc(${(globalTime / totalDuration) * 100}% - 6px)` }} />
        </div>

        <span className="text-[11px] text-slate-500 font-mono tabular-nums w-10">{fmt(totalDuration)}</span>

        <button onClick={() => setMuted(!muted)} className="p-1.5 rounded hover:bg-white/5">
          {muted ? <VolumeX size={16} className="text-slate-500" /> : <Volume2 size={16} className="text-slate-400" />}
        </button>
        <button onClick={toggleFullscreen} className="p-1.5 rounded hover:bg-white/5">
          {fullscreen ? <Minimize2 size={16} className="text-slate-400" /> : <Maximize2 size={16} className="text-slate-400" />}
        </button>
      </div>
    </div>
  )
}
