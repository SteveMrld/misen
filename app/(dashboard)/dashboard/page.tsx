'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Film, Clapperboard, Clock, MoreHorizontal, Trash2, Download, Upload, X, Loader2, Play } from 'lucide-react'
import type { Project } from '@/types/database'

const statusLabels: Record<string, { label: string; class: string }> = {
  draft: { label: 'Brouillon', class: 'badge-default' },
  analyzing: { label: 'En analyse', class: 'badge-orange' },
  production: { label: 'Production', class: 'badge-orange' },
  complete: { label: 'Terminé', class: 'badge-success' },
}

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [importing, setImporting] = useState(false)

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
    if (!confirm(`Supprimer le projet "${name}" ? Cette action est irréversible.`)) return
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

  const handleDemo = async () => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Les deux rives — Démo MISEN' }),
      })
      if (res.ok) {
        const proj = await res.json()
        const { DEMO_SCENARIO } = await import('@/lib/data/demo-scenario')
        await fetch(`/api/projects/${proj.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ script_text: DEMO_SCENARIO.script }),
        })
        router.push(`/project/${proj.id}`)
      }
    } catch {}
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
          alert(err.error || 'Erreur import')
        }
      } catch {
        alert('Fichier JSON invalide')
      } finally {
        setImporting(false)
      }
    }
    input.click()
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h2 text-slate-50">Mes projets</h1>
          <p className="text-body-sm text-slate-400 mt-1">
            {projects.length} projet{projects.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDemo} disabled={importing} className="btn-ghost btn-md text-orange-400 border-orange-500/30 hover:bg-orange-500/10">
            <Play size={18} className="mr-2" />
            Démo
          </button>
          <button onClick={handleImport} disabled={importing} className="btn-ghost btn-md">
            {importing ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Upload size={18} className="mr-2" />}
            Importer
          </button>
          <button onClick={() => setShowNewModal(true)} className="btn-primary btn-md">
            <Plus size={18} className="mr-2" />
            Nouveau projet
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="text-orange-500 animate-spin" />
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
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-20 h-20 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center mb-6">
        <Clapperboard size={36} className="text-orange-500/60" />
      </div>
      <h3 className="text-h4 text-slate-200 mb-2">Créez votre premier projet</h3>
      <p className="text-body-sm text-slate-400 text-center max-w-sm mb-8">
        Importez un scénario et laissez MISEN orchestrer votre production
        avec 13 moteurs d&apos;analyse et 7 modèles IA.
      </p>
      <button onClick={onNew} className="btn-primary btn-lg">
        <Plus size={20} className="mr-2" />
        Nouveau projet
      </button>
      <div className="flex items-center gap-6 mt-12">
        {[
          { icon: Film, label: '13 moteurs' },
          { icon: Clapperboard, label: '7 modèles IA' },
          { icon: Clock, label: 'Export JSON' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-slate-500">
            <Icon size={16} />
            <span className="text-caption">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProjectCard({ project, onClick, onDelete, onExport }: {
  project: Project; onClick: () => void; onDelete: () => void; onExport: () => void
}) {
  const status = statusLabels[project.status] || statusLabels.draft
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="card-interactive group cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-body font-medium text-slate-100 truncate group-hover:text-orange-400 transition-colors">
            {project.name}
          </h3>
          <p className="text-caption text-slate-500 mt-1">
            {project.scenes_count} scène{project.scenes_count > 1 ? 's' : ''}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
            className="btn-ghost p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal size={16} className="text-slate-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 w-40 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-10 py-1" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => { onExport(); setShowMenu(false) }} className="flex items-center gap-2 w-full px-3 py-2 text-body-sm text-slate-300 hover:bg-dark-700 transition-colors">
                <Download size={14} /> Exporter JSON
              </button>
              <button onClick={() => { onDelete(); setShowMenu(false) }} className="flex items-center gap-2 w-full px-3 py-2 text-body-sm text-red-400 hover:bg-dark-700 transition-colors">
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-dark-700">
        <span className={status.class}>{status.label}</span>
        <span className="text-caption text-slate-500">
          {new Date(project.updated_at).toLocaleDateString('fr-FR')}
        </span>
      </div>
    </div>
  )
}

function NewProjectModal({ onClose, onCreated }: {
  onClose: () => void; onCreated: (project: Project) => void
}) {
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h4 text-slate-100">Nouveau projet</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-md">
            <X size={18} className="text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-body-sm text-slate-300 mb-1.5">Nom du projet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mon court-métrage"
              className="w-full px-3 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-body-sm text-slate-300 mb-1.5">Description (optionnel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre projet..."
              rows={3}
              className="w-full px-3 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost btn-md">Annuler</button>
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
