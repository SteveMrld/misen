'use client'

import { useEffect } from 'react'
import { Logo } from '@/components/ui/logo'
import { RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('MISEN Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Logo size="lg" className="mx-auto mb-8" />
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-100 mb-3">Erreur inattendue</h2>
        <p className="text-sm text-slate-400 mb-8">
          Un problème est survenu. Réessayez ou retournez à l&apos;accueil.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a href="/" className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-slate-300 text-sm font-medium rounded-xl transition-colors">
            <Home size={16} /> Accueil
          </a>
          <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-orange-500/20">
            <RefreshCw size={16} /> Réessayer
          </button>
        </div>
      </div>
    </div>
  )
}
