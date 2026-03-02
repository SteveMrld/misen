'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { X } from 'lucide-react'

export function CookieBanner() {
  const { t } = useI18n()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('misen-cookies-accepted')
    if (!accepted) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('misen-cookies-accepted', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 animate-in slide-in-from-bottom-4">
      <div className="max-w-2xl mx-auto bg-dark-800 border border-dark-600 rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-4">
        <p className="text-sm text-slate-300 flex-1">{t.cookie.message}</p>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/legal/privacy" className="text-xs text-orange-400 hover:text-orange-300 whitespace-nowrap">
            {t.cookie.learnMore}
          </Link>
          <button
            onClick={accept}
            className="px-4 py-1.5 btn-primary text-sm font-medium rounded-lg"
          >
            {t.cookie.accept}
          </button>
        </div>
        <button onClick={accept} className="text-slate-500 hover:text-white" aria-label="Close">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
