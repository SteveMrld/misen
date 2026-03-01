'use client'

import { useI18n } from '@/lib/i18n'
import { useState, useEffect } from 'react'
import { Film, Brain, Zap, Camera, Sparkles, ArrowRight, ArrowLeft, X, Play, Rocket, Copy, ExternalLink, Palette } from 'lucide-react'

interface OnboardingProps {
  userName?: string | null
  onComplete: () => void
  onDemo: () => void
  onNewProject: () => void
}

const STEP_ICONS = [Sparkles, Zap, Camera, Rocket]

const STEPS_FR = [
  {
    title: 'Bienvenue dans MISEN', subtitle: 'Le premier studio IA qui pense comme un réalisateur',
    content: [
      { icon: Film, label: 'Écrivez votre scénario', desc: "Texte libre, format Fountain, ou dictez à l'assistant IA" },
      { icon: Brain, label: '13 moteurs analysent', desc: 'Cadrage, prompts, tension narrative, continuité, compliance…' },
      { icon: Palette, label: 'Le meilleur modèle IA par plan', desc: 'Kling, Runway, Sora, Veo — assignés automatiquement' },
      { icon: Copy, label: "Prompts prêts à l'emploi", desc: 'Copiez le prompt optimisé, collez dans le studio IA' },
    ],
  },
  {
    title: 'Comment ça marche', subtitle: "4 étapes, de l'idée à l'écran",
    content: [
      { icon: Film, label: '1. Collez votre texte', desc: "Scénario, brief, idée brute — MISEN s'adapte" },
      { icon: Brain, label: '2. Analysez en un clic', desc: 'Scènes, plans, modèles IA, coûts — tout est calculé' },
      { icon: Copy, label: '3. Récupérez vos prompts', desc: 'Chaque plan a son prompt optimisé pour le bon modèle' },
      { icon: ExternalLink, label: '4. Générez vos vidéos', desc: 'Collez dans Kling, Runway ou Sora — ou générez directement avec votre clé API' },
    ],
  },
  {
    title: 'Deux modes de travail', subtitle: "Adaptez l'interface à votre niveau",
    content: [
      { icon: Sparkles, label: 'Mode Simple', desc: "Scénario → Analyse → Plans & Prompts. L'essentiel en 3 clics." },
      { icon: Brain, label: 'Mode Expert', desc: 'Timeline, copilote IA, sous-titres, voix off, banque média, raccourcis clavier.' },
    ],
  },
  { title: 'Prêt à créer ?', subtitle: 'Choisissez comment commencer', content: [] },
]

const STEPS_EN = [
  {
    title: 'Welcome to MISEN', subtitle: 'The first AI studio that thinks like a director',
    content: [
      { icon: Film, label: 'Write your script', desc: 'Free text, Fountain format, or dictate to the AI assistant' },
      { icon: Brain, label: '13 engines analyze', desc: 'Framing, prompts, narrative tension, continuity, compliance…' },
      { icon: Palette, label: 'Best AI model per shot', desc: 'Kling, Runway, Sora, Veo — auto-assigned' },
      { icon: Copy, label: 'Ready-to-use prompts', desc: 'Copy the optimized prompt, paste into the AI studio' },
    ],
  },
  {
    title: 'How it works', subtitle: '4 steps, from idea to screen',
    content: [
      { icon: Film, label: '1. Paste your text', desc: 'Script, brief, raw idea — MISEN adapts' },
      { icon: Brain, label: '2. Analyze in one click', desc: 'Scenes, shots, AI models, costs — all calculated' },
      { icon: Copy, label: '3. Get your prompts', desc: 'Each shot has its optimized prompt for the right model' },
      { icon: ExternalLink, label: '4. Generate your videos', desc: 'Paste in Kling, Runway or Sora — or generate directly with your API key' },
    ],
  },
  {
    title: 'Two work modes', subtitle: 'Adapt the interface to your level',
    content: [
      { icon: Sparkles, label: 'Simple Mode', desc: 'Script → Analysis → Shots & Prompts. The essentials in 3 clicks.' },
      { icon: Brain, label: 'Expert Mode', desc: 'Timeline, AI copilot, subtitles, voiceover, media library, keyboard shortcuts.' },
    ],
  },
  { title: 'Ready to create?', subtitle: 'Choose how to start', content: [] },
]

export function Onboarding({ userName, onComplete, onDemo, onNewProject }: OnboardingProps) {
  const { locale } = useI18n()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const isFr = locale === 'fr'
  const STEPS = isFr ? STEPS_FR : STEPS_EN

  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t) }, [])

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const Icon = STEP_ICONS[step]

  const handleSkip = () => { setVisible(false); setTimeout(onComplete, 300) }
  const handleNext = () => { if (!isLast) setStep(s => s + 1) }
  const handleBack = () => { if (step > 0) setStep(s => s - 1) }
  const handleDemo = () => { setVisible(false); setTimeout(() => { onComplete(); onDemo() }, 300) }
  const handleNew = () => { setVisible(false); setTimeout(() => { onComplete(); onNewProject() }, 300) }

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div className={`relative w-full max-w-lg mx-4 bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 transition-transform duration-300 ${visible ? 'scale-100' : 'scale-95'}`}>
        <button onClick={handleSkip} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-dark-800 text-slate-500 hover:text-slate-300 transition-colors z-10"><X size={18} /></button>

        <div className="relative px-8 pt-8 pb-6 bg-gradient-to-b from-orange-600/10 to-transparent">
          <div className="flex gap-1.5 mb-6">
            {STEPS.map((_, i) => (<div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-orange-500' : 'bg-dark-700'}`} />))}
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-orange-600/20 rounded-xl"><Icon size={22} className="text-orange-400" /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-50">
                {step === 0 && userName ? `${current.title}, ${userName.split(' ')[0]}\u00A0!` : current.title}
              </h2>
              <p className="text-sm text-slate-400">{current.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="px-8 pb-4">
          {current.content.length > 0 && (
            <div className="space-y-3">
              {current.content.map((item, i) => {
                const ItemIcon = item.icon
                return (
                  <div key={i} className="flex items-start gap-3.5 p-3 bg-dark-800/60 rounded-xl border border-dark-700/50">
                    <div className="p-1.5 bg-dark-700 rounded-lg mt-0.5"><ItemIcon size={16} className="text-orange-400" /></div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {isLast && (
            <div className="space-y-3">
              <button onClick={handleDemo} className="w-full flex items-center gap-3 p-4 bg-dark-800/60 rounded-xl border border-dark-700/50 hover:border-orange-500/30 hover:bg-orange-600/5 transition-all group">
                <div className="p-2 bg-orange-600/20 rounded-lg"><Play size={18} className="text-orange-400" /></div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-slate-200 group-hover:text-orange-400 transition-colors">{isFr ? 'Explorer les 3 démos' : 'Explore the 3 demos'}</p>
                  <p className="text-xs text-slate-500">{isFr ? 'Court-métrage, publicité, vidéo éducative — tout est prêt' : 'Short film, ad, educational video — all ready'}</p>
                </div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-orange-400 transition-colors" />
              </button>
              <button onClick={handleNew} className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-orange-600/10 to-orange-500/5 rounded-xl border border-orange-500/20 hover:border-orange-500/40 transition-all group">
                <div className="p-2 bg-orange-600/30 rounded-lg"><Rocket size={18} className="text-orange-300" /></div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-orange-300 group-hover:text-orange-200 transition-colors">{isFr ? 'Créer mon projet' : 'Create my project'}</p>
                  <p className="text-xs text-slate-500">{isFr ? 'Commencer avec votre propre scénario' : 'Start with your own script'}</p>
                </div>
                <ArrowRight size={16} className="text-orange-600 group-hover:text-orange-400 transition-colors" />
              </button>
              <p className="text-center text-[10px] text-slate-600 mt-2">{isFr ? 'Aucune clé API requise pour démarrer' : 'No API key required to start'}</p>
            </div>
          )}
        </div>

        <div className="px-8 py-4 border-t border-dark-700/50 flex items-center justify-between">
          <button onClick={handleBack} disabled={step === 0} className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${step === 0 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-slate-200'}`}>
            <ArrowLeft size={14} /> {isFr ? 'Retour' : 'Back'}
          </button>
          <div className="flex items-center gap-3">
            <button onClick={handleSkip} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{isFr ? 'Passer' : 'Skip'}</button>
            {!isLast && (
              <button onClick={handleNext} className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium rounded-lg transition-colors">
                {isFr ? 'Suivant' : 'Next'} <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
