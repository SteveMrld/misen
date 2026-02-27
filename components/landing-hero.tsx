'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Play, ArrowRight, Brain, Film, Zap, Check, ChevronDown,
  Terminal, Users, Shield, Eye, DollarSign, Cpu, BookOpen,
  Palette, MessageSquare, Ban, TrendingUp, Camera, Sparkles
} from 'lucide-react'

const MODELS = [
  { id: 'kling3', name: 'Kling 3.0', color: '#3B82F6', tag: 'Réalisme' },
  { id: 'runway4.5', name: 'Runway Gen-4.5', color: '#8B5CF6', tag: 'Style' },
  { id: 'sora2', name: 'Sora 2', color: '#EC4899', tag: 'VFX' },
  { id: 'veo3.1', name: 'Veo 3.1', color: '#10B981', tag: 'Dialogue' },
  { id: 'seedance2', name: 'Seedance 2.0', color: '#14B8A6', tag: 'Mouvement' },
  { id: 'wan2.5', name: 'Wan 2.5', color: '#6366F1', tag: 'Animation' },
  { id: 'hailuo2.3', name: 'Hailuo 2.3', color: '#D946EF', tag: 'Cohérence' },
]

const ENGINES = [
  { name: 'Intent Parser', icon: Terminal },
  { name: 'Grammar', icon: BookOpen },
  { name: 'Character Bible', icon: Users },
  { name: 'Contextual Prompt', icon: MessageSquare },
  { name: 'Model Syntax', icon: Cpu },
  { name: 'Negative Prompt', icon: Ban },
  { name: 'Compliance', icon: Shield },
  { name: 'Continuity', icon: Eye },
  { name: 'Tension Curve', icon: TrendingUp },
  { name: 'Cost Router', icon: DollarSign },
  { name: 'Consistency', icon: Palette },
  { name: 'Memory', icon: Brain },
  { name: 'Scene Splitter', icon: Film },
]

export function LandingHero({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const router = useRouter()
  const [selectedModel, setSelectedModel] = useState(0)
  const [showModels, setShowModels] = useState(false)
  const [showEngines, setShowEngines] = useState(false)
  const [scriptPreview, setScriptPreview] = useState('')
  const model = MODELS[selectedModel]

  const handleGo = () => {
    router.push(isLoggedIn ? '/dashboard' : '/register')
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* ═══ NAV ═══ */}
      <nav className="flex items-center justify-between px-6 py-4 relative z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Play size={14} className="text-white ml-0.5" fill="white" />
          </div>
          <span className="font-display text-xl text-white tracking-tight">MISEN</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/demo" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors">
            Démo
          </Link>
          <Link href="/login" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors">
            Connexion
          </Link>
          <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-xl transition-colors">
            Commencer
          </Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img src="/images/hero_bg.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950/60 via-dark-950/80 to-dark-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950/80 via-transparent to-dark-950/80" />
        </div>

        {/* NEW badge */}
        <div className="relative z-10 mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <span className="text-[10px] font-bold tracking-wider text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded">NEW</span>
            <span className="text-sm text-slate-300">13 moteurs d&apos;analyse · 7 modèles IA vidéo</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="relative z-10 font-display text-5xl md:text-7xl text-center text-white mb-4 tracking-tight" style={{ fontWeight: 500, lineHeight: 1.1 }}>
          Du scénario<br />
          <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
            à l&apos;écran.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="relative z-10 text-base md:text-lg text-slate-400 text-center max-w-xl mb-10 leading-relaxed">
          Collez votre scénario. MISEN analyse chaque plan avec 13 moteurs
          et orchestre les meilleurs modèles IA vidéo. Du concept au cinéma, en secondes.
        </p>

        {/* ═══ ACTION BOX (Clonizer-style) ═══ */}
        <div className="relative z-10 w-full max-w-2xl">
          <div className="bg-dark-900/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl shadow-black/40">
            {/* Model selector row */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowModels(!showModels)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-colors"
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: model.color }} />
                <span className="text-sm font-medium text-white">{model.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-white/[0.06] text-slate-400 rounded">{model.tag}</span>
                <ChevronDown size={14} className="text-slate-500" />
              </button>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Brain size={12} /> 13 moteurs
              </div>
            </div>

            {/* Model dropdown */}
            {showModels && (
              <div className="mb-4 grid grid-cols-2 gap-1.5 p-2 bg-dark-800/50 rounded-xl border border-dark-700">
                {MODELS.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedModel(i); setShowModels(false) }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${i === selectedModel ? 'bg-white/[0.08] text-white' : 'hover:bg-white/[0.04] text-slate-400'}`}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                    <span className="text-xs font-medium">{m.name}</span>
                    <span className="text-[9px] text-slate-600 ml-auto">{m.tag}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Script input */}
            <div className="relative">
              <textarea
                value={scriptPreview}
                onChange={(e) => setScriptPreview(e.target.value)}
                placeholder="Collez votre scénario ici..."
                rows={3}
                className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none leading-relaxed"
              />
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
              <p className="text-[11px] text-slate-600">
                Entrée pour analyser · Crédits gratuits · 7 modèles disponibles
              </p>
              <button
                onClick={handleGo}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-500/30"
              >
                <Play size={14} fill="white" /> Analyser
              </button>
            </div>
          </div>
        </div>

        {/* ═══ STATS BAR ═══ */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 w-full max-w-2xl">
          {[
            { value: '13', label: 'Moteurs IA', sub: 'analyse parallèle' },
            { value: '7', label: 'Modèles vidéo', sub: 'orchestrés' },
            { value: '4K', label: 'Résolution max', sub: 'cinéma-grade' },
            { value: '<10s', label: 'Par analyse', sub: 'temps réel' },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-display font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ VISUAL SHOWCASE ═══ */}
      <section className="px-6 py-16 max-w-5xl mx-auto w-full">
        <h2 className="font-display text-2xl text-white text-center mb-3 tracking-tight">
          Du concept au rendu
        </h2>
        <p className="text-sm text-slate-500 text-center mb-8">
          MISEN analyse votre scénario et orchestre la production visuelle
        </p>
        {/* Demo scene grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {[
            { src: '/images/demo_sc1_p1_fleuve.png', label: 'SC1-P1 · Plan large', model: 'Kling 3.0', color: '#3B82F6' },
            { src: '/images/demo_sc1_p2_visage.png', label: 'SC1-P2 · Gros plan', model: 'Veo 3.1', color: '#10B981' },
            { src: '/images/demo_sc1_p3_photo.png', label: 'SC1-P3 · Insert', model: 'Runway Gen-4.5', color: '#8B5CF6' },
            { src: '/images/demo_sc2_p1_pont.png', label: 'SC2-P1 · Plan large', model: 'Sora 2', color: '#EC4899' },
            { src: '/images/demo_sc2_p2_main.png', label: 'SC2-P2 · Gros plan', model: 'Kling 3.0', color: '#3B82F6' },
            { src: '/images/demo_sc2_p3_silhouettes.png', label: 'SC2-P3 · Plan moyen', model: 'Hailuo 2.3', color: '#D946EF' },
          ].map((scene) => (
            <div key={scene.label} className="group relative rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/[0.15] transition-all">
              <img src={scene.src} alt={scene.label} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-[11px] text-white font-medium">{scene.label}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: scene.color }} />
                  <span className="text-[9px] text-slate-400">{scene.model}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mockups */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <img src="/images/mockup_desktop.png" alt="MISEN Desktop" className="w-full md:w-[55%] rounded-xl border border-white/[0.08] shadow-2xl shadow-black/50" />
          <img src="/images/mockup_mobile.png" alt="MISEN Mobile" className="w-40 md:w-32 rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/50" />
        </div>
      </section>

      {/* ═══ MODELS SHOWCASE ═══ */}
      <section className="px-6 py-16 max-w-5xl mx-auto w-full">
        <h2 className="font-display text-2xl text-white text-center mb-3 tracking-tight">
          7 modèles IA orchestrés
        </h2>
        <p className="text-sm text-slate-500 text-center mb-8">
          Chaque plan est assigné au modèle optimal selon son contenu
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'kling3', name: 'Kling 3.0', tag: 'Réalisme · Physique', color: '#3B82F6', src: '/images/model_kling.png' },
            { id: 'runway', name: 'Runway Gen-4.5', tag: 'Style · Contrôle', color: '#8B5CF6', src: '/images/model_runway.png' },
            { id: 'sora', name: 'Sora 2', tag: 'VFX · Émotion', color: '#EC4899', src: '/images/model_sora.png' },
            { id: 'veo', name: 'Veo 3.1', tag: 'Dialogue · Audio', color: '#10B981', src: '/images/model_veo.png' },
            { id: 'seedance', name: 'Seedance 2.0', tag: 'Mouvement · Multimodal', color: '#14B8A6', src: '/images/model_seedance.png' },
            { id: 'wan', name: 'Wan 2.5', tag: 'Animation · Caméra', color: '#6366F1', src: '/images/model_wan.png' },
            { id: 'hailuo', name: 'Hailuo 2.3', tag: 'Cohérence personnage', color: '#D946EF', src: '/images/model_hailuo.png' },
          ].map((m) => (
            <div key={m.id} className="group relative rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/[0.15] transition-all">
              <img src={m.src} alt={m.name} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-xs font-medium text-white">{m.name}</span>
                </div>
                <p className="text-[10px] text-slate-400">{m.tag}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 13 ENGINES ═══ */}
      <section className="px-6 py-16 max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl text-white mb-3 tracking-tight">13 moteurs d&apos;analyse</h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">Chaque scène passe au crible de moteurs spécialisés qui travaillent en synergie</p>
        </div>
        <button onClick={() => setShowEngines(!showEngines)} className="mx-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] text-sm text-slate-400 hover:text-white transition-all mb-4">
          {showEngines ? 'Masquer' : 'Voir'} les 13 moteurs <ChevronDown size={14} className={`transition-transform ${showEngines ? 'rotate-180' : ''}`} />
        </button>
        {showEngines && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 animate-fade-in">
            {ENGINES.map((e) => (
              <div key={e.name} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors group">
                <e.icon size={16} className="text-orange-500/60 group-hover:text-orange-400 transition-colors flex-shrink-0" />
                <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">{e.name}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="px-6 py-16 max-w-4xl mx-auto w-full">
        <h2 className="font-display text-2xl text-white text-center mb-10 tracking-tight">Comment ça marche</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Collez', desc: 'Votre scénario, traitement, séquencier...', src: '/images/step_script.png', color: '#F97316' },
            { step: '02', title: 'Analysez', desc: '13 moteurs décomposent chaque plan', src: '/images/step_analysis.png', color: '#F97316' },
            { step: '03', title: 'Storyboard', desc: 'Plans visuels avec caméra et cadrage', src: '/images/step_storyboard.png', color: '#06B6D4' },
            { step: '04', title: 'Générez', desc: 'Prompts optimisés, modèle assigné', src: '/images/step_render.png', color: '#06B6D4' },
          ].map((s) => (
            <div key={s.step} className="group">
              <div className="relative rounded-xl overflow-hidden mb-3 border border-white/[0.06]">
                <img src={s.src} alt={s.title} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-2 left-2 text-[10px] font-bold tracking-widest px-2 py-0.5 rounded" style={{ color: s.color, backgroundColor: `${s.color}15` }}>{s.step}</div>
              </div>
              <h3 className="text-sm font-semibold text-white mb-0.5">{s.title}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="px-6 py-16 max-w-4xl mx-auto w-full">
        <h2 className="font-display text-2xl text-white text-center mb-10 tracking-tight">Tarifs simples</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Free', price: '0€', desc: '3 projets · 5 analyses/jour', features: ['13 moteurs', 'Mode Simple', 'Export prompts', '7 modèles'] },
            { name: 'Studio', price: '19€', desc: 'Projets illimités · Analyses illimitées', features: ['Tout Free +', 'Mode Expert', 'Timeline & Copilote', 'Média bank'], glow: true },
            { name: 'Production', price: '49€', desc: 'Équipe · API · Priorité', features: ['Tout Studio +', 'Génération vidéo', 'API access', 'Support prioritaire'] },
          ].map((p) => (
            <div key={p.name} className={`rounded-2xl p-6 border transition-all ${p.glow ? 'bg-orange-600/[0.06] border-orange-500/30 shadow-lg shadow-orange-600/5' : 'bg-white/[0.02] border-white/[0.06]'}`}>
              <span className={`text-xs font-bold tracking-wider ${p.glow ? 'text-orange-400' : 'text-slate-500'}`}>{p.name.toUpperCase()}</span>
              <div className="mt-3 mb-1">
                <span className="font-display text-3xl text-white">{p.price}</span>
                <span className="text-sm text-slate-500">/mois</span>
              </div>
              <p className="text-xs text-slate-500 mb-5">{p.desc}</p>
              <div className="space-y-2 mb-6">
                {p.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check size={12} className={p.glow ? 'text-orange-500' : 'text-slate-600'} /> {f}
                  </div>
                ))}
              </div>
              <Link href="/register" className={`block text-center py-2.5 rounded-xl text-sm font-medium transition-colors ${p.glow ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-white/[0.05] hover:bg-white/[0.08] text-slate-300'}`}>
                {p.glow ? 'Commencer' : 'Essayer'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-6 py-8 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Play size={10} className="text-white ml-0.5" fill="white" />
              </div>
              <span className="font-display text-base text-white">MISEN</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">Mise en Scène Numérique — par Steve Moradel</p>
          </div>
          <div className="flex items-center gap-5 text-xs text-slate-600">
            <Link href="/demo" className="hover:text-slate-300 transition-colors">Démo</Link>
            <Link href="/login" className="hover:text-slate-300 transition-colors">Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
