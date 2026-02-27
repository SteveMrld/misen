'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Key, Save, Loader2, Check, Trash2, ExternalLink, Eye, EyeOff } from 'lucide-react'

const AI_PROVIDERS = [
  { id: 'kling', name: 'Kling 3.0', placeholder: 'sk-kling-...', color: '#22d3ee' },
  { id: 'runway', name: 'Runway Gen-4.5', placeholder: 'rw_...', color: '#a78bfa' },
  { id: 'sora', name: 'Sora 2', placeholder: 'sk-...', color: '#34d399' },
  { id: 'veo', name: 'Veo 3.1', placeholder: 'AIza...', color: '#60a5fa' },
  { id: 'seedance', name: 'Seedance 2.0', placeholder: 'sd-...', color: '#fb923c' },
  { id: 'wan', name: 'Wan 2.5', placeholder: 'wan-...', color: '#f472b6' },
  { id: 'hailuo', name: 'Hailuo 2.3', placeholder: 'hl-...', color: '#fbbf24' },
]

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [keys, setKeys] = useState<Record<string, { masked: string; hasKey: boolean }>>({})
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [showKey, setShowKey] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const res = await fetch('/api/api-keys')
      if (res.ok) {
        const data = await res.json()
        const map: Record<string, { masked: string; hasKey: boolean }> = {}
        data.forEach((k: any) => { map[k.provider] = { masked: k.masked, hasKey: k.hasKey } })
        setKeys(map)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSaveKey = async (provider: string) => {
    const value = inputs[provider]?.trim()
    if (!value) return
    setSaving(prev => ({ ...prev, [provider]: true }))
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, api_key: value }),
      })
      if (res.ok) {
        setKeys(prev => ({ ...prev, [provider]: { masked: value.slice(0, 4) + '••••••••' + value.slice(-4), hasKey: true } }))
        setInputs(prev => ({ ...prev, [provider]: '' }))
        setSaved(prev => ({ ...prev, [provider]: true }))
        setTimeout(() => setSaved(prev => ({ ...prev, [provider]: false })), 2000)
      }
    } catch {}
    finally { setSaving(prev => ({ ...prev, [provider]: false })) }
  }

  const handleDeleteKey = async (provider: string) => {
    if (!confirm('Supprimer cette clé API ?')) return
    try {
      await fetch('/api/api-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
      setKeys(prev => ({ ...prev, [provider]: { masked: '', hasKey: false } }))
    } catch {}
  }

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 size={24} className="animate-spin text-orange-500" /></div>
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-50">Réglages</h1>
        <p className="text-sm text-slate-400 mt-1">Configurez votre studio MISEN</p>
      </div>

      {/* Profil */}
      <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <User size={20} className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-100">Profil</h3>
            <p className="text-xs text-slate-400">Informations de votre compte</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-300 font-medium mb-1.5">Email</label>
            <input type="email" defaultValue={user?.email || ''} className="w-full h-10 px-4 bg-dark-900 border border-dark-600 rounded-lg text-slate-100 opacity-60" disabled />
          </div>
        </div>
      </div>

      {/* Clés API */}
      <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Key size={20} className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-100">Clés API — Modèles IA</h3>
            <p className="text-xs text-slate-400">Connectez vos comptes pour générer des vidéos</p>
          </div>
        </div>

        <div className="space-y-4">
          {AI_PROVIDERS.map((provider) => {
            const keyData = keys[provider.id]
            const hasKey = keyData?.hasKey || false
            const isSaving = saving[provider.id] || false
            const isSaved = saved[provider.id] || false

            return (
              <div key={provider.id} className="p-4 bg-dark-900 rounded-lg border border-dark-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: hasKey ? '#22c55e' : '#64748b' }} />
                    <span className="text-sm font-medium text-slate-200">{provider.name}</span>
                  </div>
                  {hasKey && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-mono">{keyData.masked}</span>
                      <button onClick={() => handleDeleteKey(provider.id)} className="p-1 rounded hover:bg-white/5" title="Supprimer">
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
                {!hasKey && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={showKey[provider.id] ? 'text' : 'password'}
                        value={inputs[provider.id] || ''}
                        onChange={(e) => setInputs(prev => ({ ...prev, [provider.id]: e.target.value }))}
                        placeholder={provider.placeholder}
                        className="w-full h-9 px-3 pr-8 bg-dark-800 border border-dark-600 rounded-lg text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50"
                      />
                      <button
                        onClick={() => setShowKey(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        {showKey[provider.id] ? <EyeOff size={14} className="text-slate-500" /> : <Eye size={14} className="text-slate-500" />}
                      </button>
                    </div>
                    <button
                      onClick={() => handleSaveKey(provider.id)}
                      disabled={!inputs[provider.id]?.trim() || isSaving}
                      className="h-9 px-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : isSaved ? <Check size={14} /> : <Save size={14} />}
                      {isSaved ? 'OK' : 'Sauver'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-xs text-slate-500 mt-4">
          Les clés sont stockées de manière sécurisée et ne sont jamais partagées. Elles sont utilisées uniquement pour vos générations.
        </p>
      </div>
    </div>
  )
}
