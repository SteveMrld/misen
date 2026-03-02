'use client'

import { useState, useEffect, useCallback } from 'react'
import emptyProjectsImg from '@/public/images/empty_projects.png'
import { useRouter } from 'next/navigation'
import { Plus, Film, Clapperboard, Clock, MoreHorizontal, Trash2, Download, Upload, X, Loader2, Play, Camera, Zap, TrendingUp, DollarSign } from 'lucide-react'
import { ModelLegend } from '@/components/ui/model-badge'
import { StoryboardSVG } from '@/components/ui/storyboard-svg'
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
