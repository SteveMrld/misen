import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json([], { status: 401 })

    const { data } = await supabase
      .from('api_keys')
      .select('provider')
      .eq('user_id', user.id)

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json([])
  }
}
