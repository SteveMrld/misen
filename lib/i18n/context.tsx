'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { fr } from './fr'
import { en } from './en'
import type { Dictionary } from './types'

type Locale = 'fr' | 'en'

interface I18nContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Dictionary
}

const I18nContext = createContext<I18nContextType>({
  locale: 'fr',
  setLocale: () => {},
  t: fr,
})

const dictionaries: Record<Locale, Dictionary> = { fr, en }

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr')

  useEffect(() => {
    const saved = localStorage.getItem('misen-locale') as Locale
    if (saved && dictionaries[saved]) setLocaleState(saved)
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('misen-locale', l)
    document.documentElement.lang = l
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: dictionaries[locale] }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => useContext(I18nContext)
