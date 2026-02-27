'use client'

import { useState } from 'react'
import { Loader2, ChevronDown, ChevronRight, Trophy, AlertTriangle, DollarSign, Zap, Info, BarChart3, X, Scale } from 'lucide-react'
import { getModelColor } from '@/components/ui/model-badge'

interface ModelResult {
  id: string; name: string; version: string; finalScore: number
  axisScores: Array<{ axis: string; label: string; modelValue: number; weight: number; weighted: number; source?: string; confidence?: string; basis?: string }>
  bonus: number; bonusReason: string; costPer10s: number
  speciality: string; strengths: string[]; weaknesses: string[]
}

interface CompareResult {
  ranking: ModelResult[]
  contextWeights: Array<{ axis: string; label: string; weight: number; isAdjusted: boolean }>
  reasoning: string[]
  planContext: Record<string, any>
  methodology?: { description: string; legend: Record<string, string>; confidenceLevels: Record<string, string>; recommendation: string }
}

const CONF_COLORS: Record<string, { dot: string; label: string }> = {
  high: { dot: 'bg-green-400', label: 'Vérifié' },
  medium: { dot: 'bg-yellow-400', label: 'Consensus' },
  low: { dot: 'bg-red-400', label: 'Estimé' },
}

// ═══ Main Compare Panel ═══
export function ComparePanel({ plan, onClose }: { plan: any; onClose: () => void }) {
  const [result, setResult] = useState<CompareResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [showWeights, setShowWeights] = useState(false)

  const runCompare = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shotType: plan?.cadrage || plan?.shotType || 'PM',
          cameraMove: plan?.camera || plan?.cameraMove || 'fixe',
          hasDialogue: plan?.hasDialogue || false,
          dialogueLength: plan?.dialogueLength || 0,
          personnageCount: plan?.personnageCount || 1,
          isFlashback: plan?.isFlashback || false,
          duration: plan?.estimatedDuration || 4,
          needsVFX: plan?.needsVFX || false,
          needsConsistency: plan?.needsConsistency || false,
          sceneType: plan?.sceneType || 'INT',
          intensity: plan?.intensity || 50,
          emotion: plan?.emotion || 'neutre',
        }),
      })
      if (res.ok) setResult(await res.json())
    } catch {} finally { setLoading(false) }
  }

  // Auto-run on mount
  if (!result && !loading) { runCompare() }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Scale size={20} className="text-orange-500" />
            <div>
              <h2 className="text-lg font-display text-slate-100">Comparaison MCAP</h2>
              <p className="text-xs text-slate-500">Pourquoi ce modèle est recommandé pour ce plan</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-dark-800"><X size={18} className="text-slate-400" /></button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="text-orange-500 animate-spin" />
              <span className="ml-3 text-sm text-slate-400">Calcul MCAP en cours...</span>
            </div>
          )}

          {result && (
            <>
              {/* Context reasoning */}
              {result.reasoning.length > 0 && (
                <div className="bg-dark-850 border border-dark-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={14} className="text-cyan-400" />
                    <span className="text-xs font-medium text-slate-300">Contexte détecté — ajustement des poids</span>
                  </div>
                  <div className="space-y-1">
                    {result.reasoning.map((r, i) => (
                      <p key={i} className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-cyan-400/60 flex-shrink-0" />
                        {r}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Ranking bars */}
              <div className="space-y-2">
                {result.ranking.map((m, i) => {
                  const mc = getModelColor(m.id)
                  const isTop = i === 0
                  const isOpen = showDetails === m.id

                  return (
                    <div key={m.id} className={`border rounded-xl overflow-hidden transition-all ${isTop ? 'border-orange-500/40 bg-dark-850' : 'border-dark-700 bg-dark-900'}`}>
                      {/* Summary row */}
                      <button
                        onClick={() => setShowDetails(isOpen ? null : m.id)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Rank */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isTop ? 'bg-orange-500/20 text-orange-400' : 'bg-dark-700 text-slate-500'}`}>
                          {isTop ? <Trophy size={14} /> : `#${i + 1}`}
                        </div>

                        {/* Model info */}
                        <div className="flex items-center gap-2 w-32 flex-shrink-0">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: mc }} />
                          <span className={`text-sm font-medium ${isTop ? 'text-slate-100' : 'text-slate-300'}`}>{m.name}</span>
                          <span className="text-[10px] text-slate-600">{m.version}</span>
                        </div>

                        {/* Score bar */}
                        <div className="flex-1 flex items-center gap-3">
                          <div className="flex-1 h-4 bg-dark-700 rounded-full overflow-hidden relative">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${m.finalScore}%`, backgroundColor: isTop ? mc : `${mc}90` }}
                            />
                            {m.bonus > 0 && (
                              <div
                                className="absolute top-0 h-full rounded-r-full opacity-40"
                                style={{
                                  left: `${m.finalScore - m.bonus}%`,
                                  width: `${m.bonus}%`,
                                  backgroundColor: '#FBBF24',
                                }}
                                title={`Bonus: +${m.bonus} (${m.bonusReason})`}
                              />
                            )}
                          </div>
                          <span className={`text-sm font-mono font-bold w-10 text-right ${isTop ? 'text-orange-400' : 'text-slate-400'}`}>
                            {m.finalScore}
                          </span>
                        </div>

                        {/* Cost */}
                        <span className="text-[10px] text-slate-600 w-16 text-right">${m.costPer10s}/10s</span>

                        {/* Chevron */}
                        {isOpen ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-600" />}
                      </button>

                      {/* Detail panel */}
                      {isOpen && (
                        <div className="px-4 pb-4 border-t border-dark-700/50">
                          {/* Speciality */}
                          <p className="text-xs text-slate-400 mt-3 mb-3 italic">&quot;{m.speciality}&quot;</p>

                          {/* Bonus */}
                          {m.bonus > 0 && (
                            <div className="flex items-center gap-2 mb-3 text-xs">
                              <Zap size={12} className="text-yellow-400" />
                              <span className="text-yellow-400/80">Bonus contextuel: +{m.bonus} — {m.bonusReason}</span>
                            </div>
                          )}

                          {/* Strengths & Weaknesses */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                              <span className="text-[10px] font-medium text-green-400 block mb-1">Forces (≥9/10)</span>
                              <div className="flex flex-wrap gap-1">
                                {m.strengths.length > 0 ? m.strengths.map(s => (
                                  <span key={s} className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded">{s}</span>
                                )) : <span className="text-[10px] text-slate-600">—</span>}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] font-medium text-red-400 block mb-1">Faiblesses (≤5/10)</span>
                              <div className="flex flex-wrap gap-1">
                                {m.weaknesses.length > 0 ? m.weaknesses.map(w => (
                                  <span key={w} className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded">{w}</span>
                                )) : <span className="text-[10px] text-slate-600">—</span>}
                              </div>
                            </div>
                          </div>

                          {/* Axis breakdown */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-medium text-slate-500 block">Détail par axe (score × poids = pondéré)</span>
                            {m.axisScores
                              .sort((a, b) => b.weighted - a.weighted)
                              .map(ax => {
                                const maxWeighted = Math.max(...m.axisScores.map(a => a.weighted))
                                const conf = CONF_COLORS[ax.confidence || 'low'] || CONF_COLORS.low
                                return (
                                  <div key={ax.axis} className="group">
                                    <div className="flex items-center gap-2 text-[11px]">
                                      <span className="w-24 text-slate-500 truncate">{ax.label}</span>
                                      <span className={`w-6 text-right font-mono ${ax.modelValue >= 9 ? 'text-green-400' : ax.modelValue <= 5 ? 'text-red-400' : 'text-slate-400'}`}>
                                        {ax.modelValue}
                                      </span>
                                      <span className="text-slate-700">×</span>
                                      <span className={`w-6 text-right font-mono ${ax.weight > 1.5 ? 'text-cyan-400' : 'text-slate-600'}`}>
                                        {ax.weight}
                                      </span>
                                      <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                                        <div
                                          className="h-full rounded-full"
                                          style={{
                                            width: `${(ax.weighted / maxWeighted) * 100}%`,
                                            backgroundColor: mc,
                                            opacity: ax.modelValue >= 8 ? 0.8 : 0.4,
                                          }}
                                        />
                                      </div>
                                      <span className="w-8 text-right font-mono text-slate-600">{ax.weighted}</span>
                                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${conf.dot}`} title={`${conf.label}: ${ax.source || 'Estimation'}`} />
                                    </div>
                                    {/* Source on hover */}
                                    {ax.source && (
                                      <div className="hidden group-hover:block ml-[100px] mt-0.5 mb-1">
                                        <span className="text-[8px] text-slate-600 italic">{conf.label} — {ax.source}</span>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Weights toggle */}
              <button onClick={() => setShowWeights(!showWeights)} className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                <BarChart3 size={12} />
                {showWeights ? 'Masquer' : 'Voir'} les poids appliqués
                {showWeights ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>

              {showWeights && (
                <div className="bg-dark-850 border border-dark-700 rounded-xl p-4">
                  <p className="text-[10px] text-slate-500 mb-3">Les poids sont ajustés automatiquement selon le contexte du plan. Les axes en <span className="text-cyan-400">cyan</span> ont été augmentés.</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {result.contextWeights.map(w => (
                      <div key={w.axis} className="flex items-center justify-between gap-2 text-[11px]">
                        <span className={w.isAdjusted ? 'text-cyan-400' : 'text-slate-500'}>{w.label}</span>
                        <span className={`font-mono ${w.isAdjusted ? 'text-cyan-400 font-bold' : 'text-slate-600'}`}>
                          ×{w.weight}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Methodology & Sources */}
              <div className="bg-dark-850/50 border border-dark-700/50 rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-yellow-500/60 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {result.methodology?.description || 'Le scoring MCAP est basé sur les spécifications constructeur et benchmarks publiés. Les résultats réels peuvent varier.'}
                  </p>
                </div>
                <div className="flex items-center gap-4 ml-5">
                  {Object.entries(CONF_COLORS).map(([key, { dot, label }]) => (
                    <div key={key} className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                      <span className="text-[9px] text-slate-600">{label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-slate-600 ml-5 italic">
                  Survolez chaque axe pour voir la source du score. {result.methodology?.recommendation || ''}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══ Compact Compare Button ═══
export function CompareButton({ plan, className = '' }: { plan: any; className?: string }) {
  const [showCompare, setShowCompare] = useState(false)

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setShowCompare(true) }}
        className={`flex items-center gap-1 px-2 py-0.5 text-[10px] text-cyan-400/70 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors ${className}`}
        title="Comparer les modèles pour ce plan"
      >
        <Scale size={10} /> Comparer
      </button>
      {showCompare && <ComparePanel plan={plan} onClose={() => setShowCompare(false)} />}
    </>
  )
}
