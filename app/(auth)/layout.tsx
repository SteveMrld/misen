export const dynamic = 'force-dynamic'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      {/* Subtle background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/[0.04] rounded-full blur-[128px]" />
        <div className="absolute inset-0 vignette" />
      </div>

      <div className="relative w-full max-w-auth">
        {children}
      </div>
    </div>
  )
}
