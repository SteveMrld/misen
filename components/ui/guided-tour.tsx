'use client'

/**
 * MISEN V11 — Guided Tour System
 * Interactive walkthrough with spotlight + tooltip overlay
 * Highlights UI elements step by step with contextual explanations
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, ArrowRight, ArrowLeft, Sparkles, Play, SkipForward } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export interface TourStep {
  target: string        // CSS selector or 'center' for modal
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: () => void   // Auto-action when step activates
  delay?: number        // Delay before showing (ms)
}

interface GuidedTourProps {
  steps: TourStep[]
  onComplete: () => void
  onSkip: () => void
}

export function GuidedTour({ steps, onComplete, onSkip }: GuidedTourProps) {
  const { locale } = useI18n()
  const [current, setCurrent] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [visible, setVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const step = steps[current]
  const isLast = current === steps.length - 1
  const progress = ((current + 1) / steps.length) * 100

  // Find and highlight target element
  const updateTarget = useCallback(() => {
    if (!step) return
    if (step.target === 'center') {
      setRect(null)
      setVisible(true)
      return
    }
    const el = document.querySelector(step.target)
    if (el) {
      const r = el.getBoundingClientRect()
      setRect(r)
      // Scroll into view if needed
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      setVisible(true)
    } else {
      setRect(null)
      setVisible(true)
    }
  }, [step])

  useEffect(() => {
    const delay = step?.delay || 300
    setVisible(false)
    const timer = setTimeout(() => {
      if (step?.action) step.action()
      setTimeout(updateTarget, 100)
    }, delay)
    return () => clearTimeout(timer)
  }, [current, step, updateTarget])

  // Update on resize/scroll
  useEffect(() => {
    const handler = () => updateTarget()
    window.addEventListener('resize', handler)
    window.addEventListener('scroll', handler, true)
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('scroll', handler, true)
    }
  }, [updateTarget])

  const next = () => {
    if (isLast) { onComplete(); return }
    setCurrent(c => c + 1)
  }
  const prev = () => setCurrent(c => Math.max(0, c - 1))

  if (!step) return null

  // Tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!rect || step.position === 'center') {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    }
    const pad = 16
    const pos = step.position || 'bottom'
    switch (pos) {
      case 'top': return { bottom: window.innerHeight - rect.top + pad, left: rect.left + rect.width / 2, transform: 'translateX(-50%)' }
      case 'bottom': return { top: rect.bottom + pad, left: rect.left + rect.width / 2, transform: 'translateX(-50%)' }
      case 'left': return { top: rect.top + rect.height / 2, right: window.innerWidth - rect.left + pad, transform: 'translateY(-50%)' }
      case 'right': return { top: rect.top + rect.height / 2, left: rect.right + pad, transform: 'translateY(-50%)' }
      default: return { top: rect.bottom + pad, left: rect.left + rect.width / 2, transform: 'translateX(-50%)' }
    }
  }

  return (
    <div className="fixed inset-0 z-[200]" style={{ pointerEvents: 'auto' }}>
      {/* Dark overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - 8} y={rect.top - 8}
                width={rect.width + 16} height={rect.height + 16}
                rx="12" fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(10,8,6,0.75)" mask="url(#tour-mask)" />
      </svg>

      {/* Spotlight ring */}
      {rect && (
        <div
          className="absolute border-2 border-orange-400/60 rounded-xl pointer-events-none animate-pulse"
          style={{
            left: rect.left - 8, top: rect.top - 8,
            width: rect.width + 16, height: rect.height + 16,
            boxShadow: '0 0 30px rgba(192,123,42,0.2), inset 0 0 20px rgba(192,123,42,0.05)'
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`absolute z-[201] w-80 max-w-[90vw] transition-all duration-300 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={getTooltipStyle()}
      >
        <div className="bg-dark-900 border border-orange-500/20 rounded-2xl p-5 shadow-2xl shadow-black/60">
          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-1 bg-dark-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{current + 1}/{steps.length}</span>
          </div>

          {/* Content */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles size={14} className="text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button onClick={onSkip} className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">
              {locale === 'fr' ? 'Passer la visite' : 'Skip tour'}
            </button>
            <div className="flex items-center gap-2">
              {current > 0 && (
                <button onClick={prev} className="p-1.5 rounded-lg hover:bg-dark-800 text-slate-400 hover:text-slate-200 transition-colors">
                  <ArrowLeft size={14} />
                </button>
              )}
              <button onClick={next}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold rounded-xl hover:from-orange-400 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/15">
                {isLast ? (locale === 'fr' ? 'Terminer' : 'Finish') : (locale === 'fr' ? 'Suivant' : 'Next')}
                {isLast ? <Sparkles size={12} /> : <ArrowRight size={12} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Pre-built tour for the project page
export function useProjectTour(options: {
  setMode: (m: any) => void
  setWorkspace: (w: any) => void
  setTab: (t: any) => void
  hasAnalysis: boolean
}) {
  const { locale } = useI18n()
  const fr = locale === 'fr'

  const steps: TourStep[] = [
    {
      target: 'center',
      title: fr ? 'Bienvenue dans votre projet MISEN' : 'Welcome to your MISEN project',
      description: fr
        ? 'Découvrez en 60 secondes comment passer de votre idée à un film analysé plan par plan. Suivez le guide !'
        : 'Discover in 60 seconds how to go from your idea to a film analyzed shot by shot. Follow the guide!',
      position: 'center',
    },
    {
      target: '[data-tour="script-editor"]',
      title: fr ? '1. Écriture du scénario' : '1. Script Writing',
      description: fr
        ? 'Écrivez ou collez votre texte ici. Format libre, Fountain, ou utilisez l\'assistant IA pour générer un scénario complet.'
        : 'Write or paste your text here. Free format, Fountain, or use the AI assistant to generate a complete screenplay.',
      position: 'right',
      action: () => { options.setMode('expert'); options.setWorkspace('writing'); options.setTab('script') },
    },
    {
      target: '[data-tour="analyze-button"]',
      title: fr ? '2. Lancez l\'analyse' : '2. Run Analysis',
      description: fr
        ? '13 moteurs IA analysent votre scénario : scènes, plans, cadrages, émotions, personnages, continuité, compliance. Un clic suffit.'
        : '13 AI engines analyze your script: scenes, shots, framing, emotions, characters, continuity, compliance. One click.',
      position: 'top',
    },
    ...(options.hasAnalysis ? [
      {
        target: '[data-tour="workspace-bar"]',
        title: fr ? '3. Naviguez par workspace' : '3. Navigate by workspace',
        description: fr
          ? '5 espaces de travail comme DaVinci Resolve : Écriture → Analyse → Production → Post-prod → Export. Chacun regroupe les outils pertinents.'
          : '5 workspaces like DaVinci Resolve: Writing → Analysis → Production → Post-prod → Export. Each groups relevant tools.',
        position: 'bottom',
      },
      {
        target: '[data-tour="mini-timeline"]',
        title: fr ? '4. La mini-timeline' : '4. The mini-timeline',
        description: fr
          ? 'Toujours visible en bas. Chaque segment = un plan, coloré par émotion. Cliquez pour naviguer. Votre film en un coup d\'œil.'
          : 'Always visible at bottom. Each segment = a shot, colored by emotion. Click to navigate. Your film at a glance.',
        position: 'top',
        action: () => { options.setWorkspace('analysis'); options.setTab('overview') },
      },
      {
        target: '[data-tour="cockpit-kpis"]',
        title: fr ? '5. Le cockpit de production' : '5. The production cockpit',
        description: fr
          ? 'Vue d\'ensemble de votre projet : scènes, plans, budget, continuité, durée, personnages. Chaque KPI est cliquable → accès direct au module.'
          : 'Project overview: scenes, shots, budget, continuity, duration, characters. Each KPI is clickable → direct access to module.',
        position: 'bottom',
        action: () => { options.setWorkspace('analysis'); options.setTab('overview') },
      },
    ] as TourStep[] : []),
    {
      target: 'center',
      title: fr ? 'Raccourcis utiles' : 'Useful shortcuts',
      description: fr
        ? 'Ctrl+K → Command palette. 1-5 → Workspaces. ? → Tous les raccourcis. E → Basculer Simple/Expert. Le studio est à portée de clavier.'
        : 'Ctrl+K → Command palette. 1-5 → Workspaces. ? → All shortcuts. E → Toggle Simple/Expert. The studio is at your fingertips.',
      position: 'center',
    },
    {
      target: 'center',
      title: fr ? '🎬 Vous êtes prêt !' : '🎬 You\'re ready!',
      description: fr
        ? 'Collez votre scénario, lancez l\'analyse, explorez chaque plan. MISEN fait le reste. Bonne création !'
        : 'Paste your script, run the analysis, explore each shot. MISEN does the rest. Happy creating!',
      position: 'center',
    },
  ]

  return steps
}
