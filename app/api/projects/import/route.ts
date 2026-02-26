import { NextRequest, NextResponse } from 'next/server';
import { importProject } from '@/lib/db/projects';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.version || !body.project) {
      return NextResponse.json({ error: 'Format JSON invalide' }, { status: 400 });
    }

    const project = await importProject(body);
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
