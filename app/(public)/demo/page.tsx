'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Play, Pause, SkipForward, ChevronRight,
  Film, Brain, Clock, Sparkles, Image, Subtitles, Zap,
  Camera, Users, TrendingUp, Shield, DollarSign, Eye,
  ArrowRight, X
} from 'lucide-react'
import { DEMO_SCRIPT, DEMO_WALKTHROUGH } from '@/lib/demo/data'

// Static image imports
import imgSc1P1 from '@/public/images/demo_sc1_p1_fleuve.png'
import imgSc1P2 from '@/public/images/demo_sc1_p2_visage.png'
import imgSc1P3 from '@/public/images/demo_sc1_p3_photo.png'
import imgSc2P1 from '@/public/images/demo_sc2_p1_pont.png'
import imgSc2P2 from '@/public/images/demo_sc2_p2_main.png'
import imgSc2P3 from '@/public/images/demo_sc2_p3_silhouettes.png'
import imgSc3P1 from '@/public/images/demo_sc3_p1_hopital.png'
import imgSc3P2 from '@/public/images/demo_sc3_p2_fenetre.png'
import imgSc4P1 from '@/public/images/demo_sc4_p1_retrouvailles.png'
import imgSc4P2 from '@/public/images/demo_sc4_p2_caillou.png'
import imgMediaAction from '@/public/images/media_action.png'
import imgMediaDrama from '@/public/images/media_drama.png'
import imgMediaScifi from '@/public/images/media_scifi.png'
import imgMediaDocu from '@/public/images/media_docu.png'
import imgMediaNoir from '@/public/images/media_noir.png'
import imgMediaNature from '@/public/images/media_nature.png'
import Link from 'next/link'

const TAB_ICONS: Record<string, any> = {
  script: Film,
  analyse: Brain,
  timeline: Clock,
  copilot: Sparkles,
  media: Image,
  subtitles: Subtitles,
  generate: Zap,
}

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const [typedText, setTypedText] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const step = DEMO_WALKTHROUGH[currentStep]

  // Auto-play
  useEffect(() => {
    if (!autoPlay) return
    timerRef.current = setTimeout(() => {
      if (currentStep < DEMO_WALKTHROUGH.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        setAutoPlay(false)
      }
    }, step.duration)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [autoPlay, currentStep, step.duration])

  // Typing effect for narration
  useEffect(() => {
    setTypedText('')
    let i = 0
    const interval = setInterval(() => {
      if (i < step.narration.length) {
        setTypedText(step.narration.slice(0, i + 1))
        i++
      } else clearInterval(interval)
    }, 20)
    return () => clearInterval(interval)
  }, [currentStep, step.narration])

  const Icon = TAB_ICONS[step.step] || Film

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-dark-800">
        <div className="flex items-center gap-3">
          <Play size={20} className="text-orange-500" fill="currentColor" />
          <span className="text-sm font-bold text-slate-50">MISEN</span>
          <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">DÉMO</span>
        </div>
        <Link href="/" className="p-2 rounded-lg hover:bg-white/5">
          <X size={18} className="text-slate-400" />
        </Link>
      </div>

      {/* Progress bar */}
      <div className="px-6 py-3">
        <div className="flex items-center gap-1">
          {DEMO_WALKTHROUGH.map((w, i) => {
            const StepIcon = TAB_ICONS[w.step] || Film
            return (
              <button
                key={i}
                onClick={() => { setCurrentStep(i); setAutoPlay(false) }}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-xs transition-all ${
                  i === currentStep ? 'bg-orange-600 text-white' :
                  i < currentStep ? 'bg-orange-500/20 text-orange-400' : 'bg-dark-800 text-slate-600'
                }`}
              >
                <StepIcon size={12} />
                <span className="hidden md:inline">{w.title.replace(/^\d+\.\s*/, '')}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="px-6 py-6 max-w-5xl mx-auto">
        {/* Step header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Icon size={24} className="text-orange-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-50">{step.title}</h2>
            <p className="text-sm text-slate-400">Étape {currentStep + 1} / {DEMO_WALKTHROUGH.length}</p>
          </div>
        </div>

        {/* Narration box */}
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse mt-2 flex-shrink-0" />
            <p className="text-sm text-slate-300 leading-relaxed">{typedText}<span className="text-orange-500 animate-pulse">|</span></p>
          </div>
        </div>

        {/* Step-specific content */}
        {step.step === 'script' && <DemoScript />}
        {step.step === 'analyse' && <DemoAnalyse />}
        {step.step === 'timeline' && <DemoTimeline />}
        {step.step === 'copilot' && <DemoCopilot />}
        {step.step === 'media' && <DemoMedia />}
        {step.step === 'subtitles' && <DemoSubtitles />}
        {step.step === 'generate' && <DemoGenerate />}
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 inset-x-0 bg-dark-950 border-t border-dark-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {autoPlay ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Auto-play</>}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-3 py-2 bg-dark-800 hover:bg-dark-700 disabled:opacity-30 text-slate-200 text-sm rounded-lg transition-colors"
            >
              ← Précédent
            </button>
            {currentStep < DEMO_WALKTHROUGH.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-3 py-2 bg-dark-800 hover:bg-dark-700 text-slate-200 text-sm rounded-lg transition-colors flex items-center gap-1"
              >
                Suivant <ChevronRight size={14} />
              </button>
            ) : (
              <Link
                href="/register"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                Créer mon compte <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══ DEMO STEP COMPONENTS ═══

function DemoScript() {
  return (
    <div className="rounded-xl border border-dark-700 bg-dark-900 p-4 max-h-80 overflow-y-auto">
      <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{DEMO_SCRIPT}</pre>
    </div>
  )
}

function DemoAnalyse() {
  const stats = [
    { icon: Film, label: 'Scènes', value: '8' },
    { icon: Eye, label: 'Plans', value: '17' },
    { icon: Users, label: 'Personnages', value: '4' },
    { icon: DollarSign, label: 'Coût estimé', value: '$2.45' },
  ]
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-dark-900 border border-dark-700 rounded-xl p-3 text-center">
            <s.icon size={18} className="text-orange-500/60 mx-auto mb-1" />
            <p className="text-lg font-bold text-slate-100">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
      {/* Plan previews with real images */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { src: imgSc1P1.src, label: 'SC1-P1', type: 'PL · pan', model: 'Kling', color: '#3B82F6' },
          { src: imgSc1P2.src, label: 'SC1-P2', type: 'GP · fixe', model: 'Veo', color: '#10B981' },
          { src: imgSc1P3.src, label: 'SC1-P3', type: 'Insert · dolly', model: 'Runway', color: '#8B5CF6' },
          { src: imgSc2P1.src, label: 'SC2-P1', type: 'PL · travelling', model: 'Sora', color: '#EC4899' },
          { src: imgSc2P2.src, label: 'SC2-P2', type: 'GP · fixe', model: 'Kling', color: '#3B82F6' },
          { src: imgSc2P3.src, label: 'SC2-P3', type: 'PM · steadicam', model: 'Hailuo', color: '#D946EF' },
          { src: imgSc3P1.src, label: 'SC3-P1', type: 'PM · travelling', model: 'Runway', color: '#8B5CF6' },
          { src: imgSc3P2.src, label: 'SC3-P2', type: 'GP · fixe', model: 'Veo', color: '#10B981' },
          { src: imgSc4P1.src, label: 'SC4-P1', type: 'PL · crane', model: 'Kling', color: '#3B82F6' },
          { src: imgSc4P2.src, label: 'SC4-P2', type: 'Insert · fixe', model: 'Seedance', color: '#14B8A6' },
        ].map((p) => (
          <div key={p.label} className="relative rounded-lg overflow-hidden border border-dark-700 group">
            <img src={p.src} alt={p.label} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute top-1.5 left-1.5">
              <span className="text-[9px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">{p.label}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <p className="text-[9px] text-slate-300">{p.type}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-[8px] text-slate-500">{p.model}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-red-400" />
          <span className="text-sm text-slate-200 font-medium">Courbe de tension</span>
        </div>
        <div className="flex items-end gap-2 h-20">
          {[5, 3, 8, 7, 4, 9].map((t, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-red-500/60 rounded-t transition-all" style={{ height: `${t * 8}px` }} />
              <span className="text-[9px] text-slate-600">S{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Users size={16} className="text-blue-400" />
          <span className="text-sm text-slate-200 font-medium">Personnages détectés</span>
        </div>
        {['Adrien — Homme, 30 ans. Porte le deuil de son frère jumeau.', 'Léo — Frère jumeau d\'Adrien. Décédé.', 'Infirmière — Personnel hospitalier.', 'Contrôleur — Cinéma.'].map((c, i) => (
          <p key={i} className="text-xs text-slate-400 py-1">{c}</p>
        ))}
      </div>
    </div>
  )
}

function DemoTimeline() {
  const plans = [
    { scene: 1, shot: 'PDE', model: 'Kling', dur: 3 },
    { scene: 1, shot: 'GP', model: 'Runway', dur: 4 },
    { scene: 2, shot: 'PL', model: 'Veo', dur: 5 },
    { scene: 2, shot: 'PM', model: 'Kling', dur: 3 },
    { scene: 3, shot: 'TL', model: 'Sora', dur: 4 },
    { scene: 3, shot: 'GP', model: 'Runway', dur: 3 },
    { scene: 4, shot: 'PM', model: 'Kling', dur: 3 },
    { scene: 4, shot: 'GP', model: 'Runway', dur: 2 },
    { scene: 5, shot: 'PL', model: 'Veo', dur: 5 },
    { scene: 5, shot: 'GP', model: 'Sora', dur: 4 },
    { scene: 6, shot: 'PDE', model: 'Kling', dur: 4 },
    { scene: 6, shot: 'Insert', model: 'Runway', dur: 3 },
    { scene: 6, shot: 'PL', model: 'Veo', dur: 5 },
  ]
  const colors = ['#f97316', '#22d3ee', '#a78bfa', '#34d399', '#f472b6', '#fbbf24']
  const total = plans.reduce((s, p) => s + p.dur, 0)
  let acc = 0

  return (
    <div className="bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
      <div className="px-3 py-2 flex items-center gap-2 border-b border-dark-700">
        <Camera size={14} className="text-slate-500" />
        <span className="text-xs text-slate-400 font-medium">13 plans • {total}s • 4 modèles IA</span>
      </div>
      <div className="p-3">
        <div className="relative h-14 bg-dark-800 rounded">
          {plans.map((p, i) => {
            const left = (acc / total) * 100
            acc += p.dur
            return (
              <div key={i} className="absolute top-0 h-full border-r border-dark-700/50 flex flex-col justify-center px-1" style={{
                left: `${left}%`, width: `${(p.dur / total) * 100}%`,
                background: `${colors[(p.scene - 1) % colors.length]}25`,
              }}>
                <span className="text-[7px] text-slate-300 font-medium">P{i + 1}</span>
                <span className="text-[6px] text-slate-500">{p.shot} · {p.model}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function DemoCopilot() {
  const suggestions = [
    { icon: '🎬', title: 'Ça me fait penser à...', detail: 'Cinema Paradiso (Tornatore, 1988) — la scène du cinéma. Technique recommandée : lumière projetée sur les visages, contrejour de l\'écran.' },
    { icon: '🎵', title: 'Suggestion musicale', detail: 'Piano solo minimaliste type Yann Tiersen. Les cordes lentes de Max Richter (On the Nature of Daylight) colleraient aussi parfaitement au thème du deuil.' },
    { icon: '📐', title: 'As-tu pensé à...', detail: 'Un plan-séquence sans coupe pour la scène de l\'hôpital. La tension continue sans montage renforcerait l\'émotion.' },
    { icon: '🪑', title: 'L\'art du vide', detail: 'La place vide au cinéma est un personnage. Yasujirō Ozu filmait les espaces vides après le départ des personnages — les "pillow shots".' },
    { icon: '💡', title: 'Astuce flashback', detail: 'Change le ratio d\'image (2.35:1 → 4:3) ou désature légèrement pour distinguer les temporalités. Nolan utilise IMAX vs 35mm dans Oppenheimer.' },
  ]

  return (
    <div className="space-y-3">
      {suggestions.map((s, i) => (
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

function DemoMedia() {
  const results = [
    { label: 'Poursuite urbaine', src: imgMediaAction.src },
    { label: 'Conversation intime', src: imgMediaDrama.src },
    { label: 'Laboratoire futuriste', src: imgMediaScifi.src },
    { label: 'Artisan au travail', src: imgMediaDocu.src },
    { label: 'Rue pluvieuse', src: imgMediaNoir.src },
    { label: 'Forêt brumeuse', src: imgMediaNature.src },
  ]

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-9 px-3 bg-dark-900 border border-dark-700 rounded-lg flex items-center text-sm text-slate-500">
          🔍 scène action nuit urbaine…
        </div>
        <div className="px-3 py-2 bg-orange-600 text-white text-xs font-medium rounded-lg">Pexels</div>
        <div className="px-3 py-2 bg-dark-700 text-slate-300 text-xs font-medium rounded-lg">Pixabay</div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {results.map((r, i) => (
          <div key={i} className="relative aspect-video rounded-lg border border-dark-700 overflow-hidden group">
            <img src={r.src} alt={r.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span className="absolute bottom-2 left-2 text-[10px] text-white font-medium">{r.label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-3">Images de référence pour construire votre moodboard. Connectez Pexels/Pixabay dans les réglages.</p>
    </div>
  )
}

function DemoSubtitles() {
  const subs = [
    { time: '0:03', char: 'ADRIEN', text: 'On y va aujourd\'hui. Pas vrai ?' },
    { time: '0:12', char: 'LÉO', text: 'On se promet un truc. Même quand on sera grands…' },
    { time: '0:16', char: 'ADRIEN', text: 'On fera tout ensemble.' },
    { time: '0:24', char: 'INFIRMIÈRE', text: 'Vous pouvez arrêter de venir… ça fait deux ans.' },
    { time: '0:28', char: 'ADRIEN', text: 'On avait dit… ensemble.' },
    { time: '0:35', char: 'CONTRÔLEUR', text: 'Vous êtes seul ?' },
    { time: '0:37', char: 'ADRIEN', text: 'Non. Jamais.' },
  ]

  return (
    <div className="space-y-2">
      {subs.map((s, i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-dark-900 rounded-lg border border-dark-700">
          <span className="text-[10px] text-slate-600 font-mono w-10 pt-0.5">{s.time}</span>
          <span className="text-xs text-orange-400 font-medium w-24 flex-shrink-0">{s.char}</span>
          <p className="text-sm text-slate-200 flex-1">{s.text}</p>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-3">
        <div className="px-3 py-1.5 bg-dark-800 border border-dark-700 rounded text-xs text-slate-300">📥 SRT</div>
        <div className="px-3 py-1.5 bg-dark-800 border border-dark-700 rounded text-xs text-slate-300">📥 VTT</div>
        <div className="px-3 py-1.5 bg-dark-800 border border-dark-700 rounded text-xs text-slate-300">🔊 Voix off Browser</div>
        <div className="px-3 py-1.5 bg-dark-800 border border-dark-700 rounded text-xs text-slate-300">🎙️ ElevenLabs</div>
      </div>
    </div>
  )
}

function DemoGenerate() {
  const plans = [
    { shot: 'PDE Appartement', model: 'Kling 3.0', status: '✓', cost: '$0.20' },
    { shot: 'GP Miroir Adrien', model: 'Runway Gen-4.5', status: '✓', cost: '$0.25' },
    { shot: 'PL Rivière enfance', model: 'Veo 3.1', status: '✓', cost: '$0.15' },
    { shot: 'PM Jumeaux', model: 'Kling 3.0', status: '✓', cost: '$0.20' },
    { shot: 'TL Couloir hôpital', model: 'Sora 2', status: '⟳', cost: '$0.30' },
    { shot: 'GP Adrien hôpital', model: 'Runway Gen-4.5', status: '…', cost: '$0.25' },
  ]

  return (
    <div className="space-y-2">
      {plans.map((p, i) => (
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
        <p className="text-xs text-slate-500 mt-1">13 plans × 4 modèles IA × $2.45 budget total</p>
      </div>
    </div>
  )
}
