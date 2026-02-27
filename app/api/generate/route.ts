import { NextRequest, NextResponse } from 'next/server';
import { startGeneration, getGenerations } from '@/lib/services/generation';
import { checkLimit, incrementUsage } from '@/lib/db/subscriptions';

export async function POST(request: NextRequest) {
  try {
    // Vérifie les limites du plan
    const limit = await checkLimit('generations');
    if (!limit.allowed) {
      return NextResponse.json({
        error: `Limite atteinte : ${limit.used}/${limit.limit} générations ce mois. Passez au plan supérieur.`
      }, { status: 403 });
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
    await incrementUsage('generations');

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
