'use client'

import { usePathname } from 'next/navigation'
import { Search, Bell } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Mes projets',
  '/settings': 'Réglages',
}

export function Header() {
  const pathname = usePathname()
  const title = pageTitles[pathname] || 'MISEN'

  return (
    <header className="sticky top-0 z-30 h-header bg-dark-900 border-b border-dark-700 flex items-center justify-between px-4 lg:px-6">
      {/* Page title — offset on mobile for hamburger */}
      <h2 className="text-h4 text-slate-100 font-sans pl-10 lg:pl-0">{title}</h2>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="btn-ghost p-2 rounded-lg">
          <Search size={18} className="text-slate-400" />
        </button>
        <button className="btn-ghost p-2 rounded-lg relative">
          <Bell size={18} className="text-slate-400" />
        </button>
      </div>
    </header>
  )
}
