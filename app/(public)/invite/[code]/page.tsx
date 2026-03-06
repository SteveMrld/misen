'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/logo'
import { ArrowRight, Sparkles, Film, Shield, Loader2 } from 'lucide-react'

interface InviteData {
  valid: boolean
  name?: string
  role?: string
  welcome_message?: string
  error?: string
}

const ROLE_LABELS: Record<string, { fr: string; badge: string; color: string }> = {
  founder: { fr: 'Fondateur', badge: 'FONDATEUR', color: '#D4AF37' },
  cofounder: { fr: 'Cofondateur', badge: 'COFONDATEUR', color: '#C56A2D' },
  beta_tester: { fr: 'Beta Testeur', badge: 'ACCÈS BETA', color: '#6C4DFF' },
  studio: { fr: 'Studio', badge: 'STUDIO', color: '#10B981' },
  press: { fr: 'Presse', badge: 'PRESSE', color: '#EC4899' },
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const [data, setData] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [entering, setEntering] = useState(false)

  useEffect(() => {
    fetch(`/api/invite/validate?code=${encodeURIComponent(code)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setData({ valid: false, error: 'Erreur de connexion' }); setLoading(false) })
  }, [code])

  const handleEnter = () => {
    setEntering(true)
    // Store invite code in cookie for registration
    document.cookie = `misen_invite=${code};path=/;max-age=86400;SameSite=Lax`
    setTimeout(() => router.push('/register'), 600)
  }

  const roleInfo = data?.role ? ROLE_LABELS[data.role] || ROLE_LABELS.beta_tester : ROLE_LABELS.beta_tester

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-orange-400 animate-spin" />
          <p className="text-sm text-slate-500">Vérification de votre invitation...</p>
        </div>
      </div>
    )
  }

  if (!data?.valid) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Logo size="lg" showText className="mx-auto mb-8" />
          <div className="bg-dark-900 border border-red-500/20 rounded-2xl p-8">
            <Shield size={32} className="text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-display font-bold text-white mb-3">Invitation non valide</h1>
            <p className="text-sm text-slate-400 mb-6">
              {data?.error || 'Ce code d\'invitation n\'existe pas, a expiré ou a déjà été utilisé.'}
            </p>
            <p className="text-xs text-slate-600">
              MISEN est actuellement en accès privé. Contactez le fondateur pour obtenir une invitation.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[160px]"
          style={{ background: `${roleInfo.color}08` }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/[0.03] rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className={`relative z-10 max-w-lg w-full transition-all duration-700 ${entering ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {/* Logo */}
        <div className="text-center mb-10">
          <Logo size="lg" showText className="mx-auto" />
        </div>

        {/* Welcome card */}
        <div className="bg-dark-900/80 backdrop-blur-xl border border-dark-700 rounded-2xl overflow-hidden">
          {/* Header with role badge */}
          <div className="px-8 pt-8 pb-4">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest"
                style={{ background: `${roleInfo.color}15`, color: roleInfo.color, border: `1px solid ${roleInfo.color}30` }}>
                {roleInfo.badge}
              </span>
            </div>

            <h1 className="text-2xl font-display font-bold text-white text-center mb-2">
              Bienvenue{data.name ? ` ${data.name}` : ''}
            </h1>

            {data.role === 'cofounder' && (
              <p className="text-sm text-center mb-4" style={{ color: roleInfo.color }}>
                Cofondateur de MISEN
              </p>
            )}
          </div>

          {/* Welcome message */}
          <div className="px-8 pb-6">
            <div className="bg-dark-800/50 rounded-xl p-5 border border-dark-700/50">
              <p className="text-sm text-slate-300 leading-relaxed">
                {data.welcome_message || 'Vous avez été invité à découvrir MISEN, le premier studio de production cinématographique piloté par intelligence artificielle. 17 moteurs d\'analyse, 11 modèles IA, une architecture sans équivalent.'}
              </p>
            </div>
          </div>

          {/* Features teaser */}
          <div className="px-8 pb-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Film, label: '17 moteurs', sub: 'd\'intelligence' },
                { icon: Sparkles, label: '11 modèles', sub: 'IA intégrés' },
                { icon: Shield, label: '36K lignes', sub: 'de code' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center py-3 bg-dark-800/30 rounded-lg border border-dark-700/30">
                  <Icon size={16} className="text-orange-400 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-white">{label}</p>
                  <p className="text-[10px] text-slate-500">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="px-8 pb-8">
            <button
              onClick={handleEnter}
              disabled={entering}
              className="w-full btn-primary py-3.5 text-sm font-semibold flex items-center justify-center gap-2 rounded-xl transition-all"
            >
              {entering ? (
                <><Loader2 size={16} className="animate-spin" /> Préparation de votre espace...</>
              ) : (
                <>Entrer dans MISEN <ArrowRight size={16} /></>
              )}
            </button>
            <p className="text-[10px] text-slate-600 text-center mt-3">
              Vous allez créer votre compte. Vos données sont protégées.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
