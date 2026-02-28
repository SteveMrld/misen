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
  result: Play,
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
        {step.step === 'result' && <DemoResult />}
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
    { scene: 1, shot: 'PL', model: 'Kling', dur: 4.2, color: '#3B82F6', src: imgSc1P1.src, label: 'Fleuve au crépuscule' },
    { scene: 1, shot: 'GP', model: 'Veo', dur: 3.1, color: '#10B981', src: imgSc1P2.src, label: 'Visage dans l\'ombre' },
    { scene: 1, shot: 'Insert', model: 'Runway', dur: 2.8, color: '#8B5CF6', src: imgSc1P3.src, label: 'Photo ancienne' },
    { scene: 2, shot: 'PL', model: 'Sora', dur: 5.0, color: '#EC4899', src: imgSc2P1.src, label: 'Pont suspendu' },
    { scene: 2, shot: 'GP', model: 'Kling', dur: 3.5, color: '#3B82F6', src: imgSc2P2.src, label: 'Main tendue' },
    { scene: 2, shot: 'PM', model: 'Hailuo', dur: 4.0, color: '#D946EF', src: imgSc2P3.src, label: 'Silhouettes' },
    { scene: 3, shot: 'PM', model: 'Runway', dur: 3.8, color: '#8B5CF6', src: imgSc3P1.src, label: 'Couloir hôpital' },
    { scene: 3, shot: 'GP', model: 'Veo', dur: 3.2, color: '#10B981', src: imgSc3P2.src, label: 'Fenêtre brumeuse' },
    { scene: 4, shot: 'PL', model: 'Kling', dur: 5.5, color: '#3B82F6', src: imgSc4P1.src, label: 'Retrouvailles' },
    { scene: 4, shot: 'Insert', model: 'Seedance', dur: 2.5, color: '#14B8A6', src: imgSc4P2.src, label: 'Caillou rivière' },
  ]
  const sceneColors = ['#f97316', '#22d3ee', '#a78bfa', '#34d399']
  const total = plans.reduce((s, p) => s + p.dur, 0)

  return (
    <div className="bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-dark-700">
        <div className="flex items-center gap-2">
          <Camera size={14} className="text-slate-500" />
          <span className="text-xs text-slate-400 font-medium">{plans.length} plans • {total.toFixed(0)}s • 5 modèles IA</span>
        </div>
        <span className="text-[10px] text-slate-600">Les Deux Rives — Démo</span>
      </div>

      {/* Scene lanes */}
      <div className="px-3 pt-3 pb-1 flex items-center gap-1">
        {[1, 2, 3, 4].map(s => {
          const scenePlans = plans.filter(p => p.scene === s)
          const sceneDur = scenePlans.reduce((a, p) => a + p.dur, 0)
          return (
            <div key={s} className="h-5 rounded flex items-center justify-center text-[8px] font-bold tracking-wider" style={{
              width: `${(sceneDur / total) * 100}%`,
              backgroundColor: `${sceneColors[(s - 1) % sceneColors.length]}20`,
              color: sceneColors[(s - 1) % sceneColors.length],
            }}>
              SC{s}
            </div>
          )
        })}
      </div>

      {/* Timeline with thumbnails */}
      <div className="p-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5" style={{ minWidth: plans.length * 100 }}>
          {plans.map((p, i) => (
            <div key={i} className="flex-shrink-0 rounded-lg overflow-hidden border border-dark-700 hover:border-dark-500 transition-colors group" style={{ width: Math.max((p.dur / total) * 800, 90) }}>
              {/* Thumbnail */}
              <div className="relative aspect-video">
                <img src={p.src} alt={p.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {/* Plan badge */}
                <div className="absolute top-1 left-1 px-1 py-0.5 bg-black/60 rounded text-[7px] font-bold text-white backdrop-blur-sm">
                  P{i + 1}
                </div>
                {/* Model dot */}
                <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1 py-0.5 bg-black/60 rounded backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-[6px] text-white">{p.model}</span>
                </div>
                {/* Duration */}
                <div className="absolute bottom-1 right-1 text-[7px] text-white/80">{p.dur}s</div>
                {/* Shot type */}
                <div className="absolute bottom-1 left-1 text-[7px] text-white/70">{p.shot}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Playback bar */}
      <div className="px-3 pb-3">
        <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-500 to-cyan-500 rounded-full" style={{ width: '35%' }} />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[9px] text-slate-500">0:13</span>
          <span className="text-[9px] text-slate-500">0:{total.toFixed(0)}</span>
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

function DemoResult() {
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [currentPlan, setCurrentPlan] = useState(0)
  const [prevPlan, setPrevPlan] = useState(-1)
  const [transitioning, setTransitioning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const plans = [
    { src: imgSc1P1.src, label: 'SC1-P1', shot: 'Plan large', model: 'Kling 3.0', color: '#3B82F6', dur: 4.2, sub: '', direction: 'right' as const },
    { src: imgSc1P2.src, label: 'SC1-P2', shot: 'Gros plan', model: 'Veo 3.1', color: '#10B981', dur: 3.1, sub: 'On y va aujourd\'hui. Pas vrai\u00A0?', direction: 'in' as const },
    { src: imgSc1P3.src, label: 'SC1-P3', shot: 'Insert', model: 'Runway Gen-4.5', color: '#8B5CF6', dur: 2.8, sub: '', direction: 'left' as const },
    { src: imgSc2P1.src, label: 'SC2-P1', shot: 'Plan large', model: 'Sora 2', color: '#EC4899', dur: 5.0, sub: '', direction: 'right' as const },
    { src: imgSc2P2.src, label: 'SC2-P2', shot: 'Gros plan', model: 'Kling 3.0', color: '#3B82F6', dur: 3.5, sub: 'On se promet un truc\u2026', direction: 'in' as const },
    { src: imgSc2P3.src, label: 'SC2-P3', shot: 'Plan moyen', model: 'Hailuo 2.3', color: '#D946EF', dur: 4.0, sub: 'On fera tout ensemble.', direction: 'left' as const },
    { src: imgSc3P1.src, label: 'SC3-P1', shot: 'Travelling', model: 'Runway Gen-4.5', color: '#8B5CF6', dur: 3.8, sub: '\u00C7a fait deux ans.', direction: 'right' as const },
    { src: imgSc3P2.src, label: 'SC3-P2', shot: 'Gros plan', model: 'Veo 3.1', color: '#10B981', dur: 3.2, sub: 'On avait dit\u2026 ensemble.', direction: 'in' as const },
    { src: imgSc4P1.src, label: 'SC4-P1', shot: 'Plan large', model: 'Kling 3.0', color: '#3B82F6', dur: 5.5, sub: '', direction: 'out' as const },
    { src: imgSc4P2.src, label: 'SC4-P2', shot: 'Insert', model: 'Seedance 2.0', color: '#14B8A6', dur: 2.5, sub: '', direction: 'in' as const },
  ]

  const totalDur = plans.reduce((s, p) => s + p.dur, 0)

  // Ken Burns CSS class per direction
  const kenBurns: Record<string, string> = {
    right: 'animate-[kb-right_8s_ease-in-out_infinite]',
    left: 'animate-[kb-left_8s_ease-in-out_infinite]',
    in: 'animate-[kb-in_8s_ease-in-out_infinite]',
    out: 'animate-[kb-out_8s_ease-in-out_infinite]',
  }

  // Find which plan we should be on based on elapsed time
  const getPlanAtTime = (t: number) => {
    let acc = 0
    for (let i = 0; i < plans.length; i++) {
      acc += plans[i].dur
      if (t < acc) return i
    }
    return plans.length - 1
  }

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 0.1
        if (next >= totalDur) {
          // Loop
          setPrevPlan(plans.length - 1)
          setCurrentPlan(0)
          setTransitioning(true)
          setTimeout(() => { setTransitioning(false); setPrevPlan(-1) }, 1200)
          return 0
        }
        const newPlan = getPlanAtTime(next)
        if (newPlan !== getPlanAtTime(prev)) {
          setPrevPlan(getPlanAtTime(prev))
          setCurrentPlan(newPlan)
          setTransitioning(true)
          setTimeout(() => { setTransitioning(false); setPrevPlan(-1) }, 1200)
        }
        return next
      })
    }, 100)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing])

  const current = plans[currentPlan]
  const prev = prevPlan >= 0 ? plans[prevPlan] : null
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  // Subtitle fade logic
  const planStartTime = plans.slice(0, currentPlan).reduce((s, p) => s + p.dur, 0)
  const planElapsed = elapsed - planStartTime
  const subVisible = current.sub && planElapsed > 0.5 && planElapsed < current.dur - 0.3

  return (
    <div className="bg-black rounded-xl overflow-hidden shadow-2xl shadow-black/80 border border-white/[0.06]">
      {/* Cinematic player */}
      <div className="relative aspect-[2.39/1] bg-black overflow-hidden cursor-pointer" onClick={() => { setPlaying(!playing); if (elapsed >= totalDur) setElapsed(0) }}>
        {/* Previous image (crossfade out) */}
        {prev && transitioning && (
          <img
            src={prev.src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out opacity-0"
          />
        )}
        {/* Current image with Ken Burns */}
        <img
          src={current.src}
          alt={current.label}
          key={currentPlan}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out ${transitioning ? 'opacity-100' : 'opacity-100'}`}
          style={{
            animation: playing ? `kb-${current.direction} ${current.dur * 1.5}s ease-in-out forwards` : 'none',
            transformOrigin: current.direction === 'right' ? 'left center' : current.direction === 'left' ? 'right center' : 'center center',
          }}
        />

        {/* Cinematic vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />

        {/* Subtitle */}
        <div className={`absolute bottom-6 left-0 right-0 text-center transition-opacity duration-500 ${subVisible ? 'opacity-100' : 'opacity-0'}`}>
          <span className="bg-black/70 backdrop-blur-sm px-5 py-2 rounded-md text-white text-sm md:text-base font-medium tracking-wide shadow-lg">
            {current.sub}
          </span>
        </div>

        {/* Play button overlay (initial state) */}
        {!playing && elapsed === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-4">Les Deux Rives</p>
            <button className="w-20 h-20 rounded-full bg-orange-600/90 hover:bg-orange-500 flex items-center justify-center shadow-2xl shadow-orange-600/30 transition-all hover:scale-110 group">
              <Play size={32} fill="white" className="text-white ml-1 group-hover:scale-110 transition-transform" />
            </button>
            <p className="text-white/40 text-[10px] tracking-widest uppercase mt-4">Un film MISEN</p>
          </div>
        )}

        {/* Pause icon flash */}
        {!playing && elapsed > 0 && elapsed < totalDur && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Pause size={24} className="text-white/80" />
            </div>
          </div>
        )}

        {/* Film end */}
        {!playing && elapsed >= totalDur - 0.2 && elapsed > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-[2px]">
            <p className="text-white/80 text-lg font-display tracking-wider">FIN</p>
            <p className="text-white/40 text-xs mt-2">Les Deux Rives — Un film MISEN</p>
            <button onClick={(e) => { e.stopPropagation(); setElapsed(0); setCurrentPlan(0); setPlaying(true) }}
              className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5">
              <Play size={12} fill="white" /> Rejouer
            </button>
          </div>
        )}

        {/* Top-left: plan info (subtle) */}
        {playing && (
          <div className="absolute top-3 left-3 flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-[9px] text-white/70 font-medium">
              {current.label} · {current.shot}
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: current.color }} />
              <span className="text-[9px] text-white/60">{current.model}</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar — thin cinematic style */}
      <div className="relative h-1 bg-dark-900 cursor-pointer group" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const pct = (e.clientX - rect.left) / rect.width
        const newTime = pct * totalDur
        setElapsed(newTime)
        const newPlan = getPlanAtTime(newTime)
        if (newPlan !== currentPlan) {
          setPrevPlan(currentPlan)
          setCurrentPlan(newPlan)
          setTransitioning(true)
          setTimeout(() => { setTransitioning(false); setPrevPlan(-1) }, 800)
        }
      }}>
        {/* Scene segments */}
        {(() => {
          let acc = 0
          return plans.map((p, i) => {
            const left = (acc / totalDur) * 100
            acc += p.dur
            return <div key={i} className="absolute top-0 h-full border-r border-dark-800/50" style={{ left: `${left}%`, width: `${(p.dur / totalDur) * 100}%` }} />
          })
        })()}
        {/* Progress fill */}
        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-100 group-hover:h-1.5 group-hover:-top-0.5" style={{ width: `${(elapsed / totalDur) * 100}%` }} />
      </div>

      {/* Controls bar */}
      <div className="bg-dark-950 px-4 py-2.5 flex items-center gap-3">
        <button onClick={() => { setPlaying(!playing); if (elapsed >= totalDur) { setElapsed(0); setCurrentPlan(0) } }}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
          {playing ? <Pause size={12} className="text-white" /> : <Play size={12} fill="white" className="text-white ml-0.5" />}
        </button>
        <span className="text-[11px] text-slate-500 tabular-nums min-w-[70px]">{fmt(elapsed)} / {fmt(totalDur)}</span>

        {/* Plan dots */}
        <div className="flex-1 flex items-center justify-center gap-1">
          {plans.map((p, i) => (
            <button key={i} onClick={() => {
              let acc = 0; for (let j = 0; j < i; j++) acc += plans[j].dur
              setElapsed(acc); setPrevPlan(currentPlan); setCurrentPlan(i)
              setTransitioning(true); setTimeout(() => { setTransitioning(false); setPrevPlan(-1) }, 800)
            }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentPlan ? 'bg-orange-500 scale-150' : i < currentPlan ? 'bg-orange-500/40' : 'bg-white/10'}`}
              title={p.label}
            />
          ))}
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-1.5">
          <button className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-medium rounded transition-colors flex items-center gap-1">
            <ArrowRight size={10} /> Export 4K
          </button>
        </div>
      </div>

      {/* Ken Burns keyframes — injected as style */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes kb-right { from { transform: scale(1.05) translateX(-1%); } to { transform: scale(1.08) translateX(1%); } }
        @keyframes kb-left { from { transform: scale(1.05) translateX(1%); } to { transform: scale(1.08) translateX(-1%); } }
        @keyframes kb-in { from { transform: scale(1.0); } to { transform: scale(1.12); } }
        @keyframes kb-out { from { transform: scale(1.12); } to { transform: scale(1.0); } }
      `}} />
    </div>
  )
}
