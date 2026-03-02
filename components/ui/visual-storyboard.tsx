'use client'

/**
 * MISEN V9 — Visual Storyboard IA
 * Storyboard cinématographique avec vignettes générées par DALL-E 3
 * Pièce maîtresse de la pré-production visuelle
 *
 * Architecture :
 *   - Grille responsive de frames 16:9
 *   - Génération batch ou individuelle via /api/projects/[id]/storyboard
 *   - Cache localStorage pour persistance entre sessions
 *   - Lightbox plein écran avec navigation clavier
 *   - Export storyboard PDF-ready
 *   - Fallback StoryboardSVG quand pas d'image IA
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  Sparkles, Loader2, RefreshCw, ZoomIn, X, ChevronLeft, ChevronRight,
  Download, Image as ImageIcon, Film, Camera, Clock, AlertTriangle,
  Check, Pause, Play, Grid3X3, LayoutGrid, Maximize2, Eye
} from 'lucide-react'
import { StoryboardSVG } from '@/components/ui/storyboard-svg'
import { getModelColor, ModelBadge } from '@/components/ui/model-badge'
import { useI18n } from '@/lib/i18n'

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

interface VisualStoryboardProps {
  analysis: any
  projectId: string
  projectName?: string
}

interface FrameImage {
  planIndex: number
  imageData: string  // base64 data URL
  revisedPrompt?: string
  generatedAt: string
}

type GenerationStatus = 'idle' | 'generating' | 'completed' | 'error'
type GridLayout = 'grid-2' | 'grid-3' | 'grid-4' | 'filmstrip'

// ═══════════════════════════════════════════
// Storage helpers
// ═══════════════════════════════════════════

const STORAGE_PREFIX = 'misen-storyboard-'

function getStorageKey(projectId: string): string {
  return `${STORAGE_PREFIX}${projectId}`
}

function loadFrames(projectId: string): Record<number, FrameImage> {
  try {
    const raw = localStorage.getItem(getStorageKey(projectId))
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveFrames(projectId: string, frames: Record<number, FrameImage>) {
  try {
    localStorage.setItem(getStorageKey(projectId), JSON.stringify(frames))
  } catch {
    // localStorage might be full — keep only most recent frames
    console.warn('[MISEN] Storyboard storage full, trimming cache')
    try {
      const allEntries = Object.entries(frames)
        .sort((a, b) => new Date(b[1].generatedAt).getTime() - new Date(a[1].generatedAt).getTime())
      const trimmed = allEntries.slice(0, Math.floor(allEntries.length * 0.7))
      localStorage.setItem(getStorageKey(projectId), JSON.stringify(Object.fromEntries(trimmed)))
    } catch {}
  }
}

// ═══════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════

export function VisualStoryboard({ analysis, projectId, projectName }: VisualStoryboardProps) {
  const { t, locale } = useI18n()
  const plans = analysis?.plans || []
  const scenes = analysis?.scenes || []
  const chars = analysis?.characterBible || []

  // State
  const [frames, setFrames] = useState<Record<number, FrameImage>>({})
  const [statuses, setStatuses] = useState<Record<number, GenerationStatus>>({})
  const [errors, setErrors] = useState<Record<number, string>>({})
  const [batchRunning, setBatchRunning] = useState(false)
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 })
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [layout, setLayout] = useState<GridLayout>('grid-3')
  const [hasOpenAIKey, setHasOpenAIKey] = useState<boolean | null>(null)
  const abortRef = useRef(false)

  // Load cached frames on mount
  useEffect(() => {
    setFrames(loadFrames(projectId))
  }, [projectId])

  // Check if user has OpenAI key
  useEffect(() => {
    fetch('/api/keys')
      .then(r => r.ok ? r.json() : [])
      .then((keys: any[]) => {
        setHasOpenAIKey(keys.some((k: any) => k.provider === 'openai'))
      })
      .catch(() => setHasOpenAIKey(false))
  }, [])

  // Stats
  const generatedCount = Object.keys(frames).length
  const totalPlans = plans.length
  const progress = totalPlans > 0 ? (generatedCount / totalPlans) * 100 : 0

  // Get character description for a plan
  const getCharDesc = useCallback((plan: any): string | undefined => {
    if (!plan?.personnages?.length && !plan?.characters?.length) return undefined
    const names = plan.personnages || plan.characters || []
    const descs = names
      .map((name: string) => {
        const c = chars.find((ch: any) => ch.name === name || ch.personnage === name)
        return c ? `${c.name || c.personnage}: ${c.apparence || c.description || ''}` : null
      })
      .filter(Boolean)
    return descs.length > 0 ? descs.join('. ') : undefined
  }, [chars])

  // ─── Generate single frame ───
  const generateFrame = useCallback(async (planIndex: number) => {
    const plan = plans[planIndex]
    if (!plan) return

    setStatuses(s => ({ ...s, [planIndex]: 'generating' }))
    setErrors(e => { const n = { ...e }; delete n[planIndex]; return n })

    try {
      const res = await fetch(`/api/projects/${projectId}/storyboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planIndex,
          prompt: plan.finalPrompt || plan.basePrompt || plan.prompt || '',
          shotType: plan.shotType || plan.cadrage || '',
          cameraMove: plan.cameraMove || plan.camera || '',
          angle: plan.angle || '',
          lighting: plan.lighting || plan.eclairage || '',
          characterDesc: getCharDesc(plan),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatuses(s => ({ ...s, [planIndex]: 'error' }))
        setErrors(e => ({ ...e, [planIndex]: data.error || 'Generation failed' }))
        return false
      }

      const frame: FrameImage = {
        planIndex,
        imageData: data.imageData,
        revisedPrompt: data.revisedPrompt,
        generatedAt: new Date().toISOString(),
      }

      setFrames(prev => {
        const next = { ...prev, [planIndex]: frame }
        saveFrames(projectId, next)
        return next
      })
      setStatuses(s => ({ ...s, [planIndex]: 'completed' }))
      return true
    } catch (err: any) {
      setStatuses(s => ({ ...s, [planIndex]: 'error' }))
      setErrors(e => ({ ...e, [planIndex]: err.message || 'Network error' }))
      return false
    }
  }, [plans, projectId, getCharDesc])

  // ─── Batch generate ───
  const generateAll = useCallback(async () => {
    abortRef.current = false
    setBatchRunning(true)

    // Only generate missing frames
    const missing = plans
      .map((_: any, i: number) => i)
      .filter((i: number) => !frames[i])

    setBatchProgress({ done: 0, total: missing.length })

    for (let idx = 0; idx < missing.length; idx++) {
      if (abortRef.current) break
      await generateFrame(missing[idx])
      setBatchProgress({ done: idx + 1, total: missing.length })
      // Rate limit: wait 1.5s between calls (DALL-E limit)
      if (idx < missing.length - 1) {
        await new Promise(r => setTimeout(r, 1500))
      }
    }

    setBatchRunning(false)
  }, [plans, frames, generateFrame])

  const stopBatch = useCallback(() => {
    abortRef.current = true
  }, [])

  // ─── Clear all frames ───
  const clearAll = useCallback(() => {
    setFrames({})
    setStatuses({})
    setErrors({})
    try { localStorage.removeItem(getStorageKey(projectId)) } catch {}
  }, [projectId])

  // ─── Lightbox navigation ───
  const lightboxFrame = lightboxIndex !== null ? frames[lightboxIndex] : null
  const lightboxPlan = lightboxIndex !== null ? plans[lightboxIndex] : null

  const navigateLightbox = useCallback((dir: 1 | -1) => {
    if (lightboxIndex === null) return
    const frameIndices = Object.keys(frames).map(Number).sort((a, b) => a - b)
    const currentPos = frameIndices.indexOf(lightboxIndex)
    const next = currentPos + dir
    if (next >= 0 && next < frameIndices.length) {
      setLightboxIndex(frameIndices[next])
    }
  }, [lightboxIndex, frames])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowLeft') navigateLightbox(-1)
      if (e.key === 'ArrowRight') navigateLightbox(1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex, navigateLightbox])

  // Grid columns class
  const gridClass = {
    'grid-2': 'grid-cols-1 sm:grid-cols-2',
    'grid-3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    'grid-4': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    'filmstrip': 'grid-cols-1',
  }[layout]

  // Cost estimate (DALL-E 3 standard 1792×1024 ≈ $0.080/image)
  const missingCount = totalPlans - generatedCount
  const estimatedCost = missingCount * 0.08

  // ─── No analysis ───
  if (!analysis || plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ImageIcon size={48} className="text-slate-700 mb-4" />
        <h3 className="text-lg font-medium text-slate-300 mb-2">{t.project.storyboard.noAnalysis}</h3>
        <p className="text-sm text-slate-500 text-center max-w-md">{t.project.storyboard.noAnalysisDesc}</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ═══ HEADER ═══ */}
      <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-orange-400" />
              <h2 className="text-sm font-bold text-slate-200">{t.project.storyboard.title}</h2>
              <span className="text-[10px] text-slate-500 bg-dark-800 px-2 py-0.5 rounded">DALL-E 3</span>
            </div>
            <p className="text-xs text-slate-500">{t.project.storyboard.subtitle}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Layout toggle */}
            <div className="flex items-center bg-dark-800 rounded-lg p-0.5 border border-dark-700">
              {([
                { id: 'grid-2' as GridLayout, icon: LayoutGrid },
                { id: 'grid-3' as GridLayout, icon: Grid3X3 },
                { id: 'grid-4' as GridLayout, icon: Grid3X3 },
              ]).map(l => (
                <button key={l.id} onClick={() => setLayout(l.id)}
                  className={`p-1.5 rounded-md transition-all ${layout === l.id ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  title={l.id}>
                  <l.icon size={14} />
                </button>
              ))}
            </div>

            {/* Generate all */}
            {hasOpenAIKey && !batchRunning && (
              <button onClick={generateAll}
                className="flex items-center gap-1.5 px-3 py-1.5 btn-primary text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-40"
                disabled={missingCount === 0}>
                <Sparkles size={13} />
                {missingCount > 0
                  ? `${t.project.storyboard.generateAll} (${missingCount})`
                  : t.project.storyboard.allGenerated}
              </button>
            )}

            {/* Batch progress */}
            {batchRunning && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/20 text-orange-400 text-xs font-medium rounded-lg">
                  <Loader2 size={13} className="animate-spin" />
                  {batchProgress.done}/{batchProgress.total}
                </div>
                <button onClick={stopBatch}
                  className="px-2 py-1.5 bg-dark-800 hover:bg-dark-700 text-slate-400 text-xs rounded-lg border border-dark-600">
                  <Pause size={12} />
                </button>
              </div>
            )}

            {/* Clear all */}
            {generatedCount > 0 && !batchRunning && (
              <button onClick={clearAll}
                className="px-2.5 py-1.5 bg-dark-800 hover:bg-dark-700 text-slate-400 text-xs rounded-lg border border-dark-700 transition-colors">
                <RefreshCw size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {totalPlans > 0 && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>{generatedCount}/{totalPlans} {t.project.storyboard.framesGenerated}</span>
              {hasOpenAIKey && missingCount > 0 && (
                <span>~${estimatedCost.toFixed(2)} {t.project.storyboard.estimated}</span>
              )}
            </div>
            <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* No API key warning */}
        {hasOpenAIKey === false && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <AlertTriangle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-yellow-300 font-medium">{t.project.storyboard.noKeyTitle}</p>
              <p className="text-[11px] text-yellow-400/70 mt-0.5">{t.project.storyboard.noKeyDesc}</p>
            </div>
          </div>
        )}
      </div>

      {/* ═══ STORYBOARD GRID ═══ */}
      <div className={`grid ${gridClass} gap-3`}>
        {plans.map((plan: any, index: number) => (
          <FrameCard
            key={index}
            plan={plan}
            index={index}
            scene={scenes[plan.sceneIndex ?? 0]}
            frame={frames[index]}
            status={statuses[index] || 'idle'}
            error={errors[index]}
            hasKey={!!hasOpenAIKey}
            onGenerate={() => generateFrame(index)}
            onZoom={() => setLightboxIndex(index)}
            layout={layout}
          />
        ))}
      </div>

      {/* ═══ EXPORT HINT ═══ */}
      {generatedCount > 0 && (
        <div className="flex items-center justify-center gap-2 py-3">
          <Eye size={14} className="text-slate-600" />
          <p className="text-xs text-slate-600">
            {generatedCount} {t.project.storyboard.framesReady}
          </p>
        </div>
      )}

      {/* ═══ LIGHTBOX ═══ */}
      {lightboxIndex !== null && lightboxFrame && (
        <Lightbox
          frame={lightboxFrame}
          plan={lightboxPlan}
          index={lightboxIndex}
          totalPlans={totalPlans}
          projectName={projectName}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => navigateLightbox(-1)}
          onNext={() => navigateLightbox(1)}
          hasPrev={Object.keys(frames).map(Number).sort((a, b) => a - b).indexOf(lightboxIndex) > 0}
          hasNext={Object.keys(frames).map(Number).sort((a, b) => a - b).indexOf(lightboxIndex) < Object.keys(frames).length - 1}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════
// Frame Card
// ═══════════════════════════════════════════

interface FrameCardProps {
  plan: any
  index: number
  scene?: any
  frame?: FrameImage
  status: GenerationStatus
  error?: string
  hasKey: boolean
  onGenerate: () => void
  onZoom: () => void
  layout: GridLayout
}

function FrameCard({ plan, index, scene, frame, status, error, hasKey, onGenerate, onZoom, layout }: FrameCardProps) {
  const { t, locale } = useI18n()
  const mid = (plan?.modelId || 'kling').toLowerCase()
  const mc = getModelColor(mid)
  const isFilmstrip = layout === 'filmstrip'

  const shotLabel = plan?.shotType || plan?.cadrage || '—'
  const moveLabel = plan?.cameraMove || plan?.camera || ''
  const sceneTitle = scene?.heading || scene?.titre || `S${(plan?.sceneIndex ?? 0) + 1}`
  const prompt = plan?.finalPrompt || plan?.basePrompt || plan?.prompt || ''
  const duration = plan?.estimatedDuration || plan?.duree || 3

  return (
    <div className={`bg-dark-900 rounded-xl border border-dark-700 overflow-hidden group hover:border-dark-600 transition-all ${
      isFilmstrip ? 'flex gap-4' : ''
    }`}>
      {/* Image area */}
      <div className={`relative ${isFilmstrip ? 'w-[320px] flex-shrink-0' : 'w-full'}`}>
        <div className={`relative bg-dark-950 ${isFilmstrip ? 'h-[180px]' : 'aspect-video'}`}>
          {frame?.imageData ? (
            <>
              <img
                src={frame.imageData}
                alt={`P${index + 1} — ${shotLabel}`}
                className="w-full h-full object-cover"
              />
              {/* Cinematic vignette */}
              <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.35)] pointer-events-none" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <StoryboardSVG
                shotType={plan?.shotType}
                cameraMove={plan?.cameraMove}
                width={isFilmstrip ? 280 : 320}
                height={isFilmstrip ? 158 : 180}
                modelColor={mc}
              />
            </div>
          )}

          {/* Generating overlay */}
          {status === 'generating' && (
            <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
                <Sparkles size={16} className="absolute inset-0 m-auto text-orange-400" />
              </div>
              <p className="text-[10px] text-orange-400/80 mt-2">{t.project.storyboard.generating}</p>
            </div>
          )}

          {/* Shot number overlay — top left */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span className="bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white tabular-nums">
              P{index + 1}
            </span>
            <span className="bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] text-white/60">
              {sceneTitle}
            </span>
          </div>

          {/* Model badge — top right */}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mc }} />
            <span className="text-[9px] text-white/60">{plan?.modelId || 'kling'}</span>
          </div>

          {/* Shot info — bottom */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-white/90">{shotLabel}</span>
                {moveLabel && moveLabel !== 'fixe' && (
                  <span className="text-[9px] text-cyan-300/70">{moveLabel}</span>
                )}
              </div>
              <span className="text-[9px] text-white/40 tabular-nums">{duration.toFixed(1)}s</span>
            </div>
          </div>

          {/* Actions — appear on hover */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            {frame?.imageData && (
              <button onClick={onZoom}
                className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors">
                <ZoomIn size={16} className="text-white" />
              </button>
            )}
            {hasKey && status !== 'generating' && (
              <button onClick={onGenerate}
                className="w-9 h-9 rounded-full bg-orange-600/80 backdrop-blur-sm flex items-center justify-center hover:bg-orange-500 transition-colors"
                title={frame ? t.project.storyboard.regenerate : t.project.storyboard.generate}>
                {frame ? <RefreshCw size={14} className="text-white" /> : <Sparkles size={14} className="text-white" />}
              </button>
            )}
          </div>

          {/* Generated checkmark */}
          {frame?.imageData && status !== 'generating' && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-0">
              {/* Hidden on hover since we show model badge there */}
            </div>
          )}
        </div>
      </div>

      {/* Info panel (filmstrip only) */}
      {isFilmstrip && (
        <div className="flex-1 py-3 pr-4 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-slate-300">P{index + 1}</span>
            <ModelBadge modelId={mid} size="xs" />
            <span className="text-[10px] text-slate-500">{duration.toFixed(1)}s</span>
            <span className="text-[10px] text-slate-600 ml-auto">{shotLabel}</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono line-clamp-3">{prompt}</p>
          {error && (
            <p className="text-[10px] text-red-400 mt-2 flex items-center gap-1">
              <AlertTriangle size={10} /> {error}
            </p>
          )}
        </div>
      )}

      {/* Error display (grid mode) */}
      {!isFilmstrip && error && (
        <div className="px-3 py-2 border-t border-dark-800">
          <p className="text-[10px] text-red-400 flex items-center gap-1">
            <AlertTriangle size={10} /> {error}
          </p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════
// Lightbox
// ═══════════════════════════════════════════

interface LightboxProps {
  frame: FrameImage
  plan: any
  index: number
  totalPlans: number
  projectName?: string
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
}

function Lightbox({ frame, plan, index, totalPlans, projectName, onClose, onPrev, onNext, hasPrev, hasNext }: LightboxProps) {
  const { t } = useI18n()
  const shotLabel = plan?.shotType || plan?.cadrage || ''
  const moveLabel = plan?.cameraMove || plan?.camera || ''
  const prompt = plan?.finalPrompt || plan?.basePrompt || plan?.prompt || ''
  const mid = (plan?.modelId || 'kling').toLowerCase()
  const mc = getModelColor(mid)

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col" onClick={onClose}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-white/80 tabular-nums">P{index + 1}/{totalPlans}</span>
          <span className="text-xs text-white/40">{projectName}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px] text-white/40">
            <span>{shotLabel}</span>
            {moveLabel && moveLabel !== 'fixe' && <span className="text-cyan-400/60">{moveLabel}</span>}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: mc }} />
              <span>{plan?.modelId}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center px-16 relative" onClick={e => e.stopPropagation()}>
        {/* Nav arrows */}
        {hasPrev && (
          <button onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors z-10">
            <ChevronLeft size={20} className="text-white/70" />
          </button>
        )}
        {hasNext && (
          <button onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center transition-colors z-10">
            <ChevronRight size={20} className="text-white/70" />
          </button>
        )}

        <img
          src={frame.imageData}
          alt={`P${index + 1}`}
          className="max-h-[calc(100vh-180px)] max-w-full rounded-lg shadow-2xl shadow-black/50 object-contain"
        />
      </div>

      {/* Bottom info */}
      <div className="px-6 py-4" onClick={e => e.stopPropagation()}>
        <p className="text-[11px] text-white/30 font-mono leading-relaxed max-w-4xl mx-auto text-center line-clamp-2">
          {frame.revisedPrompt || prompt}
        </p>
      </div>
    </div>
  )
}
