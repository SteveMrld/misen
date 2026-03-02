import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Logo size="lg" className="mx-auto mb-8" />
        <h1 className="text-6xl font-display font-bold text-orange-500 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-slate-100 mb-3">Page introuvable</h2>
        <p className="text-sm text-slate-400 mb-8">
          Cette scène n&apos;existe pas dans le storyboard. Retournez au studio.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="px-5 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 text-slate-300 text-sm font-medium rounded-xl transition-colors">
            Accueil
          </Link>
          <Link href="/dashboard" className="px-5 py-2.5 btn-primary text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-orange-500/20">
            Mon studio
          </Link>
        </div>
      </div>
    </div>
  )
}
