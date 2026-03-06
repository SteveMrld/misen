import { NextRequest, NextResponse } from 'next/server';
import { AI_MODELS } from '@/lib/models/ai-models';
import { MODEL_SOURCES } from '@/lib/models/model-sources';
import { buildIntelligencePrompt, type ModelUpdate, type ScoreChange, type SourceRef } from '@/lib/engines/model-intelligence';

const ADMIN_SECRET = 'MISEN-MIGRATE-2026';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const singleModel = request.nextUrl.searchParams.get('model');
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!anthropicKey) {
    return NextResponse.json({
      error: 'ANTHROPIC_API_KEY requise',
      instruction: 'Ajoute ANTHROPIC_API_KEY dans les variables Vercel pour activer le Model Intelligence Engine',
    }, { status: 500 });
  }

  const allModels = Object.values(AI_MODELS);
  const targetModels = singleModel
    ? allModels.filter((m: any) => m.id === singleModel)
    : allModels;

  if (targetModels.length === 0) {
    return NextResponse.json({ error: `Modèle ${singleModel} non trouvé` }, { status: 404 });
  }

  const results: ModelUpdate[] = [];
  const errors: string[] = [];

  for (const model of targetModels) {
    try {
      const update = await researchModel(model as any, anthropicKey);
      results.push(update);
    } catch (e: any) {
      errors.push(`${(model as any).name}: ${e.message}`);
    }
  }

  // Market trends
  let marketTrends: string[] = [];
  let newModelsDetected: string[] = [];
  try {
    const market = await researchMarket(anthropicKey);
    marketTrends = market.trends;
    newModelsDetected = market.newModels;
  } catch (_) { /* non-blocking */ }

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    models: results,
    newModelsDetected,
    marketTrends,
    errors: errors.length > 0 ? errors : undefined,
    totalChangesProposed: results.reduce((s, r) => s + r.changes.length, 0),
    modelsScanned: results.length,
    nextCheckRecommended: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  });
}

async function callClaude(prompt: string, apiKey: string, maxTokens = 2000): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return (data.content || [])
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('\n')
    .trim();
}

function parseJSON(text: string): any {
  const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  try { return JSON.parse(clean); } catch {}
  const match = clean.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  return {};
}

async function researchModel(model: any, apiKey: string): Promise<ModelUpdate> {
  const currentScores: Record<string, number> = {};
  const sources = MODEL_SOURCES[model.id];
  if (sources?.scores) {
    Object.entries(sources.scores).forEach(([k, v]) => { currentScores[k] = (v as any).score || 0; });
  }

  const prompt = buildIntelligencePrompt(model.id, `${model.name} ${model.version}`, currentScores);
  const text = await callClaude(prompt, apiKey);
  const parsed = parseJSON(text);

  const changes: ScoreChange[] = (parsed.changes || [])
    .map((c: any) => ({
      axis: c.axis,
      axisLabel: c.axis,
      currentScore: currentScores[c.axis] || 0,
      proposedScore: Math.max(0, Math.min(100, c.proposedScore || 0)),
      delta: (c.proposedScore || 0) - (currentScores[c.axis] || 0),
      reason: c.reason || '',
      source: c.source || '',
    }))
    .filter((c: ScoreChange) => Math.abs(c.delta) >= 5);

  const parsedSources: SourceRef[] = (parsed.sources || []).map((s: any) => ({
    url: s.url || '',
    title: s.title || '',
    tier: s.type === 'official_blog' ? 1 : s.type === 'arxiv' ? 2 : s.type === 'benchmark' ? 3 : 4,
    type: s.type || 'press',
    date: s.date || new Date().toISOString().split('T')[0],
    reliability: s.reliability || 'probable',
  }));

  const confidence = parsedSources.some((s: SourceRef) => s.tier === 1) ? 'high'
    : parsedSources.some((s: SourceRef) => s.tier <= 2) ? 'medium' : 'low';

  return {
    modelId: model.id,
    modelName: `${model.name} ${model.version}`,
    currentVersion: model.version,
    detectedVersion: parsed.detectedVersion || null,
    changes,
    sources: parsedSources,
    confidence,
    summary: parsed.summary || 'Analyse en cours.',
    timestamp: new Date().toISOString(),
  };
}

async function researchMarket(apiKey: string): Promise<{ trends: string[]; newModels: string[] }> {
  const prompt = `You are an AI video generation market analyst. Search for:
1. Any NEW video generation models released in the last 3 months (2026)
2. Major updates to: Kling, Runway, Sora, Veo, Seedance, Wan, Hailuo
3. Top 3 market trends in AI video generation

Respond ONLY in JSON (no markdown):
{"trends": ["trend 1", "trend 2"], "newModels": ["Name by Company"]}`;

  const text = await callClaude(prompt, apiKey, 1000);
  const parsed = parseJSON(text);
  return { trends: parsed.trends || [], newModels: parsed.newModels || [] };
}
// Model Intelligence Engine v1
