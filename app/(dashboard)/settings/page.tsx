'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Key, Save, Loader2, Check, Trash2, Eye, EyeOff, CreditCard, Zap, Crown, Rocket } from 'lucide-react'

const AI_PROVIDERS = [
  { id: 'kling', name: 'Kling 3.0', placeholder: 'sk-kling-...' },
  { id: 'runway', name: 'Runway Gen-4.5', placeholder: 'rw_...' },
  { id: 'sora', name: 'Sora 2', placeholder: 'sk-...' },
  { id: 'veo', name: 'Veo 3.1', placeholder: 'AIza...' },
  { id: 'seedance', name: 'Seedance 2.0', placeholder: 'sd-...' },
  { id: 'wan', name: 'Wan 2.5', placeholder: 'wan-...' },
  { id: 'hailuo', name: 'Hailuo 2.3', placeholder: 'hl-...' },
]

const PLAN_CARDS = [
  { id: 'free', name: 'Free', price: 0, icon: Zap, features: ['5 analyses/mois', '10 générations/mois', '2 modèles IA'] },
  { id: 'pro', name: 'Pro', price: 29, icon: Crown, features: ['50 analyses/mois', '200 générations/mois', '5 modèles IA', 'Priorité file'] },
  { id: 'studio', name: 'Studio', price: 99, icon: Rocket, features: ['Analyses illimitées', 'Générations illimitées', '7 modèles IA', 'API access'] },
]

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [keys, setKeys] = useState<Record<string, { masked: string; hasKey: boolean }>>({})
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [showKey, setShowKey] = useState<Record<string, boolean>>({})
  const [sub, setSub] = useState<any>(null)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const [keysRes, subRes] = await Promise.all([
        fetch('/api/api-keys'),
        fetch('/api/subscription'),
      ])
      if (keysRes.ok) {
        const data = await keysRes.json()
        const map: Record<string, { masked: string; hasKey: boolean }> = {}
        data.forEach((k: any) => { map[k.provider] = { masked: k.masked, hasKey: k.hasKey } })
        setKeys(map)
      }
      if (subRes.ok) setSub(await subRes.json())
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

  const handleUpgrade = async (planId: string) => {
    const priceId = planId === 'pro' ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID : process.env.NEXT_PUBLIC_STRIPE_STUDIO_PRICE_ID
    if (!priceId) { alert('Stripe pas encore configuré. Ajoutez STRIPE_SECRET_KEY et les Price IDs dans Vercel.'); return }
    setUpgrading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Erreur')
    } catch { alert('Erreur réseau') }
    finally { setUpgrading(false) }
  }

  const handlePortal = async () => {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {}
  }

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 size={24} className="animate-spin text-orange-500" /></div>
  }

  const currentPlan = sub?.plan || 'free'

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-50">Réglages</h1>
        <p className="text-sm text-slate-400 mt-1">Configurez votre studio MISEN</p>
      </div>

      {/* Plan & Billing */}
      <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <CreditCard size={20} className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-100">Plan & Facturation</h3>
            <p className="text-xs text-slate-400">
              {sub ? `${sub.analyses_used || 0} analyses · ${sub.generations_used || 0} générations ce mois` : 'Chargement...'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {PLAN_CARDS.map((plan) => {
            const Icon = plan.icon
            const isCurrent = currentPlan === plan.id
            return (
              <div key={plan.id} className={`rounded-xl p-4 border transition-all ${isCurrent ? 'border-orange-500 bg-orange-500/5' : 'border-dark-700 bg-dark-900'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={18} className={isCurrent ? 'text-orange-500' : 'text-slate-500'} />
                  <span className="text-sm font-medium text-slate-200">{plan.name}</span>
                </div>
                <p className="text-2xl font-bold text-slate-100 mb-3">
                  {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                  {plan.price > 0 && <span className="text-xs text-slate-500 font-normal">/mois</span>}
                </p>
                <ul className="space-y-1 mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="text-xs text-slate-400">• {f}</li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="text-center text-xs text-orange-400 font-medium py-2">Plan actuel</div>
                ) : plan.id === 'free' ? null : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading}
                    className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {upgrading ? 'Redirection...' : 'Upgrader'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {currentPlan !== 'free' && (
          <button onClick={handlePortal} className="text-xs text-slate-400 hover:text-slate-200 underline">
            Gérer mon abonnement
          </button>
        )}
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
        <div>
          <label className="block text-xs text-slate-300 font-medium mb-1.5">Email</label>
          <input type="email" defaultValue={user?.email || ''} className="w-full h-10 px-4 bg-dark-900 border border-dark-600 rounded-lg text-slate-100 opacity-60" disabled />
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
                      <button onClick={() => setShowKey(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))} className="absolute right-2 top-1/2 -translate-y-1/2">
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
          Les clés sont stockées de manière sécurisée et ne sont jamais partagées.
        </p>
      </div>
    </div>
  )
}
