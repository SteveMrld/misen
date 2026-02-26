import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || null

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Sidebar */}
      <Sidebar userName={userName} />

      {/* Main area — offset by sidebar width */}
      <div className="ml-sidebar">
        <Header />
        <main className="p-6 max-w-dashboard mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
