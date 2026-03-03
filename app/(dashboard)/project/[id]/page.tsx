'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Play, Loader2, Save, Brain, AlertTriangle, ChevronDown, ChevronRight,
  Film, Eye, DollarSign, Shield, Users, TrendingUp, Camera, Zap, Copy, Check,
  Subtitles, Mic, Clock, Download, Volume2, Pause, SkipForward, SkipBack,
  Sparkles, Image, Search, RefreshCw, Wand2, SlidersHorizontal, Keyboard, ExternalLink, Music2
, Layers, Package, Headphones, Upload, GitBranch } from 'lucide-react'
import { StoryboardSVG } from '@/components/ui/storyboard-svg'
import { ModelBadge, getModelColor, ModelLegend } from '@/components/ui/model-badge'
import { ScreenplayAssistant } from '@/components/ui/screenplay-assistant'
import { FlowCanvas } from '@/components/ui/flow-canvas'
import { useI18n } from '@/lib/i18n'

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
import { GuidedTour, useProjectTour } from '@/components/ui/guided-tour'
import { CinematicPlayer } from '@/components/ui/cinematic-player'
import { DragDropProvider, Draggable, DropZone } from '@/components/ui/drag-drop-context'
import { useToast } from '@/components/ui/toast'
import { OverviewCockpit } from '@/components/ui/overview-cockpit'
import { CharacterReferenceCard, getCharacterRefImages, injectCharacterRefsInPrompt } from '@/components/ui/character-reference'
import { TemplateSelector } from '@/components/ui/template-selector'
import { VisualStoryboard } from '@/components/ui/visual-storyboard'
import { AssemblyPanel } from '@/components/ui/assembly-panel'
import { ScorePanel } from '@/components/ui/score-panel'

type Mode = 'simple' | 'expert'
type Tab = 'script' | 'overview' | 'analyse' | 'storyboard' | 'timeline' | 'copilot' | 'media' | 'subtitles' | 'voiceover' | 'score' | 'render' | 'flow'
type Workspace = 'writing' | 'analysis' | 'production' | 'postprod' | 'export'

function fmt(s: number) { return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` }

export default function ProjectPage() {
  const { t, locale } = useI18n()
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id as string
  const [project, setProject] = useState<any>(null)
  const [scriptText, setScriptText] = useState('')
  const [stylePreset, setStylePreset] = useState('cinematique')
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [saving, setSaving] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<Mode>('simple')
  const [tab, setTab] = useState<Tab>('script')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [workspace, setWorkspace] = useState<Workspace>('writing')
  const [showAllTabs, setShowAllTabs] = useState(false)
  const [cmdPalette, setCmdPalette] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const [demoHotspots, setDemoHotspots] = useState(true)
  const { toast } = useToast()
  const [cmdQuery, setCmdQuery] = useState('')
  const cmdRef = useRef<HTMLInputElement>(null)

  // Sync workspace when tab changes
  const tabToWorkspace: Record<Tab, Workspace> = {
    script: 'writing', overview: 'analysis', analyse: 'analysis', copilot: 'analysis',
    storyboard: 'production', timeline: 'production', media: 'production', flow: 'production',
    subtitles: 'postprod', voiceover: 'postprod', score: 'postprod',
    render: 'export',
  }
  useEffect(() => { setWorkspace(tabToWorkspace[tab]) }, [tab])

  const [showExportMenu, setShowExportMenu] = useState(false)
  const [userKeys, setUserKeys] = useState<Set<string>>(new Set())
  const [aiMode, setAiMode] = useState(false)

  // Keyboard shortcuts — defined after handlers

  useEffect(() => {
    if (!projectId) return
    fetch(`/api/projects/${projectId}`)
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(data => { setProject(data); setScriptText(data.script_text || '') })
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false))
  }, [projectId, router])

  // Load user API keys to know which models can generate directly
  useEffect(() => {
    fetch('/api/keys')
      .then(res => res.ok ? res.json() : [])
      .then((keys: any[]) => {
        const providers = new Set<string>()
        keys.forEach((k: any) => {
          if (k.provider === 'kling') providers.add('kling')
          if (k.provider === 'runway') providers.add('runway')
          if (k.provider === 'openai') providers.add('sora') // Sora uses OpenAI key
          if (k.provider === 'google') providers.add('veo')
        })
        setUserKeys(providers)
      })
      .catch(() => {})
  }, [])

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
    if (!scriptText.trim()) { setError(t.project.scriptPlaceholder); return }
    setError(''); setAnalyzing(true)
    await fetch(`/api/projects/${projectId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ script_text: scriptText }) })
    try {
      const endpoint = aiMode ? 'analyze-ai' : 'analyze'
      const res = await fetch(`/api/projects/${projectId}/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ style_preset: stylePreset }) })
      const data = await res.json()
      if (res.ok && data.result) { setAnalysis(data.result); setAnalysisId(data.analysis_id); toast(locale === 'fr' ? 'Analyse terminée — ' + (data.result.plans?.length || 0) + ' plans détectés' : 'Analysis complete — ' + (data.result.plans?.length || 0) + ' shots detected', 'success'); setShowCelebration(true); setTimeout(() => { setShowCelebration(false); if (mode === 'simple') { /* stay */ } else { setTab('overview'); setWorkspace('analysis') } }, 2500) }
      else setError(data.error || t.common.error)
    } catch { setError(t.common.error) } finally { setAnalyzing(false) }
  }

  const loadDemo = async () => {
    try {
      const { DEMO_SCENARIO } = await import('@/lib/data/demo-scenario')
      setScriptText(DEMO_SCENARIO.script); setStylePreset(DEMO_SCENARIO.style_preset)
      await fetch(`/api/projects/${projectId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ script_text: DEMO_SCENARIO.script, name: DEMO_SCENARIO.name }) })
      setProject((p: any) => ({ ...p, name: DEMO_SCENARIO.name }))
    } catch {}
  }

  const loadTemplate = async (script: string, name: string, stylePreset: string, templateAnalysis?: any) => {
    setScriptText(script)
    setStylePreset(stylePreset)
    if (templateAnalysis) {
      setAnalysis(templateAnalysis)
    }
    try {
      await fetch(`/api/projects/${projectId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ script_text: script, name }) })
      setProject((p: any) => ({ ...p, name }))
    } catch {}
  }

  const isDemoProject = (project?.name || '').toLowerCase().includes('démo') || (project?.name || '').toLowerCase().includes('demo')

  const tourSteps = useProjectTour({ setMode, setWorkspace, setTab, hasAnalysis: !!analysis })

  useKeyboardShortcuts([
    { key: '?', label: t.project.shortcuts.shortcuts, action: () => setShowShortcuts(s => !s) },
    { key: 'k', ctrl: true, label: 'Command palette', action: () => { setCmdPalette(true); setTimeout(() => cmdRef.current?.focus(), 50) } },
    { key: 'Escape', label: t.project.shortcuts.close, action: () => showShortcuts ? setShowShortcuts(false) : router.push('/dashboard') },
    { key: 'e', label: t.project.shortcuts.mode, action: () => setMode(m => m === 'simple' ? 'expert' : 'simple') },
    { key: 's', ctrl: true, label: t.project.shortcuts.save, action: handleSave },
    { key: 'Enter', ctrl: true, label: t.project.analyze, action: handleAnalyze },
    // Workspace shortcuts (1-5)
    { key: '1', label: 'Writing', action: () => { setMode('expert'); setWorkspace('writing'); setTab('script') } },
    { key: '2', label: 'Analysis', action: () => { if(analysis) { setMode('expert'); setWorkspace('analysis'); setTab('overview') } } },
    { key: '3', label: 'Production', action: () => { if(analysis) { setMode('expert'); setWorkspace('production'); setTab('storyboard') } } },
    { key: '4', label: 'Post-prod', action: () => { if(analysis) { setMode('expert'); setWorkspace('postprod'); setTab('subtitles') } } },
    { key: '5', label: 'Export', action: () => { if(analysis) { setMode('expert'); setWorkspace('export'); setTab('render') } } },
    // Extended tab shortcuts (6-0)
    { key: '6', label: 'Copilot', action: () => { if(analysis) { setMode('expert'); setTab('copilot') } } },
    { key: '7', label: 'Media', action: () => { if(analysis) { setMode('expert'); setTab('media') } } },
    { key: '8', label: 'Voiceover', action: () => { if(analysis) { setMode('expert'); setTab('voiceover') } } },
    { key: '9', label: 'Score', action: () => { if(analysis) { setMode('expert'); setTab('score') } } },
    { key: '0', label: 'Timeline', action: () => { if(analysis) { setMode('expert'); setTab('timeline') } } },
  ])

  if (loading) return <div className="flex flex-col items-center justify-center py-24 gap-4"><div className="relative"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center"><Loader2 size={24} className="text-orange-400 animate-spin" /></div></div><div className="beam w-32" /><p className="text-xs text-slate-500 animate-pulse">{locale === "fr" ? "Chargement du projet..." : "Loading project..."}</p></div>

  const tabs: { id: Tab; label: string; icon: any; disabled?: boolean }[] = [
    { id: 'script', label: t.project.tabs.script, icon: Film },
    { id: 'overview', label: t.project.tabs.overview, icon: Eye, disabled: !analysis },
    { id: 'analyse', label: t.project.tabs.analysis, icon: Brain, disabled: !analysis },
    { id: 'storyboard', label: t.project.tabs.storyboard, icon: Image, disabled: !analysis },
    { id: 'timeline', label: t.project.tabs.timeline, icon: Clock, disabled: !analysis },
    { id: 'copilot', label: t.project.tabs.copilot, icon: Sparkles, disabled: !analysis },
    { id: 'media', label: t.project.tabs.media, icon: Camera, disabled: !analysis },
    { id: 'subtitles', label: t.project.tabs.subtitles, icon: Subtitles, disabled: !analysis },
    { id: 'voiceover', label: t.project.tabs.voiceover, icon: Mic, disabled: !analysis },
    { id: 'score', label: t.project.tabs.score, icon: Music2, disabled: !analysis },
    { id: 'flow', label: t.project.tabs.flow, icon: GitBranch, disabled: !analysis },
    { id: 'render', label: t.project.tabs.render, icon: Play, disabled: !analysis },
  ]

  return (
    <DragDropProvider>
    <div>

      
      {/* Analysis Progress Overlay */}
      {analyzing && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center">
          <div className="absolute inset-0 bg-dark-950/90 backdrop-blur-lg" />
          <div className="relative max-w-md w-full px-6 animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
                <Brain size={28} className="text-orange-400 animate-pulse" />
              </div>
              <h2 className="font-display text-xl text-white mb-1">{locale === 'fr' ? 'Analyse en cours...' : 'Analysis in progress...'}</h2>
              <p className="text-xs text-slate-500">{locale === 'fr' ? '13 moteurs IA analysent votre scénario' : '13 AI engines analyzing your script'}</p>
            </div>
            <div className="space-y-2">
              {[
                { name: 'Intent Parser', emoji: '🎯' },
                { name: 'Scénariste', emoji: '✍️' },
                { name: 'Story Tracker', emoji: '📖' },
                { name: 'Shot Evaluator', emoji: '🎞️' },
                { name: 'Crispifier', emoji: '✨' },
                { name: 'Human Align', emoji: '🤝' },
                { name: 'Camera Director', emoji: '📷' },
                { name: 'Audio Tracker', emoji: '🔊' },
                { name: 'Camera Control', emoji: '🎥' },
                { name: 'Style Guard', emoji: '🎨' },
                { name: 'Color Harmonizer', emoji: '🌈' },
                { name: 'Motion Flow', emoji: '🌊' },
                { name: 'Model Selector', emoji: '🤖' },
              ].map((engine, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-dark-900/50 border border-dark-800">
                  <span className="text-sm">{engine.emoji}</span>
                  <span className="text-[11px] text-slate-400 flex-1">{engine.name}</span>
                  <div className="w-16 h-1 bg-dark-700 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full animate-shimmer" style={{ animationDelay: i * 0.15 + 's' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="beam w-full mt-6" />
          </div>
        </div>
      )}

      {/* Analysis Celebration */}
      {showCelebration && analysis && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-dark-950/60 backdrop-blur-sm" />
          <div className="relative animate-fade-in text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500/30 to-orange-600/20 border border-orange-500/30 flex items-center justify-center shadow-2xl shadow-orange-500/20">
              <Sparkles size={32} className="text-orange-400" />
            </div>
            <h2 className="font-display text-2xl text-white mb-2">{locale === 'fr' ? 'Analyse terminée !' : 'Analysis complete!'}</h2>
            <div className="flex items-center justify-center gap-4 text-sm text-slate-300 mb-3">
              <span className="flex items-center gap-1"><Film size={14} className="text-orange-400" /> {analysis.scenes?.length || 0} {locale === 'fr' ? 'scènes' : 'scenes'}</span>
              <span className="flex items-center gap-1"><Eye size={14} className="text-blue-400" /> {analysis.plans?.length || 0} {locale === 'fr' ? 'plans' : 'shots'}</span>
              <span className="flex items-center gap-1"><Users size={14} className="text-purple-400" /> {analysis.characterBible?.length || 0} {locale === 'fr' ? 'personnages' : 'characters'}</span>
            </div>
            <div className="beam w-48 mx-auto mb-3" />
            <p className="text-xs text-slate-500 animate-pulse">{locale === 'fr' ? 'Préparation du cockpit...' : 'Preparing cockpit...'}</p>
          </div>
        </div>
      )}

      <ShortcutOverlay show={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {/* Guided Tour */}
      {showTour && (
        <GuidedTour
          steps={tourSteps}
          onComplete={() => setShowTour(false)}
          onSkip={() => setShowTour(false)}
        />
      )}
      {/* COMMAND PALETTE */}
      {cmdPalette && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setCmdPalette(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-dark-900 border border-dark-600 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-700">
              <Search size={16} className="text-slate-500" />
              <input ref={cmdRef} value={cmdQuery} onChange={e => setCmdQuery(e.target.value)}
                placeholder={locale === 'fr' ? 'Naviguer, chercher, agir...' : 'Navigate, search, act...'}
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
                onKeyDown={e => { if (e.key === 'Escape') setCmdPalette(false) }}
              />
              <kbd className="text-[10px] text-slate-600 bg-dark-800 px-1.5 py-0.5 rounded border border-dark-700">ESC</kbd>
            </div>
            <div className="max-h-64 overflow-y-auto p-1.5">
              {[
                { label: t.project.workspaces.writing, desc: t.project.workspaces.writingDesc, icon: '✏️', action: () => { setMode('expert'); setWorkspace('writing'); setTab('script') } },
                { label: t.project.workspaces.analysis, desc: t.project.workspaces.analysisDesc, icon: '🔍', action: () => { if(analysis) { setMode('expert'); setWorkspace('analysis'); setTab('overview') } } },
                { label: t.project.workspaces.production, desc: t.project.workspaces.productionDesc, icon: '🎬', action: () => { if(analysis) { setMode('expert'); setWorkspace('production'); setTab('storyboard') } } },
                { label: t.project.workspaces.postprod, desc: t.project.workspaces.postprodDesc, icon: '🎧', action: () => { if(analysis) { setMode('expert'); setWorkspace('postprod'); setTab('subtitles') } } },
                { label: t.project.workspaces.export, desc: t.project.workspaces.exportDesc, icon: '📤', action: () => { if(analysis) { setMode('expert'); setWorkspace('export'); setTab('render') } } },
                { label: locale === 'fr' ? 'Lancer l\'analyse' : 'Run analysis', desc: 'Ctrl+Enter', icon: '▶️', action: handleAnalyze },
                { label: locale === 'fr' ? 'Sauvegarder' : 'Save', desc: 'Ctrl+S', icon: '💾', action: handleSave },
                { label: t.project.tabs.storyboard, desc: locale === 'fr' ? 'Générer les visuels' : 'Generate visuals', icon: '🖼️', action: () => { if(analysis) { setMode('expert'); setTab('storyboard') } } },
                { label: t.project.tabs.score, desc: locale === 'fr' ? 'Composer la musique' : 'Compose music', icon: '🎵', action: () => { if(analysis) { setMode('expert'); setTab('score') } } },
                { label: locale === 'fr' ? 'Mode simple' : 'Simple mode', desc: '', icon: '⚡', action: () => setMode('simple') },
              ].filter(cmd => !cmdQuery || cmd.label.toLowerCase().includes(cmdQuery.toLowerCase()) || (cmd.desc||'').toLowerCase().includes(cmdQuery.toLowerCase()))
              .map((cmd, i) => (
                <button key={i} onClick={() => { cmd.action(); setCmdPalette(false); setCmdQuery('') }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-dark-800 transition-colors text-left group">
                  <span className="text-sm">{cmd.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-200 group-hover:text-white">{cmd.label}</p>
                    {cmd.desc && <p className="text-[10px] text-slate-500">{cmd.desc}</p>}
                  </div>
                  <ChevronRight size={12} className="text-slate-700 group-hover:text-slate-500" />
                </button>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-dark-700 flex items-center gap-3">
              <kbd className="text-[9px] text-slate-600 bg-dark-800 px-1.5 py-0.5 rounded border border-dark-700">↑↓</kbd>
              <span className="text-[10px] text-slate-600">{locale === 'fr' ? 'Naviguer' : 'Navigate'}</span>
              <kbd className="text-[9px] text-slate-600 bg-dark-800 px-1.5 py-0.5 rounded border border-dark-700">↵</kbd>
              <span className="text-[10px] text-slate-600">{locale === 'fr' ? 'Sélectionner' : 'Select'}</span>
            </div>
          </div>
        </div>
      )}
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={20} className="text-slate-400" /></button>
          <div>
            <h1 className="text-lg font-bold text-slate-50">{project?.name || t.common.dashboard}</h1>
            {analysis && <p className="text-xs text-slate-500">{analysis.scenes?.length || 0} scenes • {analysis.plans?.length || 0} shots • ${(analysis.costTotal || 0).toFixed(2)}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto ml-12 sm:ml-0">
          {/* Export menu */}
          {analysis && (
            <div className="relative">
              <button onClick={() => setShowTour(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-xs font-medium text-orange-400 hover:text-orange-300 hover:bg-orange-500/15 transition-colors">
                <Sparkles size={12} /> {locale === 'fr' ? 'Visite guidée' : 'Guided tour'}
              </button>
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
                      { format: 'json', label: 'JSON', icon: '📦', desc: 'Data' },
                      { format: 'csv', label: 'CSV', icon: '📊', desc: 'Spreadsheet' },
                      { format: 'fountain', label: 'Fountain', icon: '🎬', desc: 'Screenplay' },
                      { format: 'prompts', label: locale === 'fr' ? 'Prompts TXT' : 'Prompts TXT', icon: '📝', desc: locale === 'fr' ? 'Copier-coller' : 'Copy-paste' },
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
          <button onClick={() => setMode('simple')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'simple' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/15' : 'text-slate-400 hover:text-slate-200'}`}>
            <Wand2 size={13} /> Simple
          </button>
          <button onClick={() => setMode('expert')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'expert' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/15' : 'text-slate-400 hover:text-slate-200'}`}>
            <SlidersHorizontal size={13} /> Expert
          </button>
          </div>
        </div>
      </div>

      {/* MODE SIMPLE */}
      {mode === 'simple' && (
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Pipeline Progress */}
          <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
            <div className="flex items-center gap-1">
              {[
                { label: locale === 'fr' ? 'Écriture' : 'Writing', done: !!scriptText.trim(), icon: '✏️' },
                { label: locale === 'fr' ? 'Analyse' : 'Analysis', done: !!analysis, icon: '🔍' },
                { label: locale === 'fr' ? 'Production' : 'Production', done: false, icon: '🎬' },
                { label: locale === 'fr' ? 'Post-prod' : 'Post-prod', done: false, icon: '🎧' },
                { label: 'Export', done: false, icon: '📤' },
              ].map((step, i, arr) => (
                <div key={i} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${step.done ? 'bg-green-500/20 border-2 border-green-500' : i === 0 || (i === 1 && scriptText.trim()) ? 'bg-orange-500/20 border-2 border-orange-500 animate-pulse' : 'bg-dark-800 border-2 border-dark-700'}`}>
                      {step.done ? '✓' : step.icon}
                    </div>
                    <span className={`text-[9px] mt-1 ${step.done ? 'text-green-400' : 'text-slate-500'}`}>{step.label}</span>
                  </div>
                  {i < arr.length - 1 && <div className={`h-0.5 w-full mx-1 rounded ${step.done ? 'bg-green-500/40' : 'bg-dark-700'}`} />}
                </div>
              ))}
            </div>
            {!scriptText.trim() && <p className="text-xs text-slate-500 text-center mt-3">{locale === 'fr' ? '👆 Commencez par écrire ou coller votre scénario' : '👆 Start by writing or pasting your script'}</p>}
            {scriptText.trim() && !analysis && <p className="text-xs text-orange-400 text-center mt-3">{locale === 'fr' ? '⬇️ Lancez l\'analyse pour continuer' : '⬇️ Run analysis to continue'}</p>}
            {analysis && (
              <div className="mt-4 space-y-3">
                <div className="beam w-full" />
                <div className="flex items-center gap-4 justify-center">
                  <span className="flex items-center gap-1.5 text-xs text-green-400"><Film size={12} /> {analysis.scenes?.length || 0} {locale === 'fr' ? 'scènes' : 'scenes'}</span>
                  <span className="flex items-center gap-1.5 text-xs text-blue-400"><Eye size={12} /> {analysis.plans?.length || 0} {locale === 'fr' ? 'plans' : 'shots'}</span>
                  <span className="flex items-center gap-1.5 text-xs text-purple-400"><Users size={12} /> {analysis.characterBible?.length || 0} {locale === 'fr' ? 'personnages' : 'characters'}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => { setMode('expert'); setWorkspace('analysis'); setTab('overview') }}
                    className="btn-primary px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5">
                    <Sparkles size={12} /> {locale === 'fr' ? 'Explorer le cockpit' : 'Explore cockpit'}
                  </button>
                  <button onClick={() => { setMode('expert'); setWorkspace('production'); setTab('storyboard') }}
                    className="px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5">
                    <Camera size={12} /> Storyboard
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Screenplay Assistant */}
          <ScreenplayAssistant
            onUseScript={(script: string) => setScriptText(script)}
            existingScript={scriptText.trim() || undefined}
          />

          {/* Template Selector */}
          <TemplateSelector onUseTemplate={loadTemplate} />

          <div className="bg-dark-900 rounded-2xl border border-dark-700 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-dark-700">
              <div className="flex items-center gap-2">
                <Film size={16} className="text-orange-500" />
                <span className="text-sm font-medium text-slate-200">{t.project.tabs.script}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select value={stylePreset} onChange={(e: any) => setStylePreset(e.target.value)} className="px-2 py-1 bg-dark-800 border border-dark-600 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-orange-500/50">
                  <option value="cinematique">🎬 Cinématique</option><option value="documentaire">📹 Documentaire</option>
                  <option value="noir">🌑 Film noir</option><option value="onirique">🌙 Onirique</option>
                </select>
                <button onClick={loadDemo} className="px-2 py-1 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-xs text-slate-400">{t.common.demo}</button>
                <button onClick={handleSave} disabled={saving} className="px-2 py-1 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-xs text-slate-400 flex items-center gap-1">
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Sauver
                </button>
              </div>
            </div>
            <textarea value={scriptText} onChange={(e: any) => setScriptText(e.target.value)} data-tour="script-editor" placeholder={t.project.scriptPlaceholder} rows={12}
              className="w-full p-4 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none font-mono leading-relaxed" />
          </div>

          <button data-tour="analyze-button" onClick={() => { setDemoHotspots(false); handleAnalyze() }} disabled={analyzing || !scriptText.trim()}
            className="w-full py-3.5 btn-primary disabled:bg-dark-700 disabled:text-slate-600 disabled:shadow-none disabled:opacity-40 text-white font-semibold rounded-xl flex items-center justify-center gap-2">
            {analyzing ? <><Loader2 size={18} className="animate-spin" /> {t.project.analyzing}</> : <><Brain size={18} /> {t.project.analyze}</>}
          </button>
          {error && <p className="text-xs text-red-400 text-center flex items-center justify-center gap-1"><AlertTriangle size={12} /> {error}</p>}

          {analysis && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <St icon={Film} label={t.demo.shotsDetected.split(' ')[0]} value={analysis.scenes?.length || 0} /><St icon={Eye} label={t.demo.shotsDetected} value={analysis.plans?.length || 0} />
                <St icon={DollarSign} label={t.demo.estimatedBudget} value={`$${(analysis.costTotal || 0).toFixed(2)}`} /><St icon={Shield} label="Continuity" value={`${analysis.continuity?.score || 0}%`} />
              </div>
              <div className="bg-dark-900 rounded-2xl border border-dark-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-dark-700 flex items-center justify-between">
                  <div className="flex items-center gap-2"><Camera size={16} className="text-orange-500" /><span className="text-sm font-medium text-slate-200">{locale === 'fr' ? 'Plans & Prompts' : 'Shots & Prompts'}</span></div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => {
                      const allPrompts = (analysis.plans || []).map((p: any, i: number) => `[P${i+1}] ${p.modelId || 'kling'}\n${p.finalPrompt || p.basePrompt || ''}`).join('\n\n---\n\n')
                      navigator.clipboard.writeText(allPrompts)
                    }} className="px-3 py-1.5 btn-primary text-white text-[10px] font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-lg shadow-orange-600/20">
                      <Copy size={12} /> {locale === 'fr' ? 'Copier tous les prompts' : 'Copy all prompts'}
                    </button>
                    <button onClick={() => setMode('expert')} className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"><SlidersHorizontal size={12} /> {t.project.modeExpert} →</button>
                  </div>
                </div>
                <div className="divide-y divide-dark-700/50">
                  {(analysis.plans || []).slice(0, 30).map((plan: any, i: number) => (
                    <SPC key={i} plan={plan} index={i} analysisId={analysisId} userKeys={userKeys} projectId={projectId} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 justify-center flex-wrap">
                <button onClick={() => { setMode('expert'); setTab('timeline'); setWorkspace('production') }} className="px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5"><Clock size={14} /> Timeline</button>
                <button onClick={() => { setMode('expert'); setTab('copilot'); setWorkspace('analysis') }} className="px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5"><Sparkles size={14} /> {t.project.tabs.copilot}</button>
                <button onClick={() => { setMode('expert'); setTab('subtitles'); setWorkspace('postprod') }} className="px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5"><Subtitles size={14} /> {t.project.tabs.subtitles}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE EXPERT */}
      {mode === 'expert' && (
        <div>
          {/* WORKSPACE NAVIGATION */}
          {!showAllTabs ? (
            <div className="mb-5 space-y-2">
              {/* 5 Workspaces bar */}
              <div data-tour="workspace-bar" className="flex gap-1 bg-dark-900 rounded-xl p-1.5 border border-dark-700">
                {([
                  { id: 'writing' as Workspace, label: t.project.workspaces.writing, icon: Film, tabs: ['script'], status: scriptText.trim() ? (scriptText.length > 100 ? 'done' : 'partial') : 'empty' },
                  { id: 'analysis' as Workspace, label: t.project.workspaces.analysis, icon: Brain, tabs: ['overview', 'analyse', 'copilot'], status: analysis ? 'done' : scriptText.trim() ? 'ready' : 'locked' },
                  { id: 'production' as Workspace, label: t.project.workspaces.production, icon: Image, tabs: ['storyboard', 'timeline', 'media'], status: analysis ? 'ready' : 'locked' },
                  { id: 'postprod' as Workspace, label: t.project.workspaces.postprod, icon: Headphones, tabs: ['subtitles', 'voiceover', 'score'], status: analysis ? 'ready' : 'locked' },
                  { id: 'export' as Workspace, label: t.project.workspaces.export, icon: Upload, tabs: ['render'], status: analysis ? 'ready' : 'locked' },
                ] as const).map((ws, i) => (
                  <button key={ws.id} onClick={() => { setWorkspace(ws.id); const firstTab = ws.tabs[0] as Tab; if (!analysis && firstTab !== 'script') return; setTab(firstTab) }}
                    disabled={ws.status === 'locked'}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${workspace === ws.id ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/15' : ws.status === 'locked' ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                    <ws.icon size={15} />
                    <span className="hidden sm:inline">{ws.label}</span>
                    {/* Health indicator */}
                    <div className={`w-2 h-2 rounded-full ${ws.status === 'done' ? 'bg-green-400 shadow-sm shadow-green-400/50' : ws.status === 'partial' ? 'bg-yellow-400' : ws.status === 'ready' ? 'bg-orange-400/60' : 'bg-slate-700'}`} />
                    {/* Step number */}
                    <span className={`text-[9px] font-mono ${workspace === ws.id ? 'text-white/60' : 'text-slate-600'}`}>{i + 1}</span>
                  </button>
                ))}
                {/* All tabs toggle */}
                <button onClick={() => setShowAllTabs(true)}
                  className="px-2 py-2 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all"
                  title={t.project.workspaces.allTabs}>
                  <Layers size={14} />
                </button>
              </div>
              {/* Sub-tabs within workspace */}
              {(() => {
                const wsTabMap: Record<Workspace, { id: Tab; label: string; icon: any }[]> = {
                  writing: [{ id: 'script', label: t.project.tabs.script, icon: Film }],
                  analysis: [{ id: 'overview', label: t.project.tabs.overview, icon: Eye }, { id: 'analyse', label: t.project.tabs.analysis, icon: Brain }, { id: 'copilot', label: t.project.tabs.copilot, icon: Sparkles }],
                  production: [{ id: 'storyboard', label: t.project.tabs.storyboard, icon: Image }, { id: 'timeline', label: t.project.tabs.timeline, icon: Clock }, { id: 'media', label: t.project.tabs.media, icon: Camera }],
                  postprod: [{ id: 'subtitles', label: t.project.tabs.subtitles, icon: Subtitles }, { id: 'voiceover', label: t.project.tabs.voiceover, icon: Mic }, { id: 'score', label: t.project.tabs.score, icon: Music2 }],
                  export: [{ id: 'render', label: t.project.tabs.render, icon: Play }],
                }
                const subTabs = wsTabMap[workspace]
                if (subTabs.length <= 1) return null
                return (
                  <div className="flex gap-1 bg-dark-950/50 rounded-lg p-1 border border-dark-800">
                    {subTabs.map(st => (
                      <button key={st.id} onClick={() => setTab(st.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${tab === st.id ? 'bg-dark-700 text-orange-400 border border-dark-600' : 'text-slate-500 hover:text-slate-300'}`}>
                        <st.icon size={13} /> {st.label}
                      </button>
                    ))}
                  </div>
                )
              })()}
            </div>
          ) : (
            <div className="mb-5">
              <div className="flex gap-1 bg-dark-900 rounded-xl p-1.5 overflow-x-auto border border-dark-700 scrollbar-hide">
                {tabs.map(tb => (
                  <button key={tb.id} onClick={() => !tb.disabled && setTab(tb.id)} disabled={tb.disabled}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${tab === tb.id ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/15' : tb.disabled ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                    <tb.icon size={14} /> {tb.label}
                  </button>
                ))}
                <button onClick={() => setShowAllTabs(false)}
                  className="px-2 py-2 rounded-lg text-orange-400 hover:text-orange-300 hover:bg-white/5 transition-all ml-1" data-tour="shortcuts-button"
                  title={t.project.workspaces.allTabs}>
                  <Layers size={14} />
                </button>
              </div>
            </div>
          )}
          {tab === 'script' && <ScriptTab scriptText={scriptText} setScriptText={setScriptText} stylePreset={stylePreset} setStylePreset={setStylePreset} saving={saving} analyzing={analyzing} error={error} handleSave={handleSave} handleAnalyze={handleAnalyze} loadDemo={loadDemo} loadTemplate={loadTemplate} aiMode={aiMode} setAiMode={setAiMode} />}
          {tab === 'overview' && analysis && <>
            {/* Film Summary Card */}
            <div className="bg-dark-900 rounded-xl border border-dark-700 overflow-hidden mb-4">
              <div className="relative px-6 py-5">
                {/* Cinematic gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/[0.04] via-transparent to-purple-500/[0.03]" />
                <div className="absolute inset-0 vignette opacity-50" />
                <div className="relative flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Film size={14} className="text-orange-400" />
                      <span className="text-overline text-slate-500 uppercase tracking-widest">{locale === 'fr' ? 'Aperçu du projet' : 'Project Overview'}</span>
                    </div>
                    <h2 className="font-display text-2xl text-white mb-1">{project?.name || 'Untitled'}</h2>
                    <p className="text-xs text-slate-400 max-w-lg leading-relaxed">{analysis.synopsis || analysis.logline || (locale === 'fr' ? 'Aucun synopsis détecté' : 'No synopsis detected')}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1"><Film size={10} className="text-orange-400" /> {analysis.scenes?.length || 0} {locale === 'fr' ? 'scènes' : 'scenes'}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1"><Eye size={10} className="text-blue-400" /> {analysis.plans?.length || 0} {locale === 'fr' ? 'plans' : 'shots'}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1"><Users size={10} className="text-purple-400" /> {analysis.characterBible?.length || 0} {locale === 'fr' ? 'personnages' : 'characters'}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock size={10} className="text-green-400" /> ~{Math.round((analysis.plans?.length || 0) * 4)}s</span>
                    </div>
                  </div>
                  {/* Genre / Mood tags */}
                  <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                    {(analysis.genre ? [analysis.genre] : []).concat(analysis.moods?.slice(0, 3) || []).map((tag: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-dark-800 border border-dark-700 text-[9px] text-slate-400">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="beam w-full mt-4" />
              </div>
            </div>
            <OverviewCockpit analysis={analysis} projectName={project?.name} onNavigate={(tab: string) => setTab(tab as Tab)} />
          </>}
          {tab === 'analyse' && analysis && <AR analysis={analysis} analysisId={analysisId} userKeys={userKeys} projectId={projectId} />}
          {tab === 'storyboard' && analysis && <VisualStoryboard analysis={analysis} projectId={projectId} projectName={project?.name} />}
          {tab === 'timeline' && analysis && <>
            {/* Cinematic Player */}
            <CinematicPlayer analysis={analysis} projectName={project?.name} demoImages={isDemoProject ? DEMO_IMAGES : undefined} />
            {/* Timeline tracks */}
            <div className="mt-4"><TL analysis={analysis} projectName={project?.name} /></div>
          </>}
          {tab === 'copilot' && analysis && <CP projectId={projectId} projectName={project?.name} />}
          {tab === 'media' && analysis && <MB analysis={analysis} projectId={projectId} projectName={project?.name} />}
          {tab === 'subtitles' && analysis && <SV projectId={projectId} projectName={project?.name} />}
          {tab === 'voiceover' && analysis && <VO projectId={projectId} projectName={project?.name} />}
          {tab === 'score' && analysis && <ScorePanel analysis={analysis} projectId={projectId} projectName={project?.name} />}
          
          {/* MINI-TIMELINE — persistent film overview */}
          {analysis && analysis.plans && analysis.plans.length > 0 && (
            <div className="mt-6 bg-dark-900 rounded-xl border border-dark-700 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={12} className="text-slate-500" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Timeline</span>
                <span className="text-[10px] text-slate-600 ml-auto">{analysis.plans.length} {locale === 'fr' ? 'plans' : 'shots'}</span>
              </div>
              <div className="flex gap-0.5 h-6 rounded-lg overflow-hidden bg-dark-800">
                {analysis.plans.map((plan: any, i: number) => {
                  const emotionColors: Record<string, string> = {
                    tension: '#ef4444', tristesse: '#6366f1', colère: '#b91c1c', joie: '#f59e0b',
                    peur: '#8b5cf6', nostalgie: '#a78bfa', amour: '#ec4899', mystère: '#06b6d4',
                    détermination: '#f97316', neutre: '#64748b',
                    sadness: '#6366f1', anger: '#b91c1c', joy: '#f59e0b', fear: '#8b5cf6',
                    love: '#ec4899', mystery: '#06b6d4', determination: '#f97316', neutral: '#64748b',
                  }
                  const emotion = (plan.emotion || 'neutre').toLowerCase()
                  const color = emotionColors[emotion] || '#64748b'
                  return (
                    <button key={i}
                      onClick={() => { setTab('analyse'); setWorkspace('analysis') }}
                      className="relative group h-full transition-all hover:opacity-80"
                      style={{ flex: 1, backgroundColor: color + '40', borderRight: i < analysis.plans.length - 1 ? '1px solid rgba(0,0,0,0.3)' : 'none' }}
                      title={`S${plan.sceneIndex ?? '?'}P${plan.planIndex ?? i+1} — ${plan.emotion || 'neutre'}`}
                    >
                      <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ backgroundColor: color }} />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[7px] font-mono text-white font-bold drop-shadow">P{i+1}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
              {/* Emotion legend */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {(() => {
                  const counts: Record<string, { color: string; count: number }> = {}
                  for (const plan of (analysis.plans || [])) {
                    const e = (plan.emotion || 'neutre').toLowerCase()
                    const emotionColors: Record<string, string> = { tension: '#ef4444', tristesse: '#6366f1', joie: '#f59e0b', peur: '#8b5cf6', nostalgie: '#a78bfa', amour: '#ec4899', mystère: '#06b6d4', détermination: '#f97316', neutre: '#64748b', sadness: '#6366f1', joy: '#f59e0b', fear: '#8b5cf6', love: '#ec4899', mystery: '#06b6d4', determination: '#f97316', neutral: '#64748b' }
                    if (!counts[e]) counts[e] = { color: emotionColors[e] || '#64748b', count: 0 }
                    counts[e].count++
                  }
                  return Object.entries(counts).map(([e, v]) => (
                    <span key={e} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color }} />
                      <span className="text-[9px] text-slate-500">{e} ({v.count})</span>
                    </span>
                  ))
                })()}
              </div>
            </div>
          )}
                    {tab === 'flow' && analysis && (
            <div style={{ height: 'calc(100vh - 200px)', background: '#0B0F14', borderRadius: 12, overflow: 'hidden' }}>
              <FlowCanvas analysis={analysis} mode={mode} />
            </div>
          )}
{tab === 'render' && analysis && <DeliverPage analysis={analysis} analysisId={analysisId} projectId={projectId} projectName={project?.name} locale={locale} />}
        </div>
      )}
    </div>
    </DragDropProvider>
  )
}

// ═══ Unified Deliver Page ═══
function DeliverPage({ analysis, analysisId, projectId, projectName, locale }: { analysis: any; analysisId: string | null; projectId: string; projectName?: string; locale: string }) {
  const [deliverTab, setDeliverTab] = useState<'generate' | 'assemble' | 'presets' | 'history'>('generate')
  const fr = locale === 'fr'
  const tabs = [
    { id: 'generate' as const, label: fr ? 'Générer' : 'Generate', icon: '⚡' },
    { id: 'assemble' as const, label: fr ? 'Assembler' : 'Assemble', icon: '🎬' },
    { id: 'presets' as const, label: fr ? 'Formats' : 'Formats', icon: '📐' },
    { id: 'history' as const, label: fr ? 'Historique' : 'History', icon: '📋' },
  ]
  return (
    <div className="space-y-4">
      {/* Deliver header */}
      <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/15 to-orange-500/15 border border-green-500/15 flex items-center justify-center">
              <Package size={18} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-200 font-display">{fr ? 'Livraison' : 'Deliver'}</h2>
              <p className="text-[10px] text-slate-500">{fr ? 'Générer, assembler, exporter votre film' : 'Generate, assemble, export your film'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setDeliverTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${deliverTab === t.id ? 'bg-gradient-to-r from-orange-500/15 to-green-500/10 text-orange-300 border border-orange-500/20' : 'text-slate-500 hover:text-slate-300'}`}>
                <span className="mr-1">{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
      </div>

      {/* Tab content */}
      {deliverTab === 'generate' && (
        <RenderPanel analysis={analysis} analysisId={analysisId} projectName={projectName} />
      )}

      {deliverTab === 'assemble' && (
        <AssemblyPanel analysis={analysis} projectId={projectId} projectName={projectName} />
      )}

      {deliverTab === 'presets' && (
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">{fr ? 'Formats d\'export' : 'Export Formats'}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'YouTube 1080p', res: '1920×1080', ratio: '16:9', icon: '▶', color: 'border-red-500/20 hover:border-red-500/40' },
              { label: 'Instagram Reels', res: '1080×1920', ratio: '9:16', icon: '📱', color: 'border-pink-500/20 hover:border-pink-500/40' },
              { label: fr ? 'Cinéma 4K' : 'Cinema 4K', res: '3840×2160', ratio: '2.39:1', icon: '🎬', color: 'border-orange-500/20 hover:border-orange-500/40' },
              { label: fr ? 'Présentation' : 'Presentation', res: '1920×1080', ratio: '16:9', icon: '📊', color: 'border-blue-500/20 hover:border-blue-500/40' },
              { label: 'TikTok', res: '1080×1920', ratio: '9:16', icon: '🎵', color: 'border-cyan-500/20 hover:border-cyan-500/40' },
              { label: 'X / Twitter', res: '1280×720', ratio: '16:9', icon: '🐦', color: 'border-sky-500/20 hover:border-sky-500/40' },
              { label: 'LinkedIn', res: '1920×1080', ratio: '16:9', icon: '💼', color: 'border-blue-600/20 hover:border-blue-600/40' },
              { label: fr ? 'Carré' : 'Square', res: '1080×1080', ratio: '1:1', icon: '⬛', color: 'border-purple-500/20 hover:border-purple-500/40' },
            ].map((preset, i) => (
              <button key={i} className={`bg-dark-800/50 hover:bg-dark-800 border rounded-xl p-4 text-left transition-all group ${preset.color}`}>
                <span className="text-2xl block mb-2">{preset.icon}</span>
                <span className="text-xs text-slate-200 font-medium block group-hover:text-orange-400 transition-colors">{preset.label}</span>
                <span className="text-[10px] text-slate-500 block mt-1">{preset.res}</span>
                <span className="text-[9px] text-slate-600">{preset.ratio}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {deliverTab === 'history' && (
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-slate-400" />
            <span className="text-sm text-slate-200 font-medium">{fr ? 'Historique d\'export' : 'Export History'}</span>
          </div>
          <div className="space-y-2">
            {[
              { date: new Date().toLocaleDateString(fr ? 'fr-FR' : 'en-US'), type: 'JSON', size: '2.4 KB', icon: '📋', status: '✓' },
            ].map((ex, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-dark-800/50 rounded-lg border border-dark-700/50 hover:border-dark-600 transition-colors">
                <span className="text-sm">{ex.icon}</span>
                <div className="flex-1">
                  <span className="text-xs text-slate-300 font-medium">{ex.type}</span>
                  <span className="text-[10px] text-slate-500 ml-2">{ex.size}</span>
                </div>
                <span className="text-green-400 text-xs">{ex.status}</span>
                <span className="text-[10px] text-slate-500">{ex.date}</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-slate-600 text-center mt-3">{fr ? 'L\'historique se remplit au fur et à mesure de vos exports' : 'History fills as you export'}</p>
        </div>
      )}
    </div>
  )
}

// ═══ Model studio URLs ═══
const MODEL_URLS: Record<string, { name: string; url: string; provider: string }> = {
  kling: { name: 'Kling', url: 'https://klingai.com', provider: 'kling' },
  'kling 3.0': { name: 'Kling', url: 'https://klingai.com', provider: 'kling' },
  runway: { name: 'Runway', url: 'https://app.runwayml.com', provider: 'runway' },
  'runway gen-4': { name: 'Runway', url: 'https://app.runwayml.com', provider: 'runway' },
  'runway gen-4.5': { name: 'Runway', url: 'https://app.runwayml.com', provider: 'runway' },
  sora: { name: 'Sora', url: 'https://sora.com', provider: 'sora' },
  'sora 2': { name: 'Sora', url: 'https://sora.com', provider: 'sora' },
  veo: { name: 'Veo', url: 'https://deepmind.google/technologies/veo/', provider: 'veo' },
  'veo 3.1': { name: 'Veo', url: 'https://deepmind.google/technologies/veo/', provider: 'veo' },
  hailuo: { name: 'Hailuo', url: 'https://hailuoai.video', provider: 'hailuo' },
  'hailuo 2.3': { name: 'Hailuo', url: 'https://hailuoai.video', provider: 'hailuo' },
  seedance: { name: 'Seedance', url: 'https://seedance.ai', provider: 'seedance' },
  'seedance 2.0': { name: 'Seedance', url: 'https://seedance.ai', provider: 'seedance' },
  'wan 2.5': { name: 'Wan', url: 'https://wan.video', provider: 'wan' },
}
const getModelStudio = (mid: string) => MODEL_URLS[mid.toLowerCase()] || MODEL_URLS['kling']

// ═══ Simple Plan Card ═══
function SPC({ plan, index, analysisId, userKeys, projectId }: { plan: any; index: number; analysisId?: string | null; userKeys: Set<string>; projectId?: string }) {
  const { t, locale } = useI18n()
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<'idle'|'processing'|'polling'|'completed'|'failed'>('idle')
  const [progress, setProgress] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showVideo, setShowVideo] = useState(false)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const basePrompt = plan?.finalPrompt || plan?.basePrompt || ''
  const mid = (plan?.modelId || 'kling').toLowerCase()
  const mc = getModelColor(mid)
  const studio = getModelStudio(mid)
  const canGenerate = userKeys.has(studio.provider)

  // Inject character reference images into prompt
  const prompt = useMemo(() => {
    if (!projectId) return basePrompt
    const refImages = getCharacterRefImages(projectId)
    if (Object.keys(refImages).length === 0) return basePrompt
    const charNames = Object.keys(refImages)
    const { prompt: enhanced } = injectCharacterRefsInPrompt(basePrompt, charNames, refImages, mid)
    return enhanced
  }, [basePrompt, projectId, mid])

  const copy = () => { navigator.clipboard.writeText(prompt).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }).catch(() => {}) }

  const generate = async () => {
    if (!analysisId) return
    setStatus('processing'); setProgress(0); setError(null)

    // Collect character reference images for real injection
    const refImages = projectId ? getCharacterRefImages(projectId) : {}
    const characterRefImages = Object.entries(refImages).map(([name, dataUrl]) => ({
      name,
      base64: dataUrl,
      mimeType: dataUrl.match(/^data:(image\/\w+)/)?.[1] || 'image/png',
    }))

    try {
      const r = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId, planIndex: index, sceneIndex: plan?.sceneIndex || 0,
          modelId: plan?.modelId, prompt, negativePrompt: plan?.negativePrompt,
          duration: plan?.estimatedDuration || 5, aspectRatio: '16:9',
          characterRefImages: characterRefImages.length > 0 ? characterRefImages : undefined,
        }),
      })
      const data = await r.json()
      if (!r.ok) { setStatus('failed'); setError(data.error || t.common.error); return }
      setStatus('polling')
      let tick = 0
      pollRef.current = setInterval(async () => {
        tick++; setProgress(prev => Math.min(prev + 2 + Math.random() * 3, 92))
        try {
          const sr = await fetch(`/api/generate/status?jobId=${data.jobId || data.generationId}`)
          if (!sr.ok) return
          const sd = await sr.json()
          if (sd.status === 'completed') { clearInterval(pollRef.current!); setProgress(100); setVideoUrl(sd.resultUrl || sd.thumbnailUrl); setStatus('completed') }
          else if (sd.status === 'failed') { clearInterval(pollRef.current!); setStatus('failed'); setError(sd.errorMessage || 'Échec') }
          if (sd.progress) setProgress(sd.progress)
        } catch {}
        if (tick > 150) { clearInterval(pollRef.current!); setStatus('failed'); setError('Timeout') }
      }, 2000)
    } catch (e: any) { setStatus('failed'); setError(e.message) }
  }

  useEffect(() => { return () => { if (pollRef.current) clearInterval(pollRef.current) } }, [])
  const isGenerating = status === 'processing' || status === 'polling'

  return (
    <div className="card overflow-hidden group hover:border-dark-600 transition-all">
      <div className="flex gap-3 p-3">
        {/* Preview */}
        <div className="flex-shrink-0 relative hidden sm:block">
          {status === 'completed' && videoUrl ? (
            <div className="relative cursor-pointer" onClick={() => setShowVideo(!showVideo)}>
              <div className="w-[160px] h-[90px] bg-dark-800 rounded-lg overflow-hidden">
                <video src={videoUrl} className="w-full h-full object-cover" muted preload="metadata" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg hover:bg-black/10 transition-colors">
                <Play size={20} fill="white" className="text-white drop-shadow-lg" />
              </div>
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                <Check size={9} className="text-white" />
              </div>
            </div>
          ) : (
            <div className="relative">
              <StoryboardSVG shotType={plan?.shotType} cameraMove={plan?.cameraMove} width={160} height={90} modelColor={mc} />
              {isGenerating && (
                <div className="absolute inset-0 bg-dark-950/60 rounded-lg flex items-center justify-center">
                  <Loader2 size={20} className="text-orange-400 animate-spin mx-auto" />
                  <span className="text-[9px] text-orange-400 ml-1">{Math.round(progress)}%</span>
                </div>
              )}
            </div>
          )}
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
                {copied ? <><Check size={10} /> {t.demo.copied}</> : <><Copy size={10} /> {t.demo.copyPrompt}</>}
              </button>
              {canGenerate && status === 'idle' && (
                <button onClick={generate} className="px-2.5 py-1 btn-primary text-white text-[10px] font-medium rounded flex items-center gap-1 transition-colors">
                  <Zap size={10} /> {t.demo.generateWith}
                </button>
              )}
              {canGenerate && status === 'failed' && (
                <button onClick={generate} className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] rounded flex items-center gap-1 hover:bg-red-500/20">
                  <AlertTriangle size={10} /> Retry
                </button>
              )}
              {canGenerate && status === 'completed' && (
                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded flex items-center gap-1">
                  <Check size={10} /> {t.common.success}
                </span>
              )}
              {!canGenerate && (
                <a href={studio.url} target="_blank" rel="noopener noreferrer"
                  className="px-2 py-1 bg-dark-700 hover:bg-dark-600 text-slate-300 text-[10px] rounded flex items-center gap-1 transition-colors">
                  <ExternalLink size={9} /> {studio.name}
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-slate-500">{plan?.shotType}</span>
            {plan?.cameraMove && plan.cameraMove !== 'fixe' && <span className="text-[10px] text-cyan-400/60">{plan.cameraMove}</span>}
            <CompareButton plan={plan} />
            <button onClick={() => {
              const alt = (prompt || '').replace(/cinematic/gi, 'documentary-style').replace(/golden hour/gi, 'blue hour').replace(/slow motion/gi, 'real-time')
              const variant = alt !== prompt ? alt : prompt + ', alternative angle, different color palette'
              navigator.clipboard.writeText(`[A] ${prompt}\n\n[B] ${variant}`)
            }} className="px-1.5 py-0.5 text-[9px] text-amber-400/70 hover:text-amber-300 bg-amber-400/5 hover:bg-amber-400/10 rounded border border-amber-400/10 transition-all">
              A/B
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-mono line-clamp-2">{prompt || '—'}</p>
          {isGenerating && (
            <div className="mt-2 h-1 bg-dark-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-600 to-yellow-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          )}
          {status === 'failed' && error && <p className="text-[10px] text-red-400/80 mt-1">{error}</p>}
        </div>
      </div>
      {showVideo && videoUrl && (
        <div className="border-t border-dark-700 bg-black">
          <video src={videoUrl} controls autoPlay className="w-full aspect-video" />
        </div>
      )}
    </div>
  )
}

// ═══ Script Tab ═══
function ScriptTab({ scriptText, setScriptText, stylePreset, setStylePreset, saving, analyzing, error, handleSave, handleAnalyze, loadDemo, loadTemplate, aiMode, setAiMode }: any) {
  const { t, locale } = useI18n()
  const [dragOver, setDragOver] = useState(false)
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (file.name.match(/\.(txt|fountain|fdx|md)$/i)) {
      const reader = new FileReader()
      reader.onload = (ev) => { if (ev.target?.result) setScriptText(ev.target.result as string) }
      reader.readAsText(file)
    }
  }, [setScriptText])
  // Live script parsing for preview
  const scriptPreview = useMemo(() => {
    if (!scriptText.trim()) return { scenes: [], chars: [], duration: 0 }
    const lines = scriptText.split('\n')
    const scenes: { heading: string; lines: number; chars: string[] }[] = []
    const charSet = new Set<string>()
    let current: any = null
    for (const line of lines) {
      const trimmed = line.trim()
      if (/^(INT\.|EXT\.|INT\/EXT)/i.test(trimmed)) {
        if (current) scenes.push(current)
        current = { heading: trimmed, lines: 0, chars: [] }
      } else if (current) {
        current.lines++
        if (/^[A-Z\u00C0-\u00DC]{2,}(\s|$)/.test(trimmed) && trimmed.length < 30) {
          const name = trimmed.replace(/\(.*\)/, '').trim()
          if (name.length > 1) { charSet.add(name); current.chars.push(name) }
        }
      }
    }
    if (current) scenes.push(current)
    const duration = Math.round(scriptText.length / 15)
    return { scenes, chars: Array.from(charSet), duration }
  }, [scriptText])

  return (
    <DropZone accept={['media', 'file', 'reference']} onDrop={(item) => { if (item.data?.text) setScriptText((prev: string) => prev + '\n' + item.data.text) }} label={locale === 'fr' ? 'Ajouter au scénario' : 'Add to script'}><div className="space-y-4" onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}>
      {/* AI Screenplay Assistant */}
      <ScreenplayAssistant
        onUseScript={(script: string) => setScriptText(script)}
        existingScript={scriptText.trim() || undefined}
      />

      {/* Template Selector */}
      <TemplateSelector onUseTemplate={loadTemplate} />

      {/* Split-view: Editor + Live Preview (drag-drop zone) */}
      {dragOver && (
        <div className="fixed inset-0 z-50 bg-dark-950/80 backdrop-blur-md flex items-center justify-center pointer-events-none">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-orange-500/15 border-2 border-dashed border-orange-500/40 flex items-center justify-center">
              <Upload size={32} className="text-orange-400" />
            </div>
            <p className="text-lg font-display text-white">{locale === 'fr' ? 'Déposez votre fichier' : 'Drop your file'}</p>
            <p className="text-xs text-slate-500 mt-1">.txt · .fountain · .fdx · .md</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Editor (2/3) */}
        <div className="lg:col-span-2 bg-dark-900 rounded-xl border border-dark-700">
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700">
            <div className="flex items-center gap-2">
              <select value={stylePreset} onChange={(e: any) => setStylePreset(e.target.value)} className="px-2 py-1 bg-dark-800 border border-dark-600 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-orange-500/50">
                <option value="cinematique">🎬 Cinématique</option><option value="documentaire">📹 Documentaire</option>
                <option value="noir">🌑 Film noir</option><option value="onirique">🌙 Onirique</option>
              </select>
              <button onClick={loadDemo} className="px-2 py-1 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-xs text-slate-400">{t.common.demo}</button>
            </div>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-xs text-slate-300">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} {locale === 'fr' ? 'Sauvegarder' : 'Save'}
            </button>
          </div>
          <textarea value={scriptText} onChange={(e: any) => setScriptText(e.target.value)} placeholder={t.project.scriptPlaceholder} rows={20}
            className="w-full p-4 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none font-mono leading-relaxed" />
        </div>

        {/* Live Preview (1/3) */}
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-4 space-y-4 max-h-[600px] overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={14} className="text-orange-500" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{locale === 'fr' ? 'Aperçu' : 'Preview'}</span>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-dark-800 rounded-lg p-2.5 text-center">
              <div className="text-lg font-bold text-orange-400">{scriptPreview.scenes.length}</div>
              <div className="text-[9px] text-slate-500 uppercase">Scènes</div>
            </div>
            <div className="bg-dark-800 rounded-lg p-2.5 text-center">
              <div className="text-lg font-bold text-orange-400">{scriptPreview.chars.length}</div>
              <div className="text-[9px] text-slate-500 uppercase">{locale === 'fr' ? 'Personnages' : 'Characters'}</div>
            </div>
            <div className="bg-dark-800 rounded-lg p-2.5 text-center">
              <div className="text-lg font-bold text-orange-400">~{scriptPreview.duration}s</div>
              <div className="text-[9px] text-slate-500 uppercase">{locale === 'fr' ? 'Durée est.' : 'Est. duration'}</div>
            </div>
          </div>
          {/* Scene list */}
          {scriptPreview.scenes.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{locale === 'fr' ? 'Structure' : 'Structure'}</span>
              {scriptPreview.scenes.map((s: any, i: number) => (
                <div key={i} className="bg-dark-800/60 rounded-lg px-3 py-2 border border-dark-700/50">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-orange-500/70">S{i+1}</span>
                    <span className="text-xs text-slate-300 font-medium truncate">{s.heading}</span>
                  </div>
                  {s.chars.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {[...new Set(s.chars)].map((c: any, j: number) => (
                        <span key={j} className="text-[9px] px-1.5 py-0.5 bg-dark-700 rounded text-slate-400">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Characters list */}
          {scriptPreview.chars.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{locale === 'fr' ? 'Personnages détectés' : 'Detected characters'}</span>
              <div className="flex gap-1.5 flex-wrap">
                {scriptPreview.chars.map((c: any, i: number) => (
                  <span key={i} className="text-xs px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-300">{c}</span>
                ))}
              </div>
            </div>
          )}
          {!scriptText.trim() && (
            <div className="text-center py-8">
              <Film size={28} className="text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-600">{locale === 'fr' ? 'Commencez à écrire pour voir la structure' : 'Start writing to see structure'}</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Enhancement Toggle */}
      <div className="flex items-center justify-between px-1">
        <button onClick={() => setAiMode(!aiMode)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
            aiMode
              ? 'bg-purple-600/15 border-purple-500/30 text-purple-300'
              : 'bg-dark-800/50 border-dark-700 text-slate-500 hover:text-slate-400'
          }`}>
          <div className={`w-7 h-4 rounded-full transition-all relative ${aiMode ? 'bg-purple-600' : 'bg-dark-600'}`}>
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${aiMode ? 'left-3.5' : 'left-0.5'}`} />
          </div>
          <Sparkles size={12} className={aiMode ? 'text-purple-400' : 'text-slate-600'} />
          {locale === 'fr' ? 'Analyse IA narrative' : 'AI Narrative Analysis'}
        </button>
        {aiMode && (
          <span className="text-[10px] text-purple-400/60">
            Claude / GPT • {locale === 'fr' ? 'enrichit les prompts et la direction artistique' : 'enriches prompts & artistic direction'}
          </span>
        )}
      </div>

      <button onClick={handleAnalyze} disabled={analyzing || !scriptText.trim()}
        className={`w-full py-3 font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${
          aiMode
            ? 'bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-500 hover:to-orange-400 shadow-purple-500/20'
            : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-orange-500/20'
        } disabled:opacity-40 text-white`}>
        {analyzing
          ? <><Loader2 size={18} className="animate-spin" /> {aiMode ? (locale === 'fr' ? 'Analyse IA profonde...' : 'Deep AI Analysis...') : (locale === 'fr' ? 'Analyse...' : 'Analyzing...')}</>
          : <><Play size={18} /> {aiMode ? (locale === 'fr' ? "Lancer l'analyse IA" : 'Run AI Analysis') : (locale === 'fr' ? "Lancer l'analyse" : 'Run Analysis')}</>}
      </button>
      {error && <p className="text-xs text-red-400 text-center flex items-center justify-center gap-1"><AlertTriangle size={12} /> {error}</p>}
    </div></DropZone>
  )
}

// ═══ Copilot ═══
function CP({ projectId, projectName }: { projectId: string; projectName?: string }) {
  const { t, locale } = useI18n()
  const isDemo = (projectName || '').toLowerCase().includes('démo') || (projectName || '').toLowerCase().includes('demo')
  const DEMO_SUGGESTIONS = [
    { icon: '🎬', title: locale === 'fr' ? 'Ça me fait penser à...' : 'This reminds me of...', detail: 'Cinema Paradiso (Tornatore, 1988) — la scène du cinéma. Technique recommandée : lumière projetée sur les visages, contrejour de l\'écran.', category: 'reference' },
    { icon: '🎵', title: 'Suggestion musicale', detail: 'Piano solo minimaliste type Yann Tiersen. Les cordes lentes de Max Richter (On the Nature of Daylight) colleraient aussi au thème du deuil.', category: 'music' },
    { icon: '📐', title: locale === 'fr' ? 'As-tu pensé à...' : 'Have you considered...', detail: 'Un plan-séquence sans coupe pour la scène de l\'hôpital. La tension continue sans montage renforcerait l\'émotion.', category: 'technique' },
    { icon: '🪑', title: 'L\'art du vide', detail: 'La place vide au cinéma est un personnage. Yasujirō Ozu filmait les espaces vides après le départ des personnages — les "pillow shots".', category: 'theory' },
    { icon: '💡', title: 'Astuce flashback', detail: 'Change le ratio d\'image (2.35:1 → 4:3) ou désature légèrement pour distinguer les temporalités. Nolan utilise IMAX vs 35mm dans Oppenheimer.', category: 'technique' },
  ]
  const [sug, setSug] = useState<any[]>(isDemo ? DEMO_SUGGESTIONS : []); const [ld, setLd] = useState(false)
  const load = async () => { if (isDemo) { setSug(DEMO_SUGGESTIONS); return } setLd(true); try { const r = await fetch(`/api/projects/${projectId}/copilot`); if(r.ok){const d=await r.json();setSug(d.suggestions||[])} } catch{} finally{setLd(false)} }
  const catColors: Record<string, string> = { reference: 'border-l-blue-400', music: 'border-l-purple-400', technique: 'border-l-cyan-400', theory: 'border-l-amber-400' }
  const catLabels: Record<string, string> = { reference: locale === 'fr' ? 'Référence' : 'Reference', music: locale === 'fr' ? 'Musique' : 'Music', technique: 'Technique', theory: locale === 'fr' ? 'Théorie' : 'Theory' }
  return (<div>
    {/* Header */}
    <div className="bg-dark-900 rounded-xl border border-dark-700 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-orange-500/20 border border-purple-500/15 flex items-center justify-center">
            <Sparkles size={16} className="text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">{locale === 'fr' ? 'Copilote IA' : 'AI Copilot'}</h3>
            <p className="text-[10px] text-slate-500">{locale === 'fr' ? 'Conseils de réalisation contextuel' : 'Contextual directing advice'}</p>
          </div>
        </div>
        <button onClick={load} disabled={ld} className="btn-primary px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5">
          {ld ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} {locale === 'fr' ? 'Analyser' : 'Analyze'}
        </button>
      </div>
    </div>
    {/* Suggestions */}
    {sug.length > 0 ? <div className="space-y-3">{sug.map((s:any,i:number) => {
      const cat = s.category || 'technique'
      return (
        <div key={i} className={`bg-dark-900 rounded-xl border border-dark-700 border-l-2 ${catColors[cat] || 'border-l-orange-400'} p-4 hover:bg-dark-850 transition-all group`}>
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">{s.icon||'💡'}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <p className="text-sm text-slate-200 font-medium">{s.title}</p>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider text-slate-500 bg-dark-800">{catLabels[cat] || cat}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{s.detail}</p>
            </div>
          </div>
        </div>
      )
    })}</div>
      : <div className="p-16 bg-dark-900 rounded-xl border border-dark-700 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-purple-500/10 border border-purple-500/15 flex items-center justify-center">
            <Sparkles size={24} className="text-purple-400/50" />
          </div>
          <p className="text-sm text-slate-300 font-display mb-1">{locale === 'fr' ? 'Votre copilote attend' : 'Your copilot is waiting'}</p>
          <p className="text-xs text-slate-500">{locale === 'fr' ? 'Cliquez Analyser pour des suggestions de réalisation' : 'Click Analyze for directing suggestions'}</p>
        </div>}
  </div>)
}

// ═══ Media Bank ═══
function MB({ analysis, projectId, projectName }: { analysis: any; projectId: string; projectName?: string }) {
  const { t, locale } = useI18n()
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
  const srch = async (sq?: string) => { const s=sq||q; if(!s.trim())return; setLd(true);setErr(''); try{const r=await fetch(`/api/media?q=${encodeURIComponent(s)}&type=all`);const d=await r.json();if(d.error&&!d.results?.length)setErr(d.error);setRes(d.results||[])}catch{setErr(t.common.error)}finally{setLd(false)} }
  const sugs = (analysis?.scenes||[]).slice(0,4).map((s:any)=>(s.heading||'').replace(/^(INT\.|EXT\.)\s*/i,'').replace(/–.*/g,'').trim()).filter(Boolean)
  return (<div>
    <div className="flex items-center gap-2 mb-4">
      <div className="flex-1 relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&srch()} placeholder="Search..." className="w-full h-9 pl-9 pr-3 bg-dark-900 border border-dark-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50" />
      </div>
      <button onClick={()=>srch()} disabled={ld||!q.trim()} className="h-9 px-4 btn-primary disabled:opacity-40 text-white text-xs font-medium rounded-lg">{ld ? <Loader2 size={14} className="animate-spin" /> : 'Chercher'}</button>
    </div>
    {sugs.length>0&&res.length===0&&<div className="flex items-center gap-2 mb-4 flex-wrap"><span className="text-xs text-slate-500">Suggestions :</span>{sugs.map((s:string,i:number)=><button key={i} onClick={()=>{setQ(s);srch(s)}} className="px-2 py-1 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded text-xs text-slate-300">{s}</button>)}</div>}
    {err&&<div className="p-3 mb-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-400">{err}</div>}
    {res.length>0 ? <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{res.map((r:any)=><Draggable key={r.id} item={{ type: 'media', data: { url: r.thumbnail || r.url, title: r.title }, label: r.title || 'Media' }}><div className="relative group rounded-lg overflow-hidden border border-dark-700"><img src={r.thumbnail||r.url} alt={r.title} className="w-full aspect-video object-cover bg-dark-800" loading="lazy" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2"><p className="text-[10px] text-white truncate">{r.title} • {r.source}</p></div></div></Draggable>)}</div>
      : !ld && <div className="p-12 bg-dark-900 rounded-xl border border-dark-700 text-center"><Image size={36} className="text-slate-700 mx-auto mb-3" /><p className="text-sm text-slate-400">Recherchez des références visuelles</p></div>}
  </div>)
}

// ═══ Multi-Track Timeline ═══
function TL({ analysis, projectName }: { analysis: any; projectName?: string }) {
  const { locale } = useI18n()
  const fr = locale === 'fr'
  const isDemoTL = (projectName || '').toLowerCase().includes('démo') || (projectName || '').toLowerCase().includes('demo')
  const [playing, setPlaying] = useState(false); const [ph, setPh] = useState(0)
  const [trackVisibility, setTrackVisibility] = useState({ scene: true, video: true, audio: true, subtitle: true, emotion: true })
  const toggleTrack = (key: string) => setTrackVisibility(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))
  const plans = analysis?.plans || []; const scenes = analysis?.scenes || []
  const total = plans.reduce((s:number,p:any)=>s+(p?.estimatedDuration||3),0)||1
  useEffect(() => { if(!playing)return; const id=setInterval(()=>{setPh(p=>{if(p>=total){setPlaying(false);return 0};return p+0.1})},100); return()=>clearInterval(id) }, [playing, total])

  const EMOTION_COLORS: Record<string, string> = {
    tension: '#ef4444', tristesse: '#6366f1', colere: '#dc2626', joie: '#f59e0b',
    peur: '#7c3aed', nostalgie: '#8b5cf6', amour: '#ec4899', mystere: '#06b6d4',
    determination: '#f97316', neutre: '#64748b',
  }

  return (<div className="space-y-3">
    {/* Transport controls */}
    <div className="flex items-center gap-3 bg-dark-900 rounded-xl border border-dark-700 px-4 py-3">
      <button onClick={()=>setPh(0)} className="p-1.5 rounded hover:bg-white/5"><SkipBack size={16} className="text-slate-400" /></button>
      <button onClick={()=>setPlaying(!playing)} className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/15">{playing ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white ml-0.5" />}</button>
      <button onClick={()=>setPh(Math.min(ph+5,total))} className="p-1.5 rounded hover:bg-white/5"><SkipForward size={16} className="text-slate-400" /></button>
      <span className="text-[11px] text-slate-200 font-mono tabular-nums">{fmt(ph)}</span>
      <div className="flex-1 relative h-1.5 bg-dark-700 rounded-full cursor-pointer group" onClick={e=>{const r=e.currentTarget.getBoundingClientRect();setPh((e.clientX-r.left)/r.width*total)}}>
        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" style={{width:`${(ph/total)*100}%`}} />
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" style={{left:`calc(${(ph/total)*100}% - 6px)`}} />
      </div>
      <span className="text-[11px] text-slate-500 font-mono tabular-nums">{fmt(total)}</span>
    </div>

    {/* Track controls + legend */}
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-1">
        {[
          { key: 'scene', label: fr ? 'Scènes' : 'Scenes', color: 'text-orange-400' },
          { key: 'video', label: fr ? 'Vidéo' : 'Video', color: 'text-blue-400' },
          { key: 'audio', label: 'Audio', color: 'text-purple-400' },
          { key: 'subtitle', label: fr ? 'Sous-titres' : 'Subtitles', color: 'text-green-400' },
          { key: 'emotion', label: fr ? 'Émotion' : 'Emotion', color: 'text-pink-400' },
        ].map(({ key, label, color }) => (
          <button key={key} onClick={() => toggleTrack(key)}
            className={`px-2 py-1 rounded text-[9px] font-medium transition-all ${trackVisibility[key as keyof typeof trackVisibility] ? `${color} bg-dark-800` : 'text-slate-600 bg-dark-900'}`}>
            {trackVisibility[key as keyof typeof trackVisibility] ? '◉' : '○'} {label}
          </button>
        ))}
      </div>
      <ModelLegend className="" />
    </div>

    {/* Multi-track area */}
    <DropZone accept={['shot', 'media']} onDrop={(item) => { /* future: reorder/insert */ }} label={fr ? 'Ajouter à la timeline' : 'Add to timeline'}>
    <div className="bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
      <div className="overflow-x-auto p-3">
        <div className="relative" style={{ minWidth: Math.max(plans.length * 100, 600) }}>
          {/* Track 1: Scenes */}
          {trackVisibility.scene && (
            <div className="flex items-center mb-1">
              <span className="w-16 flex-shrink-0 text-[8px] text-orange-400/60 uppercase tracking-wider font-bold pr-2 text-right">{fr ? 'Scène' : 'Scene'}</span>
              <div className="flex-1 flex h-6 rounded overflow-hidden">
                {scenes.map((s:any,i:number)=>{
                  const sp=plans.filter((p:any)=>(p?.sceneIndex||0)===i)
                  const d=sp.reduce((sum:number,p:any)=>sum+(p?.estimatedDuration||3),0)||1
                  return <div key={i} className="flex items-center justify-center text-[9px] text-slate-400 font-medium border-r border-dark-700/30" style={{width:`${(d/total)*100}%`, backgroundColor:'rgba(249,115,22,0.06)'}}>
                    S{i+1}
                  </div>
                })}
              </div>
            </div>
          )}

          {/* Track 2: Video (thumbnails) */}
          {trackVisibility.video && (
            <div className="flex items-center mb-1">
              <span className="w-16 flex-shrink-0 text-[8px] text-blue-400/60 uppercase tracking-wider font-bold pr-2 text-right">{fr ? 'Vidéo' : 'Video'}</span>
              <div className="flex-1 flex gap-px min-h-[56px]">
                {plans.map((p:any,i:number)=>{
                  const d=p?.estimatedDuration||3
                  const mc=getModelColor((p?.modelId||'').toLowerCase())
                  return <div key={i} className="flex-shrink-0 rounded overflow-hidden border border-dark-700/30 hover:border-dark-600 transition-all cursor-pointer group relative" style={{width:`${Math.max((d/total)*100,4)}%`, minWidth: 60}}>
                    {isDemoTL && DEMO_IMAGES[i % DEMO_IMAGES.length] ? (
                      <img src={DEMO_IMAGES[i % DEMO_IMAGES.length].src} alt={`P${i+1}`} className="w-full h-[52px] object-cover" />
                    ) : (
                      <StoryboardSVG shotType={p?.shotType} cameraMove={p?.cameraMove} width={100} height={52} modelColor={mc} />
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-dark-950/80 to-transparent px-1 py-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[7px] font-bold text-slate-300">P{i+1}</span>
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: mc }} />
                      </div>
                    </div>
                  </div>
                })}
              </div>
            </div>
          )}

          {/* Track 3: Audio (waveform-style) */}
          {trackVisibility.audio && (
            <div className="flex items-center mb-1">
              <span className="w-16 flex-shrink-0 text-[8px] text-purple-400/60 uppercase tracking-wider font-bold pr-2 text-right">Audio</span>
              <div className="flex-1 flex h-8 rounded bg-dark-800/30 overflow-hidden">
                {plans.map((p:any,i:number)=>{
                  const d=p?.estimatedDuration||3
                  const bars = Math.max(Math.floor(d * 2), 3)
                  return <div key={i} className="flex items-end justify-center gap-px px-px" style={{width:`${(d/total)*100}%`}}>
                    {Array.from({length: bars}).map((_,b)=>{
                      const h = 20 + Math.sin((i * 7 + b * 3) * 0.7) * 15 + Math.random() * 10
                      return <div key={b} className="bg-purple-500/40 rounded-t-sm" style={{width: 2, height: `${Math.min(h, 100)}%`}} />
                    })}
                  </div>
                })}
              </div>
            </div>
          )}

          {/* Track 4: Subtitles */}
          {trackVisibility.subtitle && (
            <div className="flex items-center mb-1">
              <span className="w-16 flex-shrink-0 text-[8px] text-green-400/60 uppercase tracking-wider font-bold pr-2 text-right">{fr ? 'Sous-t.' : 'Subs'}</span>
              <div className="flex-1 flex h-5 rounded bg-dark-800/20 overflow-hidden">
                {plans.map((p:any,i:number)=>{
                  const d=p?.estimatedDuration||3
                  const hasDialogue = p?.dialogue || p?.characterName
                  return <div key={i} className="flex items-center justify-center border-r border-dark-700/20" style={{width:`${(d/total)*100}%`}}>
                    {hasDialogue && <div className="h-3 mx-0.5 rounded-sm bg-green-500/30 border border-green-500/20 flex-1 flex items-center justify-center">
                      <span className="text-[6px] text-green-400/70 truncate px-0.5">{p.characterName || '💬'}</span>
                    </div>}
                  </div>
                })}
              </div>
            </div>
          )}

          {/* Track 5: Emotion curve */}
          {trackVisibility.emotion && (
            <div className="flex items-center">
              <span className="w-16 flex-shrink-0 text-[8px] text-pink-400/60 uppercase tracking-wider font-bold pr-2 text-right">{fr ? 'Émotion' : 'Emotion'}</span>
              <div className="flex-1 flex h-4 rounded overflow-hidden">
                {plans.map((p:any,i:number)=>{
                  const d=p?.estimatedDuration||3
                  const emo = (p?.emotion || p?.emotionTag || 'neutre').toLowerCase()
                  const c = EMOTION_COLORS[emo] || EMOTION_COLORS.neutre
                  return <div key={i} className="cursor-pointer hover:opacity-80 transition-opacity" title={emo}
                    style={{width:`${(d/total)*100}%`, backgroundColor: c, opacity: 0.5}} />
                })}
              </div>
            </div>
          )}

          {/* Playhead line */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-orange-400 pointer-events-none z-10" style={{left:`calc(64px + ${(ph/total) * (100)}% - ${(ph/total) * 64}px)`}}>
            <div className="w-2 h-2 bg-orange-400 rounded-full -ml-[3px] -mt-0.5" />
          </div>
        </div>
      </div>
    </div></DropZone>
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
        {!subs ? <button onClick={load} disabled={ld} className="px-3 py-2 btn-primary disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1.5">{ld ? <Loader2 size={14} className="animate-spin" /> : <Subtitles size={14} />} Générer</button>
          : <><button onClick={()=>window.open(`/api/projects/${projectId}/subtitles?format=srt`)} className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs rounded-lg flex items-center gap-1"><Download size={12} /> SRT</button><button onClick={()=>window.open(`/api/projects/${projectId}/subtitles?format=vtt`)} className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs rounded-lg flex items-center gap-1"><Download size={12} /> VTT</button></>}
      </div>
    </div>
    {subs ? <div className="space-y-2">{subs.entries?.map((e:any)=><div key={e.index} className="flex items-start gap-3 p-3 bg-dark-900 rounded-lg border border-dark-700"><span className="text-[10px] text-slate-600 font-mono w-14 flex-shrink-0">{fmt(e.startTime)}</span>{e.character&&<span className="text-xs text-orange-400 font-medium w-20 flex-shrink-0">{e.character}</span>}<p className="text-sm text-slate-200 flex-1">{e.text}</p></div>)}{(!subs.entries?.length)&&<p className="text-sm text-slate-400 text-center p-6">Aucun dialogue détecté</p>}</div>
      : <div className="p-12 bg-dark-900 rounded-xl border border-dark-700 text-center"><Subtitles size={32} className="text-slate-700 mx-auto mb-3" /><p className="text-sm text-slate-400">Cliquez Générer pour extraire les sous-titres</p></div>}
  </div>)
}

// ═══ Voiceover ═══
function VO({ projectId, projectName }: { projectId: string; projectName?: string }) {
  const { locale } = useI18n()
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
        {!segs.length ? <button onClick={load} disabled={ld} className="px-3 py-2 btn-primary disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1.5">{ld ? <Loader2 size={14} className="animate-spin" /> : <Mic size={14} />} Préparer</button>
          : <button onClick={()=>speak(segs.map((s:any)=>s.character?`${s.character}: ${s.text}`:s.text).join('. '))} className="px-3 py-2 btn-primary text-white text-xs font-medium rounded-lg flex items-center gap-1.5">{sp ? <><Pause size={14} /> Stop</> : <><Volume2 size={14} /> Écouter</>}</button>}
      </div>
    </div>
    {segs.length>0 ? <div className="space-y-2">{segs.map((s:any)=><div key={s.index} className="flex items-start gap-3 p-3 bg-dark-900 rounded-lg border border-dark-700"><button onClick={()=>speak(s.text)} className="p-1.5 rounded bg-dark-800 hover:bg-dark-700 flex-shrink-0"><Volume2 size={12} className="text-slate-400" /></button><span className="text-[10px] text-slate-600 font-mono w-12 flex-shrink-0 pt-1">{fmt(s.startTime)}</span>{s.character&&<span className="text-xs text-orange-400 w-16 flex-shrink-0">{s.character}</span>}<p className="text-sm text-slate-200 flex-1">{s.text}</p></div>)}</div>
      : <div className="p-12 bg-dark-900 rounded-xl border border-dark-700 text-center"><Mic size={32} className="text-slate-700 mx-auto mb-3" /><p className="text-sm text-slate-400">{locale === "fr" ? "Cliquez Préparer pour les segments voix off" : "Click Prepare for voiceover segments"}</p></div>}
  </div>)
}

// ═══ Analysis Results ═══
function AR({ analysis, analysisId, userKeys, projectId }: { analysis: any; analysisId?: string | null; userKeys: Set<string>; projectId: string }) {
  const { t, locale } = useI18n()
  try {
    const scenes=analysis?.scenes||[]; const plans=analysis?.plans||[]; const tension=analysis?.tension; const chars=analysis?.characterBible||[]
    const comp=analysis?.compliance||{level:'OK',score:100,flags:[]}; const cont=analysis?.continuity||{score:100,alerts:[]}; const cost=analysis?.costTotal||0

    // Model distribution
    const modelCounts: Record<string, number> = {}
    plans.forEach((p: any) => { const m = p?.modelId || 'kling'; modelCounts[m] = (modelCounts[m] || 0) + 1 })
    const modelEntries = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])

    // Filters
    const [filterEmotion, setFilterEmotion] = useState<string|null>(null)
    const [filterModel, setFilterModel] = useState<string|null>(null)
    const [filterScene, setFilterScene] = useState<number|null>(null)
    const [expandedPlan, setExpandedPlan] = useState<number|null>(null)
    const [selectedPlans, setSelectedPlans] = useState<Set<number>>(new Set())
    const toggleSelect = (i: number) => { const s = new Set(selectedPlans); s.has(i) ? s.delete(i) : s.add(i); setSelectedPlans(s) }
    const selectAll = () => setSelectedPlans(new Set(filteredPlans.map((_: any, i: number) => plans.indexOf(_))))
    const selectNone = () => setSelectedPlans(new Set())
    const emotions = Array.from(new Set(plans.map((p: any) => (p.emotion || 'neutre').toLowerCase()))) as string[]
    const models = Array.from(new Set(plans.map((p: any) => (p.modelId || 'kling').toLowerCase()))) as string[]
    const sceneNums = (Array.from(new Set(plans.map((p: any) => p.sceneIndex ?? 0))) as number[]).sort((a, b) => a - b)
    const filteredPlans = plans.filter((p: any, i: number) => {
      if (filterEmotion && (p.emotion || 'neutre').toLowerCase() !== filterEmotion) return false
      if (filterModel && (p.modelId || 'kling').toLowerCase() !== filterModel) return false
      if (filterScene !== null && (p.sceneIndex ?? 0) !== filterScene) return false
      return true
    })

    return (<div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <St icon={Film} label={t.demo.shotsDetected.split(' ')[0]} value={scenes.length} /><St icon={Eye} label={t.demo.shotsDetected} value={plans.length} />
        <St icon={DollarSign} label={locale === 'fr' ? 'Coût' : 'Cost'} value={`$${cost.toFixed(2)}`} /><St icon={Shield} label={locale === 'fr' ? 'Continuité' : 'Continuity'} value={`${cont.score}%`} />
      </div>

      {/* Model Distribution */}
      {modelEntries.length > 0 && (
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-orange-400" />
            <span className="text-sm text-slate-200 font-medium">{locale === "fr" ? "Répartition modèles" : "Model Distribution"}</span>
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

      {/* Characters with Reference Images */}
      {chars.length>0 && <Sec icon={Users} title={locale === 'fr' ? 'Personnages' : 'Characters'} color="text-blue-400"><div className="space-y-3">{chars.map((c:any,i:number)=><CharacterReferenceCard key={i} character={{ name: c?.name || (locale === 'fr' ? 'Inconnu' : 'Unknown'), apparence: c?.apparence, description: c?.description, traits: c?.traits, arc: c?.arc }} projectId={projectId} />)}</div></Sec>}

      {/* Compliance */}
      <Sec icon={Shield} title={`Compliance — ${comp.level} (${comp.score}/100)`} color={comp.level==='OK'?'text-green-400':'text-yellow-400'}>
        {comp.flags?.length>0 ? comp.flags.map((f:any,i:number)=><div key={i} className="flex items-center gap-2 py-0.5"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${f?.severity==='critical'?'bg-red-600/20 text-red-300':f?.severity==='high'?'bg-red-500/20 text-red-400':'bg-yellow-500/20 text-yellow-400'}`}>{(f?.severity||'medium').toUpperCase()}</span><span className="text-xs text-slate-400">{f?.type||f?.message}</span></div>) : <p className="text-xs text-green-400">{locale === "fr" ? "Aucun flag" : "No flags"}</p>}
      </Sec>

      {/* Continuity */}
      {cont.alerts?.length>0 && <Sec icon={AlertTriangle} title={`Continuité — ${cont.score}/100`} color="text-yellow-400">{cont.alerts.map((a:any,i:number)=><div key={i} className="flex items-center gap-2 py-0.5"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${a?.severity==='critical'?'bg-red-600/20 text-red-300':a?.severity==='high'?'bg-red-500/20 text-red-400':'bg-yellow-500/20 text-yellow-400'}`}>{(a?.severity||'medium').toUpperCase()}</span><span className="text-xs text-slate-400">{a?.type}</span></div>)}</Sec>}

      {/* Plans */}
      {/* Filmstrip + Filters + Plans */}
      {plans.length > 0 && (
        <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-700">
            <Camera size={18} className="text-orange-400" />
            <span className="text-sm text-slate-200 font-medium">{locale === 'fr' ? 'Plans' : 'Shots'} ({filteredPlans.length}/{plans.length})</span>
          </div>

          {/* Filmstrip */}
          <div className="px-4 pt-3">
            <div data-tour="mini-timeline" className="flex gap-0.5 h-10 rounded-lg overflow-hidden bg-dark-800 overflow-x-auto scrollbar-hide">
              {plans.map((plan: any, i: number) => {
                const emotion = (plan.emotion || 'neutre').toLowerCase()
                const emotionColors: Record<string, string> = { tension: '#ef4444', tristesse: '#6366f1', joie: '#f59e0b', peur: '#8b5cf6', nostalgie: '#a78bfa', amour: '#ec4899', mystere: '#06b6d4', neutre: '#64748b', sadness: '#6366f1', joy: '#f59e0b', fear: '#8b5cf6', love: '#ec4899', mystery: '#06b6d4', determination: '#f97316', neutral: '#64748b' }
                const color = emotionColors[emotion] || '#64748b'
                const isFiltered = filteredPlans.includes(plan)
                return (
                  <button key={i} onClick={() => setExpandedPlan(expandedPlan === i ? null : i)}
                    className={`relative group h-full transition-all min-w-[24px] ${!isFiltered ? 'opacity-20' : ''} ${expandedPlan === i ? 'ring-2 ring-orange-500' : ''}`}
                    style={{ flex: 1, backgroundColor: color + '30' }}>
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-[7px] font-mono text-slate-400 font-bold">P{i+1}</span>
                      <span className="text-[6px] text-slate-600">{(plan.modelId || 'kling').slice(0,3)}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filters bar */}
          <div className="px-4 py-2 flex items-center gap-2 flex-wrap border-b border-dark-800">
            <span className="text-[10px] text-slate-600 uppercase tracking-wider">{locale === 'fr' ? 'Filtres' : 'Filters'}</span>
            {/* Emotion chips */}
            {emotions.map((e: string) => {
              const emotionColors: Record<string, string> = { tension: '#ef4444', tristesse: '#6366f1', joie: '#f59e0b', peur: '#8b5cf6', nostalgie: '#a78bfa', amour: '#ec4899', mystere: '#06b6d4', determination: '#f97316', neutre: '#64748b', sadness: '#6366f1', joy: '#f59e0b', fear: '#8b5cf6', love: '#ec4899', mystery: '#06b6d4', neutral: '#64748b' }
              const c = emotionColors[e] || '#64748b'
              return (
                <button key={e} onClick={() => setFilterEmotion(filterEmotion === e ? null : e)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] transition-all border ${filterEmotion === e ? 'border-current text-white' : 'border-dark-700 text-slate-500 hover:text-slate-300'}`}
                  style={filterEmotion === e ? { borderColor: c, color: c, backgroundColor: c + '20' } : {}}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c }} />
                  {e}
                </button>
              )
            })}
            <span className="text-dark-700">|</span>
            {/* Model chips */}
            {models.map((m: string) => (
              <button key={m} onClick={() => setFilterModel(filterModel === m ? null : m)}
                className={`px-2 py-0.5 rounded-full text-[10px] transition-all border ${filterModel === m ? 'border-orange-500 text-orange-400 bg-orange-500/10' : 'border-dark-700 text-slate-500 hover:text-slate-300'}`}>
                {m}
              </button>
            ))}
            <span className="text-dark-700">|</span>
            {/* Scene chips */}
            {sceneNums.map((s: number) => (
              <button key={s} onClick={() => setFilterScene(filterScene === s ? null : s)}
                className={`px-2 py-0.5 rounded-full text-[10px] transition-all border ${filterScene === s ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' : 'border-dark-700 text-slate-500 hover:text-slate-300'}`}>
                S{s+1}
              </button>
            ))}
            {/* Clear */}
            {(filterEmotion || filterModel || filterScene !== null) && (
              <button onClick={() => { setFilterEmotion(null); setFilterModel(null); setFilterScene(null) }}
                className="px-2 py-0.5 rounded-full text-[10px] text-red-400 border border-red-500/30 hover:bg-red-500/10">
                ✕ {locale === 'fr' ? 'Effacer' : 'Clear'}
              </button>
            )}
          </div>

          {/* Batch action bar */}
          {selectedPlans.size > 0 && (
            <div className="mx-3 mt-2 flex items-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <span className="text-xs text-orange-300 font-medium">{selectedPlans.size} {locale === 'fr' ? 'sélectionné(s)' : 'selected'}</span>
              <div className="flex-1" />
              <button onClick={() => {
                const allPrompts = Array.from(selectedPlans).map(i => {
                  const pl = plans[i]; return `[P${i+1}] ${pl?.modelId || 'kling'}\n${pl?.finalPrompt || pl?.basePrompt || ''}`
                }).join('\n\n---\n\n')
                navigator.clipboard.writeText(allPrompts)
              }} className="px-2.5 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-[10px] rounded-lg flex items-center gap-1">
                <Copy size={10} /> {locale === 'fr' ? 'Copier prompts' : 'Copy prompts'}
              </button>
              <button onClick={() => {
                Array.from(selectedPlans).forEach((i, idx) => {
                  const pl = plans[i]; const mid = (pl?.modelId || 'kling').toLowerCase()
                  const url = Object.entries(MODEL_URLS).find(([k]) => mid.includes(k))?.[1]?.url
                  if (url) setTimeout(() => window.open(url, '_blank'), idx * 300)
                })
              }} className="px-2.5 py-1 btn-primary text-[10px] rounded-lg flex items-center gap-1">
                <Zap size={10} /> {locale === 'fr' ? 'Ouvrir studios' : 'Open studios'}
              </button>
              <button onClick={selectNone} className="px-2 py-1 text-[10px] text-slate-400 hover:text-slate-200">✕</button>
            </div>
          )}

          {/* Plan cards */}
          <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
            {/* Select all / none */}
            <div className="flex items-center gap-2 mb-1">
              <button onClick={selectedPlans.size === filteredPlans.length ? selectNone : selectAll}
                className="text-[10px] text-slate-500 hover:text-slate-300">
                {selectedPlans.size === filteredPlans.length ? (locale === 'fr' ? '☑ Tout désélectionner' : '☑ Deselect all') : (locale === 'fr' ? '☐ Tout sélectionner' : '☐ Select all')}
              </button>
            </div>
            {filteredPlans.map((p: any, fi: number) => {
              const realIndex = plans.indexOf(p)
              return (
                <div key={realIndex} className="flex items-start gap-2">
                  <button onClick={() => toggleSelect(realIndex)} className={`mt-3 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${selectedPlans.has(realIndex) ? 'bg-orange-500 border-orange-500 text-white' : 'border-dark-600 hover:border-dark-500'}`}>
                    {selectedPlans.has(realIndex) && <Check size={10} />}
                  </button>
                  <div className="flex-1"><PC plan={p} index={realIndex} analysisId={analysisId} userKeys={userKeys} characters={chars} /></div>
                </div>
              )
            })}
            {filteredPlans.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">{locale === 'fr' ? 'Aucun plan ne correspond aux filtres' : 'No shots match filters'}</p>
            )}
          </div>
        </div>
      )}
    </div>)
  } catch { return <p className="text-red-400 text-sm text-center p-6">{locale === 'fr' ? "Erreur d'affichage" : 'Display error'}</p> }
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
function PC({ plan, index, analysisId, userKeys, characters }: { plan: any; index: number; analysisId?: string | null; userKeys: Set<string>; characters?: any[] }) {
  const { t, locale } = useI18n()
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState(false)
  const [editedPrompt, setEditedPrompt] = useState('')
  const [variantB, setVariantB] = useState('')
  const [showAB, setShowAB] = useState(false)
  const prompt = plan?.finalPrompt || plan?.basePrompt || ''; const mid=(plan?.modelId||'kling').toLowerCase(); const mc=getModelColor(mid)
  const studio = getModelStudio(mid); const canGenerate = userKeys.has(studio.provider)
  const [status, setStatus] = useState<string>('idle')
  const emotionColors: Record<string, string> = { tension: '#ef4444', tristesse: '#6366f1', joie: '#f59e0b', peur: '#8b5cf6', nostalgie: '#a78bfa', amour: '#ec4899', mystere: '#06b6d4', determination: '#f97316', neutre: '#64748b', sadness: '#6366f1', joy: '#f59e0b', fear: '#8b5cf6', love: '#ec4899', mystery: '#06b6d4', neutral: '#64748b' }
  const emotion = (plan?.emotion || 'neutre').toLowerCase()
  const eColor = emotionColors[emotion] || '#64748b'
  const gen = async () => { if(!analysisId||!canGenerate)return;setStatus('processing'); try{const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({analysisId,planIndex:index,sceneIndex:plan?.sceneIndex||0,modelId:plan?.modelId,prompt:editedPrompt||prompt,negativePrompt:plan?.negativePrompt})});setStatus(r.ok?'completed':'failed')}catch{setStatus('failed')} }
  return (<div className="card overflow-hidden hover:border-dark-600 transition-all">
    {/* Compact row — always visible */}
    <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 p-2.5 text-left hover:bg-white/[0.02] transition-colors">
      {/* Emotion stripe */}
      <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: eColor }} />
      {/* ID */}
      <span className="text-xs text-slate-300 font-bold font-mono w-8 flex-shrink-0">P{index+1}</span>
      <span className="text-[10px] text-slate-500 w-6 flex-shrink-0">S{(plan?.sceneIndex||0)+1}</span>
      {/* Model badge */}
      <ModelBadge modelId={mid} size="xs" />
      {/* Emotion chip */}
      <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ backgroundColor: eColor + '20', color: eColor }}>{emotion}</span>
      {/* Shot info */}
      <span className="text-[10px] text-slate-500 hidden sm:inline">{plan?.shotType}</span>
      {plan?.cameraMove && plan.cameraMove !== 'fixe' && <span className="text-[10px] text-cyan-400/60 hidden sm:inline">{plan.cameraMove}</span>}
      {/* Duration + cost */}
      <span className="text-[10px] text-slate-600 ml-auto">{(plan?.estimatedDuration||0).toFixed(1)}s</span>
      <span className="text-[10px] text-slate-600">${(plan?.estimatedCost||0).toFixed(3)}</span>
      {/* Actions in compact */}
      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
        <button onClick={()=>{navigator.clipboard.writeText(prompt);setCopied(true);setTimeout(()=>setCopied(false),2000)}} className="p-1 hover:bg-dark-700 rounded text-slate-500 hover:text-orange-400"><Copy size={12} /></button>
        {canGenerate && status==='idle' && <button onClick={gen} className="p-1 hover:bg-dark-700 rounded text-slate-500 hover:text-orange-400"><Zap size={12} /></button>}
        {status==='processing' && <Loader2 size={12} className="text-yellow-400 animate-spin" />}
        {status==='completed' && <Check size={12} className="text-green-400" />}
      </div>
      <ChevronDown size={14} className={`text-slate-600 transition-transform ${expanded ? 'rotate-180' : ''}`} />
    </button>

    {/* Expanded detail */}
    {expanded && (
      <div className="px-4 pb-4 pt-1 border-t border-dark-800 space-y-3">
        {/* SVG + Metadata grid */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <StoryboardSVG shotType={plan?.shotType} cameraMove={plan?.cameraMove} width={200} height={112} modelColor={mc} />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div className="bg-dark-800/50 rounded-lg px-3 py-2"><span className="text-[9px] text-slate-600 uppercase block">{locale === 'fr' ? 'Cadrage' : 'Shot'}</span><span className="text-xs text-slate-300">{plan?.shotType || '—'}</span></div>
            <div className="bg-dark-800/50 rounded-lg px-3 py-2"><span className="text-[9px] text-slate-600 uppercase block">{locale === 'fr' ? 'Caméra' : 'Camera'}</span><span className="text-xs text-slate-300">{plan?.cameraMove || 'fixe'}</span></div>
            <div className="bg-dark-800/50 rounded-lg px-3 py-2"><span className="text-[9px] text-slate-600 uppercase block">{locale === 'fr' ? 'Émotion' : 'Emotion'}</span><span className="text-xs" style={{ color: eColor }}>{emotion}</span></div>
            <div className="bg-dark-800/50 rounded-lg px-3 py-2"><span className="text-[9px] text-slate-600 uppercase block">{locale === 'fr' ? 'Modèle' : 'Model'}</span><span className="text-xs text-slate-300">{plan?.modelId || 'kling'}</span></div>
          </div>
        </div>

        {/* Prompt — inline editable */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Prompt</span>
            <button onClick={() => { if (!editingPrompt) setEditedPrompt(prompt); setEditingPrompt(!editingPrompt) }}
              className="text-[10px] text-orange-400 hover:text-orange-300">
              {editingPrompt ? (locale === 'fr' ? '✓ Fermer' : '✓ Close') : (locale === 'fr' ? '✎ Modifier' : '✎ Edit')}
            </button>
            {editingPrompt && editedPrompt !== prompt && <span className="text-[9px] text-yellow-400 bg-yellow-400/10 px-1.5 rounded">{locale === 'fr' ? 'modifié' : 'modified'}</span>}
          </div>
          {editingPrompt ? (
            <div className="space-y-2">
              {/* @ Autocomplete reference system */}
              {(() => {
                const charNames = (characters || []).map((c: any) => typeof c === 'string' ? c : c?.name || '?')
                const allRefs = [
                  ...charNames.map((name: string) => ({ label: name, type: 'char', icon: '👤', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' })),
                  { label: 'cinematic lighting', type: 'style', icon: '✨', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
                  { label: 'golden hour', type: 'style', icon: '✨', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
                  { label: 'shallow depth of field', type: 'style', icon: '✨', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
                  { label: 'anamorphic lens flare', type: 'style', icon: '✨', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
                  { label: 'slow motion', type: 'motion', icon: '🎬', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
                  { label: 'rack focus', type: 'motion', icon: '🎬', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
                  { label: 'dolly zoom', type: 'motion', icon: '🎬', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
                  { label: 'handheld', type: 'motion', icon: '🎬', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
                  { label: 'film grain', type: 'style', icon: '🎨', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
                  { label: 'teal and orange', type: 'style', icon: '🎨', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
                  { label: 'chiaroscuro', type: 'style', icon: '🎨', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
                ]
                // Check if prompt ends with @ to show autocomplete
                const atMatch = editedPrompt.match(/@(\S*)$/)
                const query = atMatch ? atMatch[1].toLowerCase() : ''
                const showDropdown = !!atMatch
                const filtered = showDropdown ? allRefs.filter(r => r.label.toLowerCase().includes(query)) : []
                const insertRef = (label: string) => {
                  setEditedPrompt(prev => prev.replace(/@\S*$/, label + ', '))
                }
                return (
                  <div className="relative">
                    {/* Quick chips row */}
                    <div className="flex items-center gap-1 flex-wrap mb-2">
                      <span className="text-[9px] text-slate-600 mr-0.5">@ Insert:</span>
                      {allRefs.slice(0, 6).map((ref, ri) => (
                        <button key={ri} onClick={() => setEditedPrompt(prev => prev + (prev.endsWith(' ') || !prev ? '' : ', ') + ref.label)}
                          className={`px-1.5 py-0.5 rounded text-[9px] border transition-all hover:opacity-80 ${ref.color}`}>
                          {ref.icon} {ref.label}
                        </button>
                      ))}
                      <span className="text-[8px] text-slate-600 ml-1">{locale === 'fr' ? 'ou tapez @...' : 'or type @...'}</span>
                    </div>
                    {/* Fuzzy autocomplete dropdown */}
                    {showDropdown && filtered.length > 0 && (
                      <div className="absolute bottom-full left-0 w-64 mb-1 bg-dark-800 border border-dark-600 rounded-xl shadow-xl shadow-black/40 overflow-hidden z-20 animate-fade-in">
                        <div className="px-3 py-1.5 border-b border-dark-700">
                          <span className="text-[9px] text-orange-400 font-semibold">@ {query || '...'}</span>
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                          {filtered.map((ref, ri) => (
                            <button key={ri} onClick={() => insertRef(ref.label)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-dark-700 text-left transition-colors">
                              <span className="text-sm">{ref.icon}</span>
                              <span className="text-[11px] text-slate-200 flex-1">{ref.label}</span>
                              <span className={`text-[8px] px-1 rounded ${ref.color}`}>{ref.type}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
              <textarea value={editedPrompt} onChange={e => setEditedPrompt(e.target.value)}
                className="w-full p-2.5 bg-dark-800 border border-orange-500/30 rounded-lg text-[11px] text-slate-200 font-mono leading-relaxed resize-none focus:outline-none focus:border-orange-500/50"
                rows={4} />
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono bg-dark-800/50 rounded-lg p-2.5">{prompt || '—'}</p>
          )}
        </div>

        {/* Negative prompt */}
        {plan?.negativePrompt && (
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Negative prompt</span>
            <p className="text-[10px] text-red-400/60 font-mono mt-1">{plan.negativePrompt}</p>
          </div>
        )}

        {/* AI Enrichment */}
        {plan?.aiEnrichment && (
          <div className="bg-purple-500/5 border border-purple-500/15 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles size={12} className="text-purple-400" />
              <span className="text-[10px] text-purple-300 uppercase tracking-wider">AI Enrichment</span>
            </div>
            <p className="text-[11px] text-purple-200/70 leading-relaxed">{typeof plan.aiEnrichment === 'string' ? plan.aiEnrichment : JSON.stringify(plan.aiEnrichment)}</p>
          </div>
        )}

        {/* Actions bar */}
        <div className="flex items-center gap-2 pt-1">
          <button onClick={()=>{navigator.clipboard.writeText(editedPrompt||prompt);setCopied(true);setTimeout(()=>setCopied(false),2000)}}
            className="px-3 py-1.5 bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 text-[10px] rounded-lg flex items-center gap-1.5 border border-orange-500/20">
            {copied?<><Check size={10} />{t.demo.copied}</>:<><Copy size={10} />{t.demo.copyPrompt}</>}
          </button>
          {canGenerate && status==='idle' && <button onClick={gen} className="px-3 py-1.5 btn-primary text-white text-[10px] rounded-lg flex items-center gap-1.5"><Zap size={10} /> {t.demo.generateWith}</button>}
          {canGenerate && status==='processing' && <span className="flex items-center gap-1.5 text-yellow-400 text-[10px]"><Loader2 size={12} className="animate-spin" />{locale === 'fr' ? 'Génération...' : 'Generating...'}</span>}
          {canGenerate && status==='completed' && <span className="flex items-center gap-1.5 text-green-400 text-[10px]"><Check size={12} />{locale === 'fr' ? 'Terminé' : 'Done'}</span>}
          {canGenerate && status==='failed' && <button onClick={gen} className="px-3 py-1.5 bg-red-500/10 text-red-400 text-[10px] rounded-lg flex items-center gap-1.5 border border-red-500/20"><AlertTriangle size={10} /> Retry</button>}
          {!canGenerate && <a href={studio.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-slate-300 text-[10px] rounded-lg flex items-center gap-1.5 border border-dark-600"><ExternalLink size={9} /> {studio.name}</a>}
          <CompareButton plan={plan} />
        </div>
      </div>
    )}
  </div>)
}

// ═══ Render Panel — Assembly Player V8 ═══
function RenderPanel({ analysis, analysisId, projectName }: { analysis: any; analysisId: string | null; projectName?: string }) {
  const { t } = useI18n()
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
          <span className="text-sm font-medium text-slate-200">{projectName || t.project.tabs.render}</span>
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
                {current?.status === 'pending' ? t.project.render.pending : t.project.render.generating}
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
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 flex items-center justify-center shadow-xl shadow-orange-500/25 transition-transform hover:scale-110">
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
          <button className="px-3 py-1.5 btn-primary text-white text-[10px] font-medium rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
