'use client'

const MODELS: Record<string, { name: string; version: string; color: string }> = {
  kling: { name: 'Kling', version: '2.1', color: '#3B82F6' },
  kling3: { name: 'Kling', version: '3.0', color: '#3B82F6' },
  runway: { name: 'Runway', version: 'Gen-4', color: '#8B5CF6' },
  'runway4.5': { name: 'Runway', version: 'Gen-4.5', color: '#8B5CF6' },
  sora: { name: 'Sora', version: '2', color: '#EC4899' },
  sora2: { name: 'Sora', version: '2', color: '#EC4899' },
  veo: { name: 'Veo', version: '3', color: '#10B981' },
  'veo3.1': { name: 'Veo', version: '3.1', color: '#10B981' },
  seedance: { name: 'Seedance', version: '2.0', color: '#14B8A6' },
  seedance2: { name: 'Seedance', version: '2.0', color: '#14B8A6' },
  wan: { name: 'Wan', version: '2.1', color: '#6366F1' },
  'wan2.5': { name: 'Wan', version: '2.5', color: '#6366F1' },
  hailuo: { name: 'Hailuo', version: '2.3', color: '#D946EF' },
  'hailuo2.3': { name: 'Hailuo', version: '2.3', color: '#D946EF' },
}

export function getModelInfo(id: string) {
  const key = (id || 'kling').toLowerCase().replace(/[\s\-]/g, '')
  return MODELS[key] || { name: id || 'Auto', version: '', color: '#F97316' }
}

export function getModelColor(id: string): string {
  return getModelInfo(id).color
}

export function ModelBadge({ modelId, size = 'sm' }: { modelId: string; size?: 'xs' | 'sm' | 'md' }) {
  const m = getModelInfo(modelId)
  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-2.5 py-1 gap-2',
  }
  const dotSizes = { xs: 'w-1.5 h-1.5', sm: 'w-2 h-2', md: 'w-2.5 h-2.5' }

  return (
    <span className={`inline-flex items-center rounded-md font-medium ${sizes[size]}`}
          style={{ backgroundColor: `${m.color}15`, color: m.color }}>
      <span className={`${dotSizes[size]} rounded-full`} style={{ backgroundColor: m.color }} />
      {m.name}{m.version && size !== 'xs' ? ` ${m.version}` : ''}
    </span>
  )
}

export function ModelDot({ modelId, size = 8 }: { modelId: string; size?: number }) {
  const m = getModelInfo(modelId)
  return <span className="rounded-full inline-block" style={{ width: size, height: size, backgroundColor: m.color }} />
}

export function ModelLegend({ className = '' }: { className?: string }) {
  const unique = ['kling3', 'runway4.5', 'sora2', 'veo3.1', 'seedance2', 'wan2.5', 'hailuo2.3']
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {unique.map(id => {
        const m = getModelInfo(id)
        return (
          <div key={id} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
            <span className="text-[11px] text-slate-400">{m.name}</span>
          </div>
        )
      })}
    </div>
  )
}
