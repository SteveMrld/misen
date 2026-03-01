'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Only use images that actually look good
import heroBg from '@/public/images/hero_bg.png'
import demoSc1P1 from '@/public/images/demo_sc1_p1_fleuve.png'
import demoSc1P2 from '@/public/images/demo_sc1_p2_visage.png'
import demoSc1P3 from '@/public/images/demo_sc1_p3_photo.png'
import demoSc2P1 from '@/public/images/demo_sc2_p1_pont.png'
import demoSc2P2 from '@/public/images/demo_sc2_p2_main.png'
import demoSc2P3 from '@/public/images/demo_sc2_p3_silhouettes.png'
import demoSc3P1 from '@/public/images/demo_sc3_p1_hopital.png'
import demoSc4P1 from '@/public/images/demo_sc4_p1_retrouvailles.png'

import {
  Play, ArrowRight, Brain, Film, Zap, Check, ChevronDown,
  Terminal, Users, Shield, Eye, DollarSign, Cpu, BookOpen,
  Palette, MessageSquare, Ban, TrendingUp, Camera, Sparkles,
  Wand2, Clapperboard, Megaphone, GraduationCap, PenTool,
  Video, SlidersHorizontal, Layers
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
          {isLoggedIn ? (
            <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-xl transition-colors">
              Mon dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors">
                Connexion
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-xl transition-colors">
                Commencer
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img src={heroBg.src} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950/50 via-dark-950/80 to-dark-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950/80 via-transparent to-dark-950/80" />
        </div>

        {/* Badge */}
        <div className="relative z-10 mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <span className="text-[10px] font-bold tracking-wider text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded">NEW</span>
            <span className="text-sm text-slate-300">Assistant IA + 13 moteurs + 7 modèles vidéo</span>
          </div>
        </div>

        {/* ═══ NEW HEADLINE ═══ */}
        <h1 className="relative z-10 font-display text-5xl md:text-7xl text-center text-white mb-4 tracking-tight" style={{ fontWeight: 500, lineHeight: 1.1 }}>
          De l&apos;idée<br />
          <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
            à l&apos;image.
          </span>
        </h1>

        {/* ═══ SUBTITLE ═══ */}
        <p className="relative z-10 text-base md:text-lg text-slate-400 text-center max-w-2xl mb-10 leading-relaxed">
          Court-métrage, publicité, documentaire, clip, BD, vidéo éducative
          — décrivez votre vision, MISEN écrit le scénario, analyse chaque plan
          avec 13 moteurs et sélectionne le meilleur modèle IA parmi 7 pour chaque image.
          <span className="text-slate-300"> Pas un seul outil — le bon outil, à chaque plan.</span>
        </p>

        {/* ═══ ACTION BOX ═══ */}
        <div className="relative z-10 w-full max-w-2xl">
          <div className="bg-dark-900/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl shadow-black/40">
            {/* Model selector */}
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
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><Wand2 size={11} className="text-orange-500/60" /> Assistant IA</span>
                <span className="flex items-center gap-1"><Brain size={11} /> 13 moteurs</span>
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
            <textarea
              value={scriptPreview}
              onChange={(e) => setScriptPreview(e.target.value)}
              placeholder="Décrivez votre idée ou collez votre scénario..."
              rows={3}
              className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none leading-relaxed"
            />

            {/* Bottom row */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
              <p className="text-[11px] text-slate-600">
                Pas de scénario ? L&apos;assistant IA vous guide · Gratuit
              </p>
              <button
                onClick={handleGo}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-500/30"
              >
                <Play size={14} fill="white" /> {isLoggedIn ? 'Dashboard' : 'Commencer'}
              </button>
            </div>
          </div>
        </div>

        {/* ═══ STATS BAR ═══ */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 w-full max-w-2xl">
          {[
            { value: '∞', label: 'Formats', sub: 'film · pub · docu · BD · clip' },
            { value: '13', label: 'Moteurs IA' },
            { value: '7', label: 'Modèles vidéo' },
            { value: '<10s', label: 'Par analyse' },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-display font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ USE CASES ═══ */}
      <section className="px-6 py-16 max-w-5xl mx-auto w-full">
        <h2 className="font-display text-2xl text-white text-center mb-3 tracking-tight">
          Un outil, tous les formats
        </h2>
        <p className="text-sm text-slate-500 text-center mb-8 max-w-lg mx-auto">
          Que vous soyez réalisateur, marketeur, enseignant ou créateur — MISEN s&apos;adapte à votre vision
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { icon: Clapperboard, label: 'Court-métrage', desc: 'Fiction, drame, comédie', color: '#F97316' },
            { icon: Megaphone, label: 'Publicité', desc: 'Spot 15s, 30s, 60s', color: '#EC4899' },
            { icon: Film, label: 'Documentaire', desc: 'Narration, interviews', color: '#10B981' },
            { icon: Video, label: 'Clip musical', desc: 'Storytelling visuel', color: '#8B5CF6' },
            { icon: PenTool, label: 'Bande dessinée', desc: 'Cases, storyboard', color: '#3B82F6' },
            { icon: GraduationCap, label: 'Vidéo éducative', desc: 'Tutos, e-learning', color: '#14B8A6' },
          ].map((uc) => (
            <div key={uc.label} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${uc.color}15` }}>
                <uc.icon size={18} style={{ color: uc.color }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{uc.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{uc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS (icon-based, no broken images) ═══ */}
      <section className="px-6 py-16 max-w-4xl mx-auto w-full">
        <h2 className="font-display text-2xl text-white text-center mb-10 tracking-tight">Comment ça marche</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '01', icon: Wand2, title: 'Imaginez', desc: 'Décrivez votre idée — l\'assistant IA vous aide à construire le scénario', color: '#F97316' },
            { step: '02', icon: Brain, title: 'Analysez', desc: '13 moteurs décomposent chaque plan, personnage, émotion et cadrage', color: '#F97316' },
            { step: '03', icon: Layers, title: 'Orchestrez', desc: 'Storyboard, timeline, copilote IA — peaufinez chaque détail', color: '#06B6D4' },
            { step: '04', icon: Zap, title: 'Générez', desc: '7 modèles vidéo créent vos plans avec le prompt optimal', color: '#06B6D4' },
          ].map((s) => (
            <div key={s.step} className="group text-center md:text-left">
              <div className="w-14 h-14 mx-auto md:mx-0 rounded-2xl flex items-center justify-center mb-4 border border-white/[0.06] bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors">
                <s.icon size={24} style={{ color: s.color }} />
              </div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest mb-2" style={{ color: s.color }}>
                {s.step}
              </div>
              <h3 className="text-base font-semibold text-white mb-1.5">{s.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ VISUAL SHOWCASE ═══ */}
      <section className="px-6 py-16 max-w-5xl mx-auto w-full">
        <h2 className="font-display text-2xl text-white text-center mb-3 tracking-tight">
          Des résultats cinématiques
        </h2>
        <p className="text-sm text-slate-500 text-center mb-8">
          Chaque plan est assigné au modèle IA optimal pour un rendu professionnel
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { src: demoSc1P1.src, label: 'Plan large · Fleuve', model: 'Kling 3.0', color: '#3B82F6' },
            { src: demoSc1P2.src, label: 'Gros plan · Portrait', model: 'Veo 3.1', color: '#10B981' },
            { src: demoSc2P1.src, label: 'Plan large · Pont', model: 'Sora 2', color: '#EC4899' },
            { src: demoSc2P2.src, label: 'Insert · Main', model: 'Runway Gen-4.5', color: '#8B5CF6' },
            { src: demoSc1P3.src, label: 'Insert · Photo', model: 'Hailuo 2.3', color: '#D946EF' },
            { src: demoSc3P1.src, label: 'Intérieur · Hôpital', model: 'Kling 3.0', color: '#3B82F6' },
            { src: demoSc4P1.src, label: 'Plan moyen · Émotion', model: 'Veo 3.1', color: '#10B981' },
            { src: demoSc2P3.src, label: 'Silhouettes · Contre-jour', model: 'Wan 2.5', color: '#6366F1' },
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
      </section>

      {/* ═══ MODELS ═══ */}
      <section className="px-6 py-16 max-w-5xl mx-auto w-full">
        <h2 className="font-display text-2xl text-white text-center mb-3 tracking-tight">
          7 modèles IA orchestrés
        </h2>
        <p className="text-sm text-slate-500 text-center mb-8">
          Chaque plan est automatiquement assigné au modèle optimal
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Kling 3.0', tag: 'Réalisme · Physique', color: '#3B82F6', desc: 'Mouvements naturels, textures réalistes' },
            { name: 'Runway Gen-4.5', tag: 'Style · Contrôle', color: '#8B5CF6', desc: 'Direction artistique précise' },
            { name: 'Sora 2', tag: 'VFX · Émotion', color: '#EC4899', desc: 'Effets visuels, scènes complexes' },
            { name: 'Veo 3.1', tag: 'Dialogue · Audio', color: '#10B981', desc: 'Lip sync, voix intégrées' },
            { name: 'Seedance 2.0', tag: 'Mouvement · Corps', color: '#14B8A6', desc: 'Danse, sport, action' },
            { name: 'Wan 2.5', tag: 'Animation · Caméra', color: '#6366F1', desc: 'Mouvements de caméra fluides' },
            { name: 'Hailuo 2.3', tag: 'Cohérence', color: '#D946EF', desc: 'Personnages persistants' },
          ].map((m) => (
            <div key={m.name} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-sm font-medium text-white">{m.name}</span>
              </div>
              <p className="text-[10px] font-medium mb-1" style={{ color: m.color }}>{m.tag}</p>
              <p className="text-[11px] text-slate-500">{m.desc}</p>
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

      {/* ═══ PRICING ═══ */}
      <section className="px-6 py-16 max-w-4xl mx-auto w-full">
        <h2 className="font-display text-2xl text-white text-center mb-10 tracking-tight">Tarifs simples</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Free', price: '0€', desc: '3 projets · 5 générations/mois', features: ['13 moteurs d\'analyse', 'Assistant IA (3 requêtes)', 'Mode Simple', '7 modèles', 'Export JSON'] },
            { name: 'Pro', price: '29€', desc: '20 projets · 100 générations/mois', features: ['Tout Free +', 'Assistant IA (30 requêtes)', 'Mode Expert complet', 'Timeline & Copilote', 'Export JSON + MP4'], glow: true },
            { name: 'Studio', price: '79€', desc: 'Illimité · API · Support', features: ['Tout Pro +', 'Assistant IA illimité', 'Générations illimitées', 'API access', 'Support dédié'] },
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
