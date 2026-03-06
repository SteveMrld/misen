'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, Key, Save, Loader2, Check, Trash2, Eye, EyeOff, CreditCard, Zap, Crown, Sparkles, BarChart3, Download } from 'lucide-react'
import { CostsDashboard } from '@/components/ui/costs-dashboard'
import { useI18n } from '@/lib/i18n'

const AI_PROVIDERS = [
  { id: 'anthropic', name: '🧠 Claude (Assistant scénariste)', placeholder: 'sk-ant-...' },
  { id: 'openai', name: '🤖 OpenAI GPT (Assistant fallback)', placeholder: 'sk-...' },
  { id: 'kling', name: 'Kling 3.0', placeholder: 'sk-kling-...' },
  { id: 'runway', name: 'Runway Gen-4.5', placeholder: 'rw_...' },
  { id: 'sora', name: 'Sora 2', placeholder: 'sk-...' },
  { id: 'veo', name: 'Veo 3.1', placeholder: 'AIza...' },
  { id: 'seedance', name: 'Seedance 2.0', placeholder: 'sd-...' },
  { id: 'wan', name: 'Wan 2.5', placeholder: 'wan-...' },
  { id: 'hailuo', name: 'Hailuo 2.3', placeholder: 'hl-...' },
  { id: 'pexels', name: 'Pexels (Banque média)', placeholder: 'Votre clé Pexels...' },
  { id: 'pixabay', name: 'Pixabay (Banque média)', placeholder: 'Votre clé Pixabay...' },
  { id: 'elevenlabs', name: 'ElevenLabs (Voix off)', placeholder: 'Votre clé ElevenLabs...' },
]

const PLANS = [
  {
    id: 'free', name: 'Free', price: 0, icon: Zap,
    features: ['17 moteurs d\'analyse', 'Prompts optimisés par plan', '3 projets max', 'Assistant IA (3 req/mois)', 'Export JSON'],
  },
  {
    id: 'pro', name: 'Pro', price: 29, icon: Crown, popular: true,
    features: ['17 moteurs d\'analyse', 'Mode Expert complet', '20 projets', 'Assistant IA (30 req/mois)', 'Génération intégrée (vos clés)', 'Support prioritaire'],
  },
  {
    id: 'studio', name: 'Studio', price: 79, icon: Sparkles,
    features: ['17 moteurs d\'analyse', 'Projets illimités', 'Assistant IA illimité', 'Génération intégrée (vos clés)', 'API access', 'Support dédié'],
  },
]

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const { t, locale } = useI18n()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const initialTab = (searchParams.get('tab') as any) || 'profile'
  const [tab, setTab] = useState<'profile' | 'apikeys' | 'billing' | 'usage'>(
    ['profile', 'apikeys', 'billing', 'usage'].includes(initialTab) ? initialTab : 'profile'
  )

  // API Keys state
  const [keys, setKeys] = useState<Record<string, { masked: string; hasKey: boolean }>>({})
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [showKey, setShowKey] = useState<Record<string, boolean>>({})

  // Subscription state
  const [sub, setSub] = useState<any>(null)
  const [checkoutLoading, setCheckoutLoading] = useState('')

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

      if (subRes.ok) {
        setSub(await subRes.json())
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
    if (!confirm(t.settings.apikeys.confirmDelete)) return
    try {
      await fetch('/api/api-keys', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider }) })
      setKeys(prev => ({ ...prev, [provider]: { masked: '', hasKey: false } }))
    } catch {}
  }

  const handleCheckout = async (planId: string) => {
    const plan = PLANS.find(p => p.id === planId)
    if (!plan || planId === 'free') return
    setCheckoutLoading(planId)
    try {
      const priceIdKey = planId === 'pro' ? 'STRIPE_PRO_PRICE_ID' : 'STRIPE_STUDIO_PRICE_ID'
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: planId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {}
    finally { setCheckoutLoading('') }
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
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-50">{t.settings.title}</h1>
        <p className="text-sm text-slate-400 mt-1">{t.common.tagline}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-dark-900 rounded-lg p-1 w-fit overflow-x-auto scrollbar-hide">
        {[
          { id: 'profile' as const, label: t.settings.tabs.profile, icon: User },
          { id: 'apikeys' as const, label: t.settings.tabs.apikeys, icon: Key },
          { id: 'billing' as const, label: t.settings.tabs.billing, icon: CreditCard },
          { id: 'usage' as const, label: t.settings.tabs.usage, icon: BarChart3 },
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              tab === tb.id ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/15' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <tb.icon size={16} /> {tb.label}
          </button>
        ))}
      </div>

      {/* ─── PROFIL ─── */}
      {tab === 'profile' && (
        <div className="space-y-4">
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <h3 className="text-sm font-medium text-slate-100 mb-4">{t.settings.profile.title}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1.5">{t.settings.profile.email}</label>
                <input type="email" defaultValue={user?.email || ''} className="w-full h-10 px-4 bg-dark-900 border border-dark-600 rounded-lg text-slate-100 opacity-60" disabled />
              </div>
              <div>
                <label className="block text-xs text-slate-300 font-medium mb-1.5">{t.settings.billing.currentPlan}</label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-md text-sm font-medium capitalize">{currentPlan}</span>
                  {sub?.generations_used !== undefined && (
                    <span className="text-xs text-slate-500">
                      {sub.generations_used} {locale === 'fr' ? `génération${sub.generations_used > 1 ? 's' : ''} utilisée${sub.generations_used > 1 ? 's' : ''}` : `generation${sub.generations_used > 1 ? 's' : ''} used`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Export data (RGPD) */}
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <h3 className="text-sm font-medium text-slate-100 mb-1">{t.settings.profile.exportData}</h3>
            <p className="text-xs text-slate-400 mb-4">{t.settings.profile.exportDataDesc}</p>
            <a
              href="/api/account/export"
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 border border-dark-600 text-slate-300 text-sm font-medium rounded-lg transition-colors"
            >
              <Download size={14} />
              {t.settings.profile.exportDataButton}
            </a>
          </div>

          {/* Delete account */}
          <div className="bg-dark-800 rounded-xl p-6 border border-red-500/20">
            <h3 className="text-sm font-medium text-red-400 mb-1">{t.settings.profile.deleteAccount}</h3>
            <p className="text-xs text-slate-400 mb-4">{t.settings.profile.deleteAccountDesc}</p>
            <button
              onClick={async () => {
                const confirmation = prompt(t.settings.profile.deleteAccountConfirm)
                if (confirmation !== (t.settings.profile.deleteAccountConfirm.includes('DELETE') ? 'DELETE' : 'SUPPRIMER')) return
                const res = await fetch('/api/account/delete', { method: 'DELETE' })
                if (res.ok) {
                  const { createClient: cc } = await import('@/lib/supabase/client')
                  const sb = cc()
                  await sb.auth.signOut()
                  window.location.href = '/'
                } else {
                  alert(t.common.error)
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-colors"
            >
              <Trash2 size={14} />
              {t.settings.profile.deleteAccount}
            </button>
          </div>
        </div>
      )}

      {/* ─── CLÉS API ─── */}
      {tab === 'apikeys' && (
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <h3 className="text-sm font-medium text-slate-100 mb-1">{t.settings.apikeys.title}</h3>
          <p className="text-xs text-slate-400 mb-4">{t.settings.apikeys.desc}</p>

          <div className="space-y-3">
            {AI_PROVIDERS.map((provider) => {
              const keyData = keys[provider.id]
              const hasKey = keyData?.hasKey || false
              const isSaving = saving[provider.id] || false
              const isSaved = saved[provider.id] || false

              return (
                <div key={provider.id} className="p-3 bg-dark-900 rounded-lg border border-dark-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: hasKey ? '#22c55e' : '#64748b' }} />
                      <span className="text-sm font-medium text-slate-200">{provider.name}</span>
                    </div>
                    {hasKey && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-mono">{keyData.masked}</span>
                        <button onClick={() => handleDeleteKey(provider.id)} className="p-1 rounded hover:bg-white/5">
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
                        className="h-9 px-3 btn-primary text-xs font-medium rounded-lg flex items-center gap-1.5"
                      >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : isSaved ? <Check size={14} /> : <Save size={14} />}
                        {isSaved ? 'OK' : t.common.save}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-slate-500 mt-4">{t.settings.apikeys.noKeysDesc}</p>
        </div>
      )}

      {/* ─── BILLING ─── */}
      {tab === 'billing' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {PLANS.map((plan) => {
              const isCurrent = currentPlan === plan.id
              const Icon = plan.icon
              return (
                <div key={plan.id} className={`relative rounded-xl p-5 border transition-all ${
                  isCurrent ? 'bg-orange-500/5 border-orange-500/30' : 'bg-dark-800 border-dark-700 hover:border-dark-600'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 btn-primary text-[10px] font-bold rounded-full uppercase">
                      {t.pricing.popular}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={20} className={isCurrent ? 'text-orange-500' : 'text-slate-400'} />
                    <span className="text-sm font-bold text-slate-100">{plan.name}</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-slate-50">{plan.price === 0 ? t.common.free : `${plan.price}€`}</span>
                    {plan.price > 0 && <span className="text-xs text-slate-500">/mois</span>}
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <Check size={12} className="text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <div className="w-full py-2 text-center text-xs font-medium text-orange-400 bg-orange-500/10 rounded-lg">
                      {t.settings.billing.currentPlan}
                    </div>
                  ) : plan.price > 0 ? (
                    <button
                      onClick={() => handleCheckout(plan.id)}
                      disabled={!!checkoutLoading}
                      className="w-full py-2 btn-primary text-xs font-medium rounded-lg flex items-center justify-center gap-1.5"
                    >
                      {checkoutLoading === plan.id ? <Loader2 size={14} className="animate-spin" /> : null}
                      {t.settings.billing.changePlan} {plan.name}
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>

          {currentPlan !== 'free' && (
            <div className="bg-dark-800 rounded-xl p-5 border border-dark-700">
              <h3 className="text-sm font-medium text-slate-100 mb-2">{t.settings.billing.manageBilling}</h3>
              <p className="text-xs text-slate-400 mb-3">{t.settings.billing.features}</p>
              <button onClick={handlePortal} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs font-medium rounded-lg transition-colors">
                Stripe Portal
              </button>
            </div>
          )}

          {sub && (
            <div className="mt-4 p-4 bg-dark-900 rounded-lg border border-dark-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{t.settings.usage.analysesUsed}</span>
                <span className="text-slate-200 font-medium">
                  {sub.generations_used || 0} / {sub.planDetails?.generations === -1 ? '∞' : sub.planDetails?.generations || 5}
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{
                    width: sub.planDetails?.generations === -1
                      ? '5%'
                      : `${Math.min(100, ((sub.generations_used || 0) / (sub.planDetails?.generations || 5)) * 100)}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'usage' && (
        <CostsDashboard />
      )}
    </div>
  )
}
