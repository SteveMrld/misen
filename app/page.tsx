import { createClient } from '@/lib/supabase/server'
import { LandingHero } from '@/components/landing-hero'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <LandingHero isLoggedIn={!!user} />
}
