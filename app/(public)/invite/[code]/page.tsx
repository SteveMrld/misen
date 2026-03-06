'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  useEffect(() => {
    // Store invite code in cookie
    document.cookie = `misen_invite=${encodeURIComponent(code)};path=/;max-age=604800;SameSite=Lax`
    // Redirect to landing page — user discovers MISEN, then signs up
    setTimeout(() => router.push('/'), 800)
  }, [code, router])

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="text-orange-400 animate-spin" />
        <p className="text-sm text-slate-400">Activation de votre invitation...</p>
      </div>
    </div>
  )
}
