import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/db/projects';
import { SCENARIO_TEMPLATES } from '@/lib/data/templates';

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // If template_id provided, use template data
    let name = body.name?.trim()
    let description = body.description?.trim() || undefined
    let script_text = body.script_text || undefined

    if (body.template_id) {
      const tpl = SCENARIO_TEMPLATES.find(t => t.id === body.template_id)
      if (tpl) {
        name = name || tpl.title.fr
        description = description || tpl.tagline.fr
        script_text = tpl.script
      }
    }

    if (!name || name.length === 0) {
      return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
    }

    const project = await createProject({
      name,
      description,
      script_text,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
