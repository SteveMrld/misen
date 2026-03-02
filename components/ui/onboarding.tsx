'use client'

import { useI18n } from '@/lib/i18n'
import { useState, useEffect } from 'react'
import { Film, Brain, Zap, Camera, Sparkles, ArrowRight, ArrowLeft, X, Play, Rocket, Copy, ExternalLink, Palette, Layers, BookOpen, Crown } from 'lucide-react'

interface OnboardingProps {
  userName?: string | null
  onComplete: () => void
  onDemo: () => void
  onNewProject: () => void
}

type Path = 'beginner' | 'intermediate' | 'expert' | null

export function Onboarding({ userName, onComplete, onDemo, onNewProject }: OnboardingProps) {
  const { locale } = useI18n()
  const [step, setStep] = useState(0)
  const [path, setPath] = useState<Path>(null)
  const [visible, setVisible] = useState(false)
  const fr = locale === 'fr'

  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t) }, [])

  const handleSkip = () => { setVisible(false); setTimeout(onComplete, 300) }
  const handleDemo = () => { setVisible(false); setTimeout(() => { onComplete(); onDemo() }, 300) }
  const handleNew = () => { setVisible(false); setTimeout(() => { onComplete(); onNewProject() }, 300) }

  const selectPath = (p: Path) => { setPath(p); setStep(1) }

  // Path-specific content
  const pathSteps: Record<string, { title: string; subtitle: string; items: { icon: any; label: string; desc: string }[] }[]> = {
    beginner: [
      {
        title: fr ? 'MISEN en 3 clics' : 'MISEN in 3 clicks',
        subtitle: fr ? "Pas besoin d'être réalisateur" : "No filmmaking experience needed",
        items: [
          { icon: Film, label: fr ? '1. Décrivez votre idée' : '1. Describe your idea', desc: fr ? "En langage courant. Ex: \"Une pub pour un parfum dans le désert\"" : "In plain language. E.g.: \"A perfume ad in the desert\"" },
          { icon: Brain, label: fr ? "2. L'IA fait le reste" : '2. AI does the rest', desc: fr ? '13 moteurs transforment votre idée en scénario structuré avec plans, cadrages et modèles' : '13 engines transform your idea into a structured screenplay with shots, framing and models' },
          { icon: Copy, label: fr ? '3. Copiez, collez, générez' : '3. Copy, paste, generate', desc: fr ? 'Chaque plan a un prompt optimisé. Collez-le dans Kling, Runway ou Sora.' : 'Each shot has an optimized prompt. Paste it in Kling, Runway or Sora.' },
        ]
      },
      {
        title: fr ? 'Le mode Simple' : 'Simple Mode',
        subtitle: fr ? "Votre interface par défaut" : "Your default interface",
        items: [
          { icon: Sparkles, label: fr ? 'Pipeline guidé' : 'Guided pipeline', desc: fr ? 'Écriture → Analyse → Plans. Suivez les étapes, MISEN vous accompagne.' : 'Writing → Analysis → Shots. Follow the steps, MISEN guides you.' },
          { icon: Layers, label: fr ? 'Passez en Expert quand vous êtes prêt' : 'Switch to Expert when ready', desc: fr ? 'Timeline, sous-titres, voix off, banque média — tout est là quand vous le voulez.' : 'Timeline, subtitles, voiceover, media library — everything is there when you want it.' },
        ]
      },
    ],
    intermediate: [
      {
        title: fr ? 'Votre studio de pré-production' : 'Your pre-production studio',
        subtitle: fr ? 'Tout ce qu\'un réalisateur attend' : 'Everything a director expects',
        items: [
          { icon: Camera, label: fr ? 'Analyse plan par plan' : 'Shot-by-shot analysis', desc: fr ? 'Cadrage, mouvement caméra, émotion, durée, modèle IA — pour chaque plan' : 'Framing, camera move, emotion, duration, AI model — for each shot' },
          { icon: Palette, label: fr ? 'Multi-modèles intelligent' : 'Smart multi-model', desc: fr ? 'Kling pour le réalisme, Runway pour le style, Sora pour les VFX — assignation automatique' : 'Kling for realism, Runway for style, Sora for VFX — auto-assignment' },
          { icon: Brain, label: fr ? 'Copilote IA contextuel' : 'Contextual AI copilot', desc: fr ? "Suggestions de plans, corrections de continuité, enrichissement de prompts" : 'Shot suggestions, continuity corrections, prompt enrichment' },
        ]
      },
      {
        title: fr ? '5 workspaces, comme DaVinci' : '5 workspaces, like DaVinci',
        subtitle: fr ? 'Un espace dédié pour chaque étape' : 'A dedicated space for each step',
        items: [
          { icon: Film, label: fr ? 'Écriture → Analyse → Production → Post-prod → Export' : 'Writing → Analysis → Production → Post-prod → Export', desc: fr ? 'Navigation par espace + onglets contextuels. Ctrl+K pour la command palette.' : 'Space navigation + contextual tabs. Ctrl+K for command palette.' },
          { icon: Zap, label: fr ? 'Raccourcis clavier NLE' : 'NLE keyboard shortcuts', desc: fr ? '1-5 pour les workspaces, J/K/L pour le player, ? pour voir tous les raccourcis' : '1-5 for workspaces, J/K/L for player, ? to see all shortcuts' },
        ]
      },
    ],
    expert: [
      {
        title: fr ? 'Le pipeline complet' : 'The complete pipeline',
        subtitle: fr ? '13 moteurs × 7 modèles × contrôle total' : '13 engines × 7 models × total control',
        items: [
          { icon: Brain, label: fr ? 'Moteurs spécialisés' : 'Specialized engines', desc: fr ? 'Intent Parser, Crispifier, Style Guard, Color Harmonizer, Motion Flow… chacun affine le résultat' : 'Intent Parser, Crispifier, Style Guard, Color Harmonizer, Motion Flow… each refines the output' },
          { icon: Camera, label: fr ? 'Inline prompt editing + @ références' : 'Inline prompt editing + @ references', desc: fr ? "Modifiez chaque prompt, injectez des personnages et styles via le système @" : 'Edit each prompt, inject characters and styles via the @ system' },
          { icon: Zap, label: fr ? 'Batch actions + génération multi-plans' : 'Batch actions + multi-shot generation', desc: fr ? 'Sélectionnez plusieurs plans, copiez ou générez en lot' : 'Select multiple shots, copy or generate in batch' },
        ]
      },
      {
        title: fr ? 'Post-production IA' : 'AI Post-production',
        subtitle: fr ? 'Sous-titres, voix off, score musical' : 'Subtitles, voiceover, musical score',
        items: [
          { icon: Sparkles, label: fr ? 'Score musical automatique' : 'Automatic musical score', desc: fr ? 'Composition par émotion avec synth preview, leitmotifs, timeline synchronisée' : 'Emotion-based composition with synth preview, leitmotifs, synchronized timeline' },
          { icon: ExternalLink, label: fr ? 'Export multi-format' : 'Multi-format export', desc: fr ? 'YouTube 1080p, Instagram Reels, Cinéma 4K, Présentation — presets intégrés' : 'YouTube 1080p, Instagram Reels, Cinema 4K, Presentation — built-in presets' },
        ]
      },
    ],
  }

  const currentSteps = path ? pathSteps[path] || [] : []
  const contentStep = currentSteps[step - 1]
  const totalSteps = currentSteps.length + 2 // path select + content steps + final
  const isPathSelect = step === 0
  const isFinal = step > currentSteps.length
  const progress = ((step + 1) / totalSteps) * 100

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" />
      <div className={`relative w-full max-w-lg mx-4 bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 transition-transform duration-300 ${visible ? 'scale-100' : 'scale-95'}`}>
        <button onClick={handleSkip} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-dark-800 text-slate-500 hover:text-slate-300 transition-colors z-10"><X size={18} /></button>

        {/* Progress */}
        <div className="px-8 pt-6">
          <div className="flex gap-1 mb-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-gradient-to-r from-orange-500 to-orange-400' : 'bg-dark-700'}`} />
            ))}
          </div>
        </div>

        {/* Step 0: Path Selection */}
        {isPathSelect && (
          <div className="px-8 pb-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
                <Sparkles size={24} className="text-orange-400" />
              </div>
              <h2 className="font-display text-xl text-white mb-1">
                {userName ? `${fr ? 'Bienvenue' : 'Welcome'}, ${userName.split(' ')[0]}!` : (fr ? 'Bienvenue dans MISEN' : 'Welcome to MISEN')}
              </h2>
              <p className="text-sm text-slate-400">{fr ? 'Quel est votre profil ?' : 'What\'s your profile?'}</p>
            </div>
            <div className="space-y-3">
              {([
                { id: 'beginner' as Path, icon: BookOpen, label: fr ? 'Débutant' : 'Beginner', desc: fr ? "Je découvre la création vidéo IA" : 'I\'m new to AI video creation', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
                { id: 'intermediate' as Path, icon: Camera, label: fr ? 'Créateur' : 'Creator', desc: fr ? "Je connais la vidéo, pas encore l'IA" : 'I know video, not AI yet', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
                { id: 'expert' as Path, icon: Crown, label: fr ? 'Expert' : 'Expert', desc: fr ? "Réalisateur, producteur ou tech" : 'Director, producer or tech', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
              ]).map((p) => (
                <button key={p.id} onClick={() => selectPath(p.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] active:scale-[0.99] ${p.color}`}>
                  <div className="p-2.5 rounded-xl bg-dark-800/80"><p.icon size={20} /></div>
                  <div className="text-left flex-1">
                    <span className="text-sm font-semibold text-slate-100 block">{p.label}</span>
                    <span className="text-xs text-slate-400">{p.desc}</span>
                  </div>
                  <ArrowRight size={16} className="text-slate-600" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Steps */}
        {contentStep && !isFinal && (
          <div className="px-8 pb-4">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white mb-0.5">{contentStep.title}</h2>
              <p className="text-xs text-slate-500">{contentStep.subtitle}</p>
            </div>
            <div className="space-y-3">
              {contentStep.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3.5 p-3 bg-dark-800/50 rounded-xl border border-dark-700/50">
                  <div className="p-1.5 bg-dark-700 rounded-lg mt-0.5"><item.icon size={16} className="text-orange-400" /></div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final: CTA */}
        {isFinal && (
          <div className="px-8 pb-4">
            <div className="text-center mb-5">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
                <Rocket size={24} className="text-orange-400" />
              </div>
              <h2 className="font-display text-xl text-white mb-1">{fr ? 'Prêt à créer ?' : 'Ready to create?'}</h2>
              <p className="text-xs text-slate-500">{fr ? 'Choisissez comment commencer' : 'Choose how to start'}</p>
            </div>
            <div className="space-y-3">
              <button onClick={handleDemo} className="w-full flex items-center gap-3 p-4 bg-dark-800/50 rounded-xl border border-dark-700/50 hover:border-orange-500/20 transition-all group">
                <div className="p-2 bg-orange-600/15 rounded-lg"><Play size={18} className="text-orange-400" /></div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-slate-200 group-hover:text-orange-400 transition-colors">{fr ? 'Explorer les démos' : 'Explore demos'}</p>
                  <p className="text-xs text-slate-500">{fr ? 'Court-métrage, pub, vidéo éducative' : 'Short film, ad, educational video'}</p>
                </div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-orange-400" />
              </button>
              <button onClick={handleNew} className="w-full flex items-center gap-3 p-4 bg-orange-500/[0.06] rounded-xl border border-orange-500/20 hover:border-orange-500/40 transition-all group">
                <div className="p-2 bg-orange-600/25 rounded-lg"><Rocket size={18} className="text-orange-300" /></div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-orange-300">{fr ? 'Créer mon projet' : 'Create my project'}</p>
                  <p className="text-xs text-slate-500">{fr ? 'Commencer avec votre propre scénario' : 'Start with your own script'}</p>
                </div>
                <ArrowRight size={16} className="text-orange-500 group-hover:text-orange-400" />
              </button>
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className="px-8 py-4 border-t border-dark-700/50 flex items-center justify-between">
          <button onClick={() => step > 0 ? setStep(s => s - 1) : null} disabled={step === 0}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${step === 0 ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-slate-200'}`}>
            <ArrowLeft size={14} /> {fr ? 'Retour' : 'Back'}
          </button>
          <div className="flex items-center gap-3">
            <button onClick={handleSkip} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{fr ? 'Passer' : 'Skip'}</button>
            {!isPathSelect && !isFinal && (
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-1.5 px-4 py-2 btn-primary text-xs font-medium rounded-xl">
                {fr ? 'Suivant' : 'Next'} <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
