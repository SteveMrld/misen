'use client'

import { useI18n } from '@/lib/i18n'

import { useState, useEffect } from 'react'
import {
  DollarSign, Zap, Film, Clock, TrendingUp, AlertTriangle,
  BarChart3, RefreshCw, ArrowUpRight, CreditCard, Loader2, Sparkles
} from 'lucide-react'

interface UsageData {
  plan: {
    id: string; name: string; price: number;
    generationsLimit: number; generationsUsed: number; generationsRemaining: number;
    projectsLimit: number; resetAt: string;
  };
  stats: {
    total: number; completed: number; failed: number; processing: number;
    totalCost: number; totalDurationSeconds: number; avgCostPerGeneration: number;
  };
  costByProvider: Record<string, { count: number; cost: number; duration: number }>;
  dailyCosts: Record<string, number>;
  recentGenerations: { id: string; model: string; status: string; cost: number; date: string }[];
}

const MODEL_COLORS: Record<string, string> = {
  kling3: '#3B82F6', 'runway4.5': '#8B5CF6', sora2: '#EC4899',
  'veo3.1': '#10B981', seedance2: '#14B8A6', 'wan2.5': '#6366F1', 'hailuo2.3': '#D946EF',
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  completed: { label: 'Terminé', class: 'text-green-400 bg-green-500/10' },
  processing: { label: 'En cours', class: 'text-yellow-400 bg-yellow-500/10' },
  pending: { label: 'File', class: 'text-slate-400 bg-slate-500/10' },
  failed: { label: 'Échoué', class: 'text-red-400 bg-red-500/10' },
}

const CREDIT_PACK_OPTIONS = [
  { id: 'starter', name: 'Starter', credits: 50, price: 9.99, perCredit: '0.20', popular: false },
  { id: 'creator', name: 'Creator', credits: 150, price: 24.99, perCredit: '0.17', popular: true },
  { id: 'studio_pack', name: 'Studio', credits: 500, price: 69.99, perCredit: '0.14', popular: false },
]

export function CostsDashboard() {
  const { t } = useI18n()
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creditBalance, setCreditBalance] = useState<number | null>(null)
  const [buyingPack, setBuyingPack] = useState<string | null>(null)
  const [buyError, setBuyError] = useState<string | null>(null)

  const fetchUsage = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/usage')
      if (!r.ok) throw new Error('Loading error')
      setData(await r.json())
      setError(null)
    } catch (e: any) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const fetchCredits = async () => {
    try {
      const r = await fetch('/api/credits')
      if (r.ok) {
        const d = await r.json()
        setCreditBalance(d.balance ?? 0)
      }
    } catch { /* ignore */ }
  }

  const handleBuyCredits = async (packId: string) => {
    setBuyingPack(packId)
    setBuyError(null)
    try {
      const r = await fetch('/api/credits/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      })
      const d = await r.json()
      if (d.url) {
        window.location.href = d.url
      } else {
        setBuyError(d.error || 'Erreur lors de la création du paiement')
        setBuyingPack(null)
      }
    } catch (e: any) {
      setBuyError(e.message)
      setBuyingPack(null)
    }
  }

  useEffect(() => { fetchUsage(); fetchCredits() }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="text-orange-500 animate-spin" />
    </div>
  )
  if (error || !data) return (
    <div className="text-center py-12">
      <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
      <p className="text-sm text-slate-400">{error || t.common.error}</p>
      <button onClick={fetchUsage} className="mt-2 text-xs text-orange-400 hover:text-orange-300">Réessayer</button>
    </div>
  )

  const { plan, stats, costByProvider, dailyCosts, recentGenerations } = data
  const creditPct = plan.generationsLimit > 0 ? (plan.generationsUsed / plan.generationsLimit) * 100 : 0
  const isUnlimited = plan.generationsLimit === -1

  // Build daily chart (last 14 days)
  const days: string[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  const maxDailyCost = Math.max(...days.map(d => dailyCosts[d] || 0), 0.01)

  const fmtDur = (s: number) => {
    if (s < 60) return `${s.toFixed(0)}s`
    return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-bold text-white">Coûts & Crédits</h2>
        <button onClick={fetchUsage} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <RefreshCw size={16} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Plan & Credits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Plan card */}
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-orange-500" />
              <span className="text-sm font-medium text-slate-200">Plan {plan.name}</span>
            </div>
            <span className="text-lg font-bold text-white">{plan.price > 0 ? `${plan.price}€` : 'Gratuit'}</span>
          </div>
          {/* Credits bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500">Crédits utilisés</span>
              <span className="text-[10px] text-slate-400">
                {isUnlimited ? '∞ illimité' : `${plan.generationsUsed}/${plan.generationsLimit}`}
              </span>
            </div>
            {!isUnlimited && (
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${creditPct > 80 ? 'bg-red-500' : creditPct > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(creditPct, 100)}%` }} />
              </div>
            )}
          </div>
          {!isUnlimited && plan.generationsRemaining <= 5 && (
            <p className="text-[10px] text-yellow-400 flex items-center gap-1">
              <AlertTriangle size={10} /> {plan.generationsRemaining} génération{plan.generationsRemaining > 1 ? 's' : ''} restante{plan.generationsRemaining > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Total cost card */}
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-green-400" />
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Coût total</span>
          </div>
          <span className="text-2xl font-bold text-white">${stats.totalCost.toFixed(2)}</span>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-slate-500">{stats.completed} clips</span>
            <span className="text-[10px] text-slate-500">~${stats.avgCostPerGeneration.toFixed(3)}/clip</span>
          </div>
        </div>

        {/* Duration card */}
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Film size={16} className="text-cyan-400" />
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Contenu généré</span>
          </div>
          <span className="text-2xl font-bold text-white">{fmtDur(stats.totalDurationSeconds)}</span>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-slate-500">{stats.total} requêtes</span>
            {stats.failed > 0 && <span className="text-[10px] text-red-400">{stats.failed} échouée{stats.failed > 1 ? 's' : ''}</span>}
            {stats.processing > 0 && <span className="text-[10px] text-yellow-400">{stats.processing} en cours</span>}
          </div>
        </div>
      </div>

      {/* ═══ Buy Credits Section ═══ */}
      <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-violet-400" />
            <span className="text-sm font-medium text-slate-200">Crédits MISEN</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500">Solde actuel</span>
            <span className="text-sm font-bold text-white bg-violet-500/15 px-2.5 py-0.5 rounded-lg border border-violet-500/20">
              {creditBalance ?? 0} crédits
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mb-4">
          Les crédits permettent de générer directement dans MISEN sans clé API. 1 crédit = 1 génération vidéo (5s).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CREDIT_PACK_OPTIONS.map(pack => (
            <button key={pack.id} onClick={() => handleBuyCredits(pack.id)}
              disabled={buyingPack !== null}
              className={`relative text-left p-4 rounded-xl border transition-all ${
                pack.popular
                  ? 'border-violet-500/40 bg-violet-500/5 hover:bg-violet-500/10 ring-1 ring-violet-500/20'
                  : 'border-dark-600 bg-dark-800 hover:bg-dark-700'
              } ${buyingPack === pack.id ? 'opacity-60' : ''}`}>
              {pack.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full border border-violet-500/30">
                  POPULAIRE
                </span>
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">{pack.name}</span>
                <span className="text-lg font-bold text-white">{pack.price}€</span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-violet-300 font-medium">{pack.credits} crédits</span>
                <span className="text-[10px] text-slate-500">{pack.perCredit}€/crédit</span>
              </div>
              <div className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${pack.popular ? 'bg-violet-600/30 text-violet-200' : 'bg-dark-600 text-slate-300'}`}>
                {buyingPack === pack.id ? (
                  <><Loader2 size={12} className="animate-spin" /> Redirection...</>
                ) : (
                  <><CreditCard size={12} /> Acheter</>
                )}
              </div>
            </button>
          ))}
        </div>
        {buyError && <p className="text-xs text-red-400 mt-2">{buyError}</p>}
      </div>

      {/* Cost by provider */}
      <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-orange-500" />
          <span className="text-sm font-medium text-slate-200">Coût par modèle</span>
        </div>
        {Object.keys(costByProvider).length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">Aucune génération pour l'instant</p>
        ) : (
          <div className="space-y-2.5">
            {Object.entries(costByProvider)
              .sort(([, a], [, b]) => b.cost - a.cost)
              .map(([model, info]) => {
                const maxCost = Math.max(...Object.values(costByProvider).map(v => v.cost), 0.01)
                const pct = (info.cost / maxCost) * 100
                const color = MODEL_COLORS[model] || '#C07B2A'
                return (
                  <div key={model}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-xs text-slate-300">{model}</span>
                        <span className="text-[10px] text-slate-600">{info.count} clips</span>
                      </div>
                      <span className="text-xs text-slate-200 font-medium">${info.cost.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Daily costs chart */}
      <div className="bg-dark-900 rounded-xl border border-dark-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-orange-500" />
          <span className="text-sm font-medium text-slate-200">Dépenses (14 jours)</span>
        </div>
        <div className="flex items-end gap-1 h-24">
          {days.map(day => {
            const cost = dailyCosts[day] || 0
            const h = maxDailyCost > 0 ? (cost / maxDailyCost) * 100 : 0
            const isToday = day === new Date().toISOString().slice(0, 10)
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1 group" title={`${day}: $${cost.toFixed(2)}`}>
                <div className="w-full relative" style={{ height: '100%' }}>
                  <div className={`absolute bottom-0 left-0 right-0 rounded-t transition-all ${isToday ? 'bg-orange-500' : 'bg-orange-500/40'} group-hover:bg-orange-400`}
                    style={{ height: `${Math.max(h, 2)}%` }} />
                </div>
                <span className={`text-[7px] ${isToday ? 'text-orange-400' : 'text-slate-600'}`}>
                  {day.slice(8)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent generations */}
      <div className="bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-dark-700 flex items-center gap-2">
          <Clock size={16} className="text-orange-500" />
          <span className="text-sm font-medium text-slate-200">Dernières générations</span>
        </div>
        {recentGenerations.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Aucune génération</p>
        ) : (
          <div className="divide-y divide-dark-700/50">
            {recentGenerations.slice(0, 10).map(g => {
              const st = STATUS_LABELS[g.status] || STATUS_LABELS.pending
              const color = MODEL_COLORS[g.model] || '#C07B2A'
              return (
                <div key={g.id} className="px-4 py-2.5 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-xs text-slate-300 flex-1">{g.model || '—'}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${st.class}`}>{st.label}</span>
                  <span className="text-[10px] text-slate-500 w-14 text-right">${(g.cost || 0).toFixed(3)}</span>
                  <span className="text-[10px] text-slate-600 w-16 text-right">
                    {new Date(g.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
