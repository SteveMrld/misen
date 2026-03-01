'use client'

import Link from 'next/link'
import { Play, ArrowLeft } from 'lucide-react'

export function LegalLayout({ title, lastUpdated, children }: { title: string; lastUpdated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-950">
      <nav className="px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Play size={12} className="text-white ml-0.5" fill="white" />
          </div>
          <span className="font-display text-lg font-bold text-white tracking-tight">MISEN</span>
        </Link>
        <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Retour
        </Link>
      </nav>

      <article className="px-6 py-8 max-w-3xl mx-auto">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">{title}</h1>
        <p className="text-xs text-slate-500 mb-8">Dernière mise à jour : {lastUpdated}</p>
        <div className="prose-legal space-y-6 text-sm text-slate-300 leading-relaxed">
          {children}
        </div>
      </article>

      <footer className="px-6 py-6 border-t border-white/[0.05] mt-12">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs text-slate-600">MISEN © 2026</span>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <Link href="/legal/cgu" className="hover:text-slate-300 transition-colors">CGU</Link>
            <Link href="/legal/cgv" className="hover:text-slate-300 transition-colors">CGV</Link>
            <Link href="/legal/privacy" className="hover:text-slate-300 transition-colors">Confidentialité</Link>
            <Link href="/legal/mentions" className="hover:text-slate-300 transition-colors">Mentions légales</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
