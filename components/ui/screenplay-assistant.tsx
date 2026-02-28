'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Sparkles, Send, Loader2, Copy, Check, ArrowRight,
  Film, Wand2, MessageSquare, X, ChevronDown
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = [
  { icon: '🎬', label: 'Court-métrage', prompt: 'J\'ai une idée de court-métrage. Aide-moi à écrire le scénario.' },
  { icon: '📺', label: 'Pub / Spot', prompt: 'J\'ai besoin d\'un scénario de publicité vidéo de 30 secondes.' },
  { icon: '🎵', label: 'Clip musical', prompt: 'Je veux créer un clip vidéo pour une chanson. Aide-moi avec le scénario visuel.' },
  { icon: '📖', label: 'Documentaire', prompt: 'Je veux réaliser un mini-documentaire. Aide-moi à structurer le scénario.' },
  { icon: '🎓', label: 'Vidéo éducative', prompt: 'J\'ai besoin d\'un scénario pour une vidéo explicative/éducative.' },
  { icon: '✨', label: 'Peaufiner mon texte', prompt: 'J\'ai un texte brut que je voudrais transformer en scénario professionnel au format cinéma.' },
]

export function ScreenplayAssistant({
  onUseScript,
  existingScript,
}: {
  onUseScript: (script: string) => void
  existingScript?: string
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(!existingScript)
  const [quota, setQuota] = useState<{ used: number; limit: number; remaining: number } | null>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      if (data.error) {
        const errMsg = data.error.includes('clé API') || data.error.includes('requêtes')
          ? `⚠️ ${data.error}`
          : `⚠️ Erreur : ${data.error}`
        setMessages([...newMessages, { role: 'assistant', content: errMsg }])
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.response }])
        if (data.quota) setQuota(data.quota)
      }
    } catch (e: any) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: `⚠️ Impossible de contacter l'assistant. Vérifiez votre connexion et vos clés API dans Réglages.`,
      }])
    } finally {
      setLoading(false)
    }
  }

  // Extract screenplay from last assistant message
  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant')
  const hasScreenplay = lastAssistantMsg?.content.includes('INT.') || lastAssistantMsg?.content.includes('EXT.')

  const copyScript = () => {
    if (lastAssistantMsg) {
      navigator.clipboard.writeText(lastAssistantMsg.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const useScript = () => {
    if (lastAssistantMsg) {
      onUseScript(lastAssistantMsg.content)
    }
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full p-4 bg-gradient-to-r from-orange-600/10 to-purple-600/10 border border-orange-500/20 rounded-xl hover:border-orange-500/40 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center group-hover:bg-orange-600/30 transition-colors">
            <Wand2 size={20} className="text-orange-400" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-slate-200">Assistant scénariste IA</p>
            <p className="text-xs text-slate-500">Pas de scénario ? Décrivez votre idée, l'IA vous accompagne.</p>
          </div>
          <ChevronDown size={16} className="text-slate-500" />
        </div>
      </button>
    )
  }

  return (
    <div className="bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-dark-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 size={16} className="text-orange-500" />
          <span className="text-sm font-medium text-slate-200">Assistant scénariste</span>
          <span className="text-[10px] text-slate-600 bg-dark-800 px-1.5 py-0.5 rounded">Claude / GPT</span>
          {quota && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              quota.remaining <= 1 ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'
            }`}>
              {quota.remaining}/{quota.limit} restantes
            </span>
          )}
        </div>
        <button onClick={() => setExpanded(false)} className="p-1 hover:bg-white/5 rounded">
          <X size={14} className="text-slate-500" />
        </button>
      </div>

      {/* Quick prompts (shown when no messages) */}
      {messages.length === 0 && (
        <div className="p-4">
          <p className="text-xs text-slate-500 mb-3">Qu'est-ce que vous voulez créer ?</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                onClick={() => send(qp.prompt)}
                className="flex items-center gap-2 p-3 bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-dark-600 rounded-lg transition-all text-left group"
              >
                <span className="text-lg">{qp.icon}</span>
                <span className="text-xs text-slate-300 group-hover:text-slate-100">{qp.label}</span>
              </button>
            ))}
          </div>
          {existingScript && (
            <button
              onClick={() => send(`Voici mon scénario actuel, aide-moi à l'améliorer :\n\n${existingScript}`)}
              className="mt-3 w-full p-3 bg-purple-600/10 hover:bg-purple-600/15 border border-purple-500/20 rounded-lg text-left flex items-center gap-2 transition-all"
            >
              <Sparkles size={16} className="text-purple-400" />
              <div>
                <p className="text-xs text-purple-300 font-medium">Améliorer mon scénario existant</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{existingScript.slice(0, 60)}...</p>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Chat messages */}
      {messages.length > 0 && (
        <div ref={chatRef} className="max-h-[400px] overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
                m.role === 'user'
                  ? 'bg-orange-600/20 text-slate-200'
                  : 'bg-dark-800 text-slate-300 border border-dark-700'
              }`}>
                {m.role === 'assistant' ? (
                  <div className="text-xs leading-relaxed whitespace-pre-wrap font-mono">{m.content}</div>
                ) : (
                  <p className="text-sm">{m.content}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 flex items-center gap-2">
                <Loader2 size={14} className="text-orange-400 animate-spin" />
                <span className="text-xs text-slate-400">L'assistant écrit...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action bar (when screenplay detected) */}
      {hasScreenplay && !loading && (
        <div className="px-4 py-2 border-t border-dark-700 bg-green-500/5 flex items-center gap-2">
          <Film size={14} className="text-green-400" />
          <span className="text-xs text-green-400 flex-1">Scénario détecté — prêt pour l'analyse</span>
          <button onClick={copyScript} className="px-2.5 py-1.5 bg-dark-700 hover:bg-dark-600 text-slate-300 text-[10px] rounded-lg flex items-center gap-1">
            {copied ? <Check size={10} className="text-green-400" /> : <Copy size={10} />} Copier
          </button>
          <button onClick={useScript} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-medium rounded-lg flex items-center gap-1 shadow-lg shadow-orange-600/20">
            <ArrowRight size={10} /> Utiliser ce scénario
          </button>
        </div>
      )}

      {/* Input */}
      {messages.length > 0 && (
        <div className="px-4 py-3 border-t border-dark-700">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Décrivez votre idée, demandez des modifications..."
              className="flex-1 h-9 px-3 bg-dark-800 border border-dark-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50"
              disabled={loading}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="h-9 w-9 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white rounded-lg flex items-center justify-center"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
