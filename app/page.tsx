import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Play, Brain, Film, Camera, Shield, TrendingUp, Users,
  DollarSign, Zap, Crown, Sparkles, Check, ArrowRight,
  Layers, Terminal, Eye, BookOpen, Palette, MessageSquare, Ban, Cpu
} from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  const engines = [
    { name: 'Intent Parser', desc: 'Découpe scènes et didascalies', icon: Terminal },
    { name: 'Grammar', desc: 'Syntaxe et valeurs de plan', icon: BookOpen },
    { name: 'Character Bible', desc: 'Identité visuelle personnages', icon: Users },
    { name: 'Contextual Prompt', desc: 'Prompt enrichi par scène', icon: MessageSquare },
    { name: 'Model Syntax', desc: 'Adaptation par moteur IA', icon: Cpu },
    { name: 'Negative Prompt', desc: 'Exclusions automatiques', icon: Ban },
    { name: 'Compliance', desc: 'Filtres contenu & sécurité', icon: Shield },
    { name: 'Continuity', desc: 'Cohérence entre plans', icon: Eye },
    { name: 'Tension Curve', desc: 'Arc dramatique & rythme', icon: TrendingUp },
    { name: 'Cost Router', desc: 'Budget par modèle', icon: DollarSign },
    { name: 'Consistency', desc: 'Injection tokens visuels', icon: Palette },
    { name: 'Memory', desc: 'Contexte inter-scènes', icon: Brain },
    { name: 'Scene Splitter', desc: 'Découpage intelligent', icon: Film },
  ]

  const models = [
    { name: 'Kling 2.1', color: '#3B82F6' },
    { name: 'Runway Gen-4', color: '#8B5CF6' },
    { name: 'Sora', color: '#EC4899' },
    { name: 'Veo 3', color: '#10B981' },
    { name: 'Seedance', color: '#14B8A6' },
    { name: 'Wan 2.1', color: '#6366F1' },
    { name: 'Hailuo', color: '#D946EF' },
  ]

  return (
    <div className="min-h-screen bg-dark-950">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="font-display text-xl text-orange-500" style={{ letterSpacing: '-0.02em' }}>MISEN</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost btn-sm">Connexion</Link>
          <Link href="/register" className="btn-primary btn-sm">Commencer</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 pt-16 pb-20 max-w-4xl mx-auto text-center" style={{
        background: 'radial-gradient(800px 260px at 35% 25%, rgba(249,115,22,0.08), transparent 55%), radial-gradient(700px 240px at 65% 35%, rgba(6,182,212,0.06), transparent 60%)'
      }}>
        <div className="beam w-64 mx-auto mb-8" />
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="badge-orange">13 moteurs</span>
          <span className="badge-orange">7 modèles</span>
          <span className="badge-gold">Studio-grade</span>
        </div>
        <h1 className="font-display text-5xl md:text-6xl text-slate-50 mb-6" style={{ letterSpacing: '-0.02em', fontWeight: 400 }}>
          De l&apos;écriture<br />
          <span className="text-gradient-orange">à l&apos;écran.</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          MISEN analyse votre scénario avec 13 moteurs spécialisés, assigne les meilleurs modèles IA
          à chaque plan, et génère vos vidéos. Le premier studio de production piloté par l&apos;intelligence artificielle.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register" className="btn-primary btn-lg gap-2">
            Entrer dans le Studio <ArrowRight size={18} />
          </Link>
          <Link href="/demo" className="btn-secondary btn-lg gap-2">
            <Play size={18} /> Voir la démo
          </Link>
        </div>
      </section>

      {/* PIPELINE */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {[
            { step: '01', title: 'Collez', desc: 'Votre scénario', icon: Terminal, color: '#F97316' },
            { step: '02', title: 'Analysez', desc: '13 moteurs en parallèle', icon: Brain, color: '#F97316' },
            { step: '03', title: 'Optimisez', desc: 'Prompts & modèles assignés', icon: Cpu, color: '#06B6D4' },
            { step: '04', title: 'Générez', desc: 'Vidéos par plan', icon: Film, color: '#06B6D4' },
          ].map((s, i) => (
            <div key={s.step} className="card p-5 text-center relative group hover:border-dark-600 transition-all">
              <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: s.color }}>{s.step}</div>
              <h3 className="text-sm font-bold text-slate-100 mb-1">{s.title}</h3>
              <p className="text-xs text-slate-500">{s.desc}</p>
              {i < 3 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight size={14} className="text-dark-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* STORYBOARD PREVIEW */}
      <section className="px-6 py-12 max-w-5xl mx-auto">
        <h2 className="font-display text-2xl text-slate-50 text-center mb-3" style={{ fontWeight: 400 }}>Storyboard intelligent</h2>
        <p className="text-sm text-slate-400 text-center mb-8 max-w-xl mx-auto">
          Chaque plan est analysé : cadrage, mouvement caméra, modèle IA optimal, durée et coût estimés
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { shot: 'plan large', move: 'pan right', model: 'Kling', color: '#3B82F6', label: 'SC1 — P1', dur: '4.2s' },
            { shot: 'gros plan', move: 'static', model: 'Runway', color: '#8B5CF6', label: 'SC1 — P2', dur: '3.1s' },
            { shot: 'insert', move: 'dolly in', model: 'Hailuo', color: '#D946EF', label: 'SC1 — P3', dur: '2.8s' },
            { shot: 'plan moyen', move: 'tracking', model: 'Veo', color: '#10B981', label: 'SC2 — P1', dur: '5.0s' },
          ].map((p, i) => (
            <div key={i} className="card overflow-hidden group hover:border-dark-600 transition-all">
              <div className="relative">
                <svg width="280" height="120" viewBox="0 0 280 120" className="w-full">
                  <rect width="280" height="120" fill="#0C0F1A" />
                  <line x1="93" y1="0" x2="93" y2="120" stroke="#252B3B" strokeWidth="0.5" opacity="0.4"/>
                  <line x1="187" y1="0" x2="187" y2="120" stroke="#252B3B" strokeWidth="0.5" opacity="0.4"/>
                  <line x1="0" y1="40" x2="280" y2="40" stroke="#252B3B" strokeWidth="0.5" opacity="0.4"/>
                  <line x1="0" y1="80" x2="280" y2="80" stroke="#252B3B" strokeWidth="0.5" opacity="0.4"/>
                  {p.shot === 'plan large' && <>
                    <ellipse cx="140" cy="72" rx="17" ry="14" fill="none" stroke={p.color} strokeWidth="1.5" opacity="0.7"/>
                    <circle cx="140" cy="38" r="7" fill="none" stroke={p.color} strokeWidth="1.5" opacity="0.7"/>
                    <line x1="140" y1="58" x2="140" y2="45" stroke={p.color} strokeWidth="1" opacity="0.5"/>
                  </>}
                  {p.shot === 'gros plan' && <>
                    <circle cx="140" cy="54" r="36" fill="none" stroke={p.color} strokeWidth="2" opacity="0.8"/>
                    <ellipse cx="128" cy="48" rx="5" ry="3" fill={p.color} opacity="0.4"/>
                    <ellipse cx="152" cy="48" rx="5" ry="3" fill={p.color} opacity="0.4"/>
                  </>}
                  {p.shot === 'insert' && <>
                    <rect x="90" y="36" width="100" height="48" rx="3" fill="none" stroke={p.color} strokeWidth="1.5" opacity="0.7"/>
                    <line x1="100" y1="84" x2="180" y2="36" stroke={p.color} strokeWidth="0.8" opacity="0.3"/>
                  </>}
                  {p.shot === 'plan moyen' && <>
                    <ellipse cx="140" cy="66" rx="28" ry="22" fill="none" stroke={p.color} strokeWidth="1.5" opacity="0.7"/>
                    <circle cx="140" cy="19" r="13" fill="none" stroke={p.color} strokeWidth="1.5" opacity="0.7"/>
                    <line x1="140" y1="44" x2="140" y2="32" stroke={p.color} strokeWidth="1.2" opacity="0.5"/>
                  </>}
                  {p.move === 'pan right' && <>
                    <line x1="84" y1="60" x2="196" y2="60" stroke="#06B6D4" strokeWidth="1" opacity="0.4"/>
                    <polygon points="196,60 188,55 188,65" fill="#06B6D4" opacity="0.4"/>
                  </>}
                  {p.move === 'dolly in' && <>
                    <circle cx="140" cy="60" r="42" fill="none" stroke="#06B6D4" strokeWidth="0.8" opacity="0.2"/>
                    <circle cx="140" cy="60" r="24" fill="none" stroke="#06B6D4" strokeWidth="1" opacity="0.3"/>
                  </>}
                  {p.move === 'tracking' && <>
                    <path d="M56,60 Q112,36 140,60 Q168,84 224,60" fill="none" stroke="#06B6D4" strokeWidth="1" opacity="0.3"/>
                    <polygon points="224,60 216,55 216,65" fill="#06B6D4" opacity="0.4"/>
                  </>}
                  <text x="272" y="14" textAnchor="end" fontFamily="Inter,system-ui" fontSize="8" fontWeight="600" fill={p.color} opacity="0.7">
                    {p.shot === 'plan large' ? 'WIDE' : p.shot === 'gros plan' ? 'CLOSE' : p.shot === 'insert' ? 'INSERT' : 'MEDIUM'}
                  </text>
                </svg>
                <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-dark-900 to-transparent" />
              </div>
              <div className="px-3 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-300">{p.label}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${p.color}15`, color: p.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} /> {p.model}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">{p.dur}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 13 ENGINES */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="font-display text-2xl text-slate-50 text-center mb-3" style={{ fontWeight: 400 }}>13 moteurs d&apos;analyse</h2>
        <p className="text-sm text-slate-400 text-center mb-10 max-w-xl mx-auto">
          Chaque scène passe au crible de moteurs spécialisés qui travaillent en synergie
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {engines.map((e) => (
            <div key={e.name} className="card p-4 hover:border-dark-600 transition-all group">
              <e.icon size={20} className="text-orange-500/70 mb-2 group-hover:text-orange-400 transition-colors" />
              <h4 className="text-sm font-semibold text-slate-200">{e.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MODELS */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="font-display text-2xl text-slate-50 text-center mb-3" style={{ fontWeight: 400 }}>7 modèles IA orchestrés</h2>
        <p className="text-sm text-slate-400 text-center mb-10">Chaque plan est assigné au modèle optimal selon son contenu</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {models.map((m) => (
            <div key={m.name} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-dark-700 bg-dark-850">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
              <span className="text-sm text-slate-200 font-medium">{m.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="font-display text-2xl text-slate-50 text-center mb-10" style={{ fontWeight: 400 }}>Tarifs simples</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Free', price: '0€', desc: '3 projets · 5 analyses/jour · 7 modèles', badge: 'badge-default', features: ['13 moteurs', 'Mode Simple', 'Export prompts'] },
            { name: 'Studio', price: '19€', desc: 'Projets illimités · Analyses illimitées', badge: 'badge-orange', features: ['Tout Free +', 'Mode Expert', 'Timeline', 'Copilote IA', 'Média bank'], glow: true },
            { name: 'Production', price: '49€', desc: 'Équipe · API · Priorité', badge: 'badge-gold', features: ['Tout Studio +', 'Génération vidéo', 'API access', 'Support prioritaire'] },
          ].map((p) => (
            <div key={p.name} className={`card p-6 ${p.glow ? 'glow-orange border-orange-500/30' : ''}`}>
              <span className={p.badge}>{p.name}</span>
              <div className="mt-4 mb-1">
                <span className="font-display text-3xl text-slate-50">{p.price}</span>
                <span className="text-sm text-slate-500">/mois</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">{p.desc}</p>
              <div className="space-y-2">
                {p.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check size={12} className="text-orange-500" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/register" className={`mt-6 w-full ${p.glow ? 'btn-primary' : 'btn-secondary'} btn-md flex justify-center`}>
                {p.glow ? 'Commencer' : 'Essayer'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-10 border-t border-dark-700">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <span className="font-display text-lg text-orange-500">MISEN</span>
            <p className="text-xs text-slate-500 mt-1">Mise en Scène Numérique — par Steve Moradel</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link href="/demo" className="hover:text-slate-300">Démo</Link>
            <Link href="/login" className="hover:text-slate-300">Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
