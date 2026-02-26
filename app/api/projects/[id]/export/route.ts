import { NextRequest, NextResponse } from 'next/server';
import { exportProject } from '@/lib/db/projects';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await exportProject(params.id);

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="misen-${data.project.name.replace(/\s+/g, '-').toLowerCase()}-v7.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
