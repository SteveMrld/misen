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

  return (
    <div className="min-h-screen bg-dark-950">
      {/* ─── NAV ─── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Play size={24} className="text-orange-500" fill="currentColor" />
          <span className="text-lg font-bold text-slate-50">MISEN</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
            Connexion
          </Link>
          <Link href="/register" className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors">
            Commencer gratuitement
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="px-6 pt-20 pb-24 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs text-orange-400 mb-6">
          <Zap size={12} /> 13 moteurs × 7 modèles IA
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-50 leading-tight mb-6">
          De l&apos;écriture<br />
          <span className="text-orange-500">à l&apos;écran.</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          MISEN analyse votre scénario avec 13 moteurs spécialisés, assigne les meilleurs modèles IA
          à chaque plan, et génère vos vidéos. Le premier studio de production entièrement piloté par l&apos;intelligence artificielle.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register" className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors flex items-center gap-2">
            Essayer gratuitement <ArrowRight size={18} />
          </Link>
          <a href="#features" className="px-8 py-3 bg-dark-800 hover:bg-dark-700 text-slate-300 font-medium rounded-xl transition-colors border border-dark-700">
            Découvrir
          </a>
        </div>
      </section>

      {/* ─── PIPELINE ─── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Collez', desc: 'Votre scénario', icon: Terminal },
            { step: '02', title: 'Analysez', desc: '13 moteurs en parallèle', icon: Brain },
            { step: '03', title: 'Optimisez', desc: 'Prompts & modèles assignés', icon: Cpu },
            { step: '04', title: 'Générez', desc: 'Vidéos par plan', icon: Film },
          ].map((s) => (
            <div key={s.step} className="bg-dark-900 border border-dark-700 rounded-xl p-5 text-center">
              <s.icon size={28} className="text-orange-500 mx-auto mb-3" />
              <div className="text-[10px] text-orange-400 font-bold mb-1">{s.step}</div>
              <h3 className="text-sm font-bold text-slate-100 mb-1">{s.title}</h3>
              <p className="text-xs text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 13 ENGINES ─── */}
      <section id="features" className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-50 text-center mb-3">13 moteurs d&apos;analyse</h2>
        <p className="text-sm text-slate-400 text-center mb-10 max-w-xl mx-auto">
          Chaque scène est passée au crible par des moteurs spécialisés qui travaillent en synergie
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Director', icon: Camera, desc: 'Cadrage & mise en scène' },
            { name: 'Prompt', icon: MessageSquare, desc: 'Génération de prompts' },
            { name: 'Grammar', icon: BookOpen, desc: 'Grammaire visuelle' },
            { name: 'Tension', icon: TrendingUp, desc: 'Courbe dramatique' },
            { name: 'Character', icon: Users, desc: 'Bible des personnages' },
            { name: 'Compliance', icon: Shield, desc: 'Conformité contenu' },
            { name: 'Continuity', icon: Eye, desc: 'Cohérence visuelle' },
            { name: 'Style', icon: Palette, desc: 'Direction artistique' },
            { name: 'Negative', icon: Ban, desc: 'Prompts négatifs' },
            { name: 'Cost', icon: DollarSign, desc: 'Estimation budgétaire' },
            { name: 'Rec', icon: Cpu, desc: 'Assignation modèles' },
            { name: 'Continuity+', icon: Layers, desc: 'Cohérence inter-plans' },
            { name: 'Export', icon: Film, desc: 'Timeline & export' },
          ].map((e) => (
            <div key={e.name} className="bg-dark-900 border border-dark-700 rounded-lg p-3 flex items-center gap-3">
              <e.icon size={16} className="text-orange-500/70 flex-shrink-0" />
              <div>
                <span className="text-xs font-medium text-slate-200 block">{e.name}</span>
                <span className="text-[10px] text-slate-500">{e.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 7 MODELS ─── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-50 text-center mb-3">7 modèles IA</h2>
        <p className="text-sm text-slate-400 text-center mb-10">Le bon modèle pour chaque plan, automatiquement</p>
        <div className="flex flex-wrap justify-center gap-3">
          {['Kling 3.0', 'Runway Gen-4.5', 'Sora 2', 'Veo 3.1', 'Seedance 2.0', 'Wan 2.5', 'Hailuo 2.3'].map((m) => (
            <div key={m} className="px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-sm text-slate-300 font-medium">
              {m}
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-50 text-center mb-10">Tarifs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: 'Free', price: 0, icon: Zap,
              features: ['7 moteurs d\'analyse', '5 générations/mois', '3 projets max', 'Export JSON'],
            },
            {
              name: 'Pro', price: 29, icon: Crown, popular: true,
              features: ['13 moteurs d\'analyse', '100 générations/mois', '20 projets', 'Export JSON + MP4', 'Support prioritaire'],
            },
            {
              name: 'Studio', price: 79, icon: Sparkles,
              features: ['13 moteurs d\'analyse', 'Générations illimitées', 'Projets illimités', 'Tous formats export', 'API access', 'Support dédié'],
            },
          ].map((plan) => (
            <div key={plan.name} className={`relative rounded-xl p-6 border ${plan.popular ? 'bg-orange-500/5 border-orange-500/30' : 'bg-dark-800 border-dark-700'}`}>
              {plan.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-orange-600 text-white text-[10px] font-bold rounded-full uppercase">
                  Populaire
                </div>
              )}
              <plan.icon size={24} className="text-orange-500 mb-3" />
              <h3 className="text-lg font-bold text-slate-100 mb-1">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-slate-50">{plan.price === 0 ? 'Gratuit' : `${plan.price}€`}</span>
                {plan.price > 0 && <span className="text-sm text-slate-500">/mois</span>}
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                    <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register"
                className={`block w-full py-2.5 text-center text-sm font-medium rounded-lg transition-colors ${
                  plan.popular ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-dark-700 hover:bg-dark-600 text-slate-200'
                }`}>
                {plan.price === 0 ? 'Commencer' : `Passer à ${plan.name}`}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-6 py-20 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-slate-50 mb-4">Prêt à transformer votre écriture ?</h2>
        <p className="text-sm text-slate-400 mb-8">Créez votre premier projet en moins de 2 minutes</p>
        <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-xl transition-colors">
          Commencer gratuitement <ArrowRight size={18} />
        </Link>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="px-6 py-8 border-t border-dark-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Play size={14} className="text-orange-500" fill="currentColor" />
            <span>MISEN V7 — Jabrilia Éditions</span>
          </div>
          <div>© 2026 Steve Moradel. Tous droits réservés.</div>
        </div>
      </footer>
    </div>
  )
}
