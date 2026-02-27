import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default async function DashboardLayout({
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
    <div className="min-h-screen bg-dark-950 overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar userName={userName} />

      {/* Main area — offset by sidebar width */}
      <div className="ml-sidebar overflow-x-hidden">
        <Header />
        <main className="p-4 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
