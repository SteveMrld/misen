import { NextRequest, NextResponse } from 'next/server';
import { getAnalyses } from '@/lib/db/projects';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analyses = await getAnalyses(params.id);
    return NextResponse.json(analyses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
