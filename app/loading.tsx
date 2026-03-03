export default function Loading() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-orange-500/30 border-t-orange-400 rounded-full animate-spin" />
        </div>
        <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
        <p className="text-xs text-slate-500 animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
