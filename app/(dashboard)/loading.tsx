import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="text-orange-500 animate-spin" />
        <p className="text-sm text-slate-500">Chargement du studio...</p>
      </div>
    </div>
  )
}
