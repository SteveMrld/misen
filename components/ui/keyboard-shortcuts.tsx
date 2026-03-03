'use client'

import { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

type Shortcut = {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  label: string
  action: () => void
  category?: string
}

export function useKeyboardShortcuts(shortcuts: Shortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in input/textarea
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      for (const s of shortcuts) {
        const keyMatch = e.key.toLowerCase() === s.key.toLowerCase()
        const ctrlMatch = !s.ctrl || (e.ctrlKey || e.metaKey)
        const shiftMatch = !s.shift || e.shiftKey
        const altMatch = !s.alt || e.altKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault()
          s.action()
          return
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [shortcuts, enabled])
}

// Shortcut help overlay
export function ShortcutOverlay({ show, onClose }: { show: boolean; onClose: () => void }) {
  const { locale } = useI18n()
  const fr = locale === 'fr'
  if (!show) return null

  const groups: Record<string, { keys: string; label: string }[]> = {
    [fr ? 'Navigation' : 'Navigation']: [
      { keys: '?', label: fr ? 'Afficher les raccourcis' : 'Show shortcuts' },
      { keys: '⌘+K', label: 'Command palette' },
      { keys: 'Esc', label: fr ? 'Fermer / Retour' : 'Close / Back' },
      { keys: 'E', label: fr ? 'Basculer Simple / Expert' : 'Toggle Simple / Expert' },
    ],
    [fr ? 'Workspaces' : 'Workspaces']: [
      { keys: '1', label: fr ? 'Écriture (Script)' : 'Writing (Script)' },
      { keys: '2', label: fr ? 'Analyse (Vue d\'ensemble)' : 'Analysis (Overview)' },
      { keys: '3', label: fr ? 'Production (Storyboard)' : 'Production (Storyboard)' },
      { keys: '4', label: fr ? 'Post-production (Sous-titres)' : 'Post-production (Subtitles)' },
      { keys: '5', label: fr ? 'Export (Rendu)' : 'Export (Render)' },
    ],
    [fr ? 'Onglets (tous onglets)' : 'Tabs (all tabs)']: [
      { keys: '6', label: fr ? 'Copilote IA' : 'AI Copilot' },
      { keys: '7', label: fr ? 'Médias' : 'Media' },
      { keys: '8', label: fr ? 'Voix off' : 'Voiceover' },
      { keys: '9', label: fr ? 'Musique IA' : 'AI Music' },
      { keys: '0', label: 'Timeline' },
    ],
    [fr ? 'Éditeur' : 'Editor']: [
      { keys: '⌘+S', label: fr ? 'Sauvegarder' : 'Save' },
      { keys: '⌘+Enter', label: 'Lancer l\'analyse' },
      { keys: 'N', label: fr ? 'Nouveau projet' : 'New project' },
      { keys: 'D', label: fr ? 'Charger la démo' : 'Load demo' },
    ],
    ['Player & Timeline']: [
      { keys: 'Space', label: 'Play / Pause' },
      { keys: 'J', label: fr ? 'Reculer (NLE)' : 'Backward (NLE)' },
      { keys: 'K', label: 'Pause (NLE)' },
      { keys: 'L', label: fr ? 'Avancer (NLE)' : 'Forward (NLE)' },
    ],
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl shadow-black/60" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-display text-gradient-copper">{fr ? 'Raccourcis clavier' : 'Keyboard Shortcuts'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-dark-800">
            <X size={18} className="text-slate-400" />
          </button>
        </div>
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="mb-5">
            <h3 className="text-[11px] font-bold text-orange-400/60 uppercase tracking-wider mb-2">{group}</h3>
            <div className="space-y-1.5">
              {items.map(({ keys, label }) => (
                <div key={keys} className="flex items-center justify-between py-1">
                  <span className="text-sm text-slate-300">{label}</span>
                  <div className="flex items-center gap-1">
                    {keys.split('+').map((k, i) => (
                      <kbd key={i} className="px-2 py-0.5 bg-dark-800 border border-dark-600 rounded-md text-[11px] text-orange-400/80 font-mono min-w-[24px] text-center shadow-sm shadow-dark-950">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className="text-[11px] text-slate-600 text-center mt-4">{fr ? 'Appuyez' : 'Press'} <kbd className="px-1.5 py-0.5 bg-dark-800 border border-dark-600 rounded text-[10px] text-slate-400 font-mono">?</kbd> {fr ? ' à tout moment' : ' anytime'}</p>
      </div>
    </div>
  )
}
