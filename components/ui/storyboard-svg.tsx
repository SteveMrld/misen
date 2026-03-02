'use client'

/**
 * MISEN V7 — Storyboard SVG Compositions
 * Generates visual placeholders showing framing, camera movement, and composition
 * These replace blank cards until real images are available
 */

const SHOT_CONFIGS: Record<string, { label: string; subject: (w: number, h: number) => string; frame: (w: number, h: number) => string }> = {
  'plan large': {
    label: 'WIDE',
    subject: (w, h) => `<ellipse cx="${w*0.5}" cy="${h*0.6}" rx="${w*0.06}" ry="${h*0.12}" fill="none" stroke="#C07B2A" stroke-width="1.5" opacity="0.7"/>
      <line x1="${w*0.5}" y1="${h*0.48}" x2="${w*0.5}" y2="${h*0.35}" stroke="#C07B2A" stroke-width="1" opacity="0.5"/>
      <circle cx="${w*0.5}" cy="${h*0.32}" r="${w*0.025}" fill="none" stroke="#C07B2A" stroke-width="1.5" opacity="0.7"/>`,
    frame: (w, h) => `<line x1="${w*0.1}" y1="${h*0.75}" x2="${w*0.9}" y2="${h*0.75}" stroke="#252B3B" stroke-width="1" stroke-dasharray="4,4"/>
      <rect x="${w*0.05}" y="${h*0.05}" width="${w*0.9}" height="${h*0.9}" rx="4" fill="none" stroke="#252B3B" stroke-width="1"/>`,
  },
  'plan moyen': {
    label: 'MEDIUM',
    subject: (w, h) => `<ellipse cx="${w*0.5}" cy="${h*0.55}" rx="${w*0.1}" ry="${h*0.18}" fill="none" stroke="#C07B2A" stroke-width="1.5" opacity="0.7"/>
      <line x1="${w*0.5}" y1="${h*0.37}" x2="${w*0.5}" y2="${h*0.2}" stroke="#C07B2A" stroke-width="1.2" opacity="0.5"/>
      <circle cx="${w*0.5}" cy="${h*0.16}" r="${w*0.045}" fill="none" stroke="#C07B2A" stroke-width="1.5" opacity="0.7"/>`,
    frame: (w, h) => `<rect x="${w*0.15}" y="${h*0.05}" width="${w*0.7}" height="${h*0.9}" rx="4" fill="none" stroke="#252B3B" stroke-width="1"/>`,
  },
  'gros plan': {
    label: 'CLOSE',
    subject: (w, h) => `<circle cx="${w*0.5}" cy="${h*0.45}" r="${w*0.18}" fill="none" stroke="#C07B2A" stroke-width="2" opacity="0.8"/>
      <ellipse cx="${w*0.42}" cy="${h*0.4}" rx="${w*0.025}" ry="${h*0.02}" fill="#C07B2A" opacity="0.4"/>
      <ellipse cx="${w*0.58}" cy="${h*0.4}" rx="${w*0.025}" ry="${h*0.02}" fill="#C07B2A" opacity="0.4"/>`,
    frame: (w, h) => `<rect x="${w*0.25}" y="${h*0.1}" width="${w*0.5}" height="${h*0.8}" rx="4" fill="none" stroke="#252B3B" stroke-width="1"/>`,
  },
  'très gros plan': {
    label: 'ECU',
    subject: (w, h) => `<circle cx="${w*0.5}" cy="${h*0.5}" r="${w*0.25}" fill="none" stroke="#C07B2A" stroke-width="2" opacity="0.8"/>
      <ellipse cx="${w*0.42}" cy="${h*0.45}" rx="${w*0.035}" ry="${h*0.025}" fill="#C07B2A" opacity="0.5"/>
      <ellipse cx="${w*0.58}" cy="${h*0.45}" rx="${w*0.035}" ry="${h*0.025}" fill="#C07B2A" opacity="0.5"/>`,
    frame: (w, h) => `<rect x="${w*0.35}" y="${h*0.15}" width="${w*0.3}" height="${h*0.7}" rx="4" fill="none" stroke="#252B3B" stroke-width="1"/>`,
  },
  'insert': {
    label: 'INSERT',
    subject: (w, h) => `<rect x="${w*0.3}" y="${h*0.3}" width="${w*0.4}" height="${h*0.35}" rx="3" fill="none" stroke="#C07B2A" stroke-width="1.5" opacity="0.7"/>
      <line x1="${w*0.35}" y1="${h*0.65}" x2="${w*0.65}" y2="${h*0.35}" stroke="#C07B2A" stroke-width="0.8" opacity="0.3"/>`,
    frame: (w, h) => `<rect x="${w*0.2}" y="${h*0.15}" width="${w*0.6}" height="${h*0.7}" rx="4" fill="none" stroke="#252B3B" stroke-width="1"/>`,
  },
}

const MOVE_OVERLAYS: Record<string, (w: number, h: number) => string> = {
  'pan right': (w, h) => `<line x1="${w*0.3}" y1="${h*0.5}" x2="${w*0.7}" y2="${h*0.5}" stroke="#06B6D4" stroke-width="1.5" opacity="0.6"/>
    <polygon points="${w*0.7},${h*0.5} ${w*0.65},${h*0.45} ${w*0.65},${h*0.55}" fill="#06B6D4" opacity="0.6"/>`,
  'pan left': (w, h) => `<line x1="${w*0.7}" y1="${h*0.5}" x2="${w*0.3}" y2="${h*0.5}" stroke="#06B6D4" stroke-width="1.5" opacity="0.6"/>
    <polygon points="${w*0.3},${h*0.5} ${w*0.35},${h*0.45} ${w*0.35},${h*0.55}" fill="#06B6D4" opacity="0.6"/>`,
  'tilt up': (w, h) => `<line x1="${w*0.5}" y1="${h*0.7}" x2="${w*0.5}" y2="${h*0.3}" stroke="#06B6D4" stroke-width="1.5" opacity="0.6"/>
    <polygon points="${w*0.5},${h*0.3} ${w*0.45},${h*0.35} ${w*0.55},${h*0.35}" fill="#06B6D4" opacity="0.6"/>`,
  'tilt down': (w, h) => `<line x1="${w*0.5}" y1="${h*0.3}" x2="${w*0.5}" y2="${h*0.7}" stroke="#06B6D4" stroke-width="1.5" opacity="0.6"/>
    <polygon points="${w*0.5},${h*0.7} ${w*0.45},${h*0.65} ${w*0.55},${h*0.65}" fill="#06B6D4" opacity="0.6"/>`,
  'dolly in': (w, h) => `<circle cx="${w*0.5}" cy="${h*0.5}" r="${w*0.2}" fill="none" stroke="#06B6D4" stroke-width="1" opacity="0.3"/>
    <circle cx="${w*0.5}" cy="${h*0.5}" r="${w*0.12}" fill="none" stroke="#06B6D4" stroke-width="1.5" opacity="0.5"/>
    <polygon points="${w*0.5},${h*0.38} ${w*0.47},${h*0.42} ${w*0.53},${h*0.42}" fill="#06B6D4" opacity="0.6"/>`,
  'dolly out': (w, h) => `<circle cx="${w*0.5}" cy="${h*0.5}" r="${w*0.12}" fill="none" stroke="#06B6D4" stroke-width="1.5" opacity="0.5"/>
    <circle cx="${w*0.5}" cy="${h*0.5}" r="${w*0.2}" fill="none" stroke="#06B6D4" stroke-width="1" opacity="0.3"/>
    <polygon points="${w*0.5},${h*0.62} ${w*0.47},${h*0.58} ${w*0.53},${h*0.58}" fill="#06B6D4" opacity="0.6"/>`,
  'tracking': (w, h) => `<path d="M${w*0.2},${h*0.5} Q${w*0.4},${h*0.35} ${w*0.5},${h*0.5} Q${w*0.6},${h*0.65} ${w*0.8},${h*0.5}" fill="none" stroke="#06B6D4" stroke-width="1.5" opacity="0.5"/>
    <polygon points="${w*0.8},${h*0.5} ${w*0.75},${h*0.45} ${w*0.75},${h*0.55}" fill="#06B6D4" opacity="0.6"/>`,
  'orbit': (w, h) => `<ellipse cx="${w*0.5}" cy="${h*0.5}" rx="${w*0.2}" ry="${h*0.15}" fill="none" stroke="#06B6D4" stroke-width="1.5" opacity="0.4" stroke-dasharray="4,3"/>
    <polygon points="${w*0.7},${h*0.5} ${w*0.67},${h*0.44} ${w*0.67},${h*0.56}" fill="#06B6D4" opacity="0.6"/>`,
  'crane': (w, h) => `<path d="M${w*0.3},${h*0.7} Q${w*0.5},${h*0.2} ${w*0.7},${h*0.3}" fill="none" stroke="#06B6D4" stroke-width="1.5" opacity="0.5"/>
    <polygon points="${w*0.7},${h*0.3} ${w*0.66},${h*0.27} ${w*0.66},${h*0.35}" fill="#06B6D4" opacity="0.6"/>`,
  'handheld': (w, h) => `<path d="M${w*0.25},${h*0.45} L${w*0.35},${h*0.55} L${w*0.45},${h*0.42} L${w*0.55},${h*0.58} L${w*0.65},${h*0.44} L${w*0.75},${h*0.52}" fill="none" stroke="#06B6D4" stroke-width="1.5" opacity="0.4"/>`,
  'static': () => '',
  'fixe': () => '',
}

function matchShot(type: string): string {
  const t = (type || '').toLowerCase().trim()
  for (const key of Object.keys(SHOT_CONFIGS)) {
    if (t.includes(key)) return key
  }
  if (t.includes('wide') || t.includes('establishing') || t.includes('master')) return 'plan large'
  if (t.includes('medium') || t.includes('waist') || t.includes('american')) return 'plan moyen'
  if (t.includes('close') || t.includes('ecu') || t.includes('detail')) return 'gros plan'
  if (t.includes('insert')) return 'insert'
  return 'plan moyen'
}

function matchMove(move: string): string {
  const m = (move || '').toLowerCase().trim()
  for (const key of Object.keys(MOVE_OVERLAYS)) {
    if (m.includes(key)) return key
  }
  if (m.includes('panoramique') && (m.includes('droite') || m.includes('right'))) return 'pan right'
  if (m.includes('panoramique') && (m.includes('gauche') || m.includes('left'))) return 'pan left'
  if (m.includes('plongée') || m.includes('contre')) return 'tilt up'
  if (m.includes('travelling') && m.includes('avant')) return 'dolly in'
  if (m.includes('travelling') && m.includes('arrière')) return 'dolly out'
  if (m.includes('travelling')) return 'tracking'
  if (m.includes('grue') || m.includes('crane')) return 'crane'
  if (m.includes('épaule') || m.includes('hand')) return 'handheld'
  if (m.includes('orbite') || m.includes('orbit') || m.includes('circulaire')) return 'orbit'
  return 'static'
}

interface StoryboardSVGProps {
  shotType?: string
  cameraMove?: string
  width?: number
  height?: number
  modelColor?: string
  className?: string
}

export function StoryboardSVG({ shotType = '', cameraMove = '', width = 240, height = 135, modelColor = '#C07B2A', className = '' }: StoryboardSVGProps) {
  const shot = matchShot(shotType)
  const move = matchMove(cameraMove)
  const config = SHOT_CONFIGS[shot] || SHOT_CONFIGS['plan moyen']
  const moveOverlay = MOVE_OVERLAYS[move] || (() => '')

  // Rule of thirds grid
  const thirds = `
    <line x1="${width/3}" y1="0" x2="${width/3}" y2="${height}" stroke="#252B3B" stroke-width="0.5" opacity="0.4"/>
    <line x1="${width*2/3}" y1="0" x2="${width*2/3}" y2="${height}" stroke="#252B3B" stroke-width="0.5" opacity="0.4"/>
    <line x1="0" y1="${height/3}" x2="${width}" y2="${height/3}" stroke="#252B3B" stroke-width="0.5" opacity="0.4"/>
    <line x1="0" y1="${height*2/3}" x2="${width}" y2="${height*2/3}" stroke="#252B3B" stroke-width="0.5" opacity="0.4"/>
  `

  // Label
  const label = `<text x="${width-8}" y="14" text-anchor="end" font-family="Inter,system-ui,sans-serif" font-size="9" font-weight="600" fill="${modelColor}" opacity="0.7">${config.label}</text>`

  const svgContent = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" rx="6" fill="#0C0F1A"/>
      ${thirds}
      ${config.frame(width, height)}
      ${config.subject(width, height)}
      ${moveOverlay(width, height)}
      ${label}
    </svg>
  `

  return (
    <div className={`rounded-lg overflow-hidden ${className}`} style={{ width, height }}
         dangerouslySetInnerHTML={{ __html: svgContent }} />
  )
}

// Compact version for timeline clips
export function StoryboardThumb({ shotType = '', cameraMove = '', modelColor = '#C07B2A' }: { shotType?: string; cameraMove?: string; modelColor?: string }) {
  return <StoryboardSVG shotType={shotType} cameraMove={cameraMove} width={120} height={68} modelColor={modelColor} />
}

// Full card version with info overlay
export function StoryboardCard({
  planIndex, shotType = '', cameraMove = '', modelId = '', modelColor = '#C07B2A',
  prompt = '', duration = 0, cost = 0, className = ''
}: {
  planIndex: number; shotType?: string; cameraMove?: string; modelId?: string; modelColor?: string;
  prompt?: string; duration?: number; cost?: number; className?: string
}) {
  return (
    <div className={`card overflow-hidden group hover:border-dark-600 transition-all ${className}`}>
      <div className="relative">
        <StoryboardSVG shotType={shotType} cameraMove={cameraMove} width={320} height={180} modelColor={modelColor} />
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-dark-850 to-transparent" />
        {/* Plan number badge */}
        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-dark-950/80 rounded text-[10px] font-bold text-slate-300 backdrop-blur-sm">
          P{planIndex + 1}
        </div>
        {/* Model badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-dark-950/80 rounded backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: modelColor }} />
          <span className="text-[10px] font-medium text-slate-300">{modelId || 'auto'}</span>
        </div>
        {/* Shot info */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          <span className="text-[10px] text-slate-400">{shotType}</span>
          {cameraMove && cameraMove !== 'static' && cameraMove !== 'fixe' && (
            <span className="text-[10px] text-cyan-400/70">{cameraMove}</span>
          )}
        </div>
        {/* Duration + cost */}
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          {duration > 0 && <span className="text-[10px] text-slate-500">{duration.toFixed(1)}s</span>}
          {cost > 0 && <span className="text-[10px] text-slate-500">${cost.toFixed(3)}</span>}
        </div>
      </div>
      {prompt && (
        <div className="px-3 py-2 border-t border-dark-700">
          <p className="text-[11px] text-slate-500 font-mono leading-relaxed line-clamp-2">{prompt}</p>
        </div>
      )}
    </div>
  )
}
