'use client'

import { useI18n } from '@/lib/i18n'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { useState } from 'react'
import Link from 'next/link'
import { Check, X, Zap, Crown, Sparkles, Play, ArrowRight, Brain, Film, Copy, HelpCircle } from 'lucide-react'

const PLAN_ICONS = [Zap, Crown, Sparkles]
const PLAN_STYLES = [
  { ctaStyle: 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-200', popular: false },
  { ctaStyle: 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20', popular: true },
  { ctaStyle: 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-200', popular: false },
]
const PLAN_PRICES = [0, 29, 79]

export default function PricingPage() {
  const { t, locale } = useI18n()
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const VALUE_ICONS = [Brain, Film, Copy]

  return (
    <div className="min-h-screen bg-dark-950">
      <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Play size={12} className="text-white ml-0.5" fill="white" />
          </div>
          <span className="font-display text-lg font-bold text-white tracking-tight">MISEN</span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">{t.nav.login}</Link>
          <Link href="/register" className="text-sm px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors">{t.pricing.ctaButton}</Link>
        </div>
      </nav>

      <header className="px-6 pt-12 pb-8 text-center max-w-3xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">{t.pricing.title}</h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">{t.pricing.subtitle}</p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className={`text-sm transition-colors ${!annual ? 'text-white' : 'text-slate-500'}`}>{t.pricing.monthly}</span>
          <button onClick={() => setAnnual(!annual)} className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-orange-600' : 'bg-dark-700'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${annual ? 'left-7' : 'left-1'}`} />
          </button>
          <span className={`text-sm transition-colors ${annual ? 'text-white' : 'text-slate-500'}`}>
            {t.pricing.annual} <span className="text-orange-400 text-xs font-medium">{t.pricing.annualSave}</span>
          </span>
        </div>
      </header>

      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {t.pricing.plans.map((plan, idx) => {
            const Icon = PLAN_ICONS[idx]; const style = PLAN_STYLES[idx]; const basePrice = PLAN_PRICES[idx]
            const price = basePrice === 0 ? 0 : annual ? Math.round(basePrice * 0.8) : basePrice
            return (
              <div key={idx} className={`relative rounded-2xl p-6 border transition-all flex flex-col ${style.popular ? 'bg-orange-600/[0.06] border-orange-500/30 shadow-xl shadow-orange-600/5' : 'bg-white/[0.02] border-white/[0.06]'}`}>
                {style.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-orange-600 text-white text-[10px] font-bold tracking-wider uppercase rounded-full">{t.pricing.popular}</div>}
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-1.5 rounded-lg ${style.popular ? 'bg-orange-600/20' : 'bg-white/[0.05]'}`}><Icon size={16} className={style.popular ? 'text-orange-400' : 'text-slate-400'} /></div>
                  <span className={`text-sm font-bold tracking-wider ${style.popular ? 'text-orange-400' : 'text-slate-400'}`}>{plan.name.toUpperCase()}</span>
                </div>
                <div className="mb-1">
                  <span className="font-display text-4xl text-white">{price === 0 ? t.common.free : `${price}€`}</span>
                  {price > 0 && <span className="text-sm text-slate-500">/{t.common.month}</span>}
                </div>
                <p className="text-xs text-slate-500 mb-6">{plan.desc}</p>
                <div className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {f.included ? <Check size={14} className={`mt-0.5 flex-shrink-0 ${style.popular ? 'text-orange-500' : 'text-green-500/70'}`} /> : <X size={14} className="mt-0.5 flex-shrink-0 text-slate-700" />}
                      <span className={`text-xs ${f.included ? 'text-slate-300' : 'text-slate-600'}`}>{f.text}</span>
                    </div>
                  ))}
                </div>
                <Link href="/register" className={`block text-center py-3 rounded-xl text-sm font-medium transition-all ${style.ctaStyle}`}>{plan.cta}</Link>
              </div>
            )
          })}
        </div>
      </section>

      <section className="px-6 py-12 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl text-white text-center mb-8">{t.pricing.valueTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.pricing.valuePillars.map((item, i) => { const ItemIcon = VALUE_ICONS[i]; return (
              <div key={i} className="p-5 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                <ItemIcon size={20} className="text-orange-400 mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            )})}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 border-t border-white/[0.05]">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl text-white text-center mb-8">{t.pricing.faqTitle}</h2>
          <div className="space-y-2">
            {t.pricing.faq.map((faq, i) => (
              <div key={i} className="border border-white/[0.06] rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm text-slate-200 font-medium pr-4">{faq.q}</span>
                  <HelpCircle size={16} className={`flex-shrink-0 transition-colors ${openFaq === i ? 'text-orange-400' : 'text-slate-600'}`} />
                </button>
                {openFaq === i && <div className="px-5 pb-4"><p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="font-display text-2xl text-white mb-3">{t.pricing.ctaTitle}</h2>
          <p className="text-sm text-slate-400 mb-6">{t.pricing.ctaDesc}</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/register" className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2">{t.pricing.ctaButton} <ArrowRight size={16} /></Link>
            <Link href="/demo" className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 text-sm font-medium rounded-xl transition-colors flex items-center gap-2"><Play size={14} /> {t.pricing.ctaSecondary}</Link>
          </div>
        </div>
      </section>

      <footer className="px-6 py-6 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center"><Play size={8} className="text-white ml-0.5" fill="white" /></div>
            <span className="text-xs text-slate-600">MISEN © 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{t.common.home}</Link>
            <Link href="/demo" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{t.common.demo}</Link>
            <Link href="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{t.common.login}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
