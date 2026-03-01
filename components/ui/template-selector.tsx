'use client'

import { useState } from 'react'
import { Sparkles, Film, Eye, DollarSign, Clock, ChevronRight, X, TrendingUp } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { SCENARIO_TEMPLATES, type ScenarioTemplate } from '@/lib/data/templates'
import { getModelColor } from '@/components/ui/model-badge'

interface TemplateSelectorProps {
  onUseTemplate: (script: string, name: string, stylePreset: string, analysis?: any) => void
}

export function TemplateSelector({ onUseTemplate }: TemplateSelectorProps) {
  const { t, locale } = useI18n()
  const [expanded, setExpanded] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)

  const previewTemplate = previewId
    ? SCENARIO_TEMPLATES.find(t => t.id === previewId) || null
    : null

  const handleUse = (template: ScenarioTemplate) => {
    onUseTemplate(
      template.script,
      template.title[locale],
      template.style_preset,
      template.analysis
    )
    setExpanded(false)
    setPreviewId(null)
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl hover:border-orange-500/30 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Sparkles size={16} className="text-orange-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-slate-200">{t.project.templates.title}</p>
            <p className="text-xs text-slate-500">{t.project.templates.subtitle}</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-500 group-hover:text-orange-400 transition-colors" />
      </button>
    )
  }

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-orange-400" />
          <span className="text-sm font-medium text-slate-200">{t.project.templates.title}</span>
        </div>
        <button onClick={() => { setExpanded(false); setPreviewId(null) }} className="p-1 rounded hover:bg-white/5">
          <X size={16} className="text-slate-400" />
        </button>
      </div>

      {/* Template grid */}
      <div className="p-3">
        {previewTemplate ? (
          <TemplatePreview
            template={previewTemplate}
            locale={locale}
            t={t}
            onUse={() => handleUse(previewTemplate)}
            onBack={() => setPreviewId(null)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {SCENARIO_TEMPLATES.map((tmpl) => (
              <TemplateCard
                key={tmpl.id}
                template={tmpl}
                locale={locale}
                t={t}
                onPreview={() => setPreviewId(tmpl.id)}
                onUse={() => handleUse(tmpl)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══ Template Card ═══
function TemplateCard({ template, locale, t, onPreview, onUse }: {
  template: ScenarioTemplate
  locale: 'fr' | 'en'
  t: any
  onPreview: () => void
  onUse: () => void
}) {
  const category = t.project.templates.categories[template.category] || template.category

  return (
    <div className="bg-dark-800/60 border border-dark-700 rounded-lg p-3.5 hover:border-dark-600 transition-all group">
      <div className="flex items-start gap-3 mb-2.5">
        <span className="text-xl">{template.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-200 truncate">{template.title[locale]}</h4>
          <p className="text-[10px] text-slate-500">{category}</p>
        </div>
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: template.color }} />
      </div>
      <p className="text-xs text-slate-400 italic mb-3">{template.tagline[locale]}</p>

      {/* Mini stats */}
      <div className="flex items-center gap-3 mb-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><Film size={10} /> {template.stats.scenes} {t.project.templates.scenes}</span>
        <span className="flex items-center gap-1"><Eye size={10} /> {template.stats.plans} {t.project.templates.shots}</span>
        <span className="flex items-center gap-1"><DollarSign size={10} /> {template.stats.cost}</span>
        <span className="flex items-center gap-1"><Clock size={10} /> {template.stats.duration}</span>
      </div>

      {/* Model bar */}
      <div className="flex h-1.5 rounded-full overflow-hidden mb-3">
        {(() => {
          const counts: Record<string, number> = {}
          template.analysis.plans.forEach(p => {
            counts[p.modelId] = (counts[p.modelId] || 0) + 1
          })
          const total = template.analysis.plans.length
          return Object.entries(counts).map(([mid, count]) => (
            <div
              key={mid}
              className="h-full"
              style={{ width: `${(count / total) * 100}%`, backgroundColor: getModelColor(mid) }}
              title={`${mid}: ${count}`}
            />
          ))
        })()}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onPreview}
          className="flex-1 py-1.5 bg-dark-700 hover:bg-dark-600 text-slate-300 text-[11px] font-medium rounded-lg transition-colors"
        >
          {t.project.templates.preview}
        </button>
        <button
          onClick={onUse}
          className="flex-1 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-medium rounded-lg transition-colors"
        >
          {t.project.templates.useTemplate}
        </button>
      </div>
    </div>
  )
}

// ═══ Template Preview ═══
function TemplatePreview({ template, locale, t, onUse, onBack }: {
  template: ScenarioTemplate
  locale: 'fr' | 'en'
  t: any
  onUse: () => void
  onBack: () => void
}) {
  const plans = template.analysis.plans
  const tension = template.analysis.tension
  const maxTension = Math.max(...tension.curve.map(c => c.tension), 1)

  // Model distribution
  const modelCounts: Record<string, number> = {}
  plans.forEach(p => { modelCounts[p.modelId] = (modelCounts[p.modelId] || 0) + 1 })
  const modelEntries = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-4">
      {/* Back + Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-xs text-slate-400 hover:text-slate-200">← {locale === 'fr' ? 'Retour' : 'Back'}</button>
          <span className="text-xl">{template.icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">{template.title[locale]}</h3>
            <p className="text-[10px] text-slate-500">{template.genre[locale]}</p>
          </div>
        </div>
        <button
          onClick={onUse}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium rounded-lg transition-colors"
        >
          {t.project.templates.useTemplate}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MiniStat icon={Film} label={t.project.templates.scenes} value={template.stats.scenes} />
        <MiniStat icon={Eye} label={t.project.templates.shots} value={template.stats.plans} />
        <MiniStat icon={DollarSign} label={t.project.cockpit.totalBudget} value={template.stats.cost} />
        <MiniStat icon={Clock} label={t.project.cockpit.avgDuration} value={template.stats.duration} />
      </div>

      {/* Two columns: Model dist + Tension */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Model distribution */}
        <div className="bg-dark-800/60 rounded-lg border border-dark-700 p-3">
          <p className="text-[11px] text-slate-400 mb-2">{t.project.cockpit.modelDistribution}</p>
          <div className="flex h-2 rounded-full overflow-hidden mb-2">
            {modelEntries.map(([mid, count]) => (
              <div key={mid} className="h-full" style={{ width: `${(count / plans.length) * 100}%`, backgroundColor: getModelColor(mid) }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {modelEntries.map(([mid, count]) => (
              <div key={mid} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getModelColor(mid) }} />
                <span className="text-[10px] text-slate-400">{mid} ({count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tension curve */}
        <div className="bg-dark-800/60 rounded-lg border border-dark-700 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-slate-400">{t.project.cockpit.tensionCurve}</p>
            <span className="text-[10px] text-slate-500">arc: {tension.arc}</span>
          </div>
          <div className="flex items-end gap-px h-12">
            {tension.curve.map((pt, i) => {
              const h = Math.max((pt.tension / maxTension) * 100, 8)
              const intensity = pt.tension / maxTension
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: `${h}%`,
                      backgroundColor: intensity > 0.7 ? 'rgba(239,68,68,0.7)' : intensity > 0.4 ? 'rgba(249,115,22,0.5)' : 'rgba(249,115,22,0.25)'
                    }}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-1">
            {tension.curve.map((_, i) => (
              <span key={i} className="text-[8px] text-slate-600 flex-1 text-center">S{i + 1}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Script preview */}
      <div className="bg-dark-800/60 rounded-lg border border-dark-700 p-3">
        <p className="text-[11px] text-slate-400 mb-2">Script</p>
        <pre className="text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
          {template.script.slice(0, 500)}{template.script.length > 500 ? '…' : ''}
        </pre>
      </div>
    </div>
  )
}

// ═══ Mini Stat ═══
function MiniStat({ icon: I, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="bg-dark-800/60 rounded-lg border border-dark-700 p-2.5 text-center">
      <I size={14} className="text-orange-500/60 mx-auto mb-1" />
      <p className="text-sm font-bold text-slate-200 tabular-nums">{value}</p>
      <p className="text-[9px] text-slate-500">{label}</p>
    </div>
  )
}
