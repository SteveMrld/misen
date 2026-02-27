'use client'

export function Logo({ size = 'md', showText = true, className = '' }: { size?: 'sm' | 'md' | 'lg'; showText?: boolean; className?: string }) {
  const h = size === 'sm' ? 28 : size === 'md' ? 36 : 48
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showText && (
        <span className={`font-display tracking-tight text-orange-500 ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-3xl'}`} style={{ letterSpacing: '-0.02em' }}>
          MISEN
        </span>
      )}
    </div>
  )
}

export function LogoFull({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <div className="beam w-full mb-2" style={{ height: 2 }} />
      <span className="font-display text-3xl text-orange-500" style={{ letterSpacing: '-0.02em' }}>MISEN</span>
      <p className="text-overline uppercase text-slate-400 tracking-widest mt-1">Mise en Scène Numérique</p>
    </div>
  )
}
