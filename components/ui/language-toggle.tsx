'use client'

import { useI18n } from '@/lib/i18n'
import { Globe } from 'lucide-react'

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useI18n()

  return (
    <button
      onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10 text-slate-400 hover:text-white ${className}`}
      aria-label={locale === 'fr' ? 'Switch to English' : 'Passer en français'}
      title={locale === 'fr' ? 'English' : 'Français'}
    >
      <Globe size={14} />
      <span className="uppercase">{locale === 'fr' ? 'EN' : 'FR'}</span>
    </button>
  )
}
