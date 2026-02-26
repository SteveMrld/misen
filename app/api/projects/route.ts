import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/db/projects';

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

    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
    }

    const project = await createProject({
      name: body.name.trim(),
      description: body.description?.trim() || undefined,
      script_text: body.script_text || undefined,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
