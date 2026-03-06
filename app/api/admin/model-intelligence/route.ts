import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  CURRENT_MODELS,
  buildIntelligencePrompt,
  parseIntelligenceResponse,
  applyUpdates,
  type ModelIntelligenceReport,
} from '@/lib/intelligence/model-intelligence';

const ADMIN_SECRET = 'MISEN-MIGRATE-2026';

/**
 * GET /api/admin/model-intelligence?secret=XXX
 * 
 * Triggers a full model intelligence scan:
 * 1. Calls Claude API with web_search tool to find latest model updates
 * 2. Parses the response for score changes
 * 3. Applies high-confidence updates
 * 4. Stores report in Supabase
 * 5. Returns full report
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({
      error: 'ANTHROPIC_API_KEY manquante. Ajoute-la dans les variables Vercel.',
      hint: 'Nécessaire pour que MISEN puisse scanner les mises à jour des modèles via Claude + web search.'
    }, { status: 500 });
  }

  try {
    // 1. Build the intelligence prompt
    const prompt = buildIntelligencePrompt(CURRENT_MODELS);

    // 2. Call Claude API with web_search
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
          }
        ],
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      return NextResponse.json({
        error: `Claude API error: ${claudeRes.status}`,
        detail: err,
      }, { status: 500 });
    }

    const claudeData = await claudeRes.json();

    // 3. Extract text response (may have multiple content blocks due to web_search)
    const textBlocks = claudeData.content
      ?.filter((block: any) => block.type === 'text')
      ?.map((block: any) => block.text)
      ?.join('\n') || '';

    if (!textBlocks) {
      return NextResponse.json({
        error: 'Claude returned no text response',
        raw: claudeData.content,
      }, { status: 500 });
    }

    // 4. Parse the intelligence response
    const report = parseIntelligenceResponse(textBlocks, CURRENT_MODELS);

    // 5. Apply high-confidence updates
    const updatedModels = applyUpdates(CURRENT_MODELS, report.updatesApplied);

    // 6. Store report in Supabase (if available)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      const supabase = createClient(supabaseUrl, serviceKey);

      // Store the report
      const { error: reportErr } = await supabase.from('intelligence_reports').insert({
        report: report,
        updated_models: updatedModels,
        raw_response: textBlocks.substring(0, 10000),
      });
      if (reportErr) {
        report.errors.push('Note: intelligence_reports table — ' + reportErr.message);
      }

      // Update model_registry if it exists
      for (const model of updatedModels) {
        const { error: regErr } = await supabase.from('model_registry').upsert({
          model_id: model.model_id,
          model_name: model.model_name,
          version: model.version,
          provider: model.provider,
          scores: model.scores,
          metadata: model.metadata,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'model_id' });
        if (regErr && !report.errors.includes('model_registry: ' + regErr.message)) {
          report.errors.push('model_registry: ' + regErr.message);
        }
      }
    }

    // 7. Return full report
    return NextResponse.json({
      status: 'OK',
      report,
      updatedModels: updatedModels.map(m => ({
        id: m.model_id,
        name: `${m.model_name} ${m.version}`,
        provider: m.provider,
        topScores: Object.entries(m.scores)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([k, v]) => `${k}: ${v}`),
        lastChecked: m.metadata.lastChecked,
      })),
      summary: {
        modelsScanned: report.modelsScanned,
        updatesFound: report.updatesFound.length,
        updatesAutoApplied: report.updatesApplied.length,
        pendingReview: report.updatesFound.filter(u => !u.autoApplied).length,
        nextScan: report.nextScanRecommended,
      },
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}
