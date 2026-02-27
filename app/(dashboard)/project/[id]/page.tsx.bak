'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Play, Loader2, Save, Brain, AlertTriangle, ChevronDown, ChevronRight,
  Film, Eye, DollarSign, Shield, Users, TrendingUp, Camera, Zap,
  Subtitles, Mic, Clock, Download, Volume2, Pause, SkipForward,
  Lightbulb, Image, Music, Search, ExternalLink, Sparkles, MessageSquare
} from 'lucide-react'

type Tab = 'script' | 'analyse' | 'timeline' | 'copilot' | 'media' | 'subtitles' | 'voiceover'

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
    if (!scriptText.trim()) { setError('Collez un script avant de lancer l\'analyse'); return }
    setError(''); setAnalyzing(true)
    await fetch(`/api/projects/${projectId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ script_text: scriptText }) })
    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ style_preset: stylePreset }) })
      const data = await res.json()
      if (res.ok && data.result) { setAnalysis(data.result); setAnalysisId(data.analysis_id); setTab('analyse') }
      else setError(data.error || 'Erreur analyse')
    } catch { setError('Erreur réseau') } finally { setAnalyzing(false) }
  }

  const loadDemo = async () => {
    const { DEMO_SCENARIO } = await import('@/lib/data/demo-scenario')
    setScriptText(DEMO_SCENARIO.script)
    setStylePreset(DEMO_SCENARIO.style_preset)
    // Save to project
    await fetch(`/api/projects/${projectId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ script_text: DEMO_SCENARIO.script, name: DEMO_SCENARIO.name }) })
    setProject((p: any) => ({ ...p, name: DEMO_SCENARIO.name, script_text: DEMO_SCENARIO.script }))
  }

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 size={32} className="text-orange-500 animate-spin" /></div>

  const tabs: { id: Tab; label: string; icon: any; disabled?: boolean }[] = [
    { id: 'script', label: 'Script', icon: Film },
    { id: 'analyse', label: 'Analyse', icon: Brain, disabled: !analysis },
    { id: 'copilot', label: 'Copilot IA', icon: Sparkles, disabled: !analysis },
    { id: 'timeline', label: 'Timeline', icon: Clock, disabled: !analysis },
    { id: 'media', label: 'Médias', icon: Image, disabled: !analysis },
    { id: 'subtitles', label: 'Sous-titres', icon: Subtitles, disabled: !analysis },
    { id: 'voiceover', label: 'Voix off', icon: Mic, disabled: !analysis },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={20} className="text-slate-400" /></button>
          <h1 className="text-xl font-bold text-slate-50">{project?.name || 'Projet'}</h1>
        </div>
        {analysis && <div className="flex items-center gap-2 text-xs text-slate-500"><span>{analysis.scenes?.length || 0} scènes</span><span>•</span><span>{analysis.plans?.length || 0} plans</span><span>•</span><span>${(analysis.costTotal || 0).toFixed(2)}</span></div>}
      </div>

      <div className="flex gap-1 mb-4 bg-dark-900 rounded-lg p-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => !t.disabled && setTab(t.id)} disabled={t.disabled}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${tab === t.id ? 'bg-orange-600 text-white' : t.disabled ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-slate-200'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'script' && <ScriptTab scriptText={scriptText} setScriptText={setScriptText} stylePreset={stylePreset} setStylePreset={setStylePreset} saving={saving} analyzing={analyzing} error={error} handleSave={handleSave} handleAnalyze={handleAnalyze} loadDemo={loadDemo} />}
      {tab === 'analyse' && analysis && <AnalysisResults analysis={analysis} analysisId={analysisId} />}
      {tab === 'copilot' && analysis && <CopilotTab projectId={projectId} />}
      {tab === 'timeline' && analysis && <TimelineView analysis={analysis} />}
      {tab === 'media' && analysis && <MediaBankTab analysis={analysis} projectId={projectId} />}
      {tab === 'subtitles' && analysis && <SubtitlesView projectId={projectId} />}
      {tab === 'voiceover' && analysis && <VoiceoverView projectId={projectId} />}
    </div>
  )
}

// ═══ SCRIPT TAB ═══
function ScriptTab({ scriptText, setScriptText, stylePreset, setStylePreset, saving, analyzing, error, handleSave, handleAnalyze, loadDemo }: any) {
  return (
    <div>
      <div className="rounded-xl border border-dark-700" style={{ background: 'rgb(15,15,20)' }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgb(40,40,50)' }}>
          <span className="text-sm text-slate-300 font-medium">Script</span>
          <div className="flex items-center gap-2">
            <button onClick={loadDemo} className="px-2 py-1 bg-orange-500/10 text-orange-400 text-xs rounded hover:bg-orange-500/20 transition-colors">Charger la démo</button>
            <select value={stylePreset} onChange={(e: any) => setStylePreset(e.target.value)} className="px-2 py-1 bg-dark-800 border border-dark-700 rounded text-xs text-slate-300">
              <option value="cinematique">Cinématique</option><option value="documentaire">Documentaire</option><option value="noir">Film Noir</option><option value="onirique">Onirique</option>
            </select>
            <button onClick={handleSave} disabled={saving} className="p-1.5 rounded hover:bg-white/5">
              {saving ? <Loader2 size={16} className="animate-spin text-slate-400" /> : <Save size={16} className="text-slate-400" />}
            </button>
          </div>
        </div>
        <textarea value={scriptText} onChange={(e: any) => setScriptText(e.target.value)} placeholder={'Collez votre script ici...\n\nINT. APPARTEMENT - JOUR\n\nMARC\nJe ne sais plus quoi faire...'} rows={16} className="block w-full p-4 bg-transparent text-slate-200 text-sm leading-relaxed focus:outline-none resize-none" spellCheck={false} />
      </div>
      {error && <div className="flex items-center gap-2 px-3 py-2 mt-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400"><AlertTriangle size={16} /> {error}</div>}
      <button onClick={handleAnalyze} disabled={analyzing || !scriptText.trim()} className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors">
        {analyzing ? <><Loader2 size={20} className="animate-spin" /> Analyse en cours...</> : <><Play size={20} /> Lancer l&apos;analyse (13 moteurs)</>}
      </button>
    </div>
  )
}

// ═══ COPILOT IA TAB ═══
function CopilotTab({ projectId }: { projectId: string }) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/copilot`)
      if (res.ok) { const d = await res.json(); setSuggestions(d.suggestions || []); setLoaded(true) }
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { if (!loaded) load() }, [])

  const typeColors: Record<string, string> = {
    reference: 'border-blue-500/30 bg-blue-500/5', technique: 'border-purple-500/30 bg-purple-500/5',
    music: 'border-pink-500/30 bg-pink-500/5', pacing: 'border-yellow-500/30 bg-yellow-500/5',
    visual: 'border-green-500/30 bg-green-500/5', improvement: 'border-orange-500/30 bg-orange-500/5',
  }
  const typeLabels: Record<string, string> = {
    reference: 'Référence cinéma', technique: 'Technique', music: 'Musique',
    pacing: 'Rythme', visual: 'Visuel', improvement: 'Amélioration',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-slate-100 flex items-center gap-2"><Sparkles size={16} className="text-orange-500" /> Copilot IA — Votre directeur artistique</h3>
          <p className="text-xs text-slate-500 mt-0.5">Suggestions créatives, références cinéma, idées de mise en scène</p>
        </div>
        <button onClick={load} disabled={loading} className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-slate-300 text-xs rounded-lg flex items-center gap-1.5">
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Rafraîchir
        </button>
      </div>

      {loading && !loaded && <div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-orange-500" /><span className="ml-2 text-sm text-slate-400">L&apos;IA analyse votre travail...</span></div>}

      {suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((s: any) => (
            <div key={s.id} className={`p-4 rounded-xl border ${typeColors[s.type] || 'border-dark-700 bg-dark-900'}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl">{s.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-100">{s.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">{typeLabels[s.type] || s.type}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{s.message}</p>
                  {s.reference && <p className="text-xs text-orange-400 mt-2 flex items-center gap-1"><Film size={10} /> {s.reference}</p>}
                </div>
                <div className="flex-shrink-0"><div className="w-8 h-1 rounded-full bg-dark-700"><div className="h-full rounded-full bg-orange-500" style={{ width: `${s.confidence * 100}%` }} /></div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loaded && suggestions.length === 0 && (
        <div className="p-8 bg-dark-900 rounded-xl border border-dark-700 text-center">
          <Sparkles size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Aucune suggestion pour le moment</p>
          <p className="text-xs text-slate-500 mt-1">Enrichissez votre script pour obtenir des recommandations</p>
        </div>
      )}
    </div>
  )
}

// ═══ MEDIA BANK TAB ═══
function MediaBankTab({ analysis, projectId }: { analysis: any; projectId: string }) {
  const [mediaTab, setMediaTab] = useState<'stock' | 'music' | 'imageai'>('stock')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')

  const searchMedia = async (q?: string) => {
    const searchQ = q || query
    if (!searchQ.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`/api/media?q=${encodeURIComponent(searchQ)}&type=${mediaType}`)
      if (res.ok) { const d = await res.json(); setResults(d.results || []) }
      else { const d = await res.json(); alert(d.error || 'Erreur') }
    } catch {} finally { setSearching(false) }
  }

  const searchFromScene = (heading: string) => {
    const loc = heading.replace(/^(INT\.|EXT\.)\s*/i, '').replace(/\s*[-–]\s*(JOUR|NUIT|MATIN|SOIR).*/i, '').trim()
    setQuery(loc); searchMedia(loc)
  }

  const musicProviders = [
    { name: 'Suno v4', type: '🤖 Génératif', url: 'https://suno.com', desc: 'Créez des morceaux originaux depuis un prompt textuel' },
    { name: 'Udio', type: '🤖 Génératif', url: 'https://udio.com', desc: 'Génération musicale avec contrôle fin du style' },
    { name: 'Epidemic Sound', type: '📚 Bibliothèque', url: 'https://epidemicsound.com', desc: '40 000+ morceaux libres de droits pour la production' },
    { name: 'Artlist', type: '📚 Bibliothèque', url: 'https://artlist.io', desc: 'Musique + SFX curatés pour la vidéo professionnelle' },
    { name: 'Mubert', type: '🤖 Génératif', url: 'https://mubert.com', desc: 'Musique générative en temps réel par IA' },
  ]

  const imageAI = [
    { name: 'DALL-E 3', cost: '$0.04/img', desc: 'OpenAI — storyboards et concept art', color: '#10a37f' },
    { name: 'Midjourney v6.1', cost: '$0.05/img', desc: 'Direction artistique cinématique premium', color: '#5865f2' },
    { name: 'Flux Pro 1.1', cost: '$0.03/img', desc: 'Black Forest Labs — photoréalisme rapide', color: '#ff6b35' },
    { name: 'Stable Diffusion XL', cost: '$0.01/img', desc: 'Open source — ControlNet, LoRA, contrôle total', color: '#a855f7' },
  ]

  return (
    <div>
      <div className="flex gap-1 mb-4 bg-dark-900 rounded-lg p-1">
        {[
          { id: 'stock' as const, label: 'Banque Médias', icon: Image },
          { id: 'music' as const, label: 'Musique', icon: Music },
          { id: 'imageai' as const, label: 'Images IA', icon: Sparkles },
        ].map(t => (
          <button key={t.id} onClick={() => setMediaTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${mediaTab === t.id ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* STOCK MEDIA */}
      {mediaTab === 'stock' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchMedia()}
                placeholder="Rechercher images et vidéos..." className="w-full h-9 pl-9 pr-3 bg-dark-900 border border-dark-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-orange-500/50" />
            </div>
            <select value={mediaType} onChange={(e: any) => setMediaType(e.target.value)} className="h-9 px-2 bg-dark-900 border border-dark-700 rounded-lg text-xs text-slate-300">
              <option value="image">📷 Images</option><option value="video">🎥 Vidéos</option>
            </select>
            <button onClick={() => searchMedia()} disabled={searching} className="h-9 px-4 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5">
              {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Chercher
            </button>
          </div>

          {/* Quick search from scenes */}
          {analysis?.scenes?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="text-[10px] text-slate-500 py-1">Scènes :</span>
              {analysis.scenes.map((sc: any, i: number) => (
                <button key={i} onClick={() => searchFromScene(sc.heading || '')}
                  className="px-2 py-1 bg-dark-800 hover:bg-dark-700 text-xs text-slate-300 rounded border border-dark-700 transition-colors">
                  S{i + 1}: {(sc.heading || '').slice(0, 25)}
                </button>
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {results.map((r: any) => (
                <div key={r.id} className="group relative rounded-lg overflow-hidden border border-dark-700 bg-dark-900 aspect-video">
                  <img src={r.thumbnail || r.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] text-white">{r.photographer} • Pexels</span>
                  </div>
                  {r.duration && <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[9px] text-white">{r.duration}s</div>}
                </div>
              ))}
            </div>
          )}

          {results.length === 0 && !searching && (
            <div className="p-8 bg-dark-900 rounded-xl border border-dark-700 text-center">
              <Image size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Recherchez des images et vidéos de référence pour vos scènes</p>
              <p className="text-xs text-slate-500 mt-1">Powered by Pexels — ajoutez votre clé API dans Réglages</p>
            </div>
          )}
        </div>
      )}

      {/* MUSIC */}
      {mediaTab === 'music' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 mb-2">Trouvez ou générez la bande-son parfaite pour votre film</p>
          {musicProviders.map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-dark-900 rounded-xl border border-dark-700 hover:border-dark-600 transition-colors group">
              <span className="text-xl">{p.type.split(' ')[0]}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-100">{p.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">{p.type.split(' ')[1]}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{p.desc}</p>
              </div>
              <ExternalLink size={14} className="text-slate-600 group-hover:text-orange-400 transition-colors" />
            </a>
          ))}
        </div>
      )}

      {/* IMAGE AI */}
      {mediaTab === 'imageai' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 mb-2">Générez des storyboards et concept art avec l&apos;IA</p>
          {imageAI.map((p) => (
            <div key={p.name} className="flex items-center gap-4 p-4 bg-dark-900 rounded-xl border border-dark-700">
              <div className="w-3 h-8 rounded-full" style={{ background: p.color }} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-100">{p.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400">{p.cost}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{p.desc}</p>
              </div>
            </div>
          ))}
          <div className="p-3 bg-dark-900 rounded-lg border border-dark-700 text-xs text-slate-500">
            💡 Les prompts de storyboard sont générés automatiquement par MISEN dans l&apos;onglet Analyse. Copiez-les pour les utiliser avec ces outils.
          </div>
        </div>
      )}
    </div>
  )
}

// ═══ TIMELINE ═══
function TimelineView({ analysis }: { analysis: any }) {
  const plans = analysis?.plans || []
  const totalDuration = plans.reduce((s: number, p: any) => s + (p.estimatedDuration || 4), 0)
  const [playhead, setPlayhead] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    const iv = setInterval(() => setPlayhead(p => { if (p >= totalDuration) { setPlaying(false); return 0 }; return p + 0.1 }), 100)
    return () => clearInterval(iv)
  }, [playing, totalDuration])

  let acc = 0
  const pos = plans.map((p: any) => { const s = acc; const d = p.estimatedDuration || 4; acc += d; return { ...p, start: s, duration: d, end: s + d } })
  const colors = ['#f97316','#22d3ee','#a78bfa','#34d399','#f472b6','#fbbf24','#60a5fa']

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 bg-dark-900 rounded-xl p-3 border border-dark-700">
        <button onClick={() => { setPlayhead(0); setPlaying(false) }} className="p-2 rounded-lg hover:bg-white/5"><SkipForward size={16} className="text-slate-400 rotate-180" /></button>
        <button onClick={() => setPlaying(!playing)} className="p-2 bg-orange-600 rounded-lg hover:bg-orange-500">{playing ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white" />}</button>
        <span className="text-xs text-slate-400 font-mono">{fmt(playhead)} / {fmt(totalDuration)}</span>
        <div className="flex-1 h-1 bg-dark-700 rounded-full mx-2 cursor-pointer" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setPlayhead(((e.clientX - r.left) / r.width) * totalDuration) }}>
          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(playhead / totalDuration) * 100}%` }} />
        </div>
      </div>
      <div className="bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
        <div className="flex items-center h-7 border-b border-dark-700 px-2 relative">
          {Array.from({ length: Math.ceil(totalDuration) }, (_, i) => <div key={i} className="absolute text-[9px] text-slate-600" style={{ left: `${(i / totalDuration) * 100}%` }}>{i}s</div>)}
        </div>
        <div className="px-2 py-2">
          <div className="flex items-center gap-1 mb-1"><Film size={12} className="text-slate-500" /><span className="text-[10px] text-slate-500 font-medium">Scènes</span></div>
          <div className="relative h-7 bg-dark-800 rounded">
            {(analysis.scenes || []).map((sc: any, i: number) => {
              const sp = pos.filter((p: any) => p.sceneIndex === i); if (!sp.length) return null
              return <div key={i} className="absolute top-0 h-full rounded flex items-center px-1" style={{ left: `${(sp[0].start / totalDuration) * 100}%`, width: `${((sp[sp.length-1].end - sp[0].start) / totalDuration) * 100}%`, background: `${colors[i % colors.length]}20`, borderLeft: `2px solid ${colors[i % colors.length]}` }}>
                <span className="text-[8px] text-slate-300 truncate">S{i+1}</span></div>
            })}
          </div>
        </div>
        <div className="px-2 py-2">
          <div className="flex items-center gap-1 mb-1"><Camera size={12} className="text-slate-500" /><span className="text-[10px] text-slate-500 font-medium">Plans</span></div>
          <div className="relative h-10 bg-dark-800 rounded">
            {pos.map((p: any, i: number) => (
              <div key={i} className="absolute top-0 h-full border-r border-dark-700 flex flex-col justify-center px-0.5 hover:brightness-125 cursor-pointer group" style={{ left: `${(p.start / totalDuration) * 100}%`, width: `${(p.duration / totalDuration) * 100}%`, background: `${colors[p.sceneIndex % colors.length]}30` }}>
                <span className="text-[7px] text-slate-300 font-medium truncate">P{i+1}</span>
                <span className="text-[6px] text-slate-500 truncate">{p.shotType || ''}</span>
              </div>
            ))}
            <div className="absolute top-0 h-full w-0.5 bg-orange-500 z-10 pointer-events-none" style={{ left: `${(playhead / totalDuration) * 100}%` }} />
          </div>
        </div>
        <div className="px-2 py-1.5 border-t border-dark-700 flex items-center gap-1"><Volume2 size={10} className="text-slate-600" /><span className="text-[9px] text-slate-600">Audio</span></div>
        <div className="px-2 py-1.5 border-t border-dark-700 flex items-center gap-1"><Subtitles size={10} className="text-slate-600" /><span className="text-[9px] text-slate-600">Sous-titres</span></div>
      </div>
      <div className="mt-3 space-y-1.5">
        {pos.map((p: any, i: number) => (
          <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${playhead >= p.start && playhead < p.end ? 'bg-orange-500/10 border-orange-500/30' : 'bg-dark-900 border-dark-700'}`}>
            <div className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold" style={{ background: `${colors[p.sceneIndex % colors.length]}30`, color: colors[p.sceneIndex % colors.length] }}>{i+1}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><span className="text-xs text-slate-200 font-medium">{p.shotType || 'PM'}</span><span className="text-[10px] text-slate-500">{p.cameraMove || 'fixe'}</span><span className="text-[10px] text-slate-500">{p.duration.toFixed(1)}s</span><span className="text-[10px] text-orange-400">{p.modelId}</span></div>
              <p className="text-[10px] text-slate-500 truncate">{(p.finalPrompt || p.basePrompt || '').slice(0, 80)}</p>
            </div>
            <span className="text-[10px] text-slate-600 font-mono">{fmt(p.start)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══ SUBTITLES ═══
function SubtitlesView({ projectId }: { projectId: string }) {
  const [subs, setSubs] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const load = async () => { setLoading(true); try { const r = await fetch(`/api/projects/${projectId}/subtitles?format=json`); if (r.ok) setSubs(await r.json()) } catch {} finally { setLoading(false) } }
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="text-sm font-medium text-slate-100">Sous-titres</h3><p className="text-xs text-slate-500">Générés depuis les dialogues</p></div>
        <div className="flex items-center gap-2">
          {!subs && <button onClick={load} disabled={loading} className="px-3 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1.5">{loading ? <Loader2 size={14} className="animate-spin" /> : <Subtitles size={14} />} Générer</button>}
          {subs && <><button onClick={() => window.open(`/api/projects/${projectId}/subtitles?format=srt`)} className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs rounded-lg flex items-center gap-1"><Download size={12} /> SRT</button><button onClick={() => window.open(`/api/projects/${projectId}/subtitles?format=vtt`)} className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs rounded-lg flex items-center gap-1"><Download size={12} /> VTT</button></>}
        </div>
      </div>
      {subs ? <div className="space-y-2">{subs.entries?.map((e: any) => <div key={e.index} className="flex items-start gap-3 p-3 bg-dark-900 rounded-lg border border-dark-700"><span className="text-[10px] text-slate-600 font-mono w-14 flex-shrink-0">{fmt(e.startTime)}</span>{e.character && <span className="text-xs text-orange-400 font-medium w-20 flex-shrink-0">{e.character}</span>}<p className="text-sm text-slate-200 flex-1">{e.text}</p></div>)}{(!subs.entries?.length) && <p className="text-sm text-slate-400 text-center p-6">Aucun dialogue détecté</p>}</div>
        : <div className="p-12 bg-dark-900 rounded-xl border border-dark-700 text-center"><Subtitles size={32} className="text-slate-700 mx-auto mb-3" /><p className="text-sm text-slate-400">Cliquez Générer pour extraire les sous-titres</p></div>}
    </div>
  )
}

// ═══ VOICEOVER ═══
function VoiceoverView({ projectId }: { projectId: string }) {
  const [segs, setSegs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [provider, setProvider] = useState('browser')

  const load = async () => { setLoading(true); try { const r = await fetch(`/api/projects/${projectId}/voiceover`); if (r.ok) { const d = await r.json(); setSegs(d.segments || []) } } catch {} finally { setLoading(false) } }
  const speak = (text: string) => {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return }
    const u = new SpeechSynthesisUtterance(text); u.lang = 'fr-FR'; u.rate = 0.9; u.onend = () => setSpeaking(false); setSpeaking(true); window.speechSynthesis.speak(u)
  }
  const speakAll = () => { const t = segs.map(s => s.character ? `${s.character}: ${s.text}` : s.text).join('. '); speak(t) }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="text-sm font-medium text-slate-100">Voix off</h3><p className="text-xs text-slate-500">Narration et dialogues TTS</p></div>
        <div className="flex items-center gap-2">
          <select value={provider} onChange={(e: any) => setProvider(e.target.value)} className="px-2 py-1.5 bg-dark-800 border border-dark-700 rounded text-xs text-slate-300">
            <option value="browser">Navigateur (gratuit)</option><option value="openai">OpenAI TTS</option><option value="elevenlabs">ElevenLabs</option>
          </select>
          {!segs.length ? <button onClick={load} disabled={loading} className="px-3 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1.5">{loading ? <Loader2 size={14} className="animate-spin" /> : <Mic size={14} />} Préparer</button>
            : <button onClick={speakAll} className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5">{speaking ? <><Pause size={14} /> Stop</> : <><Volume2 size={14} /> Écouter tout</>}</button>}
        </div>
      </div>
      {segs.length > 0 ? <div className="space-y-2">{segs.map((s: any) => <div key={s.index} className="flex items-start gap-3 p-3 bg-dark-900 rounded-lg border border-dark-700"><button onClick={() => speak(s.text)} className="p-1.5 rounded bg-dark-800 hover:bg-dark-700 flex-shrink-0"><Volume2 size={12} className="text-slate-400" /></button><span className="text-[10px] text-slate-600 font-mono w-12 flex-shrink-0 pt-1">{fmt(s.startTime)}</span>{s.character && <span className="text-xs text-orange-400 w-16 flex-shrink-0">{s.character}</span>}<p className="text-sm text-slate-200 flex-1">{s.text}</p></div>)}</div>
        : <div className="p-12 bg-dark-900 rounded-xl border border-dark-700 text-center"><Mic size={32} className="text-slate-700 mx-auto mb-3" /><p className="text-sm text-slate-400">Cliquez Préparer pour analyser les segments voix off</p></div>}
    </div>
  )
}

// ═══ ANALYSIS RESULTS ═══
function AnalysisResults({ analysis, analysisId }: { analysis: any; analysisId?: string | null }) {
  try {
    const { scenes=[], plans=[], tension, characterBible=[], compliance={ level:'OK', score:100, flags:[] }, continuity={ score:100, alerts:[] }, costTotal=0, costByModel={} } = analysis || {}
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <St icon={Film} label="Scènes" value={scenes.length} /><St icon={Eye} label="Plans" value={plans.length} />
          <St icon={DollarSign} label="Coût" value={`$${costTotal.toFixed(2)}`} /><St icon={Shield} label="Continuité" value={`${continuity.score}%`} />
        </div>
        {tension?.curve?.length > 0 && <Sec icon={TrendingUp} title="Courbe de tension" color="text-red-400">
          <div className="flex items-end gap-1 h-16">{tension.curve.map((t: any, i: number) => <div key={i} className="flex-1 flex flex-col items-center gap-0.5"><div className="w-full bg-red-500/60 rounded-t" style={{ height: `${(t?.tension || 0) * 0.6}px` }} /><span className="text-[9px] text-slate-600">{i+1}</span></div>)}</div>
        </Sec>}
        {characterBible.length > 0 && <Sec icon={Users} title="Personnages" color="text-blue-400">
          {characterBible.map((c: any, i: number) => <div key={i} className="flex items-center gap-3 py-1"><span className="w-24 text-sm text-slate-200 font-medium truncate">{c?.name}</span><span className="text-xs text-slate-500 flex-1 truncate">{c?.apparence || ''}</span></div>)}
        </Sec>}
        {plans.length > 0 && <Sec icon={Camera} title={`Plans (${plans.length})`} color="text-orange-400" open={false}>
          <div className="space-y-2 max-h-96 overflow-y-auto">{plans.slice(0, 20).map((p: any, i: number) => <PC key={i} plan={p} index={i} analysisId={analysisId} />)}</div>
        </Sec>}
      </div>
    )
  } catch { return <p className="text-red-400 text-sm text-center p-6">Erreur d&apos;affichage</p> }
}

// ═══ SHARED ═══
function fmt(s: number) { return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` }

function PC({ plan, index, analysisId }: { plan: any; index: number; analysisId?: string | null }) {
  const [status, setStatus] = useState<'idle'|'processing'|'completed'|'failed'>('idle')
  const [err, setErr] = useState('')
  const gen = async () => {
    if (!analysisId) return; setStatus('processing'); setErr('')
    try {
      const r = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ analysisId, planIndex: index, sceneIndex: plan?.sceneIndex || 0, modelId: plan?.modelId, prompt: plan?.finalPrompt || plan?.basePrompt || '', negativePrompt: plan?.negativePrompt }) })
      const d = await r.json(); if (r.ok) setStatus(d.status || 'processing'); else { setStatus('failed'); setErr(d.error || 'Erreur') }
    } catch { setStatus('failed'); setErr('Erreur réseau') }
  }
  return (
    <div className="bg-dark-800 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-300 font-medium">Plan {index+1} — S{(plan?.sceneIndex||0)+1}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-orange-400">{plan?.modelId}</span>
          {status === 'idle' && <button onClick={gen} className="px-2 py-0.5 bg-orange-600 hover:bg-orange-500 text-white text-[10px] rounded flex items-center gap-1"><Zap size={10} /> Générer</button>}
          {status === 'processing' && <span className="text-[10px] text-yellow-400 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> En cours</span>}
          {status === 'completed' && <span className="text-[10px] text-green-400">✓</span>}
          {status === 'failed' && <span className="text-[10px] text-red-400" title={err}>✗</span>}
        </div>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">{plan?.finalPrompt || plan?.basePrompt || '-'}</p>
      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-600"><span>{plan?.shotType}</span><span>{plan?.cameraMove}</span><span>{(plan?.estimatedDuration||0).toFixed(1)}s</span><span>${(plan?.estimatedCost||0).toFixed(3)}</span></div>
    </div>
  )
}

function St({ icon: I, label, value }: { icon: any; label: string; value: string | number }) {
  return <div className="bg-dark-900 border border-dark-700 rounded-xl p-3 text-center"><I size={18} className="text-orange-500/60 mx-auto mb-1" /><p className="text-lg font-bold text-slate-100">{value}</p><p className="text-xs text-slate-500">{label}</p></div>
}

function Sec({ icon: I, title, color, children, open: startOpen = true }: { icon: any; title: string; color: string; children: React.ReactNode; open?: boolean }) {
  const [o, setO] = useState(startOpen)
  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
      <button onClick={() => setO(!o)} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition-colors"><I size={18} className={color} /><span className="text-sm text-slate-200 font-medium flex-1 text-left">{title}</span>{o ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}</button>
      {o && <div className="px-4 pb-3">{children}</div>}
    </div>
  )
}
