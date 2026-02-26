'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Key, CreditCard, Sliders, Loader2, Save } from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    loadUser()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-orange-500" />
      </div>
    )
  }

  const sections = [
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      description: 'Informations de votre compte',
    },
    {
      id: 'api-keys',
      label: 'Clés API',
      icon: Key,
      description: 'Connectez vos modèles IA — Session 4',
      disabled: true,
    },
    {
      id: 'billing',
      label: 'Plan & Facturation',
      icon: CreditCard,
      description: 'Gérez votre abonnement — Session 5',
      disabled: true,
    },
    {
      id: 'preferences',
      label: 'Préférences',
      icon: Sliders,
      description: 'Personnalisez votre expérience — Session 6',
      disabled: true,
    },
  ]

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="mb-8">
        <h1 className="text-h2 text-slate-50">Réglages</h1>
        <p className="text-body-sm text-slate-400 mt-1">
          Configurez votre studio MISEN
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {/* Profile section (active) */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <User size={20} className="text-orange-500" />
            </div>
            <div>
              <h3 className="text-body font-medium text-slate-100">Profil</h3>
              <p className="text-caption text-slate-400">Informations de votre compte</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="input-label">Nom</label>
              <input
                type="text"
                defaultValue={user?.user_metadata?.name || ''}
                className="input"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input
                type="email"
                defaultValue={user?.email || ''}
                className="input opacity-60"
                disabled
              />
              <p className="text-caption text-slate-500 mt-1">
                L&apos;email ne peut pas être modifié
              </p>
            </div>
            <div className="pt-2">
              <button className="btn-primary btn-sm">
                <Save size={16} className="mr-2" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>

        {/* Locked sections */}
        {sections.filter(s => s.disabled).map((section) => {
          const Icon = section.icon
          return (
            <div key={section.id} className="card opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
                  <Icon size={20} className="text-slate-500" />
                </div>
                <div>
                  <h3 className="text-body font-medium text-slate-300">{section.label}</h3>
                  <p className="text-caption text-slate-500">{section.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
