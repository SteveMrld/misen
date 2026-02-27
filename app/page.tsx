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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Collez', desc: 'Votre scénario', icon: Terminal },
            { step: '02', title: 'Analysez', desc: '13 moteurs en parallèle', icon: Brain },
            { step: '03', title: 'Optimisez', desc: 'Prompts & modèles assignés', icon: Cpu },
            { step: '04', title: 'Générez', desc: 'Vidéos par plan', icon: Film },
          ].map((s) => (
            <div key={s.step} className="card p-5 text-center">
              <s.icon size={28} className="text-orange-500 mx-auto mb-3" />
              <div className="text-overline text-orange-400 mb-1">{s.step}</div>
              <h3 className="text-sm font-bold text-slate-100 mb-1">{s.title}</h3>
              <p className="text-xs text-slate-500">{s.desc}</p>
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
