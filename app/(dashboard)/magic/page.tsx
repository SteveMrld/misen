'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Film, Sparkles, ArrowRight, Loader2, Play, Camera, Brain, Clock, Eye, Music2, Users, Zap, AlertTriangle, Copy, Check, ChevronDown, TrendingUp } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { useI18n } from '@/lib/i18n'

// Pipeline step names for the loading animation
const PIPELINE_STEPS = [
  { icon: Film, label: 'Découpage du scénario', labelEn: 'Script parsing' },
  { icon: Brain, label: 'Analyse émotionnelle', labelEn: 'Emotional analysis' },
  { icon: Camera, label: 'Grammaire cinématographique', labelEn: 'Cinematic grammar' },
  { icon: Zap, label: 'Courbe de tension', labelEn: 'Tension curve' },
  { icon: Users, label: 'Bible des personnages', labelEn: 'Character bible' },
  { icon: Eye, label: 'Bible de style', labelEn: 'Style bible' },
  { icon: Camera, label: 'Physique caméra', labelEn: 'Camera physics' },
  { icon: Play, label: 'Direction de mouvement', labelEn: 'Motion director' },
  { icon: Sparkles, label: 'Modèle monde', labelEn: 'World model' },
  { icon: Brain, label: 'Sélection modèle IA optimal', labelEn: 'Optimal AI model selection' },
  { icon: Zap, label: 'Adaptation syntaxe prompt', labelEn: 'Prompt syntax adaptation' },
  { icon: Eye, label: 'Injection cohérence', labelEn: 'Consistency injection' },
  { icon: AlertTriangle, label: 'Vérification conformité', labelEn: 'Compliance check' },
  { icon: Music2, label: 'Score de continuité', labelEn: 'Continuity scoring' },
  { icon: TrendingUp, label: 'Prédiction de performance', labelEn: 'Performance prediction' },
  { icon: Brain, label: 'Intelligence cinématographique', labelEn: 'Cinematic intelligence' },
  { icon: Film, label: 'Assemblage final', labelEn: 'Final assembly' },
]

const EXAMPLE_SCRIPTS = {
  drama: `EXT. FLEUVE — AUBE

Un homme marche le long de la berge. Brume épaisse. Le soleil se lève à travers les arbres.

Il s'arrête devant un vieux pont en pierre. Regarde l'eau.

HOMME (voix off)
On y va aujourd'hui. Pas vrai ?

Il sort une photo froissée de sa poche. La regarde longuement.

INT. COULOIR D'HÔPITAL — JOUR

Lumière fluorescente. Pas qui résonnent. L'homme avance, hésitant.

HOMME (voix off)
On avait dit… ensemble.`,
  pub: `EXT. DÉSERT DORÉ — COUCHER DE SOLEIL

Dunes à perte de vue. Lumière dorée rasante. Le vent soulève des grains de sable comme de la poussière d'étoiles.

Une FEMME (30) apparaît au sommet d'une dune. Robe fluide dorée. Elle avance avec assurance.

EXT. OASIS — CRÉPUSCULE

L'eau reflète le ciel. La femme s'agenouille, touche l'eau du bout des doigts. Des rides dorées se propagent.

INSERT — FLACON

Un flacon de parfum émerge du sable. Doré, géométrique, lumineux.

VOIX OFF
Au-delà du visible. ODYSSÉE.`,
  clip: `INT. STUDIO NÉON — NUIT

Éclairage rose et bleu. Un DANSEUR entre dans le cadre. Mouvement lent, fluide.

La musique monte. Les néons pulsent au rythme.

Le danseur accélère. Mouvements saccadés, puissants. Ombres qui dansent sur les murs.

EXT. TOIT D'IMMEUBLE — NUIT

La ville en contrebas. Lumières. Le danseur au bord du vide. Bras écartés.

Retour au studio. Mouvement final. Freeze.`
}

type Phase = 'input' | 'processing' | 'result'

export default function MagicModePage() {
  const router = useRouter()
  const { locale } = useI18n()
  const fr = locale === 'fr'
  const [phase, setPhase] = useState<Phase>('input')
  const [script, setScript] = useState('')
  const [projectName, setProjectName] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [analysis, setAnalysis] = useState<any>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  // Loading animation
  useEffect(() => {
    if (phase !== 'processing') return
    const stepDuration = 500
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < PIPELINE_STEPS.length - 1) return prev + 1
        return prev
      })
      setProgress(prev => Math.min(prev + (100 / PIPELINE_STEPS.length), 95))
    }, stepDuration)
    return () => clearInterval(interval)
  }, [phase])

  const handleCreate = async () => {
    if (!script.trim() || script.trim().length < 20) return
    setPhase('processing')
    setCurrentStep(0)
    setProgress(0)
    setError(null)

    try {
      // 1. Create project
      const name = projectName.trim() || (fr ? 'Mon film' : 'My film')
      const projRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, script_text: script }),
      })
      if (!projRes.ok) {
        const errData = await projRes.json().catch(() => ({}))
        throw new Error(errData.error || `Erreur création projet (${projRes.status})`)
      }
      const project = await projRes.json()
      setProjectId(project.id)

      // 2. Run analysis
      const analyzeRes = await fetch(`/api/projects/${project.id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style_preset: 'cinematique' }),
      })
      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json().catch(() => ({}))
        throw new Error(errData.error || `Erreur analyse (${analyzeRes.status})`)
      }
      const data = await analyzeRes.json()

      setAnalysis(data.result)
      setProgress(100)
      setTimeout(() => setPhase('result'), 600)
    } catch (e: any) {
      setError(e.message)
      setPhase('input')
    }
  }

  const copyPrompt = (prompt: string, idx: number) => {
    navigator.clipboard.writeText(prompt)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  // ─── INPUT PHASE ───
  if (phase === 'input') {
    return (
      <div className="min-h-screen bg-dark-950">
        {/* Subtle background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-500/[0.03] rounded-full blur-[160px]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <Logo size="md" showText />
            <button onClick={() => router.push('/dashboard')} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              {fr ? '← Dashboard' : '← Dashboard'}
            </button>
          </div>

          {/* Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
              <Sparkles size={12} className="text-orange-400" />
              <span className="text-[11px] font-bold text-orange-400 tracking-widest uppercase">{fr ? 'MODE MAGIQUE' : 'MAGIC MODE'}</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-3" style={{ letterSpacing: '-0.03em' }}>
              {fr ? 'Écrivez. MISEN réalise.' : 'Write. MISEN directs.'}
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {fr ? 'Collez votre scénario. Un clic. MISEN décompose, analyse, choisit les meilleurs modèles IA et génère votre plan de production complet.' : 'Paste your screenplay. One click. MISEN breaks it down, analyzes, picks the best AI models, and generates your complete production plan.'}
            </p>
          </div>

          {/* Name (optional) */}
          <div className="mb-3">
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder={fr ? 'Nom du projet (optionnel)' : 'Project name (optional)'}
              className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/40 transition-colors"
            />
          </div>

          {/* Script textarea */}
          <div className="relative">
            <textarea
              value={script}
              onChange={e => setScript(e.target.value)}
              placeholder={fr ? 'Collez votre scénario ici...\n\nEXT. LIEU — MOMENT\n\nDescription de la scène. Action. Ambiance.\n\nPERSONNAGE\nDialogue du personnage.' : 'Paste your screenplay here...\n\nEXT. LOCATION — TIME\n\nScene description. Action. Mood.\n\nCHARACTER\nCharacter dialogue.'}
              className="w-full h-64 bg-dark-900 border border-dark-700 rounded-xl px-4 py-4 text-sm text-slate-200 placeholder-slate-600 font-mono leading-relaxed resize-none focus:outline-none focus:border-orange-500/40 transition-colors"
            />
            <div className="absolute bottom-3 right-3 text-[10px] text-slate-600">
              {script.length} {fr ? 'caractères' : 'chars'}
            </div>
          </div>

          {/* Quick examples */}
          <div className="flex items-center gap-2 mt-3 mb-6">
            <span className="text-[10px] text-slate-600">{fr ? 'Exemples :' : 'Examples:'}</span>
            {[
              { key: 'drama', label: fr ? 'Court-métrage' : 'Short film' },
              { key: 'pub', label: fr ? 'Pub luxe' : 'Luxury ad' },
              { key: 'clip', label: fr ? 'Clip musical' : 'Music video' },
            ].map(ex => (
              <button key={ex.key} onClick={() => { setScript(EXAMPLE_SCRIPTS[ex.key as keyof typeof EXAMPLE_SCRIPTS]); setProjectName(ex.label) }}
                className="px-2.5 py-1 text-[10px] text-slate-400 hover:text-orange-400 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-lg transition-all">
                {ex.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleCreate}
            disabled={!script.trim() || script.trim().length < 20}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold text-base flex items-center justify-center gap-3 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
          >
            <Film size={20} />
            {fr ? 'Créer mon film' : 'Create my film'}
            <ArrowRight size={18} />
          </button>

          <p className="text-center text-[10px] text-slate-600 mt-3">
            {fr ? '17 moteurs d\'intelligence · Analyse en ~8 secondes' : '17 intelligence engines · Analysis in ~8 seconds'}
          </p>
        </div>
      </div>
    )
  }

  // ─── PROCESSING PHASE ───
  if (phase === 'processing') {
    const StepIcon = PIPELINE_STEPS[currentStep]?.icon || Brain
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="max-w-md w-full px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center mx-auto mb-6">
            <StepIcon size={28} className="text-orange-400 animate-pulse" />
          </div>

          <h2 className="text-lg font-display font-bold text-white mb-2">
            {fr ? PIPELINE_STEPS[currentStep]?.label : PIPELINE_STEPS[currentStep]?.labelEn}
          </h2>
          <p className="text-xs text-slate-500 mb-8">
            {fr ? `Moteur ${currentStep + 1} / ${PIPELINE_STEPS.length}` : `Engine ${currentStep + 1} / ${PIPELINE_STEPS.length}`}
          </p>

          {/* Progress bar */}
          <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-[10px] text-slate-600">
            {fr ? 'MISEN analyse votre scénario avec 17 moteurs d\'intelligence cinématographique...' : 'MISEN is analyzing your screenplay with 17 cinematic intelligence engines...'}
          </p>
        </div>
      </div>
    )
  }

  // ─── RESULT PHASE ───
  const scenes = analysis?.scenes || []
  const plans = analysis?.plans || []
  const tension = analysis?.tension || {}
  const characterBible = analysis?.characterBible || []
  const compliance = analysis?.compliance || {}
  const stats = {
    scenes: scenes.length,
    plans: plans.length,
    chars: characterBible.length,
    duration: plans.reduce((s: number, p: any) => s + (p.estimatedDuration || 3), 0),
    cost: plans.reduce((s: number, p: any) => s + (p.estimatedCost || 0.1), 0),
  }

  return (
    <div className="min-h-screen bg-dark-950" ref={resultRef}>
      {/* Header bar */}
      <div className="sticky top-0 z-50 bg-dark-950/90 backdrop-blur-xl border-b border-dark-800">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-xs text-slate-500">Mode magique</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push(`/project/${projectId}`)}
              className="px-3 py-1.5 text-xs text-orange-400 border border-orange-500/20 hover:bg-orange-500/10 rounded-lg transition-colors flex items-center gap-1.5">
              <Sparkles size={12} /> {fr ? 'Ouvrir dans l\'éditeur complet' : 'Open in full editor'}
            </button>
            <button onClick={() => { setPhase('input'); setScript(''); setAnalysis(null) }}
              className="px-3 py-1.5 text-xs text-slate-400 border border-dark-700 hover:bg-dark-800 rounded-lg transition-colors">
              {fr ? 'Nouveau film' : 'New film'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Success header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
            <Check size={12} className="text-green-400" />
            <span className="text-[11px] font-bold text-green-400 tracking-widest uppercase">{fr ? 'ANALYSE TERMINÉE' : 'ANALYSIS COMPLETE'}</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-2" style={{ letterSpacing: '-0.03em' }}>
            {projectName || (fr ? 'Votre film' : 'Your film')}
          </h1>
          <p className="text-sm text-slate-400">
            {fr ? `${stats.scenes} scènes · ${stats.plans} plans · ${Math.round(stats.duration)}s · ${stats.chars} personnage${stats.chars > 1 ? 's' : ''}` : `${stats.scenes} scenes · ${stats.plans} shots · ${Math.round(stats.duration)}s · ${stats.chars} character${stats.chars > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { value: stats.scenes, label: fr ? 'Scènes' : 'Scenes', color: 'text-orange-400' },
            { value: stats.plans, label: 'Plans', color: 'text-blue-400' },
            { value: `${Math.round(stats.duration)}s`, label: fr ? 'Durée' : 'Duration', color: 'text-green-400' },
            { value: `${Math.max(stats.plans, 1)} cr.`, label: fr ? `Crédits · ~${(Math.max(stats.plans, 1) * 0.17).toFixed(2)}€` : `Credits · ~€${(Math.max(stats.plans, 1) * 0.17).toFixed(2)}`, color: 'text-violet-400' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-center">
              <p className={`text-xl font-display font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Plans — the main content */}
        <div className="mb-10">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Camera size={16} className="text-orange-400" />
            {fr ? 'Plan de production' : 'Production plan'}
          </h2>
          <div className="space-y-3">
            {plans.map((plan: any, i: number) => {
              const osf = plan.openSourceFallback
              return (
                <div key={i} className="bg-dark-900 border border-dark-700 rounded-xl p-4 hover:border-dark-600 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Plan header */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                          P{i + 1}
                        </span>
                        <span className="text-[10px] text-slate-400">{plan.shotType || plan.cadrage}</span>
                        {plan.cameraMove && plan.cameraMove !== 'fixe' && (
                          <span className="text-[10px] text-cyan-400/60">{plan.cameraMove}</span>
                        )}
                        <span className="text-[10px] text-slate-600">·</span>
                        <span className="text-[10px] text-slate-500">{plan.estimatedDuration || 3}s</span>
                        <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(108,77,255,0.1)', color: '#8B5CF6' }}>
                          {plan.modelId || 'kling3'}
                        </span>
                      </div>

                      {/* Prompt */}
                      <p className="text-xs text-slate-300 font-mono leading-relaxed line-clamp-3 mb-2">
                        {plan.finalPrompt || plan.prompt || '—'}
                      </p>

                      {/* OS fallback info */}
                      {osf && (
                        <div className="flex items-center gap-2 text-[9px] text-slate-600">
                          <span>{fr ? 'Alt. gratuite :' : 'Free alt:'}</span>
                          <span className="text-emerald-400/70">{osf.modelName}</span>
                          <span>({osf.score}/100)</span>
                        </div>
                      )}
                    </div>

                    {/* Copy button */}
                    <button onClick={() => copyPrompt(plan.finalPrompt || plan.prompt || '', i)}
                      className="shrink-0 px-2.5 py-1.5 text-[10px] text-slate-400 hover:text-orange-400 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-lg transition-all flex items-center gap-1">
                      {copiedIdx === i ? <><Check size={10} /> {fr ? 'Copié' : 'Copied'}</> : <><Copy size={10} /> Prompt</>}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Character Bible */}
        {characterBible.length > 0 && (
          <div className="mb-10">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Users size={16} className="text-violet-400" />
              {fr ? 'Bible des personnages' : 'Character bible'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {characterBible.map((char: any, i: number) => (
                <div key={i} className="bg-dark-900 border border-dark-700 rounded-xl p-4">
                  <p className="text-sm font-bold text-white mb-1">{char.name || char.personnage}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{char.apparence || char.description || '—'}</p>
                  {char.traits && char.traits.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {char.traits.map((t: string, j: number) => (
                        <span key={j} className="text-[9px] px-2 py-0.5 bg-violet-500/10 text-violet-300 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tension curve */}
        {tension?.curve && tension.curve.length > 0 && (
          <div className="mb-10">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" />
              {fr ? 'Courbe de tension' : 'Tension curve'}
            </h2>
            <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
              <div className="flex items-end gap-1" style={{ height: 96 }}>
                {tension.curve.map((pt: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1" style={{ height: '100%', justifyContent: 'flex-end' }}>
                    <div className="w-full rounded-t" style={{
                      height: Math.max(pt.tension * 0.9, 6),
                      background: pt.tension > 70 ? 'linear-gradient(to top, #C56A2D, #E8955A)' : pt.tension > 40 ? 'linear-gradient(to top, #6C4DFF, #8B6FFF)' : 'linear-gradient(to top, #334155, #475569)',
                    }} />
                    <span className="text-[8px] text-slate-600">S{pt.sceneIndex + 1}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-3 text-center">{tension.globalArc || ''}</p>
            </div>
          </div>
        )}

        {/* Performance Engine */}
        {analysis?.performance && (
          <div className="mb-10">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-green-400" />
              {fr ? 'Score de performance' : 'Performance score'}
            </h2>
            <div className="bg-dark-900 border border-dark-700 rounded-xl p-5">
              {/* Global score */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
                  background: analysis.performance.global >= 70 ? 'rgba(16,185,129,0.1)' : analysis.performance.global >= 50 ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${analysis.performance.global >= 70 ? 'rgba(16,185,129,0.2)' : analysis.performance.global >= 50 ? 'rgba(234,179,8,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                  <span className="text-2xl font-display font-bold" style={{
                    color: analysis.performance.global >= 70 ? '#10B981' : analysis.performance.global >= 50 ? '#EAB308' : '#EF4444'
                  }}>{analysis.performance.grade}</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{analysis.performance.global}/100</p>
                  <p className="text-xs text-slate-500">{analysis.performance.benchmarkComparison}</p>
                </div>
              </div>

              {/* Dimension bars */}
              <div className="space-y-2.5">
                {Object.values(analysis.performance.dimensions as Record<string, any>).map((dim: any) => (
                  <div key={dim.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400">{dim.label}</span>
                      <span className="text-[10px] font-mono text-slate-500">{dim.score}</span>
                    </div>
                    <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${dim.score}%`,
                        background: dim.score >= 70 ? '#10B981' : dim.score >= 50 ? '#EAB308' : '#EF4444',
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Alerts */}
              {analysis.performance.alerts?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {analysis.performance.alerts.map((alert: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs" style={{
                      padding: '8px 10px', borderRadius: 8,
                      background: alert.severity === 'critical' ? 'rgba(239,68,68,0.06)' : alert.severity === 'warning' ? 'rgba(234,179,8,0.06)' : 'rgba(59,130,246,0.06)',
                      border: `1px solid ${alert.severity === 'critical' ? 'rgba(239,68,68,0.12)' : alert.severity === 'warning' ? 'rgba(234,179,8,0.12)' : 'rgba(59,130,246,0.12)'}`,
                    }}>
                      <AlertTriangle size={12} className="shrink-0 mt-0.5" style={{
                        color: alert.severity === 'critical' ? '#EF4444' : alert.severity === 'warning' ? '#EAB308' : '#3B82F6'
                      }} />
                      <div>
                        <p className="text-slate-300">{alert.message}</p>
                        <p className="text-slate-500 mt-0.5">{alert.fix}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {analysis.performance.suggestions?.length > 0 && (
                <div className="mt-3">
                  {analysis.performance.suggestions.map((s: string, i: number) => (
                    <p key={i} className="text-[10px] text-slate-500 flex items-start gap-1.5 mt-1">
                      <Sparkles size={9} className="text-orange-400 shrink-0 mt-0.5" /> {s}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dataset Intelligence */}
        {analysis?.datasetRecommendation && (
          <div className="mb-10">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Brain size={16} className="text-violet-400" />
              {fr ? 'Intelligence cinématographique' : 'Cinematic intelligence'}
            </h2>
            <div className="bg-dark-900 border border-dark-700 rounded-xl p-5">
              <p className="text-xs text-slate-400 mb-4">{analysis.datasetRecommendation.benchmarkText}</p>

              {/* Optimal structure */}
              <p className="text-[10px] font-bold text-orange-400 mb-2 tracking-wider uppercase">
                {fr ? 'Structure narrative optimale' : 'Optimal narrative structure'}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {analysis.datasetRecommendation.optimalStructure?.map((block: any, i: number) => (
                  <div key={i} className="px-2.5 py-1.5 rounded-lg text-[9px]" style={{
                    background: block.type === 'climax' ? 'rgba(197,106,45,0.15)' : block.type === 'product' ? 'rgba(108,77,255,0.1)' : 'rgba(255,255,255,0.04)',
                    border: block.type === 'climax' ? '1px solid rgba(197,106,45,0.25)' : '1px solid rgba(255,255,255,0.06)',
                    color: block.type === 'climax' ? '#C56A2D' : block.type === 'product' ? '#6C4DFF' : 'rgba(255,255,255,0.5)',
                  }}>
                    <span className="font-bold">{Math.round(block.position * 100)}%</span> — {block.type} · {block.duration}s
                  </div>
                ))}
              </div>

              {/* Style genomes */}
              {analysis.datasetRecommendation.styleGenomes?.length > 0 && (
                <>
                  <p className="text-[10px] font-bold text-violet-400 mb-2 tracking-wider uppercase">
                    {fr ? 'Styles recommandés' : 'Recommended styles'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.datasetRecommendation.styleGenomes.slice(0, 4).map((style: any) => (
                      <div key={style.id} className="px-3 py-2 bg-dark-800/50 rounded-lg border border-dark-700/50">
                        <p className="text-xs font-bold text-white">{style.director}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{style.traits.signature}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center py-8 border-t border-dark-800">
          <button onClick={() => router.push(`/project/${projectId}`)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold text-sm flex items-center justify-center gap-2 mx-auto transition-all shadow-lg shadow-orange-500/20">
            <Sparkles size={16} />
            {fr ? 'Continuer dans l\'éditeur complet' : 'Continue in full editor'}
            <ArrowRight size={16} />
          </button>
          <p className="text-[10px] text-slate-600 mt-3">
            {fr ? 'Storyboard, timeline, copilote IA, sous-titres, voix off, musique, export...' : 'Storyboard, timeline, AI copilot, subtitles, voiceover, music, export...'}
          </p>
        </div>
      </div>
    </div>
  )
}
