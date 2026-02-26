'use client'

import { cn } from '@/lib/utils/cn'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Logo Icon — Play/Shutter hybrid */}
      <div
        className={cn(
          sizes[size],
          'relative rounded-xl bg-gradient-to-br from-orange-500 to-cyan-500 flex items-center justify-center'
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-[60%] h-[60%]"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="5 3 19 12 5 21 5 3" fill="white" stroke="none" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              'font-display font-bold tracking-tight text-orange-500',
              textSizes[size]
            )}
          >
            MISEN
          </span>
          {size === 'lg' && (
            <span className="text-overline uppercase text-slate-500 tracking-widest">
              Mise en Scène Numérique
            </span>
          )}
        </div>
      )}
    </div>
  )
}
