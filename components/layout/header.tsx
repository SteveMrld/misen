'use client'

import { usePathname } from 'next/navigation'
import { Search, Bell } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function Header() {
  const pathname = usePathname()
  const { t, locale } = useI18n()

  const pageTitles: Record<string, string> = {
    '/dashboard': locale === 'fr' ? 'Mes projets' : 'My projects',
    '/settings': locale === 'fr' ? 'Réglages' : 'Settings',
  }
  const title = pageTitles[pathname] || 'MISEN'

  return (
    <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700">
      {/* Copper beam accent */}
      <div className="beam w-full" />
      <div className="flex items-center justify-between px-4 lg:px-6 h-14">
        {/* Page title — offset on mobile for hamburger */}
        <h2 className="text-h4 text-slate-100 font-display pl-10 lg:pl-0">{title}</h2>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="btn-ghost p-2 rounded-lg">
            <Search size={18} className="text-slate-400" />
          </button>
          <button className="btn-ghost p-2 rounded-lg relative">
            <Bell size={18} className="text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  )
}
