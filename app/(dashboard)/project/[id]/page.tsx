'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Play, Loader2, Save,
  Brain, AlertTriangle, ChevronDown, ChevronRight,
  Film, Eye, DollarSign, Shield, Users, TrendingUp, Camera, Zap
} from 'lucide-react'

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
  const [error, setError] = useState('')

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
      .then(data => { if (data?.length > 0 && data[0].result) setAnalysis(data[0].result) })
      .catch(() => {})
  }, [projectId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script_text: scriptText }),
      })
    } catch {} finally { setSaving(false) }
  }

  const handleAnalyze = async () => {
    if (!scriptText.trim()) { setError('Collez un script avant de lancer l\'analyse'); return }
    setError('')
    setAnalyzing(true)
    await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script_text: scriptText }),
    })
    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style_preset: stylePreset }),
      })
      const data = await res.json()
      if (res.ok && data.result) setAnalysis(data.result)
      else setError(data.error || 'Erreur analyse')
    } catch { setError('Erreur réseau') }
    finally { setAnalyzing(false) }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 size={32} className="text-orange-500 animate-spin" /></div>
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/dashboard')} className="p-2 rounded-lg hover:bg-white/5">
          <ArrowLeft size={20} className="text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-slate-50">{project?.name || 'Projet'}</h1>
      </div>

      {/* Script Editor */}
      <div className="mb-6 rounded-xl border border-dark-700" style={{ background: 'rgb(15,15,20)' }}>
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
          placeholder={'Collez votre script ici...\n\nExemple :\nINT. APPARTEMENT - JOUR\n\nMARC\nJe ne sais plus quoi faire...'}
          rows={14}
          className="block w-full p-4 bg-transparent text-slate-200 text-sm leading-relaxed focus:outline-none resize-none"
          spellCheck={false}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <button onClick={handleAnalyze} disabled={analyzing || !scriptText.trim()}
        className="mb-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors">
        {analyzing ? <><Loader2 size={20} className="animate-spin" /> Analyse en cours...</> : <><Play size={20} /> Lancer l&apos;analyse</>}
      </button>

      {/* Results */}
      {!analysis ? (
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <Brain size={48} className="text-slate-700 mb-4" />
          <p className="text-slate-400">Lancez une analyse pour voir les résultats</p>
          <p className="text-xs text-slate-600 mt-1">13 moteurs × 7 modèles IA</p>
        </div>
      ) : (
        <AnalysisResults analysis={analysis} />
      )}
    </div>
  )
}

function AnalysisResults({ analysis }: { analysis: any }) {
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
                <PlanCard key={i} plan={plan} index={i} analysisId={analysis?._analysisId} />
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
    return (
      <div className="bg-dark-900 border border-red-500/20 rounded-xl p-6 text-center">
        <p className="text-red-400 text-sm">Erreur d&apos;affichage</p>
      </div>
    )
  }
}

function PlanCard({ plan, index, analysisId }: { plan: any; index: number; analysisId?: string }) {
  const [generating, setGenerating] = useState(false)
  const [genStatus, setGenStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle')
  const [genError, setGenError] = useState('')

  const handleGenerate = async () => {
    if (!analysisId) return
    setGenerating(true)
    setGenStatus('processing')
    setGenError('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId,
          planIndex: index,
          sceneIndex: plan?.sceneIndex || 0,
          modelId: plan?.modelId,
          prompt: plan?.finalPrompt || plan?.adaptedPrompt || plan?.basePrompt || '',
          negativePrompt: plan?.negativePrompt,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setGenStatus(data.status || 'processing')
        if (data.error) { setGenError(data.error); setGenStatus('failed') }
      } else {
        setGenStatus('failed')
        setGenError(data.error || 'Erreur')
      }
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
