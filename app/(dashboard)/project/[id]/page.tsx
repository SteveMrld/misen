'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Play, Loader2, Save, Brain, AlertTriangle, ChevronDown, ChevronRight,
  Film, Eye, DollarSign, Shield, Users, TrendingUp, Camera, Zap, Copy, Check,
  Subtitles, Mic, Clock, Download, Volume2, Pause, SkipForward, SkipBack,
  Sparkles, Image, Search, RefreshCw, Wand2, SlidersHorizontal, Keyboard, ExternalLink
} from 'lucide-react'
import { StoryboardSVG } from '@/components/ui/storyboard-svg'
import { ModelBadge, getModelColor, ModelLegend } from '@/components/ui/model-badge'
import { ScreenplayAssistant } from '@/components/ui/screenplay-assistant'

// Demo images for Render panel
import imgSc1P1 from '@/public/images/sc1_fleuve.jpg'
import imgSc1P2 from '@/public/images/sc1_portrait.jpg'
import imgSc1P3 from '@/public/images/sc2_sable.jpg'
import imgSc2P1 from '@/public/images/sc1_pont.jpg'
import imgSc2P2 from '@/public/images/sc2_desert.jpg'
import imgSc2P3 from '@/public/images/sc3_silhouette.jpg'
import imgSc3P1 from '@/public/images/sc1_couloir.jpg'
import imgSc3P2 from '@/public/images/sc2_flacon.jpg'
import imgSc4P1 from '@/public/images/sc2_visage.jpg'
import imgSc4P2 from '@/public/images/sc3_oeil.jpg'

const DEMO_IMAGES = [
  imgSc1P1, imgSc1P2, imgSc1P3, imgSc2P1, imgSc2P2,
  imgSc2P3, imgSc3P1, imgSc3P2, imgSc4P1, imgSc4P2,
]
import { CompareButton } from '@/components/ui/compare-panel'
import { useKeyboardShortcuts, ShortcutOverlay } from '@/components/ui/keyboard-shortcuts'

type Mode = 'simple' | 'expert'
type Tab = 'script' | 'analyse' | 'timeline' | 'copilot' | 'media' | 'subtitles' | 'voiceover' | 'render'

function fmt(s: number) { return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` }

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
  const [mode, setMode] = useState<Mode>('simple')
  const [tab, setTab] = useState<Tab>('script')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Keyboard shortcuts — defined after handlers
  const tabKeys: Tab[] = ['script', 'analyse', 'timeline', 'copilot', 'media', 'subtitles', 'voiceover', 'render']

  useEffect(() => {
    if (!projectId) return
    fetch(`/api/projects/${projectId}`)
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(data => { setProject(data); setScriptText(data.script_text || '') })
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false))
  }, [projectId, router])

  useEffect(() => {
    if (!projectId) return
    fetch(`/api/projects/${projectId}/analyses`)
      .then(res => res.ok ? res.json() : [])
      .then(data => { if (data?.[0]) { if (data[0].result) setAnalysis(data[0].result); setAnalysisId(data[0].id) } })
      .catch(() => {})
  }, [projectId])

  const handleSave = async () => {
    setSaving(true)
    try { await fetch(`/api/projects/${projectId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ script_text: scriptText }) }) } catch {} finally { setSaving(false) }
  }

  const handleAnalyze = async () => {
    if (!scriptText.trim()) { setError('Collez un scénario'); return }
    setError(''); setAnalyzing(true)
    await fetch(`/api/projects/${projectId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ script_text: scriptText }) })
    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ style_preset: stylePreset }) })
      const data = await res.json()
      if (res.ok && data.result) { setAnalysis(data.result); setAnalysisId(data.analysis_id); if (mode === 'expert') setTab('analyse') }
      else setError(data.error || 'Erreur')
    } catch { setError('Erreur réseau') } finally { setAnalyzing(false) }
  }

  const loadDemo = async () => {
    try {
      const { DEMO_SCENARIO } = await import('@/lib/data/demo-scenario')
      setScriptText(DEMO_SCENARIO.script); setStylePreset(DEMO_SCENARIO.style_preset)
      await fetch(`/api/projects/${projectId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ script_text: DEMO_SCENARIO.script, name: DEMO_SCENARIO.name }) })
      setProject((p: any) => ({ ...p, name: DEMO_SCENARIO.name }))
    } catch {}
  }

  useKeyboardShortcuts([
    { key: '?', label: 'Raccourcis', action: () => setShowShortcuts(s => !s) },
    { key: 'Escape', label: 'Fermer', action: () => showShortcuts ? setShowShortcuts(false) : router.push('/dashboard') },
    { key: 'e', label: 'Mode', action: () => setMode(m => m === 'simple' ? 'expert' : 'simple') },
    { key: 's', ctrl: true, label: 'Sauver', action: handleSave },
    { key: 'Enter', ctrl: true, label: 'Analyser', action: handleAnalyze },
    ...tabKeys.map((t, i) => ({ key: String(i + 1), label: t, action: () => { setMode('expert'); setTab(t) } })),
  ])

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 size={32} className="text-orange-500 animate-spin" /></div>

  const tabs: { id: Tab; label: string; icon: any; disabled?: boolean }[] = [
    { id: 'script', label: 'Script', icon: Film },
    { id: 'analyse', label: 'Analyse', icon: Brain, disabled: !analysis },
    { id: 'timeline', label: 'Timeline', icon: Clock, disabled: !analysis },
    { id: 'copilot', label: 'Copilote IA', icon: Sparkles, disabled: !analysis },
    { id: 'media', label: 'Médias', icon: Image, disabled: !analysis },
    { id: 'subtitles', label: 'Sous-titres', icon: Subtitles, disabled: !analysis },
    { id: 'voiceover', label: 'Voix off', icon: Mic, disabled: !analysis },
    { id: 'render', label: 'Rendu', icon: Play, disabled: !analysis },
  ]

  return (
    <div>
      <ShortcutOverlay show={showShortcuts} onClose={() => setShowShortcuts(false)} />
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={20} className="text-slate-400" /></button>
          <div>
            <h1 className="text-lg font-bold text-slate-50">{project?.name || 'Projet'}</h1>
            {analysis && <p className="text-xs text-slate-500">{analysis.scenes?.length || 0} scènes • {analysis.plans?.length || 0} plans • ${(analysis.costTotal || 0).toFixed(2)}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto ml-12 sm:ml-0">
          {/* Export menu */}
          {analysis && (
            <div className="relative">
              <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-900 border border-dark-700 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors">
                <Download size={13} /> Export
              </button>
              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                  <div className="absolute right-0 top-9 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl shadow-black/40 z-50 py-1.5">
                    {[
                      { format: 'pdf', label: 'Bible PDF', icon: '📄', desc: 'Production book' },
                      { format: 'bible_html', label: 'Bible HTML', icon: '🌐', desc: 'Vue navigateur' },
                      { format: 'json', label: 'JSON complet', icon: '📦', desc: 'Données brutes' },
                      { format: 'csv', label: 'CSV plans', icon: '📊', desc: 'Tableur' },
                      { format: 'fountain', label: 'Fountain', icon: '🎬', desc: 'Scénario' },
                      { format: 'prompts', label: 'Prompts TXT', icon: '📝', desc: 'Copier-coller' },
                    ].map(exp => (
                      <button key={exp.format} onClick={() => { window.open(`/api/projects/${projectId}/export?format=${exp.format}`); setShowExportMenu(false) }}
                        className="flex items-center gap-3 w-full px-3 py-2 hover:bg-dark-700 transition-colors text-left">
                        <span className="text-sm">{exp.icon}</span>
                        <div>
                          <p className="text-xs font-medium text-slate-200">{exp.label}</p>
                          <p className="text-[10px] text-slate-500">{exp.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {/* Mode toggle */}
          <div className="flex items-center gap-2 bg-dark-900 rounded-lg p-1 border border-dark-700">
          <button onClick={() => setMode('simple')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'simple' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-slate-200'}`}>
            <Wand2 size={13} /> Simple
          </button>
          <button onClick={() => setMode('expert')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'expert' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:text-slate-200'}`}>
            <SlidersHorizontal size={13} /> Expert
          </button>
          </div>
        </div>
      </div>

      {/* MODE SIMPLE */}
      {mode === 'simple' && (
        <div className="max-w-3xl mx-auto space-y-5">
          {/* AI Screenplay Assistant */}
          <ScreenplayAssistant
            onUseScript={(script: string) => setScriptText(script)}
            existingScript={scriptText.trim() || undefined}
          />

          <div className="bg-dark-900 rounded-2xl border border-dark-700 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-dark-700">
              <div className="flex items-center gap-2">
                <Film size={16} className="text-orange-500" />
                <span className="text-sm font-medium text-slate-200">Votre scénario</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select value={stylePreset} onChange={(e: any) => setStylePreset(e.target.value)} className="px-2 py-1 bg-dark-800 border border-dark-600 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-orange-500/50">
                  <option value="cinematique">🎬 Cinématique</option><option value="documentaire">📹 Documentaire</option>
                  <option value="noir">🌑 Film noir</option><option value="onirique">🌙 Onirique</option>
                </select>
                <button onClick={loadDemo} className="px-2 py-1 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-xs text-slate-400">Démo</button>
                <button onClick={handleSave} disabled={saving} className="px-2 py-1 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-xs text-slate-400 flex items-center gap-1">
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Sauver
                </button>
              </div>
            </div>
            <textarea value={scriptText} onChange={(e: any) => setScriptText(e.target.value)} placeholder="Collez votre scénario ici..." rows={12}
              className="w-full p-4 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none font-mono leading-relaxed" />
          </div>

          <button onClick={handleAnalyze} disabled={analyzing || !scriptText.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:from-dark-700 disabled:to-dark-700 disabled:text-slate-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 disabled:shadow-none">
            {analyzing ? <><Loader2 size={18} className="animate-spin" /> Analyse en cours — 13 moteurs...</> : <><Brain size={18} /> Analyser avec 13 moteurs IA</>}
          </button>
          {error && <p className="text-xs text-red-400 text-center flex items-center justify-center gap-1"><AlertTriangle size={12} /> {error}</p>}

          {analysis && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <St icon={Film} label="Scènes" value={analysis.scenes?.length || 0} /><St icon={Eye} label="Plans" value={analysis.plans?.length || 0} />
                <St icon={DollarSign} label="Budget" value={`$${(analysis.costTotal || 0).toFixed(2)}`} /><St icon={Shield} label="Continuité" value={`${analysis.continuity?.score || 0}%`} />
              </div>
              <div className="bg-dark-900 rounded-2xl border border-dark-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-dark-700 flex items-center justify-between">
                  <div className="flex items-center gap-2"><Camera size={16} className="text-orange-500" /><span className="text-sm font-medium text-slate-200">Plans & Prompts</span></div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => {
                      const allPrompts = (analysis.plans || []).map((p: any, i: number) => `[P${i+1}] ${p.modelId || 'kling'}\n${p.finalPrompt || p.basePrompt || ''}`).join('\n\n---\n\n')
                      navigator.clipboard.writeText(allPrompts)
                    }} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-lg shadow-orange-600/20">
                      <Copy size={12} /> Copier tous les prompts
                    </button>
                    <button onClick={() => setMode('expert')} className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"><SlidersHorizontal size={12} /> Mode Expert →</button>
                  </div>
                </div>
                <div className="divide-y divide-dark-700/50">
                  {(analysis.plans || []).slice(0, 30).map((plan: any, i: number) => (
                    <SPC key={i} plan={plan} index={i} analysisId={analysisId} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 justify-center flex-wrap">
                <button onClick={() => { setMode('expert'); setTab('timeline') }} className="px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5"><Clock size={14} /> Timeline</button>
                <button onClick={() => { setMode('expert'); setTab('copilot') }} className="px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5"><Sparkles size={14} /> Copilote IA</button>
                <button onClick={() => { setMode('expert'); setTab('subtitles') }} className="px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5"><Subtitles size={14} /> Sous-titres</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE EXPERT */}
      {mode === 'expert' && (
        <div>
          <div className="flex gap-1 mb-5 bg-dark-900 rounded-xl p-1.5 overflow-x-auto border border-dark-700 scrollbar-hide">
            {tabs.map(t => (
              <button key={t.id} onClick={() => !t.disabled && setTab(t.id)} disabled={t.disabled}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${tab === t.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : t.disabled ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>
          {tab === 'script' && <ScriptTab scriptText={scriptText} setScriptText={setScriptText} stylePreset={stylePreset} setStylePreset={setStylePreset} saving={saving} analyzing={analyzing} error={error} handleSave={handleSave} handleAnalyze={handleAnalyze} loadDemo={loadDemo} />}
          {tab === 'analyse' && analysis && <AR analysis={analysis} analysisId={analysisId} />}
          {tab === 'timeline' && analysis && <TL analysis={analysis} projectName={project?.name} />}
          {tab === 'copilot' && analysis && <CP projectId={projectId} projectName={project?.name} />}
          {tab === 'media' && analysis && <MB analysis={analysis} projectId={projectId} projectName={project?.name} />}
          {tab === 'subtitles' && analysis && <SV projectId={projectId} projectName={project?.name} />}
          {tab === 'voiceover' && analysis && <VO projectId={projectId} projectName={project?.name} />}
          {tab === 'render' && analysis && <RenderPanel analysis={analysis} analysisId={analysisId} projectName={project?.name} />}
        </div>
      )}
    </div>
  )
}

// ═══ Model studio URLs ═══
const MODEL_URLS: Record<string, { name: string; url: string }> = {
  kling: { name: 'Kling', url: 'https://klingai.com' },
  'kling 3.0': { name: 'Kling', url: 'https://klingai.com' },
  runway: { name: 'Runway', url: 'https://app.runwayml.com' },
  'runway gen-4': { name: 'Runway', url: 'https://app.runwayml.com' },
  'runway gen-4.5': { name: 'Runway', url: 'https://app.runwayml.com' },
  sora: { name: 'Sora', url: 'https://sora.com' },
  'sora 2': { name: 'Sora', url: 'https://sora.com' },
  veo: { name: 'Veo', url: 'https://deepmind.google/technologies/veo/' },
  'veo 3.1': { name: 'Veo', url: 'https://deepmind.google/technologies/veo/' },
  hailuo: { name: 'Hailuo', url: 'https://hailuoai.video' },
  'hailuo 2.3': { name: 'Hailuo', url: 'https://hailuoai.video' },
  seedance: { name: 'Seedance', url: 'https://seedance.ai' },
  'seedance 2.0': { name: 'Seedance', url: 'https://seedance.ai' },
  'wan 2.5': { name: 'Wan', url: 'https://wan.video' },
}
const getModelStudio = (mid: string) => MODEL_URLS[mid.toLowerCase()] || MODEL_URLS['kling']

// ═══ Simple Plan Card ═══
function SPC({ plan, index, analysisId }: { plan: any; index: number; analysisId?: string | null }) {
  const [copied, setCopied] = useState(false)

  const prompt = plan?.finalPrompt || plan?.basePrompt || ''
  const mid = (plan?.modelId || 'kling').toLowerCase()
  const mc = getModelColor(mid)
  const studio = getModelStudio(mid)

  const copy = () => { navigator.clipboard.writeText(prompt).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }).catch(() => {}) }

  return (
    <div className="card overflow-hidden group hover:border-dark-600 transition-all">
      <div className="flex gap-3 p-3">
        {/* Preview */}
        <div className="flex-shrink-0 relative">
          <StoryboardSVG shotType={plan?.shotType} cameraMove={plan?.cameraMove} width={160} height={90} modelColor={mc} />
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">P{index+1}</span>
              <ModelBadge modelId={mid} size="xs" />
              <span className="text-[10px] text-slate-500">{(plan?.estimatedDuration||0).toFixed(1)}s</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-600">${(plan?.estimatedCost||0).toFixed(3)}</span>
              <button onClick={copy} className="px-2 py-1 bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 text-[10px] rounded flex items-center gap-1 transition-colors">
                {copied ? <><Check size={10} /> Copié !</> : <><Copy size={10} /> Prompt</>}
              </button>
              <a href={studio.url} target="_blank" rel="noopener noreferrer"
                className="px-2 py-1 bg-dark-700 hover:bg-dark-600 text-slate-300 text-[10px] rounded flex items-center gap-1 transition-colors">
                <ExternalLink size={9} /> {studio.name}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-slate-500">{plan?.shotType}</span>
            {plan?.cameraMove && plan.cameraMove !== 'fixe' && <span className="text-[10px] text-cyan-400/60">{plan.cameraMove}</span>}
            <CompareButton plan={plan} />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono line-clamp-2">{prompt || '—'}</p>
        </div>
      </div>
    </div>
  )
}

// ═══ Script Tab ═══
function ScriptTab({ scriptText, setScriptText, stylePreset, setStylePreset, saving, analyzing, error, handleSave, handleAnalyze, loadDemo }: any) {
  return (
    <div className="space-y-4">
      {/* AI Screenplay Assistant */}
      <ScreenplayAssistant
        onUseScript={(script: string) => setScriptText(script)}
        existingScript={scriptText.trim() || undefined}
      />

      <div className="bg-dark-900 rounded-xl border border-dark-700">
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700">
          <div className="flex items-center gap-2">
            <select value={stylePreset} onChange={(e: any) => setStylePreset(e.target.value)} className="px-2 py-1 bg-dark-800 border border-dark-600 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-orange-500/50">
              <option value="cinematique">🎬 Cinématique</option><option value="documentaire">📹 Documentaire</option>
              <option value="noir">🌑 Film noir</option><option value="onirique">🌙 Onirique</option>
            </select>
            <button onClick={loadDemo} className="px-2 py-1 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-xs text-slate-400">Démo</button>
          </div>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-xs text-slate-300">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Sauvegarder
          </button>
        </div>
        <textarea value={scriptText} onChange={(e: any) => setScriptText(e.target.value)} placeholder="Collez votre scénario ici..." rows={16}
          className="w-full p-4 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none font-mono leading-relaxed" />
      </div>
      <button onClick={handleAnalyze} disabled={analyzing || !scriptText.trim()}
        className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:opacity-40 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
        {analyzing ? <><Loader2 size={18} className="animate-spin" /> Analyse...</> : <><Play size={18} /> Lancer l&apos;analyse</>}
      </button>
      {error && <p className="text-xs text-red-400 text-center flex items-center justify-center gap-1"><AlertTriangle size={12} /> {error}</p>}
    </div>
  )
}

// ═══ Copilot ═══
function CP({ projectId, projectName }: { projectId: string; projectName?: string }) {
  const isDemo = (projectName || '').toLowerCase().includes('démo') || (projectName || '').toLowerCase().includes('demo')
  const DEMO_SUGGESTIONS = [
    { icon: '🎬', title: 'Ça me fait penser à...', detail: 'Cinema Paradiso (Tornatore, 1988) — la scène du cinéma. Technique recommandée : lumière projetée sur les visages, contrejour de l\'écran.' },
    { icon: '🎵', title: 'Suggestion musicale', detail: 'Piano solo minimaliste type Yann Tiersen. Les cordes lentes de Max Richter (On the Nature of Daylight) colleraient aussi au thème du deuil.' },
    { icon: '📐', title: 'As-tu pensé à...', detail: 'Un plan-séquence sans coupe pour la scène de l\'hôpital. La tension continue sans montage renforcerait l\'émotion.' },
    { icon: '🪑', title: 'L\'art du vide', detail: 'La place vide au cinéma est un personnage. Yasujirō Ozu filmait les espaces vides après le départ des personnages — les "pillow shots".' },
    { icon: '💡', title: 'Astuce flashback', detail: 'Change le ratio d\'image (2.35:1 → 4:3) ou désature légèrement pour distinguer les temporalités. Nolan utilise IMAX vs 35mm dans Oppenheimer.' },
  ]
  const [sug, setSug] = useState<any[]>(isDemo ? DEMO_SUGGESTIONS : []); const [ld, setLd] = useState(false)
  const load = async () => { if (isDemo) { setSug(DEMO_SUGGESTIONS); return } setLd(true); try { const r = await fetch(`/api/projects/${projectId}/copilot`); if(r.ok){const d=await r.json();setSug(d.suggestions||[])} } catch{} finally{setLd(false)} }
  return (<div>
    <div className="flex items-center justify-between mb-4">
      <div><h3 className="text-sm font-medium text-slate-100">Copilote IA</h3><p className="text-xs text-slate-500">Références cinéma, suggestions musicales, cadrage</p></div>
      <button onClick={load} disabled={ld} className="px-3 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1.5">{ld ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} {sug.length ? 'Nouvelles idées' : 'Analyser'}</button>
    </div>
    {sug.length > 0 ? <div className="space-y-3">{sug.map((s:any,i:number) => <div key={i} className="bg-dark-900 rounded-xl border border-dark-700 p-4 flex items-start gap-3"><span className="text-xl flex-shrink-0">{s.icon||'💡'}</span><div><p className="text-sm text-slate-200 font-medium">{s.title}</p><p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.detail}</p></div></div>)}</div>
      : <div className="p-12 bg-dark-900 rounded-xl border border-dark-700 text-center"><Sparkles size={36} className="text-slate-700 mx-auto mb-3" /><p className="text-sm text-slate-400">Cliquez Analyser pour des suggestions</p></div>}
  </div>)
}

// ═══ Media Bank ═══
function MB({ analysis, projectId, projectName }: { analysis: any; projectId: string; projectName?: string }) {
  const isDemoMB = (projectName || '').toLowerCase().includes('démo') || (projectName || '').toLowerCase().includes('demo')
  const DEMO_MEDIA = [
    { id: 'd1', thumbnail: imgSc1P1.src, title: 'Fleuve au crépuscule', source: 'Référence' },
    { id: 'd2', thumbnail: imgSc2P1.src, title: 'Pont suspendu — brume', source: 'Référence' },
    { id: 'd3', thumbnail: imgSc3P1.src, title: 'Couloir hôpital — lumière', source: 'Référence' },
    { id: 'd4', thumbnail: imgSc4P1.src, title: 'Silhouettes retrouvailles', source: 'Référence' },
    { id: 'd5', thumbnail: imgSc1P2.src, title: 'Portrait — clair-obscur', source: 'Moodboard' },
    { id: 'd6', thumbnail: imgSc2P3.src, title: 'Jumeaux — contrejour', source: 'Moodboard' },
  ]
  const [q, setQ] = useState(''); const [res, setRes] = useState<any[]>(isDemoMB ? DEMO_MEDIA : []); const [ld, setLd] = useState(false); const [err, setErr] = useState('')
  const srch = async (sq?: string) => { const s=sq||q; if(!s.trim())return; setLd(true);setErr(''); try{const r=await fetch(`/api/media?q=${encodeURIComponent(s)}&type=all`);const d=await r.json();if(d.error&&!d.results?.length)setErr(d.error);setRes(d.results||[])}catch{setErr('Erreur')}finally{setLd(false)} }
  const sugs = (analysis?.scenes||[]).slice(0,4).map((s:any)=>(s.heading||'').replace(/^(INT\.|EXT\.)\s*/i,'').replace(/–.*/g,'').trim()).filter(Boolean)
  return (<div>
    <div className="flex items-center gap-2 mb-4">
      <div className="flex-1 relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&srch()} placeholder="Rechercher images et vidéos..." className="w-full h-9 pl-9 pr-3 bg-dark-900 border border-dark-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50" />
      </div>
      <button onClick={()=>srch()} disabled={ld||!q.trim()} className="h-9 px-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white text-xs font-medium rounded-lg">{ld ? <Loader2 size={14} className="animate-spin" /> : 'Chercher'}</button>
    </div>
    {sugs.length>0&&res.length===0&&<div className="flex items-center gap-2 mb-4 flex-wrap"><span className="text-xs text-slate-500">Suggestions :</span>{sugs.map((s:string,i:number)=><button key={i} onClick={()=>{setQ(s);srch(s)}} className="px-2 py-1 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded text-xs text-slate-300">{s}</button>)}</div>}
    {err&&<div className="p-3 mb-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-400">{err}</div>}
    {res.length>0 ? <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{res.map((r:any)=><div key={r.id} className="relative group rounded-lg overflow-hidden border border-dark-700"><img src={r.thumbnail||r.url} alt={r.title} className="w-full aspect-video object-cover bg-dark-800" loading="lazy" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2"><p className="text-[10px] text-white truncate">{r.title} • {r.source}</p></div></div>)}</div>
      : !ld && <div className="p-12 bg-dark-900 rounded-xl border border-dark-700 text-center"><Image size={36} className="text-slate-700 mx-auto mb-3" /><p className="text-sm text-slate-400">Recherchez des références visuelles</p></div>}
  </div>)
}

// ═══ Timeline ═══
function TL({ analysis, projectName }: { analysis: any; projectName?: string }) {
  const isDemoTL = (projectName || '').toLowerCase().includes('démo') || (projectName || '').toLowerCase().includes('demo')
  const [playing, setPlaying] = useState(false); const [ph, setPh] = useState(0)
  const plans = analysis?.plans || []; const scenes = analysis?.scenes || []
  const total = plans.reduce((s:number,p:any)=>s+(p?.estimatedDuration||3),0)||1
  useEffect(() => { if(!playing)return; const id=setInterval(()=>{setPh(p=>{if(p>=total){setPlaying(false);return 0};return p+0.1})},100); return()=>clearInterval(id) }, [playing, total])
  return (<div className="space-y-4">
    {/* Transport controls */}
    <div className="flex items-center gap-3 bg-dark-900 rounded-xl border border-dark-700 px-4 py-3">
      <button onClick={()=>setPh(0)} className="p-1.5 rounded hover:bg-white/5"><SkipBack size={16} className="text-slate-400" /></button>
      <button onClick={()=>setPlaying(!playing)} className="p-2 rounded-full bg-orange-600 hover:bg-orange-500">{playing ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white" />}</button>
      <button onClick={()=>setPh(Math.min(ph+5,total))} className="p-1.5 rounded hover:bg-white/5"><SkipForward size={16} className="text-slate-400" /></button>
      <span className="text-sm text-slate-200 font-mono">{fmt(ph)}</span>
      <div className="flex-1 relative h-2 bg-dark-700 rounded-full cursor-pointer" onClick={e=>{const r=e.currentTarget.getBoundingClientRect();setPh((e.clientX-r.left)/r.width*total)}}>
        <div className="absolute top-0 left-0 h-full bg-orange-500 rounded-full" style={{width:`${(ph/total)*100}%`}} />
      </div>
      <span className="text-sm text-slate-500 font-mono">{fmt(total)}</span>
    </div>
    {/* Model legend */}
    <ModelLegend className="px-1" />
    {/* Tracks */}
    <div className="bg-dark-900 rounded-xl border border-dark-700 p-4 overflow-x-auto">
      <div className="relative" style={{ minWidth: Math.max(plans.length * 120, 600) }}>
        {/* Scene track */}
        <div className="flex h-7 mb-2 rounded overflow-hidden">
          {scenes.map((s:any,i:number)=>{
            const sp=plans.filter((p:any)=>(p?.sceneIndex||0)===i)
            const d=sp.reduce((sum:number,p:any)=>sum+(p?.estimatedDuration||3),0)||1
            return <div key={i} className="flex items-center justify-center text-[10px] text-slate-300 font-medium border-r border-dark-700/50" style={{width:`${(d/total)*100}%`, backgroundColor:'rgba(249,115,22,0.08)'}}>
              <Film size={10} className="text-orange-400/60 mr-1" />S{i+1}
            </div>
          })}
        </div>
        {/* Plan track with storyboard thumbnails */}
        <div className="flex gap-1 min-h-[72px]">
          {plans.map((p:any,i:number)=>{
            const d=p?.estimatedDuration||3
            const mc=getModelColor((p?.modelId||'').toLowerCase())
            return <div key={i} className="flex-shrink-0 rounded-lg overflow-hidden border border-dark-700/50 hover:border-dark-600 transition-all cursor-pointer group relative" style={{width:`${Math.max((d/total)*100,5)}%`, minWidth: 80}}>
              {isDemoTL && DEMO_IMAGES[i % DEMO_IMAGES.length] ? (
                <img src={DEMO_IMAGES[i % DEMO_IMAGES.length].src} alt={`P${i+1}`} className="w-full h-[68px] object-cover" />
              ) : (
                <StoryboardSVG shotType={p?.shotType} cameraMove={p?.cameraMove} width={120} height={68} modelColor={mc} />
              )}
              {/* Overlay info */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-dark-950/90 to-transparent px-1.5 py-1">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold text-slate-300">P{i+1}</span>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mc }} />
                </div>
              </div>
            </div>
          })}
        </div>
        {/* Playhead */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-orange-500 pointer-events-none z-10" style={{left:`${(ph/total)*100}%`}}>
          <div className="w-2.5 h-2.5 bg-orange-500 rounded-full -ml-[4px] -mt-1" />
        </div>
      </div>
    </div>
  </div>)
}

// ═══ Subtitles ═══
function SV({ projectId, projectName }: { projectId: string; projectName?: string }) {
  const isDemoSV = (projectName || '').toLowerCase().includes('démo') || (projectName || '').toLowerCase().includes('demo')
  const DEMO_SUBS = { entries: [
    { index: 1, startTime: 3, character: 'ADRIEN', text: 'On y va aujourd\'hui. Pas vrai\u00A0?' },
    { index: 2, startTime: 12, character: 'LÉO', text: 'On se promet un truc. Même quand on sera grands\u2026' },
    { index: 3, startTime: 16, character: 'ADRIEN ENFANT', text: 'On fera tout ensemble.' },
    { index: 4, startTime: 25, character: 'INFIRMIÈRE', text: 'Vous pouvez arrêter de venir\u2026 ça fait deux ans.' },
    { index: 5, startTime: 30, character: 'ADRIEN', text: 'On avait dit\u2026 ensemble.' },
    { index: 6, startTime: 40, character: 'CONTRÔLEUR', text: 'Vous êtes seul\u00A0?' },
    { index: 7, startTime: 43, character: 'ADRIEN', text: 'Non. Jamais.' },
  ] }
  const [subs, setSubs] = useState<any>(isDemoSV ? DEMO_SUBS : null); const [ld, setLd] = useState(false)
  const load = async () => { setLd(true); try{const r=await fetch(`/api/projects/${projectId}/subtitles?format=json`);if(r.ok)setSubs(await r.json())}catch{}finally{setLd(false)} }
  return (<div>
    <div className="flex items-center justify-between mb-4">
      <div><h3 className="text-sm font-medium text-slate-100">Sous-titres</h3><p className="text-xs text-slate-500">Extraction des dialogues</p></div>
      <div className="flex items-center gap-2">
        {!subs ? <button onClick={load} disabled={ld} className="px-3 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1.5">{ld ? <Loader2 size={14} className="animate-spin" /> : <Subtitles size={14} />} Générer</button>
          : <><button onClick={()=>window.open(`/api/projects/${projectId}/subtitles?format=srt`)} className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs rounded-lg flex items-center gap-1"><Download size={12} /> SRT</button><button onClick={()=>window.open(`/api/projects/${projectId}/subtitles?format=vtt`)} className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs rounded-lg flex items-center gap-1"><Download size={12} /> VTT</button></>}
      </div>
    </div>
    {subs ? <div className="space-y-2">{subs.entries?.map((e:any)=><div key={e.index} className="flex items-start gap-3 p-3 bg-dark-900 rounded-lg border border-dark-700"><span className="text-[10px] text-slate-600 font-mono w-14 flex-shrink-0">{fmt(e.startTime)}</span>{e.character&&<span className="text-xs text-orange-400 font-medium w-20 flex-shrink-0">{e.character}</span>}<p className="text-sm text-slate-200 flex-1">{e.text}</p></div>)}{(!subs.entries?.length)&&<p className="text-sm text-slate-400 text-center p-6">Aucun dialogue détecté</p>}</div>
      : <div className="p-12 bg-dark-900 rounded-xl border border-dark-700 text-center"><Subtitles size={32} className="text-slate-700 mx-auto mb-3" /><p className="text-sm text-slate-400">Cliquez Générer pour extraire les sous-titres</p></div>}
  </div>)
}

// ═══ Voiceover ═══
function VO({ projectId, projectName }: { projectId: string; projectName?: string }) {
  const isDemoVO = (projectName || '').toLowerCase().includes('démo') || (projectName || '').toLowerCase().includes('demo')
  const DEMO_SEGS = [
    { character: 'ADRIEN', text: 'On y va aujourd\'hui. Pas vrai\u00A0?', emotion: 'mélancolie' },
    { character: 'LÉO', text: 'On se promet un truc. Même quand on sera grands\u2026', emotion: 'tendresse' },
    { character: 'ADRIEN ENFANT', text: 'On fera tout ensemble.', emotion: 'innocence' },
    { character: 'INFIRMIÈRE', text: 'Vous pouvez arrêter de venir\u2026 ça fait deux ans.', emotion: 'compassion' },
    { character: 'ADRIEN', text: 'On avait dit\u2026 ensemble.', emotion: 'douleur' },
    { character: 'CONTRÔLEUR', text: 'Vous êtes seul\u00A0?', emotion: 'neutre' },
    { character: 'ADRIEN', text: 'Non. Jamais.', emotion: 'résolution' },
  ]
  const [segs, setSegs] = useState<any[]>(isDemoVO ? DEMO_SEGS : []); const [ld, setLd] = useState(false); const [sp, setSp] = useState(false); const [prov, setProv] = useState('browser')
  const load = async () => { setLd(true); try{const r=await fetch(`/api/projects/${projectId}/voiceover`);if(r.ok){const d=await r.json();setSegs(d.segments||[])}}catch{}finally{setLd(false)} }
  const speak = (text: string) => {
    if(typeof window==='undefined')return; if(sp){window.speechSynthesis?.cancel();setSp(false);return}
    const u=new SpeechSynthesisUtterance(text);u.lang='fr-FR';u.rate=0.9;u.onend=()=>setSp(false);setSp(true);window.speechSynthesis?.speak(u)
  }
  return (<div>
    <div className="flex items-center justify-between mb-4">
      <div><h3 className="text-sm font-medium text-slate-100">Voix off</h3><p className="text-xs text-slate-500">Narration et dialogues</p></div>
      <div className="flex items-center gap-2">
        <select value={prov} onChange={(e:any)=>setProv(e.target.value)} className="px-2 py-1.5 bg-dark-800 border border-dark-700 rounded text-xs text-slate-300"><option value="browser">Navigateur (gratuit)</option><option value="openai">OpenAI TTS</option><option value="elevenlabs">ElevenLabs</option></select>
        {!segs.length ? <button onClick={load} disabled={ld} className="px-3 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1.5">{ld ? <Loader2 size={14} className="animate-spin" /> : <Mic size={14} />} Préparer</button>
          : <button onClick={()=>speak(segs.map((s:any)=>s.character?`${s.character}: ${s.text}`:s.text).join('. '))} className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5">{sp ? <><Pause size={14} /> Stop</> : <><Volume2 size={14} /> Écouter</>}</button>}
      </div>
    </div>
    {segs.length>0 ? <div className="space-y-2">{segs.map((s:any)=><div key={s.index} className="flex items-start gap-3 p-3 bg-dark-900 rounded-lg border border-dark-700"><button onClick={()=>speak(s.text)} className="p-1.5 rounded bg-dark-800 hover:bg-dark-700 flex-shrink-0"><Volume2 size={12} className="text-slate-400" /></button><span className="text-[10px] text-slate-600 font-mono w-12 flex-shrink-0 pt-1">{fmt(s.startTime)}</span>{s.character&&<span className="text-xs text-orange-400 w-16 flex-shrink-0">{s.character}</span>}<p className="text-sm text-slate-200 flex-1">{s.text}</p></div>)}</div>
      : <div className="p-12 bg-dark-900 rounded-xl border border-dark-700 text-center"><Mic size={32} className="text-slate-700 mx-auto mb-3" /><p className="text-sm text-slate-400">Cliquez Préparer pour les segments voix off</p></div>}
  </div>)
}

// ═══ Analysis Results ═══
function AR({ analysis, analysisId }: { analysis: any; analysisId?: string | null }) {
  try {
    const scenes=analysis?.scenes||[]; const plans=analysis?.plans||[]; const tension=analysis?.tension; const chars=analysis?.characterBible||[]
    const comp=analysis?.compliance||{level:'OK',score:100,flags:[]}; const cont=analysis?.continuity||{score:100,alerts:[]}; const cost=analysis?.costTotal||0

    // Model distribution
    const modelCounts: Record<string, number> = {}
    plans.forEach((p: any) => { const m = p?.modelId || 'kling'; modelCounts[m] = (modelCounts[m] || 0) + 1 })
    const modelEntries = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])

    return (<div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <St icon={Film} label="Scènes" value={scenes.length} /><St icon={Eye} label="Plans" value={plans.length} />
        <St icon={DollarSign} label="Coût" value={`$${cost.toFixed(2)}`} /><St icon={Shield} label="Continuité" value={`${cont.score}%`} />
      </div>

      {/* Model Distribution */}
      {modelEntries.length > 0 && (
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-orange-400" />
            <span className="text-sm text-slate-200 font-medium">Répartition modèles</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden mb-3">
            {modelEntries.map(([mid, count]) => (
              <div key={mid} className="h-full transition-all" style={{ width: `${(count / plans.length) * 100}%`, backgroundColor: getModelColor(mid) }} title={`${mid}: ${count} plans`} />
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {modelEntries.map(([mid, count]) => (
              <div key={mid} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getModelColor(mid) }} />
                <span className="text-[11px] text-slate-400">{mid}</span>
                <span className="text-[10px] text-slate-600">({count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tension Curve */}
      {tension?.curve?.length>0 && (
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-red-400" />
              <span className="text-sm text-slate-200 font-medium">Courbe de tension</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span>Arc: <span className="text-slate-300">{tension.arc||'standard'}</span></span>
              <span>Moy: <span className="text-slate-300">{tension.mean?.toFixed(0)||0}</span></span>
            </div>
          </div>
          <div className="relative h-20">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0,1,2].map(i => <div key={i} className="border-b border-dark-700/50" />)}
            </div>
            {/* Bars */}
            <div className="relative flex items-end gap-px h-full">
              {tension.curve.map((t:any,i:number)=> {
                const val = t?.tension || 0
                const maxT = Math.max(...tension.curve.map((c:any) => c?.tension || 0), 1)
                const h = Math.max((val / maxT) * 100, 4)
                const intensity = val / maxT
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div className="w-full rounded-t transition-all" style={{
                      height: `${h}%`,
                      backgroundColor: intensity > 0.7 ? 'rgba(239,68,68,0.7)' : intensity > 0.4 ? 'rgba(249,115,22,0.5)' : 'rgba(249,115,22,0.25)'
                    }} />
                    {/* Tooltip on hover */}
                    <div className="absolute -top-5 bg-dark-800 px-1.5 py-0.5 rounded text-[9px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      S{i+1}: {val.toFixed(0)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-slate-600">S1</span>
            <span className="text-[9px] text-slate-600">S{tension.curve.length}</span>
          </div>
        </div>
      )}

      {/* Characters */}
      {chars.length>0 && <Sec icon={Users} title="Personnages" color="text-blue-400">{chars.map((c:any,i:number)=><div key={i} className="flex items-center gap-3 py-1.5"><span className="w-24 text-sm text-slate-200 font-medium truncate">{c?.name||'Inconnu'}</span><span className="text-xs text-slate-500 flex-1 truncate">{c?.apparence||c?.description||'apparence non décrite'}</span></div>)}</Sec>}

      {/* Compliance */}
      <Sec icon={Shield} title={`Compliance — ${comp.level} (${comp.score}/100)`} color={comp.level==='OK'?'text-green-400':'text-yellow-400'}>
        {comp.flags?.length>0 ? comp.flags.map((f:any,i:number)=><div key={i} className="flex items-center gap-2 py-0.5"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${f?.severity==='critical'?'bg-red-600/20 text-red-300':f?.severity==='high'?'bg-red-500/20 text-red-400':'bg-yellow-500/20 text-yellow-400'}`}>{(f?.severity||'medium').toUpperCase()}</span><span className="text-xs text-slate-400">{f?.type||f?.message}</span></div>) : <p className="text-xs text-green-400">Aucun flag</p>}
      </Sec>

      {/* Continuity */}
      {cont.alerts?.length>0 && <Sec icon={AlertTriangle} title={`Continuité — ${cont.score}/100`} color="text-yellow-400">{cont.alerts.map((a:any,i:number)=><div key={i} className="flex items-center gap-2 py-0.5"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${a?.severity==='critical'?'bg-red-600/20 text-red-300':a?.severity==='high'?'bg-red-500/20 text-red-400':'bg-yellow-500/20 text-yellow-400'}`}>{(a?.severity||'medium').toUpperCase()}</span><span className="text-xs text-slate-400">{a?.type}</span></div>)}</Sec>}

      {/* Plans */}
      {plans.length>0 && <Sec icon={Camera} title={`Plans (${plans.length})`} color="text-orange-400" open={false}><div className="space-y-2 max-h-96 overflow-y-auto">{plans.slice(0,30).map((p:any,i:number)=><PC key={i} plan={p} index={i} analysisId={analysisId} />)}</div></Sec>}
    </div>)
  } catch { return <p className="text-red-400 text-sm text-center p-6">Erreur d&apos;affichage</p> }
}

// ═══ Shared ═══
function St({ icon: I, label, value }: { icon: any; label: string; value: string | number }) {
  return <div className="bg-dark-900 border border-dark-700 rounded-xl p-3 text-center"><I size={18} className="text-orange-500/60 mx-auto mb-1" /><p className="text-lg font-bold text-slate-100">{value}</p><p className="text-xs text-slate-500">{label}</p></div>
}
function Sec({ icon: I, title, color, children, open: so = true }: { icon: any; title: string; color: string; children: React.ReactNode; open?: boolean }) {
  const [o, setO] = useState(so)
  return (<div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
    <button onClick={()=>setO(!o)} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition-colors"><I size={18} className={color} /><span className="text-sm text-slate-200 font-medium flex-1 text-left">{title}</span>{o ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}</button>
    {o && <div className="px-4 pb-3">{children}</div>}
  </div>)
}
function PC({ plan, index, analysisId }: { plan: any; index: number; analysisId?: string | null }) {
  const [copied, setCopied] = useState(false)
  const prompt = plan?.finalPrompt || plan?.basePrompt || ''; const mid=(plan?.modelId||'kling').toLowerCase(); const mc=getModelColor(mid)
  return (<div className="card overflow-hidden hover:border-dark-600 transition-all">
    <div className="flex gap-3">
      {/* SVG Preview */}
      <div className="flex-shrink-0">
        <StoryboardSVG shotType={plan?.shotType} cameraMove={plan?.cameraMove} width={180} height={101} modelColor={mc} />
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0 py-2 pr-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-bold">P{index+1}</span>
            <span className="text-[10px] text-slate-500">S{(plan?.sceneIndex||0)+1}</span>
            <ModelBadge modelId={mid} size="xs" />
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={()=>{navigator.clipboard.writeText(prompt);setCopied(true);setTimeout(()=>setCopied(false),2000)}} className="px-2 py-0.5 bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 text-[10px] rounded flex items-center gap-1">{copied?<><Check size={10} /> Copié !</>:<><Copy size={10} /> Prompt</>}</button>
            {(()=>{ const s = getModelStudio(mid); return <a href={s.url} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 bg-dark-700 hover:bg-dark-600 text-slate-300 text-[10px] rounded flex items-center gap-1"><ExternalLink size={9} /> {s.name}</a> })()}
          </div>
        </div>
        <div className="flex items-center gap-2 mb-1 text-[10px]">
          <span className="text-slate-500">{plan?.shotType}</span>
          {plan?.cameraMove && plan.cameraMove !== 'fixe' && <span className="text-cyan-400/60">{plan.cameraMove}</span>}
          <span className="text-slate-600">{(plan?.estimatedDuration||0).toFixed(1)}s</span>
          <span className="text-slate-600">${(plan?.estimatedCost||0).toFixed(3)}</span>
          <CompareButton plan={plan} />
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-mono line-clamp-2">{prompt||'—'}</p>
      </div>
    </div>
  </div>)
}

// ═══ Render Panel — Assembly Player V8 ═══
function RenderPanel({ analysis, analysisId, projectName }: { analysis: any; analysisId: string | null; projectName?: string }) {
  const [generations, setGenerations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentClip, setCurrentClip] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const plans = analysis?.plans || []

  // Fetch generations
  const fetchGenerations = async () => {
    if (!analysisId) return
    setLoading(true)
    try {
      const r = await fetch(`/api/generate?analysisId=${analysisId}`)
      if (r.ok) {
        const data = await r.json()
        setGenerations(Array.isArray(data) ? data : [])
      }
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchGenerations() }, [analysisId])

  // Match generation to plan index
  const getGenForPlan = (i: number) => generations.find((g: any) => g.plan_index === i && g.status === 'completed')
  const completedCount = plans.filter((_: any, i: number) => getGenForPlan(i)).length
  const totalPlans = plans.length

  // Detect demo project for preview images
  const isDemo = (projectName || '').toLowerCase().includes('démo') || (projectName || '').toLowerCase().includes('demo')

  // Build clip list from completed generations
  const clips = plans.map((p: any, i: number) => {
    const gen = getGenForPlan(i)
    const demoImg = isDemo && DEMO_IMAGES[i % DEMO_IMAGES.length] ? DEMO_IMAGES[i % DEMO_IMAGES.length].src : null
    return {
      planIndex: i,
      label: `P${i + 1}`,
      shotType: p?.shotType || '',
      modelId: p?.modelId || '',
      duration: p?.estimatedDuration || 3,
      videoUrl: gen?.result_url || null,
      imageUrl: demoImg,
      status: gen ? 'completed' : (demoImg ? 'preview' : 'pending'),
    }
  })

  const totalDur = clips.reduce((s: number, c: any) => s + c.duration, 0)

  // Auto-advance clips
  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 0.1
        let acc = 0
        for (let i = 0; i < clips.length; i++) {
          acc += clips[i].duration
          if (next < acc) {
            if (i !== currentClip) setCurrentClip(i)
            break
          }
        }
        if (next >= totalDur) { setPlaying(false); return 0 }
        return next
      })
    }, 100)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing, currentClip])

  const current = clips[currentClip] || clips[0]
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex items-center justify-between bg-dark-900 rounded-xl border border-dark-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <Film size={16} className="text-orange-500" />
          <span className="text-sm font-medium text-slate-200">{projectName || 'Rendu'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            {isDemo && completedCount === 0
              ? `${Math.min(totalPlans, DEMO_IMAGES.length)}/${totalPlans} plans (aperçu)`
              : `${completedCount}/${totalPlans} plans générés`}
          </span>
          <div className="w-24 h-1.5 bg-dark-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-600 to-green-500 rounded-full transition-all" style={{
              width: `${totalPlans > 0 ? (isDemo && completedCount === 0
                ? (Math.min(totalPlans, DEMO_IMAGES.length) / totalPlans) * 100
                : (completedCount / totalPlans) * 100) : 0}%`
            }} />
          </div>
          <button onClick={fetchGenerations} className="p-1.5 rounded hover:bg-white/5">
            <RefreshCw size={14} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Player */}
      <div className="bg-black rounded-xl overflow-hidden border border-white/[0.06]">
        {/* Video area */}
        <div className="relative aspect-video bg-dark-950 overflow-hidden">
          {current?.videoUrl ? (
            <video
              ref={videoRef}
              key={current.videoUrl}
              src={current.videoUrl}
              className="w-full h-full object-contain"
              autoPlay={playing}
              muted
            />
          ) : current?.imageUrl ? (
            <img
              key={currentClip}
              src={current.imageUrl}
              alt={current.label}
              className="w-full h-full object-cover transition-opacity duration-700"
              style={{
                animation: playing ? `kb-pan ${(current.duration || 3) * 1.5}s ease-in-out forwards` : 'none',
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <StoryboardSVG
                shotType={current?.shotType}
                cameraMove={plans[currentClip]?.cameraMove}
                width={320} height={180}
                modelColor={getModelColor((current?.modelId || '').toLowerCase())}
              />
              <p className="text-xs text-slate-600 mt-3">
                {current?.status === 'pending' ? 'En attente de génération' : 'Génération en cours...'}
              </p>
            </div>
          )}
          {/* Cinematic vignette for images */}
          {(current?.imageUrl || current?.videoUrl) && (
            <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.4)] pointer-events-none" />
          )}
          {/* Subtitle overlay for demo */}
          {isDemo && current?.imageUrl && (() => {
            const subs: Record<number, string> = { 1: 'On y va aujourd\u2019hui. Pas vrai\u00A0?', 4: 'On se promet un truc\u2026', 5: 'On fera tout ensemble.', 6: '\u00C7a fait deux ans.', 7: 'On avait dit\u2026 ensemble.' }
            const sub = subs[currentClip]
            return sub ? (
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <span className="bg-black/70 backdrop-blur-sm px-4 py-1.5 rounded-md text-white text-sm font-medium">{sub}</span>
              </div>
            ) : null
          })()}
          {/* Play overlay */}
          {!playing && elapsed === 0 && (current?.imageUrl || current?.videoUrl) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 cursor-pointer"
              onClick={() => setPlaying(true)}>
              <p className="text-white/50 text-[10px] tracking-[0.2em] uppercase mb-3">{projectName}</p>
              <div className="w-14 h-14 rounded-full bg-orange-600/90 hover:bg-orange-500 flex items-center justify-center shadow-xl transition-transform hover:scale-110">
                <Play size={24} fill="white" className="text-white ml-0.5" />
              </div>
            </div>
          )}
          {/* Plan overlay */}
          <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded">
            <span className="text-[10px] text-white font-medium">{current?.label} · {current?.shotType}</span>
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getModelColor((current?.modelId || '').toLowerCase()) }} />
            <span className="text-[10px] text-white/70">{current?.modelId}</span>
          </div>
        </div>
        {/* Ken Burns keyframe */}
        <style dangerouslySetInnerHTML={{ __html: `@keyframes kb-pan { from { transform: scale(1.0) translateX(0); } to { transform: scale(1.08) translateX(-1%); } }` }} />

        {/* Progress bar */}
        <div className="relative h-1.5 bg-dark-900 cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const pct = (e.clientX - rect.left) / rect.width
          const newTime = pct * totalDur
          setElapsed(newTime)
          let acc = 0
          for (let i = 0; i < clips.length; i++) { acc += clips[i].duration; if (newTime < acc) { setCurrentClip(i); break } }
        }}>
          {/* Clip segments */}
          {(() => {
            let acc = 0
            return clips.map((c: any, i: number) => {
              const left = (acc / totalDur) * 100
              acc += c.duration
              return <div key={i} className={`absolute top-0 h-full border-r border-dark-800 ${c.videoUrl ? '' : 'opacity-30'}`}
                style={{ left: `${left}%`, width: `${(c.duration / totalDur) * 100}%`, backgroundColor: c.videoUrl ? getModelColor((c.modelId || '').toLowerCase()) + '30' : 'transparent' }} />
            })
          })()}
          <div className="absolute top-0 left-0 h-full bg-orange-500 transition-all duration-100" style={{ width: `${(elapsed / totalDur) * 100}%` }} />
        </div>

        {/* Controls */}
        <div className="bg-dark-950 px-4 py-2.5 flex items-center gap-3">
          <button onClick={() => { setPlaying(!playing); if (elapsed >= totalDur) { setElapsed(0); setCurrentClip(0) } }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            {playing ? <Pause size={14} className="text-white" /> : <Play size={14} fill="white" className="text-white ml-0.5" />}
          </button>
          <span className="text-[11px] text-slate-500 tabular-nums">{fmtTime(elapsed)} / {fmtTime(totalDur)}</span>

          {/* Clip dots */}
          <div className="flex-1 flex items-center justify-center gap-1">
            {clips.map((c: any, i: number) => (
              <button key={i} onClick={() => {
                let acc = 0; for (let j = 0; j < i; j++) acc += clips[j].duration
                setElapsed(acc); setCurrentClip(i)
              }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentClip ? 'bg-orange-500 scale-125' :
                  c.videoUrl ? 'bg-green-500/60' : c.imageUrl ? 'bg-orange-500/40' : 'bg-white/10'
                }`}
                title={c.label}
              />
            ))}
          </div>

          {/* Export */}
          <button className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-medium rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={completedCount < totalPlans}>
            <Download size={12} /> Export {completedCount === totalPlans ? '4K' : `(${completedCount}/${totalPlans})`}
          </button>
        </div>
      </div>

      {/* Clip strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
        {clips.map((c: any, i: number) => (
          <button key={i} onClick={() => {
            let acc = 0; for (let j = 0; j < i; j++) acc += clips[j].duration
            setElapsed(acc); setCurrentClip(i)
          }}
            className={`flex-shrink-0 rounded-lg overflow-hidden border transition-all ${
              i === currentClip ? 'border-orange-500 ring-1 ring-orange-500/30' : 'border-dark-700 hover:border-dark-600'
            }`}
            style={{ width: 100 }}
          >
            <div className="relative h-14 bg-dark-900">
              {c.videoUrl ? (
                <video src={c.videoUrl} className="w-full h-full object-cover" muted preload="metadata" />
              ) : c.imageUrl ? (
                <img src={c.imageUrl} alt={c.label} className="w-full h-full object-cover" />
              ) : (
                <StoryboardSVG shotType={c.shotType} width={100} height={56} modelColor={getModelColor((c.modelId || '').toLowerCase())} />
              )}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold text-white">{c.label}</span>
                  {c.videoUrl ? <Check size={8} className="text-green-400" /> : c.imageUrl ? <Eye size={8} className="text-orange-400" /> : <Clock size={8} className="text-slate-500" />}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
