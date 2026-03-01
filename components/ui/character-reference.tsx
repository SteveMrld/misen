'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, X, ImageIcon, Check, Sparkles } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface CharacterRefImage {
  name: string
  dataUrl: string // base64
  fileName: string
}

interface CharacterReferenceCardProps {
  character: {
    name: string
    apparence?: string
    description?: string
    traits?: string[]
    arc?: string
  }
  projectId: string
  onImageChange?: (name: string, dataUrl: string | null) => void
}

const STORAGE_KEY_PREFIX = 'misen-char-ref-'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function CharacterReferenceCard({ character, projectId, onImageChange }: CharacterReferenceCardProps) {
  const { t } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const storageKey = `${STORAGE_KEY_PREFIX}${projectId}-${character.name}`

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved) as CharacterRefImage
        setImageUrl(parsed.dataUrl)
        setFileName(parsed.fileName)
      }
    } catch {}
  }, [storageKey])

  const processFile = useCallback((file: File) => {
    setError(null)
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(t.project.characterRef.supportedFormats)
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t.project.characterRef.maxSize)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setImageUrl(dataUrl)
      setFileName(file.name)
      // Persist
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          name: character.name,
          dataUrl,
          fileName: file.name,
        }))
      } catch {}
      onImageChange?.(character.name, dataUrl)
    }
    reader.readAsDataURL(file)
  }, [character.name, storageKey, onImageChange, t])

  const removeImage = () => {
    setImageUrl(null)
    setFileName(null)
    try { localStorage.removeItem(storageKey) } catch {}
    onImageChange?.(character.name, null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    // Reset input so same file can be re-selected
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4 hover:border-dark-600 transition-colors">
      <div className="flex gap-4">
        {/* Image area */}
        <div className="flex-shrink-0">
          {imageUrl ? (
            <div className="relative group">
              <img
                src={imageUrl}
                alt={character.name}
                className="w-20 h-20 rounded-lg object-cover border border-dark-600"
              />
              <button
                onClick={removeImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title={t.project.characterRef.removeImage}
              >
                <X size={10} className="text-white" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-green-500/90 text-[8px] text-white text-center py-0.5 rounded-b-lg flex items-center justify-center gap-0.5">
                <Check size={7} /> REF
              </div>
            </div>
          ) : (
            <div
              className={`w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragging
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-dark-600 hover:border-orange-500/50 hover:bg-dark-700/50'
              }`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <Upload size={16} className="text-slate-500 mb-1" />
              <span className="text-[8px] text-slate-600 text-center leading-tight px-1">
                {t.project.characterRef.dragOrClick}
              </span>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Character info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-slate-200 truncate">{character.name}</h4>
            {imageUrl && (
              <span className="flex items-center gap-1 text-[9px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
                <Sparkles size={8} /> {t.project.characterRef.injectedInPrompts}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-1.5">
            {character.apparence || character.description || '—'}
          </p>
          {character.traits && character.traits.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {character.traits.slice(0, 4).map((trait, i) => (
                <span key={i} className="text-[9px] px-1.5 py-0.5 bg-dark-700 text-slate-400 rounded">
                  {trait}
                </span>
              ))}
            </div>
          )}
          {error && (
            <p className="text-[10px] text-red-400 mt-1">{error}</p>
          )}
        </div>
      </div>

      {/* Injection hint */}
      {imageUrl && (
        <div className="mt-3 pt-3 border-t border-dark-700/50 flex items-start gap-2">
          <ImageIcon size={12} className="text-orange-400/60 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-slate-500 leading-relaxed">
            {t.project.characterRef.injectHint}
          </p>
        </div>
      )}
    </div>
  )
}

// ═══ Utility: Get all character reference images for a project ═══
export function getCharacterRefImages(projectId: string): Record<string, string> {
  const refs: Record<string, string> = {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(`${STORAGE_KEY_PREFIX}${projectId}-`)) {
        const data = JSON.parse(localStorage.getItem(key) || '{}')
        if (data.name && data.dataUrl) {
          refs[data.name] = data.dataUrl
        }
      }
    }
  } catch {}
  return refs
}

// ═══ Utility: Inject reference image into prompt text ═══
export function injectCharacterRefsInPrompt(
  prompt: string,
  characterNames: string[],
  refImages: Record<string, string>,
  modelId: string
): { prompt: string; hasRefs: boolean; refCharacters: string[] } {
  const supportedModels = ['kling', 'kling 3.0', 'runway', 'runway gen-4', 'runway gen-4.5', 'seedance', 'seedance 2.0']
  const mid = modelId.toLowerCase()
  if (!supportedModels.some(m => mid.includes(m))) {
    return { prompt, hasRefs: false, refCharacters: [] }
  }

  const refCharacters: string[] = []
  characterNames.forEach(name => {
    if (refImages[name]) {
      refCharacters.push(name)
    }
  })

  if (refCharacters.length === 0) {
    return { prompt, hasRefs: false, refCharacters: [] }
  }

  // Add reference image tag to prompt
  const refTag = refCharacters
    .map(name => `[REF:${name}]`)
    .join(' ')

  const enhancedPrompt = `${prompt}\n\n-- Character References: ${refTag} (maintain visual consistency with reference images for: ${refCharacters.join(', ')})`

  return { prompt: enhancedPrompt, hasRefs: true, refCharacters }
}
