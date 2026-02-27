'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Play, Loader2, Save, Download, History,
  Brain, Camera, TrendingUp, MessageSquare, Cpu, Users,
  Shield, BookOpen, Palette, Layers, Terminal, Ban,
  AlertTriangle, ChevronDown, ChevronRight, DollarSign,
  Film, Eye
} from 'lucide-react'
import type { Project } from '@/types/database'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [scriptText, setScriptText] = useState('')
  const [stylePreset, setStylePreset] = useState('cinematique')
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [versions, setVersions] = useState<any[]>([])
  const [error, setError] = useState('')

  // Charge le projet
  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`)
      if (!res.ok) { router.push('/dashboard'); return }
      const data = await res.json()
      setProject(data)
      setScriptText(data.script_text || '')
    } catch {
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [projectId, router])

  // Charge les versions d'analyse
  const fetchVersions = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/analyses`)
      if (res.ok) {
        const data = await res.json()
        setVersions(data)
        if (data.length > 0) {
          setAnalysis(data[0].result)
        }
      }
    } catch {}
  }, [projectId])

  useEffect(() => { fetchProject() }, [fetchProject])
  useEffect(() => { fetchVersions() }, [fetchVersions])

  // Sauvegarde le script
  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script_text: scriptText }),
      })
    } catch {}
    finally { setSaving(false) }
  }

  // Lance l'analyse
  const handleAnalyze = async () => {
    if (!scriptText.trim()) { setError('Collez un script avant de lancer l\'analyse'); return }
    setError('')
    setAnalyzing(true)

    // Sauvegarde d'abord
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
      if (res.ok) {
        const data = await res.json()
        setAnalysis(data.result)
        await fetchVersions()
      } else {
        const err = await res.json()
        setError(err.error || 'Erreur analyse')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="text-orange-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/dashboard')} className="btn-ghost p-2 rounded-lg">
          <ArrowLeft size={20} className="text-slate-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-h3 text-slate-50">{project?.name}</h1>
          {project?.description && (
            <p className="text-body-sm text-slate-400 mt-0.5">{project.description}</p>
          )}
        </div>
        {versions.length > 0 && (
          <div className="flex items-center gap-2 text-caption text-slate-500">
            <History size={14} />
            {versions.length} version{versions.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Script Editor */}
        <div className="space-y-4">
          <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700">
              <span className="text-body-sm text-slate-300 font-medium">Script</span>
              <div className="flex items-center gap-2">
                <select
                  value={stylePreset}
                  onChange={(e) => setStylePreset(e.target.value)}
                  className="px-2 py-1 bg-dark-800 border border-dark-700 rounded text-caption text-slate-300 focus:outline-none"
                >
                  <option value="cinematique">Cinématique</option>
                  <option value="documentaire">Documentaire</option>
                  <option value="noir">Film Noir</option>
                  <option value="onirique">Onirique</option>
                </select>
                <button onClick={handleSave} disabled={saving} className="btn-ghost p-1.5 rounded">
                  {saving ? <Loader2 size={16} className="animate-spin text-slate-400" /> : <Save size={16} className="text-slate-400" />}
                </button>
              </div>
            </div>
            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder={`Collez votre script ici...

Formats supportés :
INT. APPARTEMENT - JOUR
EXT. RUE - NUIT
INTÉRIEUR BUREAU - MATIN

MARC
Dialogue du personnage...

(didascalie)`}
              rows={24}
              className="w-full px-4 py-3 bg-transparent text-slate-200 placeholder:text-slate-600 font-mono text-sm leading-relaxed focus:outline-none resize-none"
              spellCheck={false}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-body-sm text-red-400">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !scriptText.trim()}
            className="btn-primary btn-lg w-full disabled:opacity-50"
          >
            {analyzing ? (
              <><Loader2 size={20} className="mr-2 animate-spin" /> Analyse en cours (13 moteurs)...</>
            ) : (
              <><Play size={20} className="mr-2" /> Lancer l&apos;analyse</>
            )}
          </button>
        </div>

        {/* RIGHT: Analysis Results */}
        <div className="space-y-4">
          {!analysis ? (
            <div className="bg-dark-900 border border-dark-700 rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <Brain size={48} className="text-slate-700 mb-4" />
              <p className="text-body text-slate-400">Lancez une analyse pour voir les résultats</p>
              <p className="text-caption text-slate-600 mt-1">13 moteurs × 7 modèles IA</p>
            </div>
          ) : (
            <>
              {/* Stats overview */}
              <div className="grid grid-cols-4 gap-3">
                <StatCard icon={Film} label="Scènes" value={analysis.scenes?.length || 0} />
                <StatCard icon={Eye} label="Plans" value={analysis.plans?.length || 0} />
                <StatCard icon={DollarSign} label="Coût est." value={`$${(analysis.costTotal || 0).toFixed(2)}`} />
                <StatCard icon={Shield} label="Continuité" value={`${analysis.continuity?.score || 100}%`} />
              </div>

              {/* Engines results */}
              <EngineSection icon={TrendingUp} title="Courbe de tension" color="text-red-400">
                {analysis.tension && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-caption text-slate-400">
                      <span>Arc : <strong className="text-slate-200">{analysis.tension.globalArc}</strong></span>
                      <span>Moyenne : <strong className="text-slate-200">{Math.round(analysis.tension.avgTension)}</strong></span>
                      <span>Climax : scène <strong className="text-slate-200">{analysis.tension.climaxIndex + 1}</strong></span>
                    </div>
                    <div className="flex items-end gap-1 h-16">
                      {analysis.tension.curve?.map((t: any, i: number) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-red-500/60 rounded-t"
                            style={{ height: `${t.tension * 0.6}px` }}
                          />
                          <span className="text-[10px] text-slate-600">{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </EngineSection>

              <EngineSection icon={Users} title="Personnages" color="text-blue-400">
                {analysis.characterBible?.map((char: any) => (
                  <div key={char.name} className="flex items-center gap-3 py-1.5">
                    <span className="w-24 text-body-sm text-slate-200 font-medium truncate">{char.name}</span>
                    <span className="text-caption text-slate-500 flex-1 truncate">{char.apparence || 'Non décrit'}</span>
                    <span className="text-caption text-slate-600">{char.traits?.join(', ')}</span>
                  </div>
                ))}
              </EngineSection>

              <EngineSection icon={Shield} title="Compliance" color="text-green-400">
                <div className="flex items-center gap-3">
                  <span className={`text-body-sm font-medium ${
                    analysis.compliance?.level === 'OK' ? 'text-green-400' :
                    analysis.compliance?.level === 'WARNING' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {analysis.compliance?.level || 'OK'}
                  </span>
                  <span className="text-caption text-slate-400">
                    Score : {analysis.compliance?.score || 100}/100
                  </span>
                  {analysis.compliance?.flags?.length > 0 && (
                    <span className="text-caption text-slate-500">
                      {analysis.compliance.flags.length} flag{analysis.compliance.flags.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </EngineSection>

              <EngineSection icon={AlertTriangle} title="Continuité" color="text-yellow-400">
                <div className="space-y-1.5">
                  <span className="text-body-sm text-slate-300">
                    Score : {analysis.continuity?.score || 100}/100
                  </span>
                  {analysis.continuity?.alerts?.map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-caption">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        a.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                        a.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>{a.severity}</span>
                      <span className="text-slate-400">{a.type}</span>
                    </div>
                  ))}
                  {(!analysis.continuity?.alerts || analysis.continuity.alerts.length === 0) && (
                    <span className="text-caption text-slate-500">Aucune alerte</span>
                  )}
                </div>
              </EngineSection>

              <EngineSection icon={Camera} title="Plans générés" color="text-orange-400" defaultOpen={false}>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {analysis.plans?.slice(0, 20).map((plan: any, i: number) => (
                    <div key={i} className="bg-dark-800 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-caption text-slate-300 font-medium">
                          Plan {i + 1} — Scène {(plan.sceneIndex || 0) + 1}
                        </span>
                        <span className="text-caption text-orange-400">{plan.modelId}</span>
                      </div>
                      <p className="text-caption text-slate-400 leading-relaxed">{plan.finalPrompt || plan.adaptedPrompt || plan.basePrompt}</p>
                      {plan.negativePrompt && (
                        <p className="text-[11px] text-red-400/60">NEG: {plan.negativePrompt}</p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-slate-600">
                        <span>{plan.shotType}</span>
                        <span>{plan.cameraMove}</span>
                        <span>{plan.estimatedDuration?.toFixed(1)}s</span>
                        <span>${plan.estimatedCost?.toFixed(3)}</span>
                      </div>
                    </div>
                  ))}
                  {analysis.plans?.length > 20 && (
                    <p className="text-caption text-slate-600 text-center">
                      + {analysis.plans.length - 20} plans supplémentaires
                    </p>
                  )}
                </div>
              </EngineSection>

              {/* Cost breakdown */}
              <EngineSection icon={DollarSign} title="Coûts par modèle" color="text-emerald-400" defaultOpen={false}>
                <div className="space-y-1.5">
                  {analysis.costByModel && Object.entries(analysis.costByModel).map(([model, cost]: [string, any]) => (
                    <div key={model} className="flex items-center justify-between text-caption">
                      <span className="text-slate-300">{model}</span>
                      <span className="text-slate-400">${Number(cost).toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </EngineSection>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// SUB-COMPONENTS
// ============================================

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl p-3 text-center">
      <Icon size={18} className="text-orange-500/60 mx-auto mb-1" />
      <p className="text-h4 text-slate-100">{value}</p>
      <p className="text-caption text-slate-500">{label}</p>
    </div>
  )
}

function EngineSection({ icon: Icon, title, color, children, defaultOpen = true }: {
  icon: any; title: string; color: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-dark-800 transition-colors"
      >
        <Icon size={18} className={color} />
        <span className="text-body-sm text-slate-200 font-medium flex-1 text-left">{title}</span>
        {open ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  )
}
