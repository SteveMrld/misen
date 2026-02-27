'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Play, Loader2, Save,
  Brain, AlertTriangle, ChevronDown, ChevronRight,
  Film, Eye, DollarSign, Shield, Users, TrendingUp, Camera, Zap,
  Subtitles, Mic, Clock, Download, Volume2, Pause, SkipForward
} from 'lucide-react'

type Tab = 'script' | 'analyse' | 'timeline' | 'subtitles' | 'voiceover'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id as string

  const [project, setProject] = useState<any>(null)
  const [scriptText, setScriptText] = useState('')
  const [stylePreset, setStylePreset] = useState('cinematique')
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('script')

  useEffect(() => {
    if (!projectId) return
    fetch(`/api/projects/${projectId}`)
      .then(res => { if (!res.ok) throw new Error('not found'); return res.json() })
      .then(data => { setProject(data); setScriptText(data.script_text || '') })
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false))
  }, [projectId, router])

  useEffect(() => {
    if (!projectId) return
    fetch(`/api/projects/${projectId}/analyses`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (data?.length > 0) {
          if (data[0].result) setAnalysis(data[0].result)
          setAnalysisId(data[0].id)
        }
      })
      .catch(() => {})
  }, [projectId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script_text: scriptText }),
      })
    } catch {} finally { setSaving(false) }
  }

  const handleAnalyze = async () => {
    if (!scriptText.trim()) { setError('Collez un script avant de lancer l\'analyse'); return }
    setError('')
    setAnalyzing(true)
    await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script_text: scriptText }),
    })
    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style_preset: stylePreset }),
      })
      const data = await res.json()
      if (res.ok && data.result) {
        setAnalysis(data.result)
        setAnalysisId(data.analysis_id)
        setTab('analyse')
      } else setError(data.error || 'Erreur analyse')
    } catch { setError('Erreur réseau') }
    finally { setAnalyzing(false) }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 size={32} className="text-orange-500 animate-spin" /></div>
  }

  const tabs: { id: Tab; label: string; icon: any; disabled?: boolean }[] = [
    { id: 'script', label: 'Script', icon: Film },
    { id: 'analyse', label: 'Analyse', icon: Brain, disabled: !analysis },
    { id: 'timeline', label: 'Timeline', icon: Clock, disabled: !analysis },
    { id: 'subtitles', label: 'Sous-titres', icon: Subtitles, disabled: !analysis },
    { id: 'voiceover', label: 'Voix off', icon: Mic, disabled: !analysis },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="p-2 rounded-lg hover:bg-white/5">
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
          <h1 className="text-xl font-bold text-slate-50">{project?.name || 'Projet'}</h1>
        </div>
        {analysis && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{analysis.scenes?.length || 0} scènes</span>
            <span>•</span>
            <span>{analysis.plans?.length || 0} plans</span>
            <span>•</span>
            <span>${(analysis.costTotal || 0).toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-dark-900 rounded-lg p-1 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => !t.disabled && setTab(t.id)}
            disabled={t.disabled}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              tab === t.id ? 'bg-orange-600 text-white' :
              t.disabled ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* ═══ SCRIPT TAB ═══ */}
      {tab === 'script' && (
        <div>
          <div className="rounded-xl border border-dark-700" style={{ background: 'rgb(15,15,20)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgb(40,40,50)' }}>
              <span className="text-sm text-slate-300 font-medium">Script</span>
              <div className="flex items-center gap-2">
                <select value={stylePreset} onChange={(e) => setStylePreset(e.target.value)}
                  className="px-2 py-1 bg-dark-800 border border-dark-700 rounded text-xs text-slate-300">
                  <option value="cinematique">Cinématique</option>
                  <option value="documentaire">Documentaire</option>
                  <option value="noir">Film Noir</option>
                  <option value="onirique">Onirique</option>
                </select>
                <button onClick={handleSave} disabled={saving} className="p-1.5 rounded hover:bg-white/5">
                  {saving ? <Loader2 size={16} className="animate-spin text-slate-400" /> : <Save size={16} className="text-slate-400" />}
                </button>
              </div>
            </div>
            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder={'Collez votre script ici...\n\nExemple :\nINT. APPARTEMENT - JOUR\n\nMARC\nJe ne sais plus quoi faire...\n\nEXT. RUE - NUIT\nMarc marche seul sous la pluie.'}
              rows={16}
              className="block w-full p-4 bg-transparent text-slate-200 text-sm leading-relaxed focus:outline-none resize-none"
              spellCheck={false}
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 mt-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              <AlertTriangle size={16} /> {error}
            </div>
          )}
          <button onClick={handleAnalyze} disabled={analyzing || !scriptText.trim()}
            className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors">
            {analyzing ? <><Loader2 size={20} className="animate-spin" /> Analyse en cours...</> : <><Play size={20} /> Lancer l&apos;analyse</>}
          </button>
        </div>
      )}

      {/* ═══ ANALYSE TAB ═══ */}
      {tab === 'analyse' && analysis && <AnalysisResults analysis={analysis} analysisId={analysisId} />}

      {/* ═══ TIMELINE TAB ═══ */}
      {tab === 'timeline' && analysis && <TimelineView analysis={analysis} />}

      {/* ═══ SUBTITLES TAB ═══ */}
      {tab === 'subtitles' && analysis && <SubtitlesView projectId={projectId} analysis={analysis} />}

      {/* ═══ VOICEOVER TAB ═══ */}
      {tab === 'voiceover' && analysis && <VoiceoverView projectId={projectId} analysis={analysis} />}
    </div>
  )
}

// ═══════════════════════════════════════════
// TIMELINE COMPONENT
// ═══════════════════════════════════════════
function TimelineView({ analysis }: { analysis: any }) {
  const plans = analysis?.plans || []
  const totalDuration = plans.reduce((sum: number, p: any) => sum + (p.estimatedDuration || 4), 0)
  const [playhead, setPlayhead] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => {
      setPlayhead(prev => {
        if (prev >= totalDuration) { setPlaying(false); return 0 }
        return prev + 0.1
      })
    }, 100)
    return () => clearInterval(interval)
  }, [playing, totalDuration])

  let accumulated = 0
  const planPositions = plans.map((p: any) => {
    const start = accumulated
    const duration = p.estimatedDuration || 4
    accumulated += duration
    return { ...p, start, duration, end: start + duration }
  })

  const colors = ['#f97316', '#22d3ee', '#a78bfa', '#34d399', '#f472b6', '#fbbf24', '#60a5fa']

  return (
    <div>
      {/* Transport controls */}
      <div className="flex items-center gap-3 mb-4 bg-dark-900 rounded-xl p-3 border border-dark-700">
        <button onClick={() => { setPlayhead(0); setPlaying(false) }} className="p-2 rounded-lg hover:bg-white/5">
          <SkipForward size={16} className="text-slate-400 rotate-180" />
        </button>
        <button onClick={() => setPlaying(!playing)} className="p-2 bg-orange-600 rounded-lg hover:bg-orange-500">
          {playing ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white" />}
        </button>
        <div className="text-xs text-slate-400 font-mono">
          {formatTime(playhead)} / {formatTime(totalDuration)}
        </div>
        <div className="flex-1 h-1 bg-dark-700 rounded-full mx-2 cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const pct = (e.clientX - rect.left) / rect.width
          setPlayhead(pct * totalDuration)
        }}>
          <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${(playhead / totalDuration) * 100}%` }} />
        </div>
      </div>

      {/* Timeline tracks */}
      <div className="bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
        {/* Time ruler */}
        <div className="flex items-center h-8 border-b border-dark-700 px-2 relative">
          {Array.from({ length: Math.ceil(totalDuration) }, (_, i) => (
            <div key={i} className="absolute text-[9px] text-slate-600" style={{ left: `${(i / totalDuration) * 100}%` }}>
              {i}s
            </div>
          ))}
        </div>

        {/* Scene track */}
        <div className="px-2 py-2">
          <div className="flex items-center gap-1 mb-1">
            <Film size={12} className="text-slate-500" />
            <span className="text-[10px] text-slate-500 font-medium">Scènes</span>
          </div>
          <div className="relative h-8 bg-dark-800 rounded">
            {/* Scène markers */}
            {(analysis.scenes || []).map((scene: any, i: number) => {
              const scenePlans = planPositions.filter((p: any) => p.sceneIndex === i)
              if (scenePlans.length === 0) return null
              const start = scenePlans[0].start
              const end = scenePlans[scenePlans.length - 1].end
              return (
                <div key={i} className="absolute top-0 h-full rounded flex items-center px-2" style={{
                  left: `${(start / totalDuration) * 100}%`,
                  width: `${((end - start) / totalDuration) * 100}%`,
                  background: `${colors[i % colors.length]}20`,
                  borderLeft: `2px solid ${colors[i % colors.length]}`,
                }}>
                  <span className="text-[9px] text-slate-300 truncate">S{i + 1}: {scene.heading || ''}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Plans track */}
        <div className="px-2 py-2">
          <div className="flex items-center gap-1 mb-1">
            <Camera size={12} className="text-slate-500" />
            <span className="text-[10px] text-slate-500 font-medium">Plans</span>
          </div>
          <div className="relative h-12 bg-dark-800 rounded">
            {planPositions.map((plan: any, i: number) => (
              <div key={i} className="absolute top-0 h-full border-r border-dark-700 flex flex-col justify-center px-1 hover:brightness-125 transition-all cursor-pointer group" style={{
                left: `${(plan.start / totalDuration) * 100}%`,
                width: `${(plan.duration / totalDuration) * 100}%`,
                background: `${colors[plan.sceneIndex % colors.length]}30`,
              }}>
                <span className="text-[8px] text-slate-300 font-medium truncate">P{i + 1}</span>
                <span className="text-[7px] text-slate-500 truncate">{plan.shotType || ''} {plan.duration.toFixed(1)}s</span>
                {/* Tooltip */}
                <div className="hidden group-hover:block absolute bottom-full left-0 mb-1 p-2 bg-dark-900 border border-dark-600 rounded-lg shadow-lg z-10 w-48">
                  <p className="text-[10px] text-slate-300 font-medium mb-1">Plan {i + 1} — {plan.modelId}</p>
                  <p className="text-[9px] text-slate-500 leading-relaxed">{(plan.finalPrompt || plan.basePrompt || '').slice(0, 100)}...</p>
                </div>
              </div>
            ))}
            {/* Playhead */}
            <div className="absolute top-0 h-full w-0.5 bg-orange-500 z-10 pointer-events-none" style={{ left: `${(playhead / totalDuration) * 100}%` }} />
          </div>
        </div>

        {/* Audio track (placeholder) */}
        <div className="px-2 py-2 border-t border-dark-700">
          <div className="flex items-center gap-1 mb-1">
            <Volume2 size={12} className="text-slate-500" />
            <span className="text-[10px] text-slate-500 font-medium">Audio / Voix off</span>
          </div>
          <div className="relative h-6 bg-dark-800 rounded flex items-center justify-center">
            <span className="text-[9px] text-slate-600">Configurez la voix off dans l&apos;onglet dédié</span>
          </div>
        </div>

        {/* Subtitle track */}
        <div className="px-2 py-2 border-t border-dark-700">
          <div className="flex items-center gap-1 mb-1">
            <Subtitles size={12} className="text-slate-500" />
            <span className="text-[10px] text-slate-500 font-medium">Sous-titres</span>
          </div>
          <div className="relative h-6 bg-dark-800 rounded flex items-center justify-center">
            <span className="text-[9px] text-slate-600">Exportez les sous-titres dans l&apos;onglet dédié</span>
          </div>
        </div>
      </div>

      {/* Plan list */}
      <div className="mt-4 space-y-2">
        {planPositions.map((plan: any, i: number) => (
          <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
            playhead >= plan.start && playhead < plan.end ? 'bg-orange-500/10 border-orange-500/30' : 'bg-dark-900 border-dark-700'
          }`}>
            <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold" style={{ background: `${colors[plan.sceneIndex % colors.length]}30`, color: colors[plan.sceneIndex % colors.length] }}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-200 font-medium">{plan.shotType || 'PM'}</span>
                <span className="text-[10px] text-slate-500">{plan.cameraMove || 'fixe'}</span>
                <span className="text-[10px] text-slate-500">{plan.duration.toFixed(1)}s</span>
                <span className="text-[10px] text-orange-400">{plan.modelId}</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">{(plan.finalPrompt || plan.basePrompt || '').slice(0, 80)}</p>
            </div>
            <span className="text-[10px] text-slate-600 font-mono">{formatTime(plan.start)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
// SUBTITLES COMPONENT
// ═══════════════════════════════════════════
function SubtitlesView({ projectId, analysis }: { projectId: string; analysis: any }) {
  const [subtitles, setSubtitles] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const loadSubtitles = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/subtitles?format=json`)
      if (res.ok) setSubtitles(await res.json())
    } catch {}
    finally { setLoading(false) }
  }

  const downloadSRT = () => {
    window.open(`/api/projects/${projectId}/subtitles?format=srt`, '_blank')
  }

  const downloadVTT = () => {
    window.open(`/api/projects/${projectId}/subtitles?format=vtt`, '_blank')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-slate-100">Sous-titres</h3>
          <p className="text-xs text-slate-500">Générés automatiquement depuis les dialogues du script</p>
        </div>
        <div className="flex items-center gap-2">
          {!subtitles && (
            <button onClick={loadSubtitles} disabled={loading}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Subtitles size={14} />} Générer
            </button>
          )}
          {subtitles && (
            <>
              <button onClick={downloadSRT} className="px-3 py-2 bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5">
                <Download size={14} /> SRT
              </button>
              <button onClick={downloadVTT} className="px-3 py-2 bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5">
                <Download size={14} /> VTT
              </button>
            </>
          )}
        </div>
      </div>

      {subtitles ? (
        <div className="space-y-2">
          {subtitles.entries?.map((entry: any) => (
            <div key={entry.index} className="flex items-start gap-3 p-3 bg-dark-900 rounded-lg border border-dark-700">
              <span className="text-[10px] text-slate-600 font-mono w-16 flex-shrink-0 pt-0.5">
                {formatTime(entry.startTime)}
              </span>
              {entry.character && (
                <span className="text-xs text-orange-400 font-medium w-20 flex-shrink-0">{entry.character}</span>
              )}
              <p className="text-sm text-slate-200 flex-1">{entry.text}</p>
              <span className="text-[10px] text-slate-600 font-mono flex-shrink-0">
                {(entry.endTime - entry.startTime).toFixed(1)}s
              </span>
            </div>
          ))}
          {(!subtitles.entries || subtitles.entries.length === 0) && (
            <div className="p-6 bg-dark-900 rounded-xl border border-dark-700 text-center">
              <p className="text-sm text-slate-400">Aucun dialogue détecté dans le script</p>
              <p className="text-xs text-slate-500 mt-1">Ajoutez des dialogues avec les noms de personnages en majuscules</p>
            </div>
          )}
          {subtitles.entries?.length > 0 && (
            <div className="p-3 bg-dark-900 rounded-lg border border-dark-700">
              <p className="text-xs text-slate-500">
                {subtitles.entries.length} sous-titre{subtitles.entries.length > 1 ? 's' : ''} • Durée totale : {formatTime(subtitles.totalDuration)}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 bg-dark-900 rounded-xl border border-dark-700 text-center">
          <Subtitles size={36} className="text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Cliquez sur Générer pour extraire les sous-titres</p>
          <p className="text-xs text-slate-500 mt-1">Export SRT et VTT disponibles</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════
// VOICEOVER COMPONENT
// ═══════════════════════════════════════════
function VoiceoverView({ projectId, analysis }: { projectId: string; analysis: any }) {
  const [segments, setSegments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [provider, setProvider] = useState<'browser' | 'openai' | 'elevenlabs'>('browser')
  const [speaking, setSpeaking] = useState(false)

  const loadSegments = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/voiceover`)
      if (res.ok) {
        const data = await res.json()
        setSegments(data.segments || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  const previewBrowser = (text: string) => {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'fr-FR'
    utterance.rate = 0.9
    utterance.onend = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const previewAll = () => {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return }
    const allText = segments.map(s => s.character ? `${s.character}: ${s.text}` : s.text).join('. ')
    previewBrowser(allText)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-slate-100">Voix off</h3>
          <p className="text-xs text-slate-500">Narration et dialogues en text-to-speech</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={provider} onChange={(e) => setProvider(e.target.value as any)}
            className="px-2 py-1.5 bg-dark-800 border border-dark-700 rounded text-xs text-slate-300">
            <option value="browser">Navigateur (gratuit)</option>
            <option value="openai">OpenAI TTS</option>
            <option value="elevenlabs">ElevenLabs</option>
          </select>
          {segments.length === 0 ? (
            <button onClick={loadSegments} disabled={loading}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Mic size={14} />} Préparer
            </button>
          ) : (
            <button onClick={previewAll}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors">
              {speaking ? <><Pause size={14} /> Stop</> : <><Volume2 size={14} /> Écouter tout</>}
            </button>
          )}
        </div>
      </div>

      {segments.length > 0 ? (
        <div className="space-y-2">
          {segments.map((seg: any) => (
            <div key={seg.index} className="flex items-start gap-3 p-3 bg-dark-900 rounded-lg border border-dark-700 group">
              <button onClick={() => previewBrowser(seg.text)} className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 flex-shrink-0 mt-0.5">
                <Volume2 size={12} className="text-slate-400" />
              </button>
              <span className="text-[10px] text-slate-600 font-mono w-14 flex-shrink-0 pt-1">
                {formatTime(seg.startTime)}
              </span>
              {seg.character && (
                <span className="text-xs text-orange-400 font-medium w-20 flex-shrink-0 pt-0.5">{seg.character}</span>
              )}
              <div className="flex-1">
                <p className="text-sm text-slate-200">{seg.text}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">Voix : {seg.voice} • {seg.duration.toFixed(1)}s</p>
              </div>
            </div>
          ))}

          <div className="p-3 bg-dark-900 rounded-lg border border-dark-700">
            <p className="text-xs text-slate-500">
              {segments.length} segment{segments.length > 1 ? 's' : ''} •
              {provider === 'browser' ? ' Aperçu navigateur gratuit' : ` Génération via ${provider} (clé API requise dans Réglages)`}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-12 bg-dark-900 rounded-xl border border-dark-700 text-center">
          <Mic size={36} className="text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Cliquez sur Préparer pour analyser les segments voix off</p>
          <p className="text-xs text-slate-500 mt-1">Aperçu gratuit via le navigateur, ou OpenAI/ElevenLabs pour la production</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════
// ANALYSIS RESULTS (inchangé)
// ═══════════════════════════════════════════
function AnalysisResults({ analysis, analysisId }: { analysis: any; analysisId?: string | null }) {
  try {
    const scenes = analysis?.scenes || []
    const plans = analysis?.plans || []
    const tension = analysis?.tension || null
    const characterBible = analysis?.characterBible || []
    const compliance = analysis?.compliance || { level: 'OK', score: 100, flags: [] }
    const continuity = analysis?.continuity || { score: 100, alerts: [] }
    const costTotal = analysis?.costTotal || 0
    const costByModel = analysis?.costByModel || {}

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <Stat icon={Film} label="Scènes" value={scenes.length} />
          <Stat icon={Eye} label="Plans" value={plans.length} />
          <Stat icon={DollarSign} label="Coût" value={`$${costTotal.toFixed(2)}`} />
          <Stat icon={Shield} label="Continuité" value={`${continuity.score}%`} />
        </div>

        {tension?.curve?.length > 0 && (
          <Section icon={TrendingUp} title="Courbe de tension" color="text-red-400">
            <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
              <span>Arc : <strong className="text-slate-200">{tension.globalArc || '-'}</strong></span>
              <span>Moyenne : <strong className="text-slate-200">{Math.round(tension.avgTension || 0)}</strong></span>
            </div>
            <div className="flex items-end gap-1 h-16">
              {tension.curve.map((t: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-red-500/60 rounded-t" style={{ height: `${(t?.tension || 0) * 0.6}px` }} />
                  <span className="text-[10px] text-slate-600">{i + 1}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {characterBible.length > 0 && (
          <Section icon={Users} title="Personnages" color="text-blue-400">
            {characterBible.map((char: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <span className="w-24 text-sm text-slate-200 font-medium truncate">{char?.name || 'Inconnu'}</span>
                <span className="text-xs text-slate-500 flex-1 truncate">{char?.apparence || 'Non décrit'}</span>
              </div>
            ))}
          </Section>
        )}

        <Section icon={Shield} title="Compliance" color="text-green-400">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${compliance.level === 'OK' ? 'text-green-400' : compliance.level === 'WARNING' ? 'text-yellow-400' : 'text-red-400'}`}>
              {compliance.level}
            </span>
            <span className="text-xs text-slate-400">Score : {compliance.score}/100</span>
          </div>
        </Section>

        <Section icon={AlertTriangle} title="Continuité" color="text-yellow-400">
          <span className="text-sm text-slate-300">Score : {continuity.score}/100</span>
          {continuity.alerts?.length > 0 ? (
            <div className="mt-1.5 space-y-1">
              {continuity.alerts.map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${a?.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : a?.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{a?.severity}</span>
                  <span className="text-slate-400">{a?.type}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-slate-500 mt-1">Aucune alerte</p>}
        </Section>

        {plans.length > 0 && (
          <Section icon={Camera} title={`Plans (${plans.length})`} color="text-orange-400" startOpen={false}>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {plans.slice(0, 20).map((plan: any, i: number) => (
                <PlanCard key={i} plan={plan} index={i} analysisId={analysisId} />
              ))}
            </div>
          </Section>
        )}

        {Object.keys(costByModel).length > 0 && (
          <Section icon={DollarSign} title="Coûts par modèle" color="text-emerald-400" startOpen={false}>
            {Object.entries(costByModel).map(([model, cost]: [string, any]) => (
              <div key={model} className="flex items-center justify-between text-xs py-0.5">
                <span className="text-slate-300">{model}</span>
                <span className="text-slate-400">${Number(cost || 0).toFixed(3)}</span>
              </div>
            ))}
          </Section>
        )}
      </div>
    )
  } catch {
    return <div className="bg-dark-900 border border-red-500/20 rounded-xl p-6 text-center"><p className="text-red-400 text-sm">Erreur d&apos;affichage</p></div>
  }
}

// ═══════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function PlanCard({ plan, index, analysisId }: { plan: any; index: number; analysisId?: string | null }) {
  const [generating, setGenerating] = useState(false)
  const [genStatus, setGenStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle')
  const [genError, setGenError] = useState('')

  const handleGenerate = async () => {
    if (!analysisId) return
    setGenerating(true); setGenStatus('processing'); setGenError('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId, planIndex: index, sceneIndex: plan?.sceneIndex || 0, modelId: plan?.modelId, prompt: plan?.finalPrompt || plan?.adaptedPrompt || plan?.basePrompt || '', negativePrompt: plan?.negativePrompt }),
      })
      const data = await res.json()
      if (res.ok) { setGenStatus(data.status || 'processing'); if (data.error) { setGenError(data.error); setGenStatus('failed') } }
      else { setGenStatus('failed'); setGenError(data.error || 'Erreur') }
    } catch { setGenStatus('failed'); setGenError('Erreur réseau') }
    finally { setGenerating(false) }
  }

  return (
    <div className="bg-dark-800 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-300 font-medium">Plan {index + 1} — Scène {(plan?.sceneIndex || 0) + 1}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-orange-400">{plan?.modelId || '-'}</span>
          {genStatus === 'idle' && (
            <button onClick={handleGenerate} disabled={generating} className="px-2 py-0.5 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-medium rounded flex items-center gap-1 transition-colors">
              <Zap size={10} /> Générer
            </button>
          )}
          {genStatus === 'processing' && <span className="text-[10px] text-yellow-400 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> En cours...</span>}
          {genStatus === 'completed' && <span className="text-[10px] text-green-400">✓ Terminé</span>}
          {genStatus === 'failed' && <span className="text-[10px] text-red-400" title={genError}>✗ Erreur</span>}
        </div>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">{plan?.finalPrompt || plan?.adaptedPrompt || plan?.basePrompt || '-'}</p>
      {genError && <p className="text-[10px] text-red-400 mt-1">{genError}</p>}
      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-600">
        <span>{plan?.shotType || '-'}</span>
        <span>{plan?.cameraMove || '-'}</span>
        <span>{(plan?.estimatedDuration || 0).toFixed(1)}s</span>
        <span>${(plan?.estimatedCost || 0).toFixed(3)}</span>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl p-3 text-center">
      <Icon size={18} className="text-orange-500/60 mx-auto mb-1" />
      <p className="text-lg font-bold text-slate-100">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}

function Section({ icon: Icon, title, color, children, startOpen = true }: {
  icon: any; title: string; color: string; children: React.ReactNode; startOpen?: boolean
}) {
  const [open, setOpen] = useState(startOpen)
  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition-colors">
        <Icon size={18} className={color} />
        <span className="text-sm text-slate-200 font-medium flex-1 text-left">{title}</span>
        {open ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  )
}
