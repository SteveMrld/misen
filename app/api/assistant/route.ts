// ============================================================================
// MISEN V8 — Assistant Scénariste IA (Hybrid)
// Clé perso → illimité | Clé serveur → 3 req/mois Free, 30 Pro
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

// Max server-key requests per month (~3€)
const FREE_QUOTA = 3;
const GLOBAL_CAP = 125;

// ---------------------------------------------------------------------------
// Claude API call
// ---------------------------------------------------------------------------

async function callClaude(apiKey: string, messages: { role: string; content: string }[]): Promise<string> {
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
    throw new Error(err.error?.message || `Claude API erreur ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || '';
}

// ---------------------------------------------------------------------------
// Usage tracking (graceful — works even without the table)
// ---------------------------------------------------------------------------

async function getUserMonthlyCount(supabase: any, userId: string): Promise<number> {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from('assistant_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());
    return count || 0;
  } catch { return 0; }
}

async function getGlobalMonthlyCount(supabase: any): Promise<number> {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from('assistant_usage')
      .select('*', { count: 'exact', head: true })
      .eq('used_server_key', true)
      .gte('created_at', startOfMonth.toISOString());
    return count || 0;
  } catch { return 0; }
}

async function logUsage(supabase: any, userId: string, provider: string, usedServerKey: boolean) {
  try {
    await supabase.from('assistant_usage').insert({
      user_id: userId, provider, used_server_key: usedServerKey,
    });
  } catch { /* silent */ }
}

// ---------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { messages } = await request.json();
    if (!messages?.length) return NextResponse.json({ error: 'Messages requis' }, { status: 400 });

    // 1) Check user's own key
    let userKey: string | null = null;
    try {
      const { data } = await supabase
        .from('api_keys')
        .select('api_key')
        .eq('user_id', user.id)
        .eq('provider', 'anthropic')
        .single();
      userKey = data?.api_key || null;
    } catch { /* no key */ }

    // If no user key, try openai
    let userOpenaiKey: string | null = null;
    if (!userKey) {
      try {
        const { data } = await supabase
          .from('api_keys')
          .select('api_key')
          .eq('user_id', user.id)
          .eq('provider', 'openai')
          .single();
        userOpenaiKey = data?.api_key || null;
      } catch { /* no key */ }
    }

    const serverKey = process.env.ANTHROPIC_API_KEY;

    // 2) Route: user key → direct | server key → quota check | nothing → error
    if (userKey) {
      // User's own Anthropic key → unlimited
      const response = await callClaude(userKey, messages);
      await logUsage(supabase, user.id, 'claude', false);
      return NextResponse.json({ response, provider: 'claude' });
    }

    if (userOpenaiKey) {
      // User's own OpenAI key → unlimited (call GPT)
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userOpenaiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o', max_tokens: 4096,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `OpenAI erreur ${res.status}`);
      }
      const data = await res.json();
      const response = data.choices?.[0]?.message?.content || '';
      await logUsage(supabase, user.id, 'openai', false);
      return NextResponse.json({ response, provider: 'openai' });
    }

    if (serverKey) {
      // Server key → check quotas
      const userCount = await getUserMonthlyCount(supabase, user.id);
      if (userCount >= FREE_QUOTA) {
        return NextResponse.json({
          error: `Vous avez utilisé vos ${FREE_QUOTA} requêtes assistant ce mois-ci. Ajoutez votre propre clé Claude dans Réglages → Clés API pour un accès illimité.`,
          quota: { used: userCount, limit: FREE_QUOTA, remaining: 0 },
        }, { status: 429 });
      }

      const globalCount = await getGlobalMonthlyCount(supabase);
      if (globalCount >= GLOBAL_CAP) {
        return NextResponse.json({
          error: 'Assistant temporairement indisponible. Ajoutez votre propre clé Claude dans Réglages → Clés API.',
        }, { status: 429 });
      }

      const response = await callClaude(serverKey, messages);
      await logUsage(supabase, user.id, 'claude', true);

      const newCount = userCount + 1;
      return NextResponse.json({
        response,
        provider: 'claude',
        quota: { used: newCount, limit: FREE_QUOTA, remaining: Math.max(0, FREE_QUOTA - newCount) },
      });
    }

    // No key at all
    return NextResponse.json({
      error: 'Ajoutez votre clé Claude ou OpenAI dans Réglages → Clés API pour utiliser l\'assistant.',
    }, { status: 400 });

  } catch (error: any) {
    console.error('[Assistant]', error);
    return NextResponse.json({ error: error.message || 'Erreur assistant' }, { status: 500 });
  }
}
