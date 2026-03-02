'use client'

import { ReactNode } from 'react'
import { I18nProvider } from '@/lib/i18n'
import { CookieBanner } from '@/components/ui/cookie-banner'
import { ToastProvider } from '@/components/ui/toast'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ToastProvider>
        {children}
        <CookieBanner />
      </ToastProvider>
    </I18nProvider>
  )
}
