'use client'

import { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'

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
  if (!show) return null

  const groups: Record<string, { keys: string; label: string }[]> = {
    'Navigation': [
      { keys: '?', label: 'Afficher les raccourcis' },
      { keys: 'Esc', label: 'Fermer / Retour' },
      { keys: 'N', label: 'Nouveau projet' },
      { keys: 'D', label: 'Charger la démo' },
    ],
    'Éditeur': [
      { keys: '⌘+S', label: 'Sauvegarder le script' },
      { keys: '⌘+Enter', label: 'Lancer l\'analyse' },
      { keys: 'E', label: 'Basculer Simple ↔ Expert' },
    ],
    'Onglets Expert': [
      { keys: '1', label: 'Script' },
      { keys: '2', label: 'Analyse' },
      { keys: '3', label: 'Timeline' },
      { keys: '4', label: 'Copilote IA' },
      { keys: '5', label: 'Média bank' },
      { keys: '6', label: 'Sous-titres' },
      { keys: '7', label: 'Voix off' },
    ],
    'Timeline': [
      { keys: 'Space', label: 'Play / Pause' },
      { keys: '←', label: 'Reculer 2s' },
      { keys: '→', label: 'Avancer 5s' },
      { keys: 'Home', label: 'Début' },
    ],
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-display text-slate-100">Raccourcis clavier</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-dark-800">
            <X size={18} className="text-slate-400" />
          </button>
        </div>
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="mb-5">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{group}</h3>
            <div className="space-y-1.5">
              {items.map(({ keys, label }) => (
                <div key={keys} className="flex items-center justify-between py-1">
                  <span className="text-sm text-slate-300">{label}</span>
                  <div className="flex items-center gap-1">
                    {keys.split('+').map((k, i) => (
                      <kbd key={i} className="px-2 py-0.5 bg-dark-800 border border-dark-600 rounded text-[11px] text-slate-400 font-mono min-w-[24px] text-center">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className="text-[11px] text-slate-600 text-center mt-4">Appuyez <kbd className="px-1.5 py-0.5 bg-dark-800 border border-dark-600 rounded text-[10px] text-slate-400 font-mono">?</kbd> à tout moment</p>
      </div>
    </div>
  )
}
