'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { Logo } from '@/components/ui/logo'
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Film,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  userName?: string | null
}

const navigation = [
  {
    label: 'PRODUCTION',
    items: [
      { name: 'Mes projets', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'SYSTÈME',
    items: [
      { name: 'Réglages', href: '/settings', icon: Settings },
    ],
  },
]

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className={cn(
        'sticky left-0 top-0 h-screen bg-dark-900 border-r border-dark-700 flex flex-col z-40 transition-all duration-300',
        collapsed ? 'w-sidebar-collapsed' : 'w-sidebar'
      )}
    >
      {/* Logo */}
      <div className="h-header flex items-center px-4 border-b border-dark-700">
        <Logo size="sm" showText={!collapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navigation.map((section) => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <p className="px-4 mb-2 text-overline uppercase text-slate-500 tracking-widest">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-150 relative',
                    isActive
                      ? 'bg-dark-800 text-orange-500'
                      : 'text-slate-400 hover:bg-dark-800 hover:text-slate-200'
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-orange-500 rounded-r" />
                  )}
                  <Icon size={20} />
                  {!collapsed && (
                    <span className="text-body-sm font-medium">{item.name}</span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-dark-700 p-3 space-y-1">
        {/* User */}
        {!collapsed && userName && (
          <div className="px-3 py-2 mb-1">
            <p className="text-body-sm text-slate-300 font-medium truncate">{userName}</p>
            <p className="text-caption text-slate-500">Free plan</p>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-slate-500 hover:bg-dark-800 hover:text-slate-300 transition-all duration-150"
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          {!collapsed && <span className="text-body-sm">Réduire</span>}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-slate-500 hover:bg-dark-800 hover:text-red-400 transition-all duration-150"
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-body-sm">Déconnexion</span>}
        </button>
      </div>
    </aside>
  )
}
