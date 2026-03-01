'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X, Zap, Crown, Sparkles, Play, ArrowRight, Brain, Film, Copy, ExternalLink, HelpCircle } from 'lucide-react'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    icon: Zap,
    desc: 'Découvrez la puissance de MISEN',
    cta: 'Commencer gratuitement',
    ctaStyle: 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-200',
    features: [
      { text: '3 projets', included: true },
      { text: '13 moteurs d\'analyse', included: true },
      { text: 'Assistant scénariste IA', included: true, detail: '3 requêtes/mois' },
      { text: 'Prompts optimisés par plan', included: true },
      { text: 'Copier-coller vers Kling, Runway…', included: true },
      { text: 'Mode Simple', included: true },
      { text: 'Export JSON', included: true },
      { text: 'Mode Expert', included: false },
      { text: 'Timeline & Copilote', included: false },
      { text: 'Sous-titres & Voix off', included: false },
      { text: 'Génération intégrée', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    icon: Crown,
    popular: true,
    desc: 'Pour les créateurs réguliers',
    cta: 'Passer à Pro',
    ctaStyle: 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20',
    features: [
      { text: '20 projets', included: true },
      { text: '13 moteurs d\'analyse', included: true },
      { text: 'Assistant scénariste IA', included: true, detail: '30 requêtes/mois' },
      { text: 'Prompts optimisés par plan', included: true },
      { text: 'Copier-coller vers Kling, Runway…', included: true },
      { text: 'Mode Simple + Expert', included: true },
      { text: 'Export JSON + prompts groupés', included: true },
      { text: 'Timeline & Copilote IA', included: true },
      { text: 'Sous-titres & Voix off', included: true },
      { text: 'Génération intégrée', included: true, detail: 'Avec vos clés API' },
      { text: 'Support prioritaire', included: true },
    ],
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 79,
    icon: Sparkles,
    desc: 'Pour les équipes & studios',
    cta: 'Passer à Studio',
    ctaStyle: 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-200',
    features: [
      { text: 'Projets illimités', included: true },
      { text: '13 moteurs d\'analyse', included: true },
      { text: 'Assistant scénariste IA', included: true, detail: 'Illimité' },
      { text: 'Prompts optimisés par plan', included: true },
      { text: 'Copier-coller vers Kling, Runway…', included: true },
      { text: 'Mode Simple + Expert', included: true },
      { text: 'Export tous formats', included: true },
      { text: 'Timeline & Copilote IA', included: true },
      { text: 'Sous-titres & Voix off', included: true },
      { text: 'Génération intégrée', included: true, detail: 'Avec vos clés API' },
      { text: 'Accès API MISEN', included: true },
      { text: 'Support dédié', included: true },
    ],
  },
]

const FAQS = [
  {
    q: 'Ai-je besoin d\'une clé API pour utiliser MISEN ?',
    a: 'Non. MISEN analyse votre scénario et génère des prompts optimisés que vous copiez-collez dans Kling, Runway ou Sora. Aucune clé API requise. Si vous souhaitez générer directement dans MISEN, vous pouvez ajouter vos propres clés dans les réglages.',
  },
  {
    q: 'Comment fonctionne l\'assistant scénariste ?',
    a: 'L\'assistant IA vous aide à écrire et structurer votre scénario au format cinématographique. En Free, vous avez 3 requêtes/mois avec notre clé serveur. Vous pouvez aussi ajouter votre propre clé Claude ou OpenAI pour un accès illimité.',
  },
  {
    q: 'Quel modèle IA est utilisé pour chaque plan ?',
    a: 'Les 13 moteurs d\'analyse de MISEN évaluent chaque plan (type de plan, mouvement de caméra, style visuel) et assignent automatiquement le meilleur modèle parmi Kling, Runway, Sora, Veo et d\'autres. Chaque prompt est optimisé pour le modèle assigné.',
  },
  {
    q: 'Puis-je annuler à tout moment ?',
    a: 'Oui, les abonnements Pro et Studio sont sans engagement. Vous pouvez annuler à tout moment depuis vos réglages. Vos projets restent accessibles en mode Free.',
  },
  {
    q: 'Qu\'est-ce que la génération intégrée ?',
    a: 'Avec un forfait Pro ou Studio, vous pouvez ajouter vos clés API Kling ou Runway dans les réglages. MISEN envoie alors le prompt directement au modèle IA et récupère la vidéo — sans quitter la plateforme.',
  },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Play size={12} className="text-white ml-0.5" fill="white" />
          </div>
          <span className="font-display text-lg font-bold text-white tracking-tight">MISEN</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Connexion</Link>
          <Link href="/register" className="text-sm px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors">Créer un compte</Link>
        </div>
      </nav>

      {/* Header */}
      <header className="px-6 pt-12 pb-8 text-center max-w-3xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
          Tarifs simples, puissance maximale
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Commencez gratuitement. Passez à Pro quand votre production s'accélère.
        </p>

        {/* Annual toggle */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className={`text-sm transition-colors ${!annual ? 'text-white' : 'text-slate-500'}`}>Mensuel</span>
          <button onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-orange-600' : 'bg-dark-700'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${annual ? 'left-7' : 'left-1'}`} />
          </button>
          <span className={`text-sm transition-colors ${annual ? 'text-white' : 'text-slate-500'}`}>
            Annuel <span className="text-orange-400 text-xs font-medium">-20%</span>
          </span>
        </div>
      </header>

      {/* Plans */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const price = plan.price === 0 ? 0 : annual ? Math.round(plan.price * 0.8) : plan.price
            return (
              <div key={plan.id} className={`relative rounded-2xl p-6 border transition-all flex flex-col ${
                plan.popular
                  ? 'bg-orange-600/[0.06] border-orange-500/30 shadow-xl shadow-orange-600/5'
                  : 'bg-white/[0.02] border-white/[0.06]'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-orange-600 text-white text-[10px] font-bold tracking-wider uppercase rounded-full">
                    Populaire
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-1.5 rounded-lg ${plan.popular ? 'bg-orange-600/20' : 'bg-white/[0.05]'}`}>
                    <Icon size={16} className={plan.popular ? 'text-orange-400' : 'text-slate-400'} />
                  </div>
                  <span className={`text-sm font-bold tracking-wider ${plan.popular ? 'text-orange-400' : 'text-slate-400'}`}>
                    {plan.name.toUpperCase()}
                  </span>
                </div>

                <div className="mb-1">
                  <span className="font-display text-4xl text-white">{price === 0 ? 'Gratuit' : `${price}€`}</span>
                  {price > 0 && <span className="text-sm text-slate-500">/mois</span>}
                </div>
                <p className="text-xs text-slate-500 mb-6">{plan.desc}</p>

                <div className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {f.included ? (
                        <Check size={14} className={`mt-0.5 flex-shrink-0 ${plan.popular ? 'text-orange-500' : 'text-green-500/70'}`} />
                      ) : (
                        <X size={14} className="mt-0.5 flex-shrink-0 text-slate-700" />
                      )}
                      <div>
                        <span className={`text-xs ${f.included ? 'text-slate-300' : 'text-slate-600'}`}>{f.text}</span>
                        {f.detail && <span className="text-[10px] text-slate-500 ml-1">({f.detail})</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <Link href="/register" className={`block text-center py-3 rounded-xl text-sm font-medium transition-all ${plan.ctaStyle}`}>
                  {plan.cta}
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* Value prop */}
      <section className="px-6 py-12 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl text-white text-center mb-8">Ce que MISEN fait pour vous</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: 'Analyse intelligente', desc: '13 moteurs analysent votre scénario : cadrage, tension, continuité, compliance, coût estimé.' },
              { icon: Film, title: 'Assignation de modèle', desc: 'Chaque plan reçoit le meilleur modèle IA (Kling, Runway, Sora, Veo) selon ses caractéristiques.' },
              { icon: Copy, title: 'Prompts optimisés', desc: 'Des prompts écrits spécifiquement pour chaque modèle. Copiez, collez, générez.' },
            ].map((item, i) => {
              const ItemIcon = item.icon
              return (
                <div key={i} className="p-5 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                  <ItemIcon size={20} className="text-orange-400 mb-3" />
                  <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-12 border-t border-white/[0.05]">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl text-white text-center mb-8">Questions fréquentes</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-white/[0.06] rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm text-slate-200 font-medium pr-4">{faq.q}</span>
                  <HelpCircle size={16} className={`flex-shrink-0 transition-colors ${openFaq === i ? 'text-orange-400' : 'text-slate-600'}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="font-display text-2xl text-white mb-3">Prêt à transformer vos idées en vidéo ?</h2>
          <p className="text-sm text-slate-400 mb-6">Aucune carte bancaire requise. Commencez gratuitement.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/register" className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2">
              Créer un compte <ArrowRight size={16} />
            </Link>
            <Link href="/demo" className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 text-sm font-medium rounded-xl transition-colors flex items-center gap-2">
              <Play size={14} /> Voir la démo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Play size={8} className="text-white ml-0.5" fill="white" />
            </div>
            <span className="text-xs text-slate-600">MISEN © 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Accueil</Link>
            <Link href="/demo" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Démo</Link>
            <Link href="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
