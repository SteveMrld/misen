'use client'

import { useMemo } from 'react'
import {
  Film, Eye, DollarSign, Shield, TrendingUp, AlertTriangle,
  Download, Clock, CheckCircle, XCircle, Users, Zap
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { getModelColor } from '@/components/ui/model-badge'

interface OverviewCockpitProps {
  analysis: any
  projectName?: string
  onNavigate?: (tab: string) => void
}

export function OverviewCockpit({ analysis, projectName, onNavigate }: OverviewCockpitProps) {
  const { t } = useI18n()

  const scenes = analysis?.scenes || []
  const plans = analysis?.plans || []
  const tension = analysis?.tension
  const chars = analysis?.characterBible || []
  const compliance = analysis?.compliance || { level: 'OK', score: 100, flags: [] }
  const continuity = analysis?.continuity || { score: 100, alerts: [] }
  const costTotal = analysis?.costTotal || 0

  // Model distribution
  const modelStats = useMemo(() => {
    const counts: Record<string, number> = {}
    plans.forEach((p: any) => {
      const m = p?.modelId || 'kling'
      counts[m] = (counts[m] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([model, count]) => ({
        model,
        count,
        pct: plans.length > 0 ? (count / plans.length) * 100 : 0,
        color: getModelColor(model),
      }))
  }, [plans])

  // Total estimated duration
  const totalDuration = useMemo(() =>
    plans.reduce((s: number, p: any) => s + (p?.estimatedDuration || 3), 0),
    [plans]
  )

  // Tension stats
  const tensionCurve = tension?.curve || []
  const tensionMax = tensionCurve.length > 0
    ? Math.max(...tensionCurve.map((c: any) => c?.tension || 0), 1)
    : 1

  // Export formats
  const exportFormats = ['PDF', 'HTML', 'JSON', 'CSV', 'Fountain', 'Prompts TXT']

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Eye size={48} className="text-slate-700 mb-4" />
        <h3 className="text-lg font-medium text-slate-300 mb-2">{t.project.cockpit.noAnalysis}</h3>
        <p className="text-sm text-slate-500 text-center max-w-md">{t.project.cockpit.noAnalysisDesc}</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ═══ KPI Cards ═══ */}
      <div data-tour="cockpit-kpis" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI icon={Film} label={t.project.cockpit.totalScenes} value={scenes.length} color="text-orange-500" onClick={() => onNavigate?.('analyse')} />
        <KPI icon={Eye} label={t.project.cockpit.totalShots} value={plans.length} color="text-blue-400" onClick={() => onNavigate?.('analyse')} />
        <KPI icon={DollarSign} label={t.project.cockpit.totalBudget} value={`${costTotal.toFixed(2)}`} color="text-green-400" onClick={() => onNavigate?.("analyse")} />
        <KPI icon={Shield} label={t.project.cockpit.continuityScore} value={`${continuity.score}%`} color={continuity.score >= 80 ? 'text-green-400' : 'text-yellow-400'} onClick={() => onNavigate?.("analyse")} />
        <KPI icon={Clock} label={t.project.cockpit.avgDuration} value={fmtDur(totalDuration)} color="text-cyan-400" onClick={() => onNavigate?.("timeline")} />
        <KPI icon={Users} label={t.project.cockpit.characters} value={chars.length} color="text-purple-400" onClick={() => onNavigate?.("analyse")} />
      </div>

      {/* ═══ Row: Pie Chart + Tension Curve ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Model Distribution — Pie Chart */}
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-orange-400" />
            <span className="text-sm font-medium text-slate-200">{t.project.cockpit.modelDistribution}</span>
          </div>
          <div className="flex items-center gap-6">
            {/* SVG Pie Chart */}
            <div className="flex-shrink-0">
              <PieChart data={modelStats} size={140} />
            </div>
            {/* Legend */}
            <div className="flex-1 space-y-2">
              {modelStats.map(({ model, count, pct, color }) => (
                <div key={model} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-xs text-slate-300 flex-1 truncate">{model}</span>
                  <span className="text-xs text-slate-500 tabular-nums">{count}</span>
                  <span className="text-[10px] text-slate-600 tabular-nums w-10 text-right">{pct.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tension Curve — Mini */}
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-red-400" />
              <span className="text-sm font-medium text-slate-200">{t.project.cockpit.tensionCurve}</span>
            </div>
            {tension && (
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span>Arc: <span className="text-slate-300">{tension.arc || 'standard'}</span></span>
                <span>{t.project.cockpit.avg}: <span className="text-slate-300">{tension.mean?.toFixed(0) || 0}</span></span>
              </div>
            )}
          </div>
          {tensionCurve.length > 0 ? (
            <div className="relative h-24">
              {/* SVG smooth curve */}
              <svg viewBox={`0 0 ${tensionCurve.length * 40} 100`} className="w-full h-full" preserveAspectRatio="none">
                {/* Grid */}
                <line x1="0" y1="25" x2={tensionCurve.length * 40} y2="25" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <line x1="0" y1="50" x2={tensionCurve.length * 40} y2="50" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <line x1="0" y1="75" x2={tensionCurve.length * 40} y2="75" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                {/* Area fill */}
                <path
                  d={buildAreaPath(tensionCurve, tensionMax)}
                  fill="url(#tensionGradient)"
                />
                {/* Line */}
                <path
                  d={buildLinePath(tensionCurve, tensionMax)}
                  stroke="#f97316"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Dots */}
                {tensionCurve.map((pt: any, i: number) => {
                  const x = i * 40 + 20
                  const y = 100 - ((pt?.tension || 0) / tensionMax) * 90 - 5
                  return <circle key={i} cx={x} cy={y} r="3" fill="#f97316" stroke="#1e1e2e" strokeWidth="1.5" />
                })}
                <defs>
                  <linearGradient id="tensionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Labels */}
              <div className="flex justify-between mt-1 px-2">
                {tensionCurve.map((_: any, i: number) => (
                  <span key={i} className="text-[9px] text-slate-600">S{i + 1}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-sm text-slate-600">—</div>
          )}
        </div>
      </div>

      {/* ═══ Row: Continuity Alerts + Compliance + Export ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Continuity Alerts */}
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-yellow-400" />
            <span className="text-sm font-medium text-slate-200">{t.project.cockpit.continuityAlerts}</span>
            <span className="ml-auto text-xs text-slate-500">{continuity.score}/100</span>
          </div>
          {continuity.alerts?.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {continuity.alerts.map((a: any, i: number) => (
                <div key={i} className="flex items-start gap-2 py-1.5 border-b border-dark-700/50 last:border-0">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium mt-0.5 ${
                    a?.severity === 'critical' ? 'bg-red-600/20 text-red-300' :
                    a?.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {(a?.severity || 'medium').toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 leading-relaxed">{a?.type || a?.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 py-3">
              <CheckCircle size={14} className="text-green-400" />
              <span className="text-xs text-green-400">{t.project.cockpit.noAlerts}</span>
            </div>
          )}
        </div>

        {/* Compliance */}
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className={compliance.level === 'OK' ? 'text-green-400' : 'text-yellow-400'} />
            <span className="text-sm font-medium text-slate-200">{t.project.cockpit.complianceStatus}</span>
            <span className={`ml-auto text-xs font-medium ${compliance.level === 'OK' ? 'text-green-400' : 'text-yellow-400'}`}>
              {compliance.level} — {compliance.score}/100
            </span>
          </div>
          {compliance.flags?.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {compliance.flags.map((f: any, i: number) => (
                <div key={i} className="flex items-start gap-2 py-1.5 border-b border-dark-700/50 last:border-0">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium mt-0.5 ${
                    f?.severity === 'critical' ? 'bg-red-600/20 text-red-300' :
                    f?.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {(f?.severity || 'medium').toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 leading-relaxed">{f?.type || f?.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 py-3">
              <CheckCircle size={14} className="text-green-400" />
              <span className="text-xs text-green-400">{t.project.cockpit.noFlags}</span>
            </div>
          )}
        </div>

        {/* Export Status */}
        <div className="bg-dark-900 rounded-xl border border-dark-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Download size={16} className="text-cyan-400" />
            <span className="text-sm font-medium text-slate-200">{t.project.cockpit.exportStatus}</span>
          </div>
          <div className="space-y-2">
            {exportFormats.map((fmt) => (
              <div key={fmt} className="flex items-center justify-between py-1.5 border-b border-dark-700/30 last:border-0">
                <span className="text-xs text-slate-300">{fmt}</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={12} className="text-green-400" />
                  <span className="text-[10px] text-green-400">{t.project.cockpit.ready}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-3">{exportFormats.length} {t.project.cockpit.formats}</p>
        </div>
      </div>
    </div>
  )
}

// ═══ KPI Card ═══
function KPI({ icon: I, label, value, color, onClick }: { icon: any; label: string; value: string | number; color: string; onClick?: () => void }) {
  return (
    <div className={`bg-dark-900 border border-dark-700 rounded-xl p-3.5 text-center transition-colors ${onClick ? "cursor-pointer hover:border-orange-500/30 hover:bg-dark-800/50" : "hover:border-dark-600"}`} onClick={onClick}>
      <I size={18} className={`${color} mx-auto mb-1.5 opacity-70`} />
      <p className="text-lg font-bold text-slate-100 tabular-nums">{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

// ═══ Pie Chart SVG ═══
function PieChart({ data, size = 140 }: { data: { model: string; pct: number; color: string }[]; size?: number }) {
  const r = size / 2 - 8
  const cx = size / 2
  const cy = size / 2

  if (data.length === 0) {
    return (
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={24} />
      </svg>
    )
  }

  let cumAngle = -90 // start from top
  const slices = data.map(({ pct, color }) => {
    const startAngle = cumAngle
    const sweep = (pct / 100) * 360
    cumAngle += sweep
    return { startAngle, sweep, color }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => {
        const start = polarToCartesian(cx, cy, r, s.startAngle)
        const end = polarToCartesian(cx, cy, r, s.startAngle + s.sweep)
        const largeArc = s.sweep > 180 ? 1 : 0
        if (s.sweep >= 359.9) {
          // Full circle
          return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={24} />
        }
        return (
          <path
            key={i}
            d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`}
            fill="none"
            stroke={s.color}
            strokeWidth={24}
            strokeLinecap="butt"
          />
        )
      })}
      {/* Center text */}
      <text x={cx} y={cy - 4} textAnchor="middle" className="text-xl font-bold" fill="#e2e8f0">
        {data.reduce((s, d) => s + Math.round(d.pct * data.length / 100), 0) || data.length}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="text-[10px]" fill="#64748b">
        {data.length > 1 ? 'models' : 'model'}
      </text>
    </svg>
  )
}

// ═══ Helpers ═══
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function fmtDur(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}m${s > 0 ? ` ${s}s` : ''}`
}

function buildLinePath(curve: any[], maxVal: number): string {
  if (curve.length === 0) return ''
  return curve.map((pt: any, i: number) => {
    const x = i * 40 + 20
    const y = 100 - ((pt?.tension || 0) / maxVal) * 90 - 5
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
}

function buildAreaPath(curve: any[], maxVal: number): string {
  if (curve.length === 0) return ''
  const w = curve.length * 40
  const points = curve.map((pt: any, i: number) => {
    const x = i * 40 + 20
    const y = 100 - ((pt?.tension || 0) / maxVal) * 90 - 5
    return `${x} ${y}`
  })
  return `M 20 100 L ${points.join(' L ')} L ${w - 20} 100 Z`
}
