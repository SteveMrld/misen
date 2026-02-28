// ============================================================================
// MISEN V8 S3 — Usage & Costs API
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSubscription } from '@/lib/db/subscriptions';
import { PLANS, PlanId } from '@/lib/stripe/config';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const sub = await getSubscription();
    const plan = PLANS[sub.plan as PlanId] || PLANS.free;

    // Get all generations for this user
    const { data: generations } = await supabase
      .from('generations')
      .select('id, status, model_id, cost, duration_seconds, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const gens = generations || [];

    // Compute stats
    const completed = gens.filter(g => g.status === 'completed');
    const failed = gens.filter(g => g.status === 'failed');
    const processing = gens.filter(g => g.status === 'processing' || g.status === 'pending');

    const totalCost = completed.reduce((s, g) => s + (g.cost || 0), 0);
    const totalDuration = completed.reduce((s, g) => s + (g.duration_seconds || 0), 0);

    // Cost by provider
    const costByProvider: Record<string, { count: number; cost: number; duration: number }> = {};
    for (const g of completed) {
      const p = g.model_id || 'unknown';
      if (!costByProvider[p]) costByProvider[p] = { count: 0, cost: 0, duration: 0 };
      costByProvider[p].count++;
      costByProvider[p].cost += g.cost || 0;
      costByProvider[p].duration += g.duration_seconds || 0;
    }

    // Daily costs (last 30 days)
    const dailyCosts: Record<string, number> = {};
    for (const g of completed) {
      const day = new Date(g.created_at).toISOString().slice(0, 10);
      dailyCosts[day] = (dailyCosts[day] || 0) + (g.cost || 0);
    }

    // Credits info
    const generationsLimit = plan.generations;
    const generationsUsed = sub.generations_used || 0;
    const generationsRemaining = generationsLimit === -1 ? -1 : Math.max(0, generationsLimit - generationsUsed);

    return NextResponse.json({
      plan: {
        id: sub.plan,
        name: plan.name,
        price: plan.price,
        generationsLimit,
        generationsUsed,
        generationsRemaining,
        projectsLimit: plan.projects,
        resetAt: sub.generations_reset_at,
      },
      stats: {
        total: gens.length,
        completed: completed.length,
        failed: failed.length,
        processing: processing.length,
        totalCost: Number(totalCost.toFixed(4)),
        totalDurationSeconds: Number(totalDuration.toFixed(1)),
        avgCostPerGeneration: completed.length > 0 ? Number((totalCost / completed.length).toFixed(4)) : 0,
      },
      costByProvider,
      dailyCosts,
      recentGenerations: gens.slice(0, 20).map(g => ({
        id: g.id,
        model: g.model_id,
        status: g.status,
        cost: g.cost,
        date: g.created_at,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
