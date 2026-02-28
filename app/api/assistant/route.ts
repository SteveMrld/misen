// ============================================================================
// MISEN V8 — Assistant Scénariste IA
// Accompagne l'utilisateur de l'idée au scénario structuré
// Utilise Claude (Anthropic) ou GPT (OpenAI) selon la config
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const SYSTEM_PROMPT = `Tu es un scénariste professionnel intégré à MISEN, un outil de production vidéo IA.
Ton rôle : transformer les idées de l'utilisateur en scénarios structurés au format cinématographique.

RÈGLES DE FORMAT :
- Utilise le format scénario standard français (INT./EXT., noms en MAJUSCULES, dialogues centrés)
- Chaque scène commence par un en-tête de lieu (INT. BUREAU – JOUR)
- Les actions sont décrites au présent, de manière visuelle et concise
- Les dialogues sont sous le nom du personnage en MAJUSCULES
- Inclus des indications de plans quand c'est pertinent (gros plan, travelling, etc.)

RÈGLES DE CONTENU :
- Adapte le ton et le style à la demande (pub, court-métrage, documentaire, clip, etc.)
- Propose des scènes visuellement fortes qui fonctionnent bien en vidéo IA
- Privilégie les plans descriptifs riches en détails visuels (couleurs, lumière, atmosphère)
- Limite à 3-8 scènes pour un court format, jusqu'à 15 pour un format long
- Chaque scène doit être "filmable" : décors réalistes, actions claires

COMPORTEMENT :
- Si l'utilisateur donne juste une idée vague, pose 2-3 questions clés PUIS propose un scénario
- Si l'utilisateur donne un brief détaillé, écris directement le scénario
- Si l'utilisateur colle un texte existant, améliore-le au format scénario
- Réponds TOUJOURS en français sauf demande contraire
- Sois créatif mais pragmatique — le scénario sera analysé par des moteurs IA ensuite`;

// ---------------------------------------------------------------------------
// Provider abstraction
// ---------------------------------------------------------------------------

async function callClaude(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY non configurée');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude API error ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || '';
}

async function callGPT(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY non configurée');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await request.json();
    const { messages, provider } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages requis' }, { status: 400 });
    }

    // Pick provider: prefer Claude, fallback to GPT
    let response: string;
    const useProvider = provider || (process.env.ANTHROPIC_API_KEY ? 'claude' : 'openai');

    if (useProvider === 'claude') {
      response = await callClaude(messages);
    } else {
      response = await callGPT(messages);
    }

    return NextResponse.json({
      response,
      provider: useProvider,
    });
  } catch (error: any) {
    console.error('[Assistant] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur assistant' },
      { status: 500 }
    );
  }
}
