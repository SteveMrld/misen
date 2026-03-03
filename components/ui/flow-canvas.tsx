'use client'

import { useState, useMemo } from 'react'
import { Layers, GitBranch, CheckCircle2, Play, Pause, Lock, Unlock, Film, Brain, Sparkles, Download, Shield } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface FlowCanvasProps { analysis: any; mode: 'simple' | 'expert' }

export function FlowCanvas({ analysis, mode }: FlowCanvasProps) {
  const { locale } = useI18n()
  const fr = locale === 'fr'
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [lockedBranches, setLockedBranches] = useState<Set<string>>(new Set())
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(true)

  const plans = analysis?.plans || []
  const scenes = analysis?.scenes || []

  const nodes = useMemo(() => [
    { id: 'input', label: fr ? 'Scenario' : 'Screenplay', icon: Film, status: 'done' as const, x: 80, y: 200, color: '#C56A2D', children: ['analysis'] },
    { id: 'analysis', label: fr ? 'Analyse' : 'Analysis', icon: Brain, status: 'done' as const, x: 240, y: 200, color: '#6C4DFF', children: ['orchestration'] },
    { id: 'orchestration', label: 'Orchestration', icon: Layers, status: 'done' as const, x: 400, y: 200, color: '#C56A2D', children: ['branch_a', 'branch_b', 'branch_c'] },
    { id: 'branch_a', label: 'Kling 3.0', icon: GitBranch, status: 'done' as const, x: 560, y: 100, color: '#3B82F6', children: ['selection'] },
    { id: 'branch_b', label: 'Runway 4.5', icon: GitBranch, status: 'done' as const, x: 560, y: 200, color: '#8B5CF6', children: ['selection'] },
    { id: 'branch_c', label: 'Sora 2', icon: GitBranch, status: 'active' as const, x: 560, y: 300, color: '#EC4899', children: ['selection'] },
    { id: 'selection', label: fr ? 'Selection' : 'Selection', icon: CheckCircle2, status: 'idle' as const, x: 720, y: 200, color: '#10B981', children: ['export'] },
    { id: 'export', label: 'Export', icon: Download, status: 'idle' as const, x: 880, y: 200, color: '#C56A2D' },
  ], [fr])

  const variants = [
    { model: 'Kling 3.0', color: '#3B82F6', score: 87, status: 'selected', country: 'CN', rgpd: false, sovScore: 3 },
    { model: 'Runway Gen-4.5', color: '#8B5CF6', score: 82, status: 'done', country: 'US', rgpd: true, sovScore: 6 },
    { model: 'Sora 2', color: '#EC4899', score: 79, status: 'generating', country: 'US', rgpd: true, sovScore: 6 },
  ]

  const toggleBranch = (id: string) => {
    if (mode !== 'expert') return
    setLockedBranches(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const drawConn = (x1: number, y1: number, x2: number, y2: number, active: boolean, key: string) => {
    const mx = (x1 + x2) / 2
    const p = 'M ' + x1 + ' ' + y1 + ' C ' + mx + ' ' + y1 + ', ' + mx + ' ' + y2 + ', ' + x2 + ' ' + y2
    return (
      <g key={key}>
        <path d={p} fill="none" stroke={active ? '#C56A2D' : 'rgba(255,255,255,0.08)'} strokeWidth={active ? 2 : 1} strokeDasharray={active ? 'none' : '4 4'} />
        {active && isAnimating && <circle r="3" fill="#C56A2D"><animateMotion dur="2s" repeatCount="indefinite" path={p} /></circle>}
      </g>
    )
  }

  const renderNode = (node: typeof nodes[0]) => {
    const sel = selectedNode === node.id
    const hov = hoveredNode === node.id
    const isBranch = node.id.startsWith('branch_')
    const locked = lockedBranches.has(node.id)
    const Icon = node.icon
    const sc = node.status === 'done' ? '#10B981' : node.status === 'active' ? node.color : 'rgba(255,255,255,0.15)'
    return (
      <g key={node.id} transform={'translate(' + node.x + ', ' + node.y + ')'} onClick={() => setSelectedNode(sel ? null : node.id)} onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)} style={{ cursor: 'pointer' }}>
        {(sel || hov) && <circle cx="0" cy="0" r="42" fill="none" stroke={node.color} strokeWidth="1" opacity="0.3">{isAnimating && <animate attributeName="r" values="42;48;42" dur="2s" repeatCount="indefinite" />}</circle>}
        <circle cx="0" cy="0" r="36" fill="rgba(11,15,20,0.9)" stroke={sc} strokeWidth="2" />
        {node.status === 'active' && isAnimating && <circle cx="0" cy="0" r="36" fill="none" stroke={node.color} strokeWidth="2" opacity="0.5"><animate attributeName="r" values="36;44;36" dur="1.5s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" /></circle>}
        <foreignObject x="-14" y="-14" width="28" height="28"><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}><Icon size={18} color={node.status === 'idle' ? 'rgba(255,255,255,0.4)' : '#fff'} strokeWidth={1.5} /></div></foreignObject>
        <text x="0" y="52" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="11" fontWeight="500" fontFamily="Inter, sans-serif">{node.label}</text>
        {isBranch && mode === 'expert' && (
          <g transform="translate(26, -26)" onClick={(e: any) => { e.stopPropagation(); toggleBranch(node.id) }} style={{ cursor: 'pointer' }}>
            <circle cx="0" cy="0" r="10" fill={locked ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)'} stroke={locked ? '#EF4444' : 'rgba(255,255,255,0.1)'} strokeWidth="1" />
            <foreignObject x="-6" y="-6" width="12" height="12"><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 12, height: 12 }}>{locked ? <Lock size={8} color="#EF4444" /> : <Unlock size={8} color="rgba(255,255,255,0.3)" />}</div></foreignObject>
          </g>
        )}
      </g>
    )
  }

  const renderDetail = () => {
    if (!selectedNode) return null
    const node = nodes.find(n => n.id === selectedNode)
    if (!node) return null
    const bi = ['branch_a', 'branch_b', 'branch_c'].indexOf(node.id)
    const v = bi >= 0 ? variants[bi] : null

    return (
      <div style={{ background: 'rgba(11,15,20,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: node.color + '15', border: '1px solid ' + node.color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <node.icon size={18} color={node.color} strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{node.label}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{node.status === 'done' ? (fr ? 'Termine' : 'Complete') : node.status === 'active' ? (fr ? 'En cours' : 'Active') : (fr ? 'Attente' : 'Pending')}</div>
          </div>
        </div>
        {node.id === 'input' && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}><div>Scenes: <span style={{ color: '#fff' }}>{scenes.length}</span></div><div>{fr ? 'Plans' : 'Shots'}: <span style={{ color: '#fff' }}>{plans.length}</span></div></div>}
        {node.id === 'analysis' && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}><div>{fr ? 'Moteurs' : 'Engines'}: <span style={{ color: '#fff' }}>13</span></div><div>MCAP: <span style={{ color: '#fff' }}>14 axes</span></div></div>}
        {v && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: v.color }} />
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{v.model}</span>
              <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 99, background: v.status === 'selected' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', color: v.status === 'selected' ? '#10B981' : 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 600 }}>
                {v.status === 'selected' ? 'OPTIMAL' : v.status === 'generating' ? (fr ? 'EN COURS' : 'RUNNING') : 'OK'}
              </span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>MCAP</span><span style={{ fontSize: 13, fontWeight: 700, color: v.color }}>{v.score}/100</span></div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}><div style={{ height: '100%', borderRadius: 2, background: v.color, width: v.score + '%', transition: 'width 0.6s ease' }} /></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Shield size={14} color={v.rgpd ? '#10B981' : '#F59E0B'} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{fr ? 'Souverainete' : 'Sovereignty'}</div>
                <div style={{ fontSize: 12, color: '#fff' }}>{v.country} <span style={{ color: v.rgpd ? '#10B981' : '#F59E0B', fontSize: 10 }}>{v.rgpd ? 'RGPD OK' : 'RGPD N/A'}</span></div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: v.sovScore >= 6 ? '#10B981' : '#F59E0B' }}>{v.sovScore}/10</div>
            </div>
            {mode === 'expert' && <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
              <button style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 11, fontWeight: 600, background: 'rgba(108,77,255,0.1)', border: '1px solid rgba(108,77,255,0.2)', color: '#6C4DFF', cursor: 'pointer' }}>{fr ? 'Forcer' : 'Force'}</button>
              <button style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>{fr ? 'Relancer' : 'Retry'}</button>
            </div>}
          </div>
        )}
        {node.id === 'selection' && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}><div>Variantes: <span style={{ color: '#fff' }}>3</span></div><div>Best: <span style={{ color: '#10B981' }}>{variants[0].score}/100</span></div></div>}
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={16} color="#C56A2D" />
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{fr ? 'Pipeline Cinematique' : 'Cinematic Pipeline'}</span>
          <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600, background: mode === 'expert' ? 'rgba(108,77,255,0.15)' : 'rgba(197,106,45,0.15)', color: mode === 'expert' ? '#6C4DFF' : '#C56A2D' }}>{mode === 'expert' ? 'EXPERT' : 'VIEW'}</span>
        </div>
        <button onClick={() => setIsAnimating(!isAnimating)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 500, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
          {isAnimating ? <Pause size={12} /> : <Play size={12} />}{isAnimating ? 'Pause' : (fr ? 'Animer' : 'Animate')}
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <svg viewBox="0 0 960 400" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
            <defs><pattern id="fg" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" /></pattern></defs>
            <rect width="960" height="400" fill="url(#fg)" />
            {nodes.map(n => n.children?.map(cid => { const c = nodes.find(x => x.id === cid); return c ? drawConn(n.x, n.y, c.x, c.y, n.status === 'done' || n.status === 'active', n.id + '-' + cid) : null }) || null)}
            {nodes.map(renderNode)}
            <g transform="translate(20, 375)">{[{ c: '#10B981', l: fr ? 'OK' : 'Done' }, { c: '#C56A2D', l: fr ? 'Actif' : 'Active' }, { c: 'rgba(255,255,255,0.15)', l: fr ? 'Attente' : 'Pending' }].map((it, i) => <g key={i} transform={'translate(' + (i * 80) + ', 0)'}><circle cx="5" cy="0" r="3" fill={it.c} /><text x="14" y="3" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="Inter">{it.l}</text></g>)}</g>
          </svg>
        </div>
        {selectedNode && <div style={{ width: 300, borderLeft: '1px solid rgba(255,255,255,0.06)', padding: 16, overflowY: 'auto' }}>{renderDetail()}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
        <span>{scenes.length} scenes</span><span>{plans.length} {fr ? 'plans' : 'shots'}</span><span>3 branches</span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}><Shield size={10} />{fr ? 'Souverainete' : 'Sovereignty'}</span>
      </div>
    </div>
  )
}
