'use client'

import { useState, useEffect, useCallback } from 'react'
import emptyProjectsImg from '@/public/images/empty_projects.png'
import { useRouter } from 'next/navigation'
import { Plus, Film, Clapperboard, Clock, MoreHorizontal, Trash2, Download, Upload, X, Loader2, Play, Camera, Zap, TrendingUp, DollarSign, ArrowRight, Sparkles, Music, Layers, Globe, BookOpen, Lightbulb, Cpu, Palette, Video, Wand2, ChevronRight } from 'lucide-react'
import { ModelLegend } from '@/components/ui/model-badge'
import { StoryboardSVG } from '@/components/ui/storyboard-svg'
import { SCENARIO_TEMPLATES } from '@/lib/data/templates'
import demoThumbCendres from '@/public/images/sc1_fleuve.jpg'
import demoThumbOdyssee from '@/public/images/sc2_desert.jpg'
import demoThumbPixel from '@/public/images/sc3_oeil.jpg'
import { Onboarding } from '@/components/ui/onboarding'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/types/database'
import { useI18n } from '@/lib/i18n'

const statusLabels: Record<string, { label: string; class: string }> = {
  draft: { label: 'Draft', class: 'badge-default' },
  analyzing: { label: 'Analyzing', class: 'badge-orange' },
  production: { label: 'Production', class: 'badge-orange' },
  complete: { label: 'Complete', class: 'badge-success' },
}

// Status labels moved inside component for i18n

export default function DashboardPage() {
  const router = useRouter()
  const { t, locale } = useI18n()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [importing, setImporting] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)

  // Check if first visit for onboarding
  useEffect(() => {
    const done = localStorage.getItem('misen_onboarding_done')
    if (!done) {
      setShowOnboarding(true)
      // Get user name for greeting
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) setUserName(user.user_metadata?.name || user.email?.split('@')[0] || null)
      })
    }
  }, [])

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (e) {
      console.error('Erreur chargement projets:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(locale === "fr" ? `Supprimer le projet "${name}" ? Cette action est irréversible.` : `Delete project "${name}"? This cannot be undone.`)) return
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (e) {
      console.error('Erreur suppression:', e)
    }
  }

  const handleExport = async (id: string) => {
    const res = await fetch(`/api/projects/${id}/export`)
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'misen-export-v7.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDemo = () => {
    router.push('/demo')
  }

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return
      setImporting(true)
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        const res = await fetch('/api/projects/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (res.ok) {
          await fetchProjects()
        } else {
          const err = await res.json()
          alert(err.error || (locale === 'fr' ? 'Erreur import' : 'Import error'))
        }
      } catch {
        alert(locale === 'fr' ? 'Fichier JSON invalide' : 'Invalid JSON file')
      } finally {
        setImporting(false)
      }
    }
    input.click()
  }

  return (
    <div className="animate-fade-in">
      {/* Onboarding overlay */}
      {showOnboarding && (
        <Onboarding
          userName={userName}
          onComplete={() => { setShowOnboarding(false); localStorage.setItem('misen_onboarding_done', '1') }}
          onDemo={handleDemo}
          onNewProject={() => setShowNewModal(true)}
        />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-50">{t.dashboard.title}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {projects.length} projet{projects.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button onClick={handleDemo} disabled={importing} className="px-3 py-2 text-sm text-orange-400 border border-orange-500/30 hover:bg-orange-500/10 rounded-lg flex items-center gap-2 transition-colors">
            <Play size={16} /> {t.common.demo}
          </button>
          <button onClick={() => router.push('/settings?tab=usage')} className="px-3 py-2 text-sm text-slate-300 border border-dark-600 hover:bg-dark-800 rounded-lg flex items-center gap-2 transition-colors">
            <DollarSign size={16} /> {locale === 'fr' ? 'Coûts' : 'Costs'}
          </button>
          <button onClick={handleImport} disabled={importing} className="px-3 py-2 text-sm text-slate-300 border border-dark-600 hover:bg-dark-800 rounded-lg flex items-center gap-2 transition-colors">
            {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Importer
          </button>
          <button onClick={() => setShowNewModal(true)} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
            <Plus size={16} /> {t.dashboard.newProject}
          </button>
        </div>
      </div>

      {/* Continue last project */}
      {projects.length > 0 && (() => {
        const last = projects[0]
        const lastStatus = statusLabels[last.status] || statusLabels.draft
        return (
          <div onClick={() => router.push(`/project/${last.id}`)}
            className="mb-4 bg-dark-900 border border-dark-700 hover:border-orange-500/20 rounded-xl p-4 cursor-pointer transition-all group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/15 to-orange-600/10 border border-orange-500/15 flex items-center justify-center group-hover:from-orange-500/25 group-hover:to-orange-600/15 transition-all">
                  <Film size={20} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">{locale === 'fr' ? 'Reprendre' : 'Continue'}</p>
                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-orange-300 transition-colors">{last.name}</h3>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={lastStatus.class}>{lastStatus.label}</span>
                <span className="text-xs text-slate-500">{new Date(last.updated_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}</span>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-orange-400 transition-colors" />
              </div>
            </div>
          </div>
        )
      })()}

      {/* Stats row */}
      {projects.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Film, label: t.dashboard.stats.totalProjects, value: projects.length, color: 'text-orange-400' },
            { icon: Camera, label: t.dashboard.projectCard.scenes, value: projects.reduce((s, p) => s + (p.scenes_count || 0), 0), color: 'text-blue-400' },
            { icon: Zap, label: locale === 'fr' ? 'En production' : 'In production', value: projects.filter(p => p.status === 'production' || p.status === 'analyzing').length, color: 'text-yellow-400' },
            { icon: TrendingUp, label: t.dashboard.stats.totalShots, value: projects.filter(p => p.status === 'complete').length, color: 'text-green-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-dark-900/80 border border-dark-700 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-dark-600 transition-all">
              <Icon size={18} className={color} />
              <div>
                <p className="text-lg font-semibold text-slate-100">{value}</p>
                <p className="text-[11px] text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ HERO INSPIRATION BANNER ═══ */}
      {projects.length === 0 && (
        <div className="relative mb-8 rounded-2xl overflow-hidden" style={{ minHeight: 200 }}>
          <video src="/videos/hero_cinematic.mp4" autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/80 to-transparent" />
          <div className="relative z-10 p-8 flex flex-col justify-center" style={{ minHeight: 200 }}>
            <p className="text-[11px] font-semibold text-orange-400 tracking-widest uppercase mb-3">{locale === 'fr' ? 'STUDIO IA' : 'AI STUDIO'}</p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white leading-tight mb-3" style={{ letterSpacing: '-0.03em' }}>
              {locale === 'fr' ? 'Votre prochaine création\ncommence ici.' : 'Your next creation\nstarts here.'}
            </h2>
            <p className="text-sm text-slate-400 max-w-md mb-5">{locale === 'fr' ? 'Choisissez un template cinématographique ou écrivez votre propre scénario. 13 moteurs IA transforment vos mots en film.' : 'Pick a cinematic template or write your own screenplay. 13 AI engines turn your words into film.'}</p>
            <button onClick={() => setShowNewModal(true)} className="btn-primary px-5 py-2.5 text-sm font-semibold flex items-center gap-2 w-fit">
              <Plus size={16} /> {locale === 'fr' ? 'Créer un projet' : 'Create a project'}
            </button>
          </div>
        </div>
      )}

      {/* ═══ TEMPLATES — Commencer avec un scénario ═══ */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Sparkles size={16} className="text-orange-400" />
              {locale === 'fr' ? 'Templates cinématographiques' : 'Cinematic templates'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{locale === 'fr' ? 'Scénarios professionnels prêts à produire — cliquez pour commencer' : 'Professional scenarios ready to produce — click to start'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCENARIO_TEMPLATES.map(tpl => {
            const TEMPLATE_IMAGES: Record<string, string> = {
              'luxe-parfum': '/images/sc2_desert.jpg',
              'court-drame': '/images/sc1_fleuve.jpg',
              'clip-musical': '/images/sc3_ville.jpg',
              'educatif': '/images/sc3_oeil.jpg',
              'game-trailer': '/images/sc3_silhouette.jpg',
              'corporate': '/images/sc1_couloir.jpg',
            }
            const bgImg = TEMPLATE_IMAGES[tpl.id] || '/images/sc1_portrait.jpg'
            return (
            <button
              key={tpl.id}
              onClick={async () => {
                try {
                  const res = await fetch('/api/projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: tpl.title[locale === 'fr' ? 'fr' : 'en'],
                      description: tpl.tagline[locale === 'fr' ? 'fr' : 'en'],
                      template_id: tpl.id,
                    }),
                  })
                  if (res.ok) {
                    const project = await res.json()
                    router.push(`/project/${project.id}`)
                  }
                } catch (e) { console.error(e) }
              }}
              className="text-left rounded-xl overflow-hidden transition-all group relative hover:ring-1 hover:ring-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5"
              style={{ minHeight: 220 }}
            >
              {/* Background image */}
              <div className="absolute inset-0">
                <img src={bgImg} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
              </div>
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-end p-5" style={{ minHeight: 220 }}>
                {/* Genre pill */}
                <span className="text-[10px] font-bold tracking-widest uppercase mb-2 px-2.5 py-1 rounded-full w-fit"
                  style={{ color: tpl.color, background: `${tpl.color}20`, border: `1px solid ${tpl.color}30` }}>
                  {tpl.genre[locale === 'fr' ? 'fr' : 'en'].split('·')[0].trim()}
                </span>
                <h3 className="text-lg font-display font-bold text-white mb-1 group-hover:text-orange-200 transition-colors" style={{ letterSpacing: '-0.02em' }}>
                  {tpl.title[locale === 'fr' ? 'fr' : 'en']}
                </h3>
                <p className="text-xs text-slate-300/80 italic mb-3">"{tpl.tagline[locale === 'fr' ? 'fr' : 'en']}"</p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400">{tpl.stats.scenes} scènes</span>
                  <span className="text-[10px] text-slate-500">•</span>
                  <span className="text-[10px] text-slate-400">{tpl.stats.plans} plans</span>
                  <span className="text-[10px] text-slate-500">•</span>
                  <span className="text-[10px] text-slate-400">{tpl.stats.duration}</span>
                  <span className="ml-auto text-[10px] font-medium text-green-400/80">{tpl.stats.cost}</span>
                </div>
                {/* Hover CTA */}
                <div className="flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[11px] font-semibold text-orange-400">{locale === 'fr' ? 'Lancer ce projet' : 'Start this project'}</span>
                  <ArrowRight size={12} className="text-orange-400" />
                </div>
              </div>
            </button>
          )})}
        </div>
      </div>

      {/* ═══ QUICK ACTIONS — Créer par type ═══ */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2 mb-3">
          <Zap size={16} className="text-yellow-400" />
          {locale === 'fr' ? 'Création rapide' : 'Quick create'}
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            { icon: Film, label: locale === 'fr' ? 'Court-métrage' : 'Short film', color: '#64748B' },
            { icon: Sparkles, label: locale === 'fr' ? 'Publicité' : 'Ad spot', color: '#D4AF37' },
            { icon: Music, label: locale === 'fr' ? 'Clip musical' : 'Music video', color: '#EC4899' },
            { icon: Camera, label: 'Documentaire', color: '#06B6D4' },
            { icon: Layers, label: 'BD & Motion', color: '#8B5CF6' },
            { icon: Globe, label: locale === 'fr' ? 'Éducatif' : 'Educational', color: '#10B981' },
            { icon: Video, label: 'Corporate', color: '#3B82F6' },
            { icon: Wand2, label: 'Game trailer', color: '#EF4444' },
          ].map(({ icon: Icon, label, color }) => (
            <button
              key={label}
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dark-700 hover:border-dark-500 bg-dark-900/60 hover:bg-dark-800/80 transition-all text-xs text-slate-300 hover:text-slate-100"
            >
              <Icon size={13} style={{ color }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ CAPABILITIES — Ce que MISEN sait faire ═══ */}
      <div className="mb-8 bg-dark-900/60 border border-dark-700 rounded-xl p-5">
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2 mb-4">
          <Cpu size={16} className="text-violet-400" />
          {locale === 'fr' ? 'La puissance de MISEN' : 'MISEN capabilities'}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { value: '13', label: locale === 'fr' ? 'Moteurs d\'analyse' : 'Analysis engines', desc: locale === 'fr' ? 'Intent Parser, Crispifier, Style Guard, Motion Flow…' : 'Intent Parser, Crispifier, Style Guard, Motion Flow…', color: 'text-orange-400' },
            { value: '7', label: locale === 'fr' ? 'Modèles IA' : 'AI models', desc: 'Kling 3.0, Runway Gen-4.5, Sora 2, Veo 3.1…', color: 'text-violet-400' },
            { value: '6', label: 'Formats', desc: locale === 'fr' ? 'Pub, Court-métrage, Clip, Docu, BD, Éducatif' : 'Ad, Short film, Music video, Doc, Comic, Educational', color: 'text-blue-400' },
            { value: '4K', label: locale === 'fr' ? 'Résolution max' : 'Max resolution', desc: locale === 'fr' ? 'Export haute qualité, HDR, son multicanal' : 'High quality export, HDR, multichannel audio', color: 'text-green-400' },
          ].map(cap => (
            <div key={cap.label} className="text-center">
              <p className={`text-2xl font-display font-bold ${cap.color}`}>{cap.value}</p>
              <p className="text-xs font-medium text-slate-200 mt-1">{cap.label}</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ TIPS — Astuce du jour ═══ */}
      <div className="mb-8">
        {(() => {
          const tips = locale === 'fr' ? [
            { title: 'Importez votre scénario', desc: 'Collez votre texte ou importez un fichier .fdx/.pdf — MISEN détecte automatiquement les scènes, dialogues et indications techniques.', icon: Upload },
            { title: 'Mode Expert', desc: 'Activez le mode Expert dans un projet pour contrôler chaque paramètre : modèle IA par plan, force de prompt, verrouillage de branche.', icon: Zap },
            { title: 'Comparez les modèles', desc: 'Utilisez le bouton Compare pour voir côte à côte les résultats de 2 modèles IA sur le même plan. Choisissez le meilleur rendu.', icon: Layers },
            { title: 'Storyboard visuel', desc: 'L\'onglet Storyboard génère automatiquement un découpage visuel de votre scénario avec les types de plans et mouvements de caméra.', icon: Palette },
            { title: 'Export multi-format', desc: 'Exportez votre projet en JSON, partagez-le avec votre équipe, ou téléchargez le brief de production pour votre studio.', icon: Download },
            { title: 'Score & Musique', desc: 'L\'onglet Score analyse l\'ambiance de chaque scène et suggère des compositions musicales adaptées au ton de votre film.', icon: Music },
          ] : [
            { title: 'Import your screenplay', desc: 'Paste your text or import a .fdx/.pdf file — MISEN auto-detects scenes, dialogues and technical cues.', icon: Upload },
            { title: 'Expert Mode', desc: 'Enable Expert mode in a project to control every parameter: AI model per shot, prompt strength, branch locking.', icon: Zap },
            { title: 'Compare models', desc: 'Use the Compare button to see side-by-side results from 2 AI models on the same shot. Pick the best render.', icon: Layers },
            { title: 'Visual Storyboard', desc: 'The Storyboard tab auto-generates a visual breakdown with shot types and camera movements.', icon: Palette },
            { title: 'Multi-format export', desc: 'Export your project as JSON, share with your team, or download the production brief for your studio.', icon: Download },
            { title: 'Score & Music', desc: 'The Score tab analyzes each scene mood and suggests musical compositions matching your film tone.', icon: Music },
          ]
          const tip = tips[Math.floor(Date.now() / 86400000) % tips.length]
          const TipIcon = tip.icon
          return (
            <div className="flex items-start gap-3 bg-gradient-to-r from-orange-500/5 to-violet-500/5 border border-orange-500/10 rounded-xl p-4">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <TipIcon size={16} className="text-orange-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-orange-300 flex items-center gap-2">
                  <Lightbulb size={12} />
                  {locale === 'fr' ? 'Astuce du jour' : 'Tip of the day'}
                </p>
                <p className="text-sm text-slate-200 mt-1 font-medium">{tip.title}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          )
        })()}
      </div>

      {/* ═══ MES PROJETS ═══ */}
      {projects.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-semibold text-slate-100">{locale === 'fr' ? 'Mes projets' : 'My projects'}</h2>
          <span className="text-xs text-slate-500">({projects.length})</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center"><Loader2 size={24} className="text-orange-400 animate-spin" /></div><div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" /><p className="text-xs text-slate-500">Chargement...</p></div>
        </div>
      ) : projects.length === 0 ? (
        <EmptyState onNew={() => setShowNewModal(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => router.push(`/project/${project.id}`)}
              onDelete={() => handleDelete(project.id, project.name)}
              onExport={() => handleExport(project.id)}
            />
          ))}
        </div>
      )}

      {showNewModal && (
        <NewProjectModal
          onClose={() => setShowNewModal(false)}
          onCreated={(project) => {
            setShowNewModal(false)
            router.push(`/project/${project.id}`)
          }}
        />
      )}
    </div>
  )
}

function EmptyState({ onNew }: { onNew: () => void }) {
  const { t, locale } = useI18n()
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-6 w-48 h-48 rounded-2xl overflow-hidden opacity-70 shadow-2xl shadow-black/40 ring-1 ring-orange-500/10">
        <img src={emptyProjectsImg.src} alt={t.dashboard.createFirst} className="w-full h-full object-cover" />
      </div>
      <div className="beam w-24 mb-4" />
      <h3 className="text-xl font-display text-slate-200 mb-2">{t.dashboard.createFirst}</h3>
      <p className="text-sm text-slate-400 text-center max-w-md mb-8">
        {t.dashboard.noProjectsDesc}
      </p>
      <button onClick={onNew} className="btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium">
        <Plus size={16} /> {t.dashboard.newProject}
      </button>
      <ModelLegend className="mt-10 opacity-60" />
    </div>
  )
}

function ProjectCard({ project, onClick, onDelete, onExport }: {
  project: Project; onClick: () => void; onDelete: () => void; onExport: () => void
}) {
  const { t, locale } = useI18n()
  const status = statusLabels[project.status] || statusLabels.draft
  const [showMenu, setShowMenu] = useState(false)

  // Pseudo-random visual based on project name
  const hash = project.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const shots = ['plan large', 'plan moyen', 'gros plan', 'insert', 'très gros plan']
  const moves = ['pan right', 'dolly in', 'tracking', 'static', 'tilt up', 'crane']
  const modelColors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#14B8A6', '#6366F1', '#D946EF']

  // Detect demo project
  const isDemo = project.name.toLowerCase().includes('démo') || project.name.toLowerCase().includes('demo')
  const demoThumb = project.name.includes('Odyssée') ? demoThumbOdyssee.src
    : project.name.includes('Pixel') ? demoThumbPixel.src
    : demoThumbCendres.src

  return (
    <div className="card-interactive group cursor-pointer overflow-hidden" onClick={onClick}>
      {/* Visual preview header */}
      <div className="relative -mx-[1px] -mt-[1px]">
        {isDemo ? (
          <img src={demoThumb} alt={project.name} className="w-full h-[110px] object-cover" />
        ) : (
          <StoryboardSVG
            shotType={shots[hash % shots.length]}
            cameraMove={moves[(hash * 7) % moves.length]}
            width={400} height={110}
            modelColor={modelColors[hash % modelColors.length]}
            className="w-full"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-850 via-dark-850/30 to-transparent" />
        <div className="absolute top-3 right-3"><span className={status.class}>{status.label}</span></div>
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
              className="p-1.5 rounded-md bg-dark-950/60 backdrop-blur-sm hover:bg-dark-950/80">
              <MoreHorizontal size={14} className="text-slate-400" />
            </button>
            {showMenu && (
              <div className="absolute left-0 top-8 w-40 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-10 py-1" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { onExport(); setShowMenu(false) }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-300 hover:bg-dark-700">
                  <Download size={13} /> {locale === 'fr' ? 'Exporter JSON' : 'Export JSON'}
                </button>
                <button onClick={() => { onDelete(); setShowMenu(false) }} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-dark-700">
                  <Trash2 size={13} /> {locale === 'fr' ? 'Supprimer' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Info */}
      <div className="p-4 pt-2">
        <h3 className="text-sm font-medium text-slate-100 truncate group-hover:text-orange-300 transition-colors">
          {project.name}
        </h3>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-slate-500 flex items-center gap-1"><Camera size={11} /> {project.scenes_count} {locale === 'fr' ? `scène${project.scenes_count > 1 ? 's' : ''}` : `scene${project.scenes_count > 1 ? 's' : ''}`}</span>
          <span className="text-[11px] text-slate-600">{new Date(project.updated_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}</span>
        </div>
      </div>
    </div>
  )
}

function NewProjectModal({ onClose, onCreated }: {
  onClose: () => void; onCreated: (project: Project) => void
}) {
  const { t, locale } = useI18n()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      })
      if (res.ok) {
        const project = await res.json()
        onCreated(project)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-dark-900 border border-dark-700/80 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50 glow-copper" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h4 text-slate-100">{t.dashboard.newProject}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-md">
            <X size={18} className="text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-body-sm text-slate-300 mb-1.5">{locale === 'fr' ? 'Nom du projet' : 'Project name'}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={locale === "fr" ? "Ex: Mon court-métrage" : "Ex: My short film"}
              className="w-full px-3 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-body-sm text-slate-300 mb-1.5">{locale === "fr" ? "Description (optionnel)" : "Description (optional)"}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={locale === "fr" ? "Décrivez votre projet..." : "Describe your project..."}
              rows={3}
              className="w-full px-3 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost btn-md">{t.common.cancel}</button>
            <button type="submit" disabled={!name.trim() || creating} className="btn-primary btn-md disabled:opacity-50">
              {creating ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Plus size={18} className="mr-2" />}
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
