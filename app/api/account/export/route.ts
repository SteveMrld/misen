import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    // Gather all user data
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)

    const { data: apiKeys } = await supabase
      .from('api_keys')
      .select('provider, created_at')
      .eq('user_id', user.id)

    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        created_at: user.created_at,
        last_sign_in: user.last_sign_in_at,
      },
      projects: (projects || []).map(p => ({
        id: p.id,
        title: p.title,
        script: p.script,
        analysis: p.analysis,
        created_at: p.created_at,
        updated_at: p.updated_at,
      })),
      api_keys: (apiKeys || []).map(k => ({
        provider: k.provider,
        created_at: k.created_at,
        // Note: actual key values are not exported for security
      })),
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="misen-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'export' }, { status: 500 })
  }
}
