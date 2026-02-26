'use client'

import { useState } from 'react'
import { Plus, Film, Clapperboard, Clock, MoreHorizontal } from 'lucide-react'

// Placeholder — sera remplacé par les vrais projets Supabase en Session 3
interface Project {
  id: string
  name: string
  updatedAt: string
  scenesCount: number
  status: 'draft' | 'analyzing' | 'production' | 'complete'
}

const statusLabels: Record<string, { label: string; class: string }> = {
  draft: { label: 'Brouillon', class: 'badge-slate' },
  analyzing: { label: 'En analyse', class: 'badge-orange' },
  production: { label: 'Production', class: 'badge-orange' },
  complete: { label: 'Terminé', class: 'badge-success' },
}

export default function DashboardPage() {
  const [projects] = useState<Project[]>([])

  return (
    <div className="animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h2 text-slate-50">Mes projets</h1>
          <p className="text-body-sm text-slate-400 mt-1">
            Gérez vos productions cinématographiques IA
          </p>
        </div>
        <button className="btn-primary btn-md">
          <Plus size={18} className="mr-2" />
          Nouveau projet
        </button>
      </div>

      {/* Projects grid or empty state */}
      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center mb-6">
        <Clapperboard size={36} className="text-orange-500/60" />
      </div>

      {/* Text */}
      <h3 className="text-h4 text-slate-200 mb-2">
        Créez votre premier projet
      </h3>
      <p className="text-body-sm text-slate-400 text-center max-w-sm mb-8">
        Importez un scénario et laissez MISEN orchestrer votre production
        avec 13 moteurs d&apos;analyse et 7 modèles IA.
      </p>

      {/* CTA */}
      <button className="btn-primary btn-lg">
        <Plus size={20} className="mr-2" />
        Nouveau projet
      </button>

      {/* Features hint */}
      <div className="flex items-center gap-6 mt-12">
        {[
          { icon: Film, label: '13 moteurs' },
          { icon: Clapperboard, label: '7 modèles IA' },
          { icon: Clock, label: '6 formats d\'export' },
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

function ProjectCard({ project }: { project: Project }) {
  const status = statusLabels[project.status]

  return (
    <div className="card-interactive group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-body font-medium text-slate-100 truncate group-hover:text-orange-400 transition-colors">
            {project.name}
          </h3>
          <p className="text-caption text-slate-500 mt-1">
            {project.scenesCount} scène{project.scenesCount > 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-ghost p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={16} className="text-slate-400" />
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-dark-700">
        <span className={status.class}>{status.label}</span>
        <span className="text-caption text-slate-500">
          {new Date(project.updatedAt).toLocaleDateString('fr-FR')}
        </span>
      </div>
    </div>
  )
}
