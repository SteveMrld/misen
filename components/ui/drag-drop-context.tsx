'use client'

/**
 * MISEN V13 — Universal Drag & Drop Context
 * Enables dragging media, shots, references between workspaces
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { Upload, Film, Image, Music, Type } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

type DragItemType = 'media' | 'shot' | 'reference' | 'file' | 'text'

interface DragItem {
  type: DragItemType
  data: any
  label: string
  thumbnail?: string
}

interface DragDropContextType {
  dragItem: DragItem | null
  isDragging: boolean
  startDrag: (item: DragItem) => void
  endDrag: () => void
}

const DragDropContext = createContext<DragDropContextType>({
  dragItem: null, isDragging: false, startDrag: () => {}, endDrag: () => {},
})

export function useDragDrop() { return useContext(DragDropContext) }

export function DragDropProvider({ children }: { children: ReactNode }) {
  const [dragItem, setDragItem] = useState<DragItem | null>(null)

  const startDrag = useCallback((item: DragItem) => setDragItem(item), [])
  const endDrag = useCallback(() => setDragItem(null), [])

  return (
    <DragDropContext.Provider value={{ dragItem, isDragging: !!dragItem, startDrag, endDrag }}>
      {children}
      {/* Global drag overlay */}
      {dragItem && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] animate-fade-in pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-dark-800/95 backdrop-blur-lg border border-orange-500/30 rounded-xl shadow-xl shadow-black/40">
            <div className="w-6 h-6 rounded bg-orange-500/15 flex items-center justify-center">
              {dragItem.type === 'shot' && <Film size={12} className="text-orange-400" />}
              {dragItem.type === 'media' && <Image size={12} className="text-blue-400" />}
              {dragItem.type === 'reference' && <Type size={12} className="text-purple-400" />}
              {dragItem.type === 'file' && <Upload size={12} className="text-green-400" />}
            </div>
            <span className="text-xs text-slate-200 font-medium max-w-40 truncate">{dragItem.label}</span>
            <span className="text-[9px] text-orange-400/60 uppercase">{dragItem.type}</span>
          </div>
        </div>
      )}
    </DragDropContext.Provider>
  )
}

// Draggable wrapper
export function Draggable({ item, children, className }: { item: DragItem; children: ReactNode; className?: string }) {
  const { startDrag, endDrag } = useDragDrop()

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/misen-drag', JSON.stringify(item))
        e.dataTransfer.effectAllowed = 'copyMove'
        startDrag(item)
      }}
      onDragEnd={endDrag}
      className={`cursor-grab active:cursor-grabbing ${className || ''}`}
    >
      {children}
    </div>
  )
}

// Drop zone wrapper
interface DropZoneProps {
  accept: DragItemType[]
  onDrop: (item: DragItem) => void
  children: ReactNode
  className?: string
  activeClassName?: string
  label?: string
}

export function DropZone({ accept, onDrop, children, className, activeClassName, label }: DropZoneProps) {
  const { locale } = useI18n()
  const fr = locale === 'fr'
  const [isOver, setIsOver] = useState(false)
  const { dragItem, endDrag } = useDragDrop()

  const canAccept = dragItem && accept.includes(dragItem.type)

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        if (canAccept) { e.dataTransfer.dropEffect = 'copy'; setIsOver(true) }
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsOver(false)
        try {
          const raw = e.dataTransfer.getData('application/misen-drag')
          if (raw) {
            const item = JSON.parse(raw)
            if (accept.includes(item.type)) { onDrop(item); endDrag() }
          }
        } catch {}
      }}
      className={`relative transition-all ${className || ''} ${isOver && canAccept ? (activeClassName || 'ring-2 ring-orange-500/40 bg-orange-500/[0.03]') : ''}`}
    >
      {children}
      {/* Drop hint overlay */}
      {isOver && canAccept && (
        <div className="absolute inset-0 flex items-center justify-center bg-orange-500/[0.05] backdrop-blur-[1px] rounded-xl border-2 border-dashed border-orange-500/30 z-10 pointer-events-none">
          <div className="text-center">
            <Upload size={20} className="text-orange-400 mx-auto mb-1" />
            <span className="text-[10px] text-orange-300 font-medium">{label || (fr ? 'Déposer ici' : 'Drop here')}</span>
          </div>
        </div>
      )}
    </div>
  )
}
