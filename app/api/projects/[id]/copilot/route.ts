import { NextRequest, NextResponse } from 'next/server';
import { getProject } from '@/lib/db/projects';
import { generateCopilotSuggestions } from '@/lib/engines/copilot';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const project = await getProject(params.id);
    if (!project) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });

    const { data: analyses } = await supabase
      .from('analyses').select('result').eq('project_id', params.id)
      .order('version', { ascending: false }).limit(1);

    if (!analyses?.length) return NextResponse.json({ suggestions: [] });

    const result = analyses[0].result as any;
    const suggestions = generateCopilotSuggestions(result, project.script_text || '');

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
