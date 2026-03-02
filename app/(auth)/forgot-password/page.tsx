'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { useI18n } from '@/lib/i18n'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { createBrowserClient } from '@supabase/ssr'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings?tab=profile`,
    })

    setLoading(false)
    if (err) {
      setError(t.forgotPassword.errorNotFound)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <LanguageToggle className="fixed top-4 right-4" />
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/">
            <Logo size="lg" className="mx-auto mb-6" />
          </Link>
          {sent ? (
            <>
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <h1 className="text-xl font-semibold text-white mb-2">{t.forgotPassword.successTitle}</h1>
              <p className="text-sm text-slate-400">{t.forgotPassword.successDesc}</p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-white mb-2">{t.forgotPassword.title}</h1>
              <p className="text-sm text-slate-400">{t.forgotPassword.subtitle}</p>
            </>
          )}
        </div>

        {!sent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                {t.forgotPassword.email}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                placeholder="vous@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 btn-primary text-sm font-medium rounded-xl"
            >
              {loading ? t.common.loading : t.forgotPassword.submit}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-orange-400 transition-colors">
            <ArrowLeft size={14} />
            {t.forgotPassword.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  )
}
