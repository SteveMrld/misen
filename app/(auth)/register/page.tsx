'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/logo'
import { useI18n } from '@/lib/i18n'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!termsAccepted) return
    setLoading(true)
    setError(null)

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
  }

  // Confirmation screen
  if (success) {
    return (
      <div className="card p-8 bg-dark-850 border-dark-700 animate-fade-in text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle size={48} className="text-success" />
        </div>
        <h2 className="text-h3 text-slate-50 mb-3">Vérifiez votre email</h2>
        <p className="text-body-sm text-slate-400 mb-6">
          Un lien de confirmation a été envoyé à <strong className="text-slate-200">{email}</strong>.
          Cliquez dessus pour activer votre compte.
        </p>
        <Link href="/login" className="btn-secondary btn-md inline-flex">
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <div className="card p-8 bg-dark-850 border-dark-700 animate-fade-in">
      <LanguageToggle className="absolute top-4 right-4" />
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Link href="/">
          <Logo size="lg" />
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-h3 text-center text-slate-50 mb-2">
        {t.register.title}
      </h1>
      <p className="text-body-sm text-slate-400 text-center mb-8">
        {t.register.subtitle}
      </p>

      {/* Error */}
      {error && (
        <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/20 text-error-light text-body-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleRegister} className="space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="name" className="input-label">
            Nom
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom"
            required
            className="input"
            autoComplete="name"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="input-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            className="input"
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="input-label">
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 caractères"
              required
              minLength={8}
              className="input pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Legal — checkbox consentement actif */}
        <div className="flex items-start gap-2">
          <input
            id="terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
            className="mt-0.5 w-4 h-4 rounded border-dark-600 bg-dark-800 text-orange-500 focus:ring-orange-500/50 accent-orange-500"
          />
          <label htmlFor="terms" className="text-[11px] text-slate-500">
            {t.register.termsPrefix}{' '}
            <a href="/legal/cgu" className="text-orange-400 hover:text-orange-300 underline underline-offset-2">{t.register.termsLink}</a>,{' '}
            <a href="/legal/cgv" className="text-orange-400 hover:text-orange-300 underline underline-offset-2">{t.register.cgvLink}</a> {t.common.and}{' '}
            <a href="/legal/privacy" className="text-orange-400 hover:text-orange-300 underline underline-offset-2">{t.register.privacyLink}</a>.
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !termsAccepted}
          className="btn-primary btn-md w-full"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              {t.common.loading}
            </>
          ) : (
            t.register.submit
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dark-700" />
        </div>
        <div className="relative flex justify-center text-caption">
          <span className="bg-dark-850 px-3 text-slate-500">ou</span>
        </div>
      </div>

      {/* Google OAuth */}
      <button
        onClick={handleGoogleLogin}
        className="btn-secondary btn-md w-full"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continuer avec Google
      </button>

      {/* Login link */}
      <p className="mt-6 text-center text-body-sm text-slate-400">
        Déjà un compte ?{' '}
        <Link
          href="/login"
          className="text-orange-500 hover:text-orange-400 transition-colors font-medium"
        >
          Se connecter
        </Link>
      </p>
    </div>
  )
}
