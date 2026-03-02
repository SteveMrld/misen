'use client'

/**
 * MISEN V10 — Video Assembly Panel
 * Final render: assembles generated clips into a downloadable film
 *
 * Features:
 *   - Clip timeline with reorder and preview
 *   - Transition selection (cut, crossfade, dip-to-black)
 *   - Title card and credits configuration
 *   - Voiceover and subtitle integration
 *   - Real-time assembly progress
 *   - Download WebM output
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Film, Play, Pause, Download, Settings, Loader2, Check,
  Sparkles, AlertTriangle, Clock, Layers, Type, Music,
  ChevronDown, ChevronUp, Maximize2, X
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import {
  assembleVideo,
  downloadAssembly,
  formatFileSize,
  type AssemblyConfig,
  type AssemblyClip,
  type AssemblyResult,
  type SubtitleEntry,
} from '@/lib/engines/video-assembly'

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

interface AssemblyPanelProps {
  analysis: any
  projectId: string
  projectName?: string
}

type TransitionType = 'cut' | 'crossfade' | 'dip-to-black'

// ═══════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════

export function AssemblyPanel({ analysis, projectId, projectName }: AssemblyPanelProps) {
  const { t, locale } = useI18n()
  const plans = analysis?.plans || []

  // State
  const [transition, setTransition] = useState<TransitionType>('crossfade')
  const [transitionDuration, setTransitionDuration] = useState(500) // ms
  const [showTitle, setShowTitle] = useState(true)
  const [titleText, setTitleText] = useState(projectName || '')
  const [titleSubtext, setTitleSubtext] = useState('')
  const [showCredits, setShowCredits] = useState(true)
  const [creditLines, setCreditLines] = useState([
    locale === 'fr' ? 'Réalisé avec MISEN' : 'Made with MISEN',
    locale === 'fr' ? 'Production vidéo IA' : 'AI Video Production',
  ])
  const [resolution, setResolution] = useState<'1080p' | '720p'>('1080p')
  const [includeSubtitles, setIncludeSubtitles] = useState(false)
  const [includeVoiceover, setIncludeVoiceover] = useState(false)
  const [assembling, setAssembling] = useState(false)
  const [phase, setPhase] = useState('')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AssemblyResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  // Collect generated clips from analysis
  const generatedClips: AssemblyClip[] = plans
    .map((plan: any, i: number) => {
      const videoUrl = plan.generatedVideoUrl || plan.videoUrl || plan.resultUrl
      if (!videoUrl) return null
      return {
        planId: plan.id || `S${(plan.sceneIndex || 0) + 1}P${(plan.planIndex || i) + 1}`,
        videoUrl,
        duration: plan.estimatedDuration || plan.duree || 5,
        sceneIndex: plan.sceneIndex || 0,
        planIndex: plan.planIndex || i,
      }
    })
    .filter(Boolean) as AssemblyClip[]

  const totalDuration = generatedClips.reduce((s, c) => s + c.duration, 0)
  const hasClips = generatedClips.length > 0

  // Resolution dimensions
  const resDimensions = resolution === '1080p'
    ? { width: 1920, height: 1080 }
    : { width: 1280, height: 720 }

  // ─── Assemble ───
  const handleAssemble = useCallback(async () => {
    if (!hasClips) return
    setAssembling(true)
    setError(null)
    setResult(null)
    setPhase('')
    setProgress(0)

    try {
      const config: AssemblyConfig = {
        clips: generatedClips,
        projectName: titleText || projectName || 'MISEN Film',
        resolution: resDimensions,
        fps: 24,
        transition: {
          type: transition,
          durationMs: transition === 'cut' ? 0 : transitionDuration,
        },
        titleCard: showTitle ? {
          text: titleText || projectName || '',
          subtitle: titleSubtext || undefined,
          durationMs: 3000,
        } : undefined,
        credits: showCredits ? {
          lines: creditLines.filter(l => l.trim()),
          durationMs: 4000,
        } : undefined,
        onProgress: (p, pct) => {
          setPhase(p)
          setProgress(pct)
        },
      }

      const assemblyResult = await assembleVideo(config)
      setResult(assemblyResult)

      // Create preview URL
      const url = URL.createObjectURL(assemblyResult.blob)
      setPreview(url)

    } catch (err: any) {
      setError(err.message || 'Assembly failed')
    } finally {
      setAssembling(false)
    }
  }, [hasClips, generatedClips, transition, transitionDuration, showTitle, titleText, titleSubtext, showCredits, creditLines, resolution, resDimensions, projectName])

  // ─── Download ───
  const handleDownload = useCallback(() => {
    if (!result) return
    const safeName = (projectName || 'misen-film').replace(/[^a-zA-Z0-9-_]/g, '_')
    downloadAssembly(result, safeName)
  }, [result, projectName])

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  // Phase labels
  const phaseLabels: Record<string, string> = {
    loading: locale === 'fr' ? 'Chargement des clips...' : 'Loading clips...',
    setup: locale === 'fr' ? 'Configuration...' : 'Setting up...',
    rendering: locale === 'fr' ? 'Rendu en cours...' : 'Rendering...',
    encoding: locale === 'fr' ? 'Encodage final...' : 'Final encoding...',
    done: locale === 'fr' ? 'Terminé' : 'Done',
  }

  return (
    <div className="space-y-5">
      {/* ═══ HEADER ═══ */}
      <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Film size={18} className="text-orange-400" />
            <h2 className="text-sm font-bold text-slate-200">{t.project.assembly.title}</h2>
            <span className="text-[10px] text-slate-500 bg-dark-800 px-2 py-0.5 rounded">V10</span>
          </div>
          <button onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-400 transition-colors">
            <Settings size={14} />
          </button>
        </div>

        {/* Clip summary */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Layers size={12} /> {generatedClips.length}/{plans.length} {locale === 'fr' ? 'clips prêts' : 'clips ready'}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {totalDuration.toFixed(1)}s
          </span>
          <span className="flex items-center gap-1">
            <Film size={12} /> {resolution}
          </span>
          <span className="capitalize text-slate-500">{transition === 'dip-to-black' ? 'dip to black' : transition}</span>
        </div>

        {/* No clips warning */}
        {!hasClips && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <AlertTriangle size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-yellow-300 font-medium">{t.project.assembly.noClips}</p>
              <p className="text-[11px] text-yellow-400/70 mt-0.5">{t.project.assembly.noClipsDesc}</p>
            </div>
          </div>
        )}
      </div>

      {/* ═══ SETTINGS PANEL ═══ */}
      {showSettings && (
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-4 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">{t.project.assembly.settings}</h3>

          {/* Transition */}
          <div>
            <label className="text-[11px] text-slate-500 mb-1.5 block">{t.project.assembly.transition}</label>
            <div className="flex gap-2">
              {(['cut', 'crossfade', 'dip-to-black'] as TransitionType[]).map(t => (
                <button key={t} onClick={() => setTransition(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                    transition === t
                      ? 'bg-orange-600/15 border-orange-500/30 text-orange-300'
                      : 'bg-dark-800 border-dark-700 text-slate-500 hover:text-slate-400'
                  }`}>
                  {t === 'dip-to-black' ? 'Dip to Black' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            {transition !== 'cut' && (
              <div className="mt-2 flex items-center gap-2">
                <input type="range" min={200} max={2000} step={100} value={transitionDuration}
                  onChange={e => setTransitionDuration(Number(e.target.value))}
                  className="flex-1 accent-orange-500" />
                <span className="text-[10px] text-slate-500 w-10 text-right">{transitionDuration}ms</span>
              </div>
            )}
          </div>

          {/* Resolution */}
          <div>
            <label className="text-[11px] text-slate-500 mb-1.5 block">{t.project.assembly.resolution}</label>
            <div className="flex gap-2">
              {(['1080p', '720p'] as const).map(r => (
                <button key={r} onClick={() => setResolution(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs border ${
                    resolution === r
                      ? 'bg-orange-600/15 border-orange-500/30 text-orange-300'
                      : 'bg-dark-800 border-dark-700 text-slate-500'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Title card */}
          <div>
            <label className="flex items-center gap-2 text-[11px] text-slate-500 mb-1.5">
              <input type="checkbox" checked={showTitle} onChange={e => setShowTitle(e.target.checked)}
                className="accent-orange-500 rounded" />
              <Type size={12} /> {t.project.assembly.titleCard}
            </label>
            {showTitle && (
              <div className="space-y-1.5 ml-5">
                <input type="text" value={titleText} onChange={e => setTitleText(e.target.value)}
                  placeholder={locale === 'fr' ? 'Titre du film' : 'Film title'}
                  className="w-full px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-orange-500/50" />
                <input type="text" value={titleSubtext} onChange={e => setTitleSubtext(e.target.value)}
                  placeholder={locale === 'fr' ? 'Sous-titre (optionnel)' : 'Subtitle (optional)'}
                  className="w-full px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-xs text-slate-400 focus:outline-none focus:border-orange-500/50" />
              </div>
            )}
          </div>

          {/* Credits */}
          <div>
            <label className="flex items-center gap-2 text-[11px] text-slate-500 mb-1.5">
              <input type="checkbox" checked={showCredits} onChange={e => setShowCredits(e.target.checked)}
                className="accent-orange-500 rounded" />
              {t.project.assembly.credits}
            </label>
            {showCredits && (
              <textarea value={creditLines.join('\n')} onChange={e => setCreditLines(e.target.value.split('\n'))}
                rows={3} placeholder={locale === 'fr' ? 'Une ligne par crédit' : 'One line per credit'}
                className="w-full ml-5 px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-xs text-slate-300 font-mono focus:outline-none focus:border-orange-500/50 resize-none" />
            )}
          </div>
        </div>
      )}

      {/* ═══ CLIP TIMELINE ═══ */}
      {hasClips && (
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
          <h3 className="text-xs font-semibold text-slate-400 mb-3">
            {locale === 'fr' ? 'Timeline' : 'Timeline'} — {generatedClips.length} clips
          </h3>
          <div className="flex gap-1.5 overflow-x-auto pb-2">
            {generatedClips.map((clip, i) => (
              <div key={clip.planId}
                className="flex-shrink-0 w-[100px] bg-dark-800 rounded-lg border border-dark-700 p-2 text-center">
                <div className="w-full h-[56px] bg-dark-950 rounded mb-1.5 flex items-center justify-center">
                  <Film size={16} className="text-slate-700" />
                </div>
                <p className="text-[9px] font-bold text-slate-300">{clip.planId}</p>
                <p className="text-[9px] text-slate-500">{clip.duration.toFixed(1)}s</p>
                {i < generatedClips.length - 1 && transition !== 'cut' && (
                  <div className="absolute -right-1 top-1/2 w-2 h-2 rounded-full bg-orange-500/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ ASSEMBLY BUTTON ═══ */}
      <button onClick={handleAssemble} disabled={assembling || !hasClips}
        className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-500 hover:to-red-400 disabled:opacity-40 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all">
        {assembling ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {phaseLabels[phase] || phase} — {progress}%
          </>
        ) : result ? (
          <>
            <Check size={18} />
            {locale === 'fr' ? 'Ré-assembler' : 'Re-assemble'}
          </>
        ) : (
          <>
            <Sparkles size={18} />
            {t.project.assembly.assemble}
          </>
        )}
      </button>

      {/* Progress bar */}
      {assembling && (
        <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-600 to-red-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertTriangle size={12} /> {error}
          </p>
        </div>
      )}

      {/* ═══ RESULT / PREVIEW ═══ */}
      {result && preview && (
        <div className="bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
          <video src={preview} controls className="w-full aspect-video bg-black" />
          <div className="p-4 flex items-center justify-between">
            <div className="text-xs text-slate-400 space-y-0.5">
              <p>{result.format} · {formatFileSize(result.size)} · {result.duration.toFixed(1)}s</p>
              <p className="text-[10px] text-slate-600">{resDimensions.width}×{resDimensions.height} @ 24fps</p>
            </div>
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-colors">
              <Download size={14} /> {t.project.assembly.download}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
