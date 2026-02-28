'use client'

import { useState, useEffect } from 'react'
import { Film, Brain, Zap, Camera, Sparkles, ArrowRight, ArrowLeft, X, Play, Rocket } from 'lucide-react'

interface OnboardingProps {
  userName?: string | null
  onComplete: () => void
  onDemo: () => void
  onNewProject: () => void
}

const STEPS = [
  {
    id: 'welcome',
    icon: Sparkles,
    title: 'Bienvenue dans MISEN',
    subtitle: 'Votre studio IA de production cinématographique',
    content: [
      { icon: Film, label: 'Collez votre scénario', desc: 'Texte libre, Fountain ou copier-coller' },
      { icon: Brain, label: '13 moteurs analysent', desc: 'Cadrage, prompts, continuité, tension…' },
      { icon: Camera, label: '7 modèles IA assignés', desc: 'Kling, Runway, Sora, Veo et plus' },
      { icon: Zap, label: 'Générez vos vidéos', desc: 'Prompts optimisés par plan' },
    ],
  },
  {
    id: 'modes',
    icon: Camera,
    title: 'Deux modes de travail',
    subtitle: 'Adaptez l\'interface à votre niveau',
    content: [
      { icon: Sparkles, label: 'Mode Simple', desc: 'Collez, analysez, exportez. Idéal pour démarrer.' },
      { icon: Brain, label: 'Mode Expert', desc: 'Timeline, copilote IA, sous-titres, voix off, banque média.' },
    ],
  },
  {
    id: 'start',
    icon: Rocket,
    title: 'Prêt à créer ?',
    subtitle: 'Choisissez comment commencer',
    content: [],
  },
]

export function Onboarding({ userName, onComplete, onDemo, onNewProject }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Small delay for smooth entrance
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const Icon = current.icon

  const handleSkip = () => {
    setVisible(false)
    setTimeout(onComplete, 300)
  }

  const handleNext = () => {
    if (isLast) return
    setStep(s => s + 1)
  }

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1)
  }

  const handleDemo = () => {
    setVisible(false)
    setTimeout(() => { onComplete(); onDemo() }, 300)
  }

  const handleNew = () => {
    setVisible(false)
    setTimeout(() => { onComplete(); onNewProject() }, 300)
  }

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Card */}
      <div className={`relative w-full max-w-lg mx-4 bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 transition-transform duration-300 ${visible ? 'scale-100' : 'scale-95'}`}>
        {/* Skip button */}
        <button onClick={handleSkip} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-dark-800 text-slate-500 hover:text-slate-300 transition-colors z-10">
          <X size={18} />
        </button>

        {/* Header gradient */}
        <div className="relative px-8 pt-8 pb-6 bg-gradient-to-b from-orange-600/10 to-transparent">
          {/* Step indicator */}
          <div className="flex gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-orange-500' : 'bg-dark-700'}`} />
            ))}
          </div>

          {/* Icon + Title */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-orange-600/20 rounded-xl">
              <Icon size={22} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-50">
                {step === 0 && userName ? `${current.title}, ${userName.split(' ')[0]} !` : current.title}
              </h2>
              <p className="text-sm text-slate-400">{current.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-4">
          {current.content.length > 0 && (
            <div className="space-y-3">
              {current.content.map((item, i) => {
                const ItemIcon = item.icon
                return (
                  <div key={i} className="flex items-start gap-3.5 p-3 bg-dark-800/60 rounded-xl border border-dark-700/50">
                    <div className="p-1.5 bg-dark-700 rounded-lg mt-0.5">
                      <ItemIcon size={16} className="text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Last step — CTA buttons */}
          {isLast && (
            <div className="space-y-3">
              <button onClick={handleDemo} className="w-full flex items-center gap-3 p-4 bg-dark-800/60 rounded-xl border border-dark-700/50 hover:border-orange-500/30 hover:bg-orange-600/5 transition-all group">
                <div className="p-2 bg-orange-600/20 rounded-lg">
                  <Play size={18} className="text-orange-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-slate-200 group-hover:text-orange-400 transition-colors">Explorer la démo</p>
                  <p className="text-xs text-slate-500">Scénario pré-rempli, résultats instantanés</p>
                </div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-orange-400 transition-colors" />
              </button>

              <button onClick={handleNew} className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-orange-600/10 to-orange-500/5 rounded-xl border border-orange-500/20 hover:border-orange-500/40 transition-all group">
                <div className="p-2 bg-orange-600/30 rounded-lg">
                  <Rocket size={18} className="text-orange-300" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-orange-300 group-hover:text-orange-200 transition-colors">Créer mon projet</p>
                  <p className="text-xs text-slate-500">Commencer avec votre propre scénario</p>
                </div>
                <ArrowRight size={16} className="text-orange-600 group-hover:text-orange-400 transition-colors" />
              </button>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="px-8 py-4 border-t border-dark-700/50 flex items-center justify-between">
          <button onClick={handleBack} disabled={step === 0}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${step === 0 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-slate-200'}`}>
            <ArrowLeft size={14} /> Retour
          </button>

          <div className="flex items-center gap-3">
            <button onClick={handleSkip} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Passer
            </button>
            {!isLast && (
              <button onClick={handleNext} className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium rounded-lg transition-colors">
                Suivant <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
