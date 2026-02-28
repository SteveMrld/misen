// ============================================================================
// MISEN V8 — Assistant Scénariste IA (Hybrid)
// 
// Modèle hybride :
// - Clé perso (Settings) → illimité, pas de quota
// - Clé serveur (env) → quota selon plan (Free=3, Pro=30, Studio=∞)
// - Cap global serveur : 50€/mois max
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getApiKey } from '@/lib/db/api-keys';
import { getSubscription } from '@/lib/db/subscriptions';
import { PLANS, PlanId } from '@/lib/stripe/config';

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
// Provider calls
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

async function callGPT(apiKey: string, messages: { role: string; content: string }[]): Promise<string> {
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
    throw new Error(err.error?.message || `OpenAI API erreur ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ---------------------------------------------------------------------------
// Quota management
// ---------------------------------------------------------------------------

async function getAssistantUsage(supabase: any, userId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('assistant_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());

  return count || 0;
}

async function getGlobalMonthlyUsage(supabase: any): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('assistant_usage')
    .select('*', { count: 'exact', head: true })
    .eq('used_server_key', true)
    .gte('created_at', startOfMonth.toISOString());

  return count || 0;
}

async function logUsage(supabase: any, userId: string, provider: string, usedServerKey: boolean): Promise<void> {
  await supabase.from('assistant_usage').insert({
    user_id: userId,
    provider,
    used_server_key: usedServerKey,
  });
}

// Max server-key requests per month (~50€ / 0.025$ per request = 2000)
const GLOBAL_MONTHLY_CAP = 2000;

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages requis' }, { status: 400 });
    }

    // Check user's own keys first
    const userAnthropicKey = await getApiKey('anthropic');
    const userOpenaiKey = await getApiKey('openai');
    const hasOwnKey = !!(userAnthropicKey || userOpenaiKey);

    // Server key from env
    const serverKey = process.env.ANTHROPIC_API_KEY;

    let response: string;
    let usedProvider: string;
    let usedServerKey = false;

    if (hasOwnKey) {
      // ── User's own key → no quota, direct call ──
      if (userAnthropicKey) {
        response = await callClaude(userAnthropicKey, messages);
        usedProvider = 'claude';
      } else {
        response = await callGPT(userOpenaiKey!, messages);
        usedProvider = 'openai';
      }
    } else if (serverKey) {
      // ── Server key → check quotas ──
      const sub = await getSubscription();
      const plan = PLANS[sub.plan as PlanId] || PLANS.free;
      const quota = plan.assistantQuota;

      // Check user monthly quota
      if (quota !== -1) {
        const usage = await getAssistantUsage(supabase, user.id);
        if (usage >= quota) {
          const remaining = 0;
          return NextResponse.json({
            error: `Vous avez utilisé vos ${quota} requêtes assistant ce mois-ci (plan ${plan.name}). Ajoutez votre propre clé Claude dans Réglages → Clés API pour un accès illimité, ou passez au plan supérieur.`,
            quota: { used: usage, limit: quota, remaining },
          }, { status: 429 });
        }
      }

      // Check global monthly cap
      const globalUsage = await getGlobalMonthlyUsage(supabase);
      if (globalUsage >= GLOBAL_MONTHLY_CAP) {
        return NextResponse.json({
          error: 'L\'assistant est temporairement indisponible (quota global atteint). Ajoutez votre propre clé Claude dans Réglages → Clés API pour un accès garanti.',
        }, { status: 429 });
      }

      // Call with server key
      response = await callClaude(serverKey, messages);
      usedProvider = 'claude';
      usedServerKey = true;
    } else {
      // ── No key at all ──
      return NextResponse.json({
        error: 'L\'assistant scénariste nécessite une clé API. Ajoutez votre clé Claude ou OpenAI dans Réglages → Clés API.',
      }, { status: 400 });
    }

    // Log usage
    await logUsage(supabase, user.id, usedProvider, usedServerKey).catch(() => {});

    // Return remaining quota info if using server key
    let quotaInfo = undefined;
    if (usedServerKey) {
      const sub = await getSubscription();
      const plan = PLANS[sub.plan as PlanId] || PLANS.free;
      const quota = plan.assistantQuota;
      if (quota !== -1) {
        const usage = await getAssistantUsage(supabase, user.id);
        quotaInfo = { used: usage, limit: quota, remaining: Math.max(0, quota - usage) };
      }
    }

    return NextResponse.json({ response, provider: usedProvider, quota: quotaInfo });
  } catch (error: any) {
    console.error('[Assistant] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur assistant' },
      { status: 500 }
    );
  }
}
