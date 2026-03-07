'use client'

import { useI18n } from '@/lib/i18n'
import { useState, useEffect, useRef } from 'react'
import {
  Play, Pause, ChevronRight,
  Film, Brain, Clock, Sparkles, Image, Subtitles, Zap,
  Camera, Users, DollarSign, Eye, TrendingUp,
  ArrowRight, X
} from 'lucide-react'
import { DEMO_SCENARIOS, DEMO_WALKTHROUGH, NARRATIONS, type DemoScenario } from '@/lib/demo/data'
import Link from 'next/link'
import { LanguageToggle } from '@/components/ui/language-toggle'

const TAB_ICONS: Record<string, any> = {
  script: Film, analyse: Brain, performance: TrendingUp, timeline: Clock, copilot: Sparkles,
  media: Image, subtitles: Subtitles, generate: Zap, result: Play,
}

export default function DemoPage() {
  const { t } = useI18n()
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const [typedText, setTypedText] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const scenario = DEMO_SCENARIOS[scenarioIdx]
  const step = DEMO_WALKTHROUGH[currentStep]
  const narration = NARRATIONS[scenario.id]?.[step.step] || ''

  const switchScenario = (idx: number) => {
    setScenarioIdx(idx); setCurrentStep(0); setAutoPlay(true)
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
              <button key={i} onClick={() => { setCurrentStep(i); setAutoPlay(true) }}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-xs transition-all ${
                  i === currentStep ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/15' :
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
        {step.step === 'performance' && <DemoPerformance scenario={scenario} />}
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
            {p.src.endsWith(".mp4") ? <video src={p.src} autoPlay muted loop playsInline className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300" /> : <img src={p.src} alt={p.label} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300" />}
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

function DemoPerformance({ scenario }: { scenario: DemoScenario }) {
  // Performance scores vary by scenario genre
  const scores: Record<string, { label: string; score: number; color: string }[]> = {
    cendres: [
      { label: 'Hook', score: 72, color: '#EAB308' },
      { label: 'Rétention', score: 65, color: '#EAB308' },
      { label: 'Impact émotionnel', score: 81, color: '#10B981' },
      { label: 'Rythme', score: 70, color: '#10B981' },
      { label: 'Potentiel viral', score: 48, color: '#EF4444' },
    ],
    odyssee: [
      { label: 'Hook', score: 85, color: '#10B981' },
      { label: 'Rétention', score: 78, color: '#10B981' },
      { label: 'Impact émotionnel', score: 74, color: '#10B981' },
      { label: 'Visibilité produit', score: 82, color: '#10B981' },
      { label: 'Potentiel viral', score: 71, color: '#10B981' },
    ],
    pixel: [
      { label: 'Hook', score: 68, color: '#EAB308' },
      { label: 'Rétention', score: 74, color: '#10B981' },
      { label: 'Impact émotionnel', score: 62, color: '#EAB308' },
      { label: 'Rythme', score: 81, color: '#10B981' },
      { label: 'Potentiel viral', score: 55, color: '#EAB308' },
    ],
  }
  const scenarioKey = scenario.plans[0]?.src?.includes('sc1') ? 'cendres' : scenario.plans[0]?.src?.includes('sc2') ? 'odyssee' : 'pixel'
  const dims = scores[scenarioKey] || scores.cendres
  const global = Math.round(dims.reduce((s, d) => s + d.score, 0) / dims.length)
  const grade = global >= 75 ? 'B+' : global >= 65 ? 'B' : global >= 55 ? 'C+' : 'C'

  const styles: { director: string; signature: string }[] = scenarioKey === 'odyssee'
    ? [{ director: 'Denis Villeneuve', signature: 'Paysages vastes, dolly lent, lumière dorée' }, { director: 'Wong Kar-wai', signature: 'Néons, slow-motion, cadres dans le cadre' }]
    : scenarioKey === 'pixel'
    ? [{ director: 'David Fincher', signature: 'Précision chirurgicale, palette désaturée' }, { director: 'Steven Spielberg', signature: 'Lumière comme émotion, push-in révélation' }]
    : [{ director: 'Stanley Kubrick', signature: 'Symétrie parfaite, Steadicam, silence' }, { director: 'Denis Villeneuve', signature: 'Échelle monumentale, dolly lent' }]

  return (
    <div className="space-y-4">
      {/* Global score */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: global >= 70 ? 'rgba(16,185,129,0.1)' : 'rgba(234,179,8,0.1)', border: `1px solid ${global >= 70 ? 'rgba(16,185,129,0.2)' : 'rgba(234,179,8,0.2)'}` }}>
            <span className="text-xl font-bold" style={{ color: global >= 70 ? '#10B981' : '#EAB308' }}>{grade}</span>
          </div>
          <div>
            <p className="text-base font-bold text-white">{global}/100</p>
            <p className="text-[10px] text-slate-500">Performance Engine — 7 dimensions analysées</p>
          </div>
        </div>
        <div className="space-y-2">
          {dims.map(d => (
            <div key={d.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400">{d.label}</span>
                <span className="text-[10px] font-mono text-slate-500">{d.score}</span>
              </div>
              <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: d.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Style Genome recommendations */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
        <p className="text-[10px] font-bold text-violet-400 mb-3 tracking-wider uppercase">Styles cinématographiques recommandés</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {styles.map(s => (
            <div key={s.director} className="px-3 py-2.5 bg-dark-800/50 rounded-lg border border-dark-700/50">
              <p className="text-xs font-bold text-white">{s.director}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{s.signature}</p>
            </div>
          ))}
        </div>
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
                {p.src.endsWith(".mp4") ? <video src={p.src} autoPlay muted loop playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <img src={p.src} alt={p.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
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
        <div className="px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-medium rounded-lg">Pexels</div>
        <div className="px-3 py-2 bg-dark-700 text-slate-300 text-xs font-medium rounded-lg">Pixabay</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {scenario.plans.map((p, i) => (
          <div key={i} className="relative aspect-video rounded-lg border border-dark-700 overflow-hidden group">
            {p.src.endsWith(".mp4") ? <video src={p.src} autoPlay muted loop playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <img src={p.src} alt={p.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
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
  const [ready, setReady] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const plans = scenario.plans
  const totalDur = plans.reduce((s, p) => s + p.dur, 0)
  const CROSSFADE_MS = 2000

  // Auto-start after brief delay
  useEffect(() => {
    setPlaying(false); setElapsed(0); setCurrentPlan(0); setNextPlan(-1); setFadePhase('stable'); setReady(false)
    const timer = setTimeout(() => { setReady(true); setPlaying(true) }, 1500)
    return () => clearTimeout(timer)
  }, [scenario.id])

  const getPlanAtTime = (t: number) => {
    let acc = 0
    for (let i = 0; i < plans.length; i++) { acc += plans[i].dur; if (t < acc) return i }
    return plans.length - 1
  }

  // Smooth playback loop
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
        if (next >= totalDur) { setPlaying(false); return totalDur }
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
  const subVisible = current.sub && planElapsed > 0.3 && planElapsed < current.dur - 0.2

  const jumpTo = (planIdx: number) => {
    let acc = 0; for (let j = 0; j < planIdx; j++) acc += plans[j].dur
    setElapsed(acc); setCurrentPlan(planIdx); setNextPlan(-1); setFadePhase('stable')
    lastTimeRef.current = 0
  }

  return (
    <div className="bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/90 border border-white/[0.04]">
      {/* Cinema viewport — 2.39:1 anamorphic ratio */}
      <div className="relative aspect-[2.39/1] bg-black overflow-hidden cursor-pointer select-none"
        onClick={() => { if (elapsed >= totalDur) { setElapsed(0); setCurrentPlan(0); lastTimeRef.current = 0 }; setPlaying(!playing) }}>

        {/* All video layers pre-mounted for instant transitions */}
        {plans.map((p, i) => (
          <video
            key={`layer-${i}`}
            ref={el => { videoRefs.current[i] = el }}
            src={p.src}
            autoPlay
            muted
            playsInline
            loop
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: i === currentPlan && fadePhase === 'stable' ? 1
                : i === currentPlan && fadePhase === 'crossfading' ? 0
                : i === nextPlan && fadePhase === 'crossfading' ? 1
                : 0,
              transition: `opacity ${CROSSFADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              zIndex: i === nextPlan ? 2 : i === currentPlan ? 1 : 0,
            }}
          />
        ))}

        {/* Cinematic vignette — deep, subtle */}
        <div className="absolute inset-0" style={{
          pointerEvents: 'none', zIndex: 5,
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.45) 100%)',
        }} />

        {/* Letterbox bars — anamorphic cinema feel */}
        <div className="absolute top-0 left-0 right-0 h-[4%] bg-black" style={{ pointerEvents: 'none', zIndex: 6 }} />
        <div className="absolute bottom-0 left-0 right-0 h-[4%] bg-black" style={{ pointerEvents: 'none', zIndex: 6 }} />

        {/* Film grain — very subtle */}
        <div className="absolute inset-0 opacity-[0.025] mix-blend-overlay" style={{
          pointerEvents: 'none', zIndex: 5,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '128px 128px',
        }} />

        {/* Subtitle — cinema style, large, breathing */}
        <div className={`absolute bottom-[10%] left-0 right-0 text-center transition-all duration-700 ease-in-out ${subVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          style={{ pointerEvents: 'none', zIndex: 10 }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '10px 28px',
            borderRadius: 4,
            color: 'white',
            fontSize: 'clamp(13px, 2vw, 18px)',
            fontWeight: 400,
            letterSpacing: '0.03em',
            lineHeight: 1.5,
            textShadow: '0 1px 6px rgba(0,0,0,0.9)',
            fontFamily: "'DM Sans', -apple-system, sans-serif",
          }}>
            {current.sub}
          </span>
        </div>

        {/* HUD — model + shot type (always visible during playback, subtle) */}
        {playing && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5" style={{ zIndex: 10, opacity: 0.6 }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: current.color }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>
              {current.model} · {current.shot}
            </span>
          </div>
        )}

        {/* Play overlay — initial state, cinematic */}
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]" style={{ zIndex: 20 }}>
            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase' as const }}>Chargement du film</p>
          </div>
        )}

        {!playing && ready && elapsed === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40" style={{ zIndex: 20 }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' as const, marginBottom: 20, fontFamily: "'Playfair Display', Georgia, serif" }}>{scenario.title}</p>
            <button className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/30 transition-all hover:scale-110">
              <Play size={32} fill="white" className="text-white ml-1" />
            </button>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase' as const, marginTop: 16 }}>Dirigé par MISEN</p>
          </div>
        )}

        {/* Pause indicator */}
        {!playing && elapsed > 0 && elapsed < totalDur && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 20 }}>
            <div className="w-14 h-14 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
              <Pause size={22} className="text-white/60" />
            </div>
          </div>
        )}

        {/* End screen — elegant */}
        {!playing && elapsed >= totalDur - 0.05 && elapsed > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-[4px]" style={{ zIndex: 20 }}>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.15em' }}>FIN</p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 8, letterSpacing: '0.1em' }}>{scenario.title} — Dirigé par MISEN</p>
            <button onClick={(e) => { e.stopPropagation(); setElapsed(0); setCurrentPlan(0); setNextPlan(-1); setFadePhase('stable'); lastTimeRef.current = 0; setPlaying(true) }}
              className="mt-6 px-5 py-2 btn-primary text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors">
              <Play size={12} fill="white" /> Rejouer
            </button>
          </div>
        )}
      </div>

      {/* Progress bar — smooth, plan markers */}
      <div className="relative h-1 bg-dark-900 cursor-pointer group" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const newTime = ((e.clientX - rect.left) / rect.width) * totalDur
        const newPlan = getPlanAtTime(newTime)
        setElapsed(newTime); setCurrentPlan(newPlan); setNextPlan(-1); setFadePhase('stable'); lastTimeRef.current = 0
      }}>
        {(() => { let acc = 0; return plans.slice(0, -1).map((p, i) => { acc += p.dur; return <div key={i} className="absolute top-0 h-full w-px bg-white/[0.08]" style={{ left: `${(acc / totalDur) * 100}%` }} /> }) })()}
        <div className="absolute top-0 left-0 h-full rounded-r-full transition-none" style={{
          width: `${(elapsed / totalDur) * 100}%`,
          background: 'linear-gradient(90deg, #C56A2D, #E8955A)',
        }} />
        <div className="absolute top-0 left-0 h-full group-hover:h-2 group-hover:-top-0.5 transition-all rounded-r-full" style={{
          width: `${(elapsed / totalDur) * 100}%`,
          background: 'linear-gradient(90deg, #C56A2D, #E8955A)',
          opacity: 0,
        }} />
      </div>

      {/* Controls — minimal, elegant */}
      <div className="bg-dark-950 px-4 py-2 flex items-center gap-3">
        <button onClick={() => { if (elapsed >= totalDur) { setElapsed(0); setCurrentPlan(0); lastTimeRef.current = 0 }; setPlaying(!playing) }}
          className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors">
          {playing ? <Pause size={11} className="text-white/80" /> : <Play size={11} fill="white" className="text-white/80 ml-0.5" />}
        </button>
        <span className="text-[10px] text-slate-600 tabular-nums min-w-[65px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt(elapsed)} / {fmt(totalDur)}</span>
        <div className="flex-1 flex items-center justify-center gap-2">
          {plans.map((p, i) => (
            <button key={i} onClick={() => { jumpTo(i); setPlaying(true) }}
              className="flex items-center gap-1 transition-all duration-300"
              style={{ opacity: i === currentPlan ? 1 : 0.3 }}>
              <div className="w-1.5 h-1.5 rounded-full transition-all" style={{
                backgroundColor: i === currentPlan ? p.color : i < currentPlan ? p.color : 'rgba(255,255,255,0.2)',
                transform: i === currentPlan ? 'scale(1.5)' : 'scale(1)',
              }} />
              <span className="text-[8px] text-slate-500 hidden sm:inline">{p.label}</span>
            </button>
          ))}
        </div>
        <span className="text-[9px] text-slate-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {current.model}
        </span>
      </div>
    </div>
  )
}
