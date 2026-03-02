'use client'

import { useI18n } from '@/lib/i18n'
import { useState, useEffect, useRef } from 'react'
import {
  Play, Pause, ChevronRight,
  Film, Brain, Clock, Sparkles, Image, Subtitles, Zap,
  Camera, Users, DollarSign, Eye,
  ArrowRight, X
} from 'lucide-react'
import { DEMO_SCENARIOS, DEMO_WALKTHROUGH, NARRATIONS, type DemoScenario } from '@/lib/demo/data'
import Link from 'next/link'
import { LanguageToggle } from '@/components/ui/language-toggle'

const TAB_ICONS: Record<string, any> = {
  script: Film, analyse: Brain, timeline: Clock, copilot: Sparkles,
  media: Image, subtitles: Subtitles, generate: Zap, result: Play,
}

export default function DemoPage() {
  const { t } = useI18n()
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const [typedText, setTypedText] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const scenario = DEMO_SCENARIOS[scenarioIdx]
  const step = DEMO_WALKTHROUGH[currentStep]
  const narration = NARRATIONS[scenario.id]?.[step.step] || ''

  const switchScenario = (idx: number) => {
    setScenarioIdx(idx); setCurrentStep(0); setAutoPlay(false)
  }

  useEffect(() => {
    if (!autoPlay) return
    timerRef.current = setTimeout(() => {
      if (currentStep < DEMO_WALKTHROUGH.length - 1) setCurrentStep(prev => prev + 1)
      else setAutoPlay(false)
    }, step.duration)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [autoPlay, currentStep, step.duration])

  useEffect(() => {
    setTypedText('')
    let i = 0
    const interval = setInterval(() => {
      if (i < narration.length) { setTypedText(narration.slice(0, i + 1)); i++ }
      else clearInterval(interval)
    }, 20)
    return () => clearInterval(interval)
  }, [currentStep, narration, scenarioIdx])

  const Icon = TAB_ICONS[step.step] || Film

  return (
    <div className="min-h-screen bg-dark-950 relative"><div className="fixed inset-0 vignette pointer-events-none z-0" />
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-dark-800">
        <div className="flex items-center gap-3">
          <Play size={20} className="text-orange-500" fill="currentColor" />
          <span className="text-sm font-bold text-slate-50">MISEN</span>
          <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">DÉMO</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link href="/" className="p-2 rounded-lg hover:bg-white/5">
            <X size={18} className="text-slate-400" />
          </Link>
        </div>
      </div>

      {/* ═══ SCENARIO SELECTOR ═══ */}
      <div className="px-6 py-4 border-b border-dark-800/50">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-2">Choisissez un projet</p>
        <div className="flex flex-col sm:flex-row gap-2">
          {DEMO_SCENARIOS.map((s, i) => (
            <button key={s.id} onClick={() => switchScenario(i)}
              className={`flex-1 px-3 py-3 rounded-xl border text-left transition-all ${
                i === scenarioIdx ? 'border-orange-500/50 bg-orange-500/5' : 'border-dark-700 bg-dark-900 hover:border-dark-600'
              }`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className={`text-xs font-medium ${i === scenarioIdx ? 'text-white' : 'text-slate-400'}`}>{s.title}</span>
              </div>
              <p className="text-[10px] text-slate-600">{s.genre}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 py-3">
        <div className="flex items-center gap-1">
          {DEMO_WALKTHROUGH.map((w, i) => {
            const StepIcon = TAB_ICONS[w.step] || Film
            return (
              <button key={i} onClick={() => { setCurrentStep(i); setAutoPlay(false) }}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-xs transition-all ${
                  i === currentStep ? 'bg-orange-600 text-white' :
                  i < currentStep ? 'bg-orange-500/20 text-orange-400' : 'bg-dark-800 text-slate-600'
                }`}>
                <StepIcon size={12} />
                <span className="hidden md:inline">{w.title.replace(/^\d+\.\s*/, '')}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="px-6 py-6 max-w-5xl mx-auto pb-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Icon size={24} className="text-orange-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-50">{step.title}</h2>
            <p className="text-sm text-slate-400">« {scenario.title} » · Étape {currentStep + 1} / {DEMO_WALKTHROUGH.length}</p>
          </div>
        </div>

        <div className="bg-dark-900 rounded-xl border border-dark-700 p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse mt-2 flex-shrink-0" />
            <p className="text-sm text-slate-300 leading-relaxed">{typedText}<span className="text-orange-500 animate-pulse">|</span></p>
          </div>
        </div>

        {step.step === 'script' && <DemoScript scenario={scenario} />}
        {step.step === 'analyse' && <DemoAnalyse scenario={scenario} />}
        {step.step === 'timeline' && <DemoTimeline scenario={scenario} />}
        {step.step === 'copilot' && <DemoCopilot scenario={scenario} />}
        {step.step === 'media' && <DemoMedia scenario={scenario} />}
        {step.step === 'subtitles' && <DemoSubtitles scenario={scenario} />}
        {step.step === 'generate' && <DemoGenerate scenario={scenario} />}
        {step.step === 'result' && <DemoResult scenario={scenario} />}
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 inset-x-0 bg-dark-950 border-t border-dark-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => setAutoPlay(!autoPlay)}
            className="flex items-center gap-2 px-4 py-2 btn-primary text-sm font-medium rounded-lg transition-colors">
            {autoPlay ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Auto-play</>}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}
              className="px-3 py-2 bg-dark-800 hover:bg-dark-700 disabled:opacity-30 text-slate-200 text-sm rounded-lg transition-colors">
              ← Précédent
            </button>
            {currentStep < DEMO_WALKTHROUGH.length - 1 ? (
              <button onClick={() => setCurrentStep(currentStep + 1)}
                className="px-3 py-2 bg-dark-800 hover:bg-dark-700 text-slate-200 text-sm rounded-lg transition-colors flex items-center gap-1">
                Suivant <ChevronRight size={14} />
              </button>
            ) : (
              <Link href="/register"
                className="px-4 py-2 btn-primary text-sm font-medium rounded-lg transition-colors flex items-center gap-1">
                {t.demo.ctaButton} <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══ STEP COMPONENTS ═══

function DemoScript({ scenario }: { scenario: DemoScenario }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: scenario.color }} />
        <span className="text-xs text-slate-500 font-medium">{scenario.genre}</span>
        <span className="text-xs text-slate-600 italic ml-auto">« {scenario.tagline} »</span>
      </div>
      <div className="rounded-xl border border-dark-700 bg-dark-900 p-4 max-h-80 overflow-y-auto">
        <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{scenario.script}</pre>
      </div>
    </div>
  )
}

function DemoAnalyse({ scenario }: { scenario: DemoScenario }) {
  const { t } = useI18n()
  const stats = [
    { icon: Film, label: t.demo.shotsDetected.split(' ')[0] || 'Scenes', value: scenario.stats.scenes },
    { icon: Eye, label: t.demo.shotsDetected, value: scenario.stats.plans },
    { icon: Users, label: t.demo.characterTitle, value: scenario.stats.chars },
    { icon: DollarSign, label: t.demo.estimatedBudget, value: scenario.stats.cost },
  ]
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-dark-900 border border-dark-700 rounded-xl p-3 text-center">
            <s.icon size={18} className="text-orange-500/60 mx-auto mb-1" />
            <p className="text-lg font-bold text-slate-100">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {scenario.plans.map((p) => (
          <div key={p.label} className="relative rounded-lg overflow-hidden border border-dark-700 group">
            <img src={p.src} alt={p.label} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute top-1.5 left-1.5">
              <span className="text-[9px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">{p.label}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <p className="text-[9px] text-slate-300">{p.shot}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-[8px] text-slate-500">{p.model}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DemoTimeline({ scenario }: { scenario: DemoScenario }) {
  const plans = scenario.plans
  const total = plans.reduce((s, p) => s + p.dur, 0)
  return (
    <div className="bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
      <div className="px-3 py-2 flex items-center justify-between border-b border-dark-700">
        <div className="flex items-center gap-2">
          <Camera size={14} className="text-slate-500" />
          <span className="text-xs text-slate-400 font-medium">{plans.length} plans • {total.toFixed(0)}s</span>
        </div>
        <span className="text-[10px] text-slate-600">{scenario.title}</span>
      </div>
      <div className="p-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5" style={{ minWidth: plans.length * 140 }}>
          {plans.map((p, i) => (
            <div key={i} className="flex-shrink-0 rounded-lg overflow-hidden border border-dark-700 group" style={{ width: Math.max((p.dur / total) * 700, 120) }}>
              <div className="relative aspect-video">
                <img src={p.src} alt={p.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute top-1 left-1 px-1 py-0.5 bg-black/60 rounded text-[7px] font-bold text-white">P{i + 1}</div>
                <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1 py-0.5 bg-black/60 rounded">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-[6px] text-white">{p.model}</span>
                </div>
                <div className="absolute bottom-1 right-1 text-[7px] text-white/80">{p.dur}s</div>
                <div className="absolute bottom-1 left-1 text-[7px] text-white/70">{p.shot}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-3 pb-3">
        <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-500 to-cyan-500 rounded-full" style={{ width: '35%' }} />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[9px] text-slate-500">0:00</span>
          <span className="text-[9px] text-slate-500">0:{total.toFixed(0)}</span>
        </div>
      </div>
    </div>
  )
}

function DemoCopilot({ scenario }: { scenario: DemoScenario }) {
  return (
    <div className="space-y-3">
      {scenario.copilot.map((s, i) => (
        <div key={i} className="bg-dark-900 rounded-xl border border-dark-700 p-4 flex items-start gap-3">
          <span className="text-xl">{s.icon}</span>
          <div>
            <p className="text-sm text-slate-200 font-medium">{s.title}</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.detail}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function DemoMedia({ scenario }: { scenario: DemoScenario }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-9 px-3 bg-dark-900 border border-dark-700 rounded-lg flex items-center text-sm text-slate-500">
          🔍 Recherche pour « {scenario.title} »…
        </div>
        <div className="px-3 py-2 bg-orange-600 text-white text-xs font-medium rounded-lg">Pexels</div>
        <div className="px-3 py-2 bg-dark-700 text-slate-300 text-xs font-medium rounded-lg">Pixabay</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {scenario.plans.map((p, i) => (
          <div key={i} className="relative aspect-video rounded-lg border border-dark-700 overflow-hidden group">
            <img src={p.src} alt={p.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span className="absolute bottom-2 left-2 text-[10px] text-white font-medium">{p.shot}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-3">Images de référence pour votre moodboard.</p>
    </div>
  )
}

function DemoSubtitles({ scenario }: { scenario: DemoScenario }) {
  return (
    <div className="space-y-2">
      {scenario.subtitles.map((s, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-dark-900 rounded-lg border border-dark-700">
          <span className="text-[10px] text-slate-600 font-mono w-10 pt-0.5">{s.time}</span>
          <span className="text-xs text-orange-400 font-medium w-24 flex-shrink-0">{s.char}</span>
          <p className="text-sm text-slate-200 flex-1">{s.text}</p>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-3">
        <div className="px-3 py-1.5 bg-dark-800 border border-dark-700 rounded text-xs text-slate-300">📥 SRT</div>
        <div className="px-3 py-1.5 bg-dark-800 border border-dark-700 rounded text-xs text-slate-300">📥 VTT</div>
        <div className="px-3 py-1.5 bg-dark-800 border border-dark-700 rounded text-xs text-slate-300">🔊 Voix off</div>
        <div className="px-3 py-1.5 bg-dark-800 border border-dark-700 rounded text-xs text-slate-300">🎙️ ElevenLabs</div>
      </div>
    </div>
  )
}

function DemoGenerate({ scenario }: { scenario: DemoScenario }) {
  const totalCost = scenario.generation.reduce((s, g) => s + parseFloat(g.cost.replace('$', '')), 0)
  return (
    <div className="space-y-2">
      {scenario.generation.map((p, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-dark-900 rounded-lg border border-dark-700">
          <span className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
            p.status === '✓' ? 'bg-green-500/20 text-green-400' :
            p.status === '⟳' ? 'bg-yellow-500/20 text-yellow-400 animate-spin' :
            'bg-dark-700 text-slate-500'
          }`}>{p.status}</span>
          <div className="flex-1">
            <span className="text-xs text-slate-200">{p.shot}</span>
            <span className="text-[10px] text-orange-400 ml-2">{p.model}</span>
          </div>
          <span className="text-xs text-slate-500">{p.cost}</span>
        </div>
      ))}
      <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 mt-4 text-center">
        <p className="text-sm text-orange-400 font-medium">De l&apos;écriture à l&apos;écran.</p>
        <p className="text-xs text-slate-500 mt-1">{scenario.plans.length} plans · ${totalCost.toFixed(2)} budget total</p>
      </div>
    </div>
  )
}

function DemoResult({ scenario }: { scenario: DemoScenario }) {
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [currentPlan, setCurrentPlan] = useState(0)
  const [nextPlan, setNextPlan] = useState(-1)
  const [fadePhase, setFadePhase] = useState<'stable' | 'crossfading'>('stable')
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  const plans = scenario.plans
  const totalDur = plans.reduce((s, p) => s + p.dur, 0)
  const CROSSFADE_MS = 1500

  // Preload all images on mount / scenario change
  useEffect(() => {
    setPlaying(false); setElapsed(0); setCurrentPlan(0); setNextPlan(-1); setFadePhase('stable'); setImagesLoaded(false)
    let loaded = 0
    plans.forEach(p => {
      const img = new window.Image()
      img.onload = () => { loaded++; if (loaded >= plans.length) setImagesLoaded(true) }
      img.onerror = () => { loaded++; if (loaded >= plans.length) setImagesLoaded(true) }
      img.src = p.src
    })
  }, [scenario.id])

  const getPlanAtTime = (t: number) => {
    let acc = 0
    for (let i = 0; i < plans.length; i++) { acc += plans[i].dur; if (t < acc) return i }
    return plans.length - 1
  }

  // requestAnimationFrame loop for smooth playback
  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = 0
      return
    }
    const tick = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const delta = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      setElapsed(prev => {
        const next = prev + delta
        if (next >= totalDur) {
          setPlaying(false)
          return totalDur
        }
        // Detect plan change
        const curPlan = getPlanAtTime(prev)
        const newPlan = getPlanAtTime(next)
        if (newPlan !== curPlan) {
          setNextPlan(newPlan)
          setFadePhase('crossfading')
          setTimeout(() => {
            setCurrentPlan(newPlan)
            setNextPlan(-1)
            setFadePhase('stable')
          }, CROSSFADE_MS)
        }
        return next
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [playing, totalDur])

  const current = plans[currentPlan]
  const incoming = nextPlan >= 0 ? plans[nextPlan] : null
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  const planStartTime = plans.slice(0, currentPlan).reduce((s, p) => s + p.dur, 0)
  const planElapsed = elapsed - planStartTime
  const planProgress = Math.min(planElapsed / current.dur, 1)
  const subVisible = current.sub && planElapsed > 0.5 && planElapsed < current.dur - 0.3

  // Ken Burns transform based on direction + progress
  const getKenBurns = (direction: string, progress: number) => {
    const p = progress
    switch (direction) {
      case 'right': return `scale(${1.02 + p * 0.06}) translateX(${-1 + p * 2}%)`
      case 'left': return `scale(${1.02 + p * 0.06}) translateX(${1 - p * 2}%)`
      case 'in': return `scale(${1.0 + p * 0.1})`
      case 'out': return `scale(${1.1 - p * 0.08})`
      default: return `scale(${1.02 + p * 0.04})`
    }
  }

  const jumpTo = (planIdx: number) => {
    let acc = 0; for (let j = 0; j < planIdx; j++) acc += plans[j].dur
    setElapsed(acc); setCurrentPlan(planIdx); setNextPlan(-1); setFadePhase('stable')
    lastTimeRef.current = 0
  }

  return (
    <div className="bg-black rounded-xl overflow-hidden shadow-2xl shadow-black/80 border border-white/[0.06]">
      {/* Cinema viewport */}
      <div className="relative aspect-[2.39/1] bg-black overflow-hidden cursor-pointer select-none"
        onClick={() => { if (elapsed >= totalDur) { setElapsed(0); setCurrentPlan(0); lastTimeRef.current = 0 }; setPlaying(!playing) }}>

        {/* Layer A — current image */}
        <img
          src={current.src}
          alt={current.label}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            willChange: 'transform, opacity',
            transform: playing || elapsed > 0 ? getKenBurns(current.direction, planProgress) : 'scale(1.02)',
            transition: 'transform 0.3s ease-out',
            opacity: fadePhase === 'crossfading' ? 0 : 1,
            transitionProperty: 'opacity, transform',
            transitionDuration: fadePhase === 'crossfading' ? `${CROSSFADE_MS}ms` : '0.3s',
            transitionTimingFunction: 'ease-in-out',
          }}
        />

        {/* Layer B — incoming image (crossfade) */}
        {incoming && (
          <img
            src={incoming.src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              willChange: 'transform, opacity',
              transform: getKenBurns(incoming.direction, 0),
              opacity: fadePhase === 'crossfading' ? 1 : 0,
              transition: `opacity ${CROSSFADE_MS}ms ease-in-out`,
            }}
          />
        )}

        {/* Cinematic vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.6)]" style={{ pointerEvents: 'none' }} />

        {/* Letterbox bars for cinema feel */}
        <div className="absolute top-0 left-0 right-0 h-[3%] bg-black" style={{ pointerEvents: 'none' }} />
        <div className="absolute bottom-0 left-0 right-0 h-[3%] bg-black" style={{ pointerEvents: 'none' }} />

        {/* Film grain overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{
          pointerEvents: 'none',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '128px 128px',
        }} />

        {/* Subtitle */}
        <div className={`absolute bottom-[8%] left-0 right-0 text-center transition-opacity duration-700 ease-in-out ${subVisible ? 'opacity-100' : 'opacity-0'}`} style={{ pointerEvents: 'none' }}>
          <span className="bg-black/60 backdrop-blur-sm px-6 py-2.5 rounded text-white text-sm md:text-base font-medium tracking-wide shadow-2xl"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            {current.sub}
          </span>
        </div>

        {/* Play overlay (initial) */}
        {!playing && elapsed === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
            {!imagesLoaded && <div className="absolute top-4 right-4 w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />}
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-4 font-light">{scenario.title}</p>
            <button className="w-20 h-20 rounded-full bg-orange-600/90 hover:bg-orange-500 flex items-center justify-center shadow-2xl shadow-orange-600/30 transition-all hover:scale-110 group">
              <Play size={32} fill="white" className="text-white ml-1 group-hover:scale-110 transition-transform" />
            </button>
            <p className="text-white/30 text-[10px] tracking-widest uppercase mt-4">Un film MISEN</p>
          </div>
        )}

        {/* Pause indicator */}
        {!playing && elapsed > 0 && elapsed < totalDur && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center animate-pulse">
              <Pause size={22} className="text-white/70" />
            </div>
          </div>
        )}

        {/* End screen */}
        {!playing && elapsed >= totalDur - 0.05 && elapsed > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-[3px]">
            <p className="text-white/80 text-xl font-display tracking-[0.2em]">FIN</p>
            <p className="text-white/30 text-xs mt-2 tracking-wide">{scenario.title} — Un film MISEN</p>
            <button onClick={(e) => { e.stopPropagation(); setElapsed(0); setCurrentPlan(0); setNextPlan(-1); setFadePhase('stable'); lastTimeRef.current = 0; setPlaying(true) }}
              className="mt-5 px-5 py-2 btn-primary text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors">
              <Play size={12} fill="white" /> Rejouer
            </button>
          </div>
        )}

        {/* Plan info (hover) */}
        {playing && (
          <div className="absolute top-3 left-3 flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-[9px] text-white/70 font-medium">{current.label} · {current.shot}</div>
            <div className="flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: current.color }} />
              <span className="text-[9px] text-white/60">{current.model}</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative h-1 bg-dark-900 cursor-pointer group" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const newTime = ((e.clientX - rect.left) / rect.width) * totalDur
        const newPlan = getPlanAtTime(newTime)
        setElapsed(newTime); setCurrentPlan(newPlan); setNextPlan(-1); setFadePhase('stable'); lastTimeRef.current = 0
      }}>
        {/* Scene markers */}
        {(() => { let acc = 0; return plans.slice(0, -1).map((p, i) => { acc += p.dur; return <div key={i} className="absolute top-0 h-full w-px bg-white/10" style={{ left: `${(acc / totalDur) * 100}%` }} /> }) })()}
        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-600 to-orange-400 group-hover:h-1.5 group-hover:-top-0.5 transition-all" style={{ width: `${(elapsed / totalDur) * 100}%` }} />
      </div>

      {/* Controls */}
      <div className="bg-dark-950 px-4 py-2.5 flex items-center gap-3">
        <button onClick={() => { if (elapsed >= totalDur) { setElapsed(0); setCurrentPlan(0); lastTimeRef.current = 0 }; setPlaying(!playing) }}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
          {playing ? <Pause size={12} className="text-white" /> : <Play size={12} fill="white" className="text-white ml-0.5" />}
        </button>
        <span className="text-[11px] text-slate-500 tabular-nums min-w-[70px]">{fmt(elapsed)} / {fmt(totalDur)}</span>
        <div className="flex-1 flex items-center justify-center gap-1.5">
          {plans.map((_, i) => (
            <button key={i} onClick={() => { jumpTo(i); setPlaying(true) }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentPlan ? 'bg-orange-500 scale-125' : i < currentPlan ? 'bg-orange-500/40' : 'bg-white/10'}`} />
          ))}
        </div>
        <button className="px-2.5 py-1 btn-primary text-[10px] font-medium rounded transition-colors flex items-center gap-1">
          <ArrowRight size={10} /> Export 4K
        </button>
      </div>
    </div>
  )
}
