import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default async function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || null

  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar userName={userName} />
      <div className="ml-sidebar">
        <Header />
        <main className="p-6 max-w-[1400px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
