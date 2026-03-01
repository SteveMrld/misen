'use client'

import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { useI18n } from '@/lib/i18n'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ContactPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-dark-950">
      <LanguageToggle className="fixed top-4 right-4 z-50" />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-orange-400 mb-6">
            <ArrowLeft size={14} />
            {t.common.back}
          </Link>
          <Logo size="lg" className="mb-6" />
          <h1 className="text-3xl font-display font-bold text-white mb-2">{t.contact.title}</h1>
          <p className="text-slate-400">{t.contact.subtitle}</p>
        </div>

        <div className="bg-dark-800/50 border border-dark-600 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Mail size={20} className="text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">{t.contact.emailLabel}</p>
              <a href="mailto:contact@jabrilia.com" className="text-orange-400 hover:text-orange-300 font-medium">
                {t.contact.email}
              </a>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{t.contact.info}</p>
        </div>

        <div className="text-center pt-8 border-t border-dark-700">
          <p className="text-xs text-slate-500">
            {t.footer.rights}
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500">
            <Link href="/legal/cgu" className="hover:text-orange-400">{t.footer.cgu}</Link>
            <Link href="/legal/cgv" className="hover:text-orange-400">{t.footer.cgv}</Link>
            <Link href="/legal/privacy" className="hover:text-orange-400">{t.footer.privacy}</Link>
            <Link href="/legal/mentions" className="hover:text-orange-400">{t.footer.mentions}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
