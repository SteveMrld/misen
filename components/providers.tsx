'use client'

import { ReactNode } from 'react'
import { I18nProvider } from '@/lib/i18n'
import { CookieBanner } from '@/components/ui/cookie-banner'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      {children}
      <CookieBanner />
    </I18nProvider>
  )
}
