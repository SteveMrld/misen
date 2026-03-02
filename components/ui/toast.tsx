'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { Check, X, AlertTriangle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() { return useContext(ToastContext) }

let toastId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'success', duration = 3000) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type, duration }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  const icons: Record<ToastType, any> = { success: Check, error: X, warning: AlertTriangle, info: Info }
  const colors: Record<ToastType, string> = {
    success: 'border-green-500/30 bg-green-500/10',
    error: 'border-red-500/30 bg-red-500/10',
    warning: 'border-amber-500/30 bg-amber-500/10',
    info: 'border-blue-500/30 bg-blue-500/10',
  }
  const iconColors: Record<ToastType, string> = {
    success: 'text-green-400', error: 'text-red-400', warning: 'text-amber-400', info: 'text-blue-400',
  }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[300] space-y-2 max-w-sm">
        {toasts.map((t) => {
          const Icon = icons[t.type]
          return (
            <div key={t.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl shadow-black/40 backdrop-blur-lg animate-fade-in ${colors[t.type]}`}
              style={{ background: 'rgba(17,14,11,0.9)' }}>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColors[t.type]} bg-dark-800`}>
                <Icon size={12} />
              </div>
              <span className="text-xs text-slate-200 flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="text-slate-600 hover:text-slate-400 flex-shrink-0">
                <X size={12} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
