'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/logo'
import { useI18n } from '@/lib/i18n'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? t.login.errorInvalid
          : t.login.errorGeneric
      )
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
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
        {t.login.title}
      </h1>
      <p className="text-body-sm text-slate-400 text-center mb-8">
        {t.login.subtitle}
      </p>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/20 text-error-light text-body-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="input-label">
            {t.login.email}
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
            {t.login.password}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input pr-10"
              autoComplete="current-password"
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

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary btn-md w-full"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              {t.common.loading}
            </>
          ) : (
            t.login.submit
          )}
        </button>
      </form>

      {/* Forgot password */}
      <div className="mt-3 text-right">
        <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-orange-400 transition-colors">
          {t.login.forgotPassword}
        </Link>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dark-700" />
        </div>
        <div className="relative flex justify-center text-caption">
          <span className="bg-dark-850 px-3 text-slate-500">{t.common.or}</span>
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
        {t.login.googleLogin}
      </button>

      {/* Register link */}
      <p className="mt-6 text-center text-body-sm text-slate-400">
        {t.login.noAccount}{' '}
        <Link
          href="/register"
          className="text-orange-500 hover:text-orange-400 transition-colors font-medium"
        >
          {t.login.registerLink}
        </Link>
      </p>
    </div>
  )
}
