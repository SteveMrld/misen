import { NextRequest, NextResponse } from 'next/server';
import { startGeneration, getGenerations } from '@/lib/services/generation';
import { canGenerate, incrementGenerations } from '@/lib/db/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const limit = await canGenerate();
    if (!limit.allowed) {
      return NextResponse.json({ error: limit.reason || 'Limite atteinte' }, { status: 403 });
    }

    const body = await request.json();
    const { analysisId, planIndex, sceneIndex, modelId, prompt, negativePrompt } = body;

    if (!analysisId || planIndex === undefined || !modelId || !prompt) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const result = await startGeneration({
      analysisId,
      planIndex,
      sceneIndex: sceneIndex || 0,
      modelId,
      prompt,
      negativePrompt,
    });

    // Incrémente le compteur
    await incrementGenerations();

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('analysisId');
    if (!analysisId) {
      return NextResponse.json({ error: 'analysisId requis' }, { status: 400 });
    }
    const generations = await getGenerations(analysisId);
    return NextResponse.json(generations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
