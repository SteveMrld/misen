'use client'

import { useState, useEffect } from 'react'
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
  Menu,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { useI18n } from '@/lib/i18n'

interface SidebarProps {
  userName?: string | null
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useI18n()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navigation = [
    {
      label: 'PRODUCTION',
      items: [
        { name: t.sidebar.projects, href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: t.common.settings.toUpperCase(),
      items: [
        { name: t.sidebar.settings, href: '/settings', icon: Settings },
      ],
    },
  ]

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const sidebarContent = (isMobile: boolean) => (
    <>
      {/* Logo */}
      <div className="h-header flex items-center justify-between px-4 border-b border-dark-700">
        <Logo size="sm" showText={isMobile || !collapsed} />
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-dark-800 lg:hidden">
            <X size={20} className="text-slate-400" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navigation.map((section) => (
          <div key={section.label} className="mb-4">
            {(isMobile || !collapsed) && (
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
                  {(isMobile || !collapsed) && (
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
        {(isMobile || !collapsed) && userName && (
          <div className="px-3 py-2 mb-1">
            <p className="text-body-sm text-slate-300 font-medium truncate">{userName}</p>
            <p className="text-caption text-slate-500">{t.sidebar.plan} Free</p>
          </div>
        )}

        {/* Collapse toggle — desktop only */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-slate-500 hover:bg-dark-800 hover:text-slate-300 transition-all duration-150"
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            {!collapsed && <span className="text-body-sm">{t.common.settings === 'Settings' ? 'Collapse' : 'Réduire'}</span>}
          </button>
        )}

        {/* Language */}
        <LanguageToggle className="w-full justify-start px-3 py-2" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-slate-500 hover:bg-dark-800 hover:text-red-400 transition-all duration-150"
        >
          <LogOut size={18} />
          {(isMobile || !collapsed) && <span className="text-body-sm">{t.sidebar.logout}</span>}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-dark-900 border border-dark-700 lg:hidden"
        aria-label="Menu"
      >
        <Menu size={20} className="text-slate-300" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[280px] bg-dark-900/95 backdrop-blur-xl border-r border-dark-700 flex flex-col transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent(true)}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'sticky left-0 top-0 h-screen bg-dark-900/95 backdrop-blur-xl border-r border-dark-700 flex-col z-40 transition-all duration-300 hidden lg:flex',
          collapsed ? 'w-sidebar-collapsed' : 'w-sidebar'
        )}
      >
        {sidebarContent(false)}
      </aside>
    </>
  )
}
