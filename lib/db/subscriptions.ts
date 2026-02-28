import { createClient } from '@/lib/supabase/server';
import { PLANS, PlanId } from '@/lib/stripe/config';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string;
  status: string;
  generations_used: number;
  generations_reset_at: string;
  current_period_start: string | null;
  current_period_end: string | null;
}

export async function getSubscription(): Promise<Subscription> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  try {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) return data;

    // Try to create a subscription
    const { data: newSub } = await supabase
      .from('subscriptions')
      .insert({ user_id: user.id, plan: 'free', status: 'active' })
      .select()
      .single();

    if (newSub) return newSub;
  } catch {
    // Table might not exist or insert failed
  }

  // Return a safe default — never null
  return {
    id: 'default',
    user_id: user.id,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    plan: 'free',
    status: 'active',
    generations_used: 0,
    generations_reset_at: new Date().toISOString(),
    current_period_start: null,
    current_period_end: null,
  };
}

export async function canGenerate(): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getSubscription();
  const plan = PLANS[sub.plan as PlanId] || PLANS.free;

  if (plan.generations === -1) return { allowed: true };

  // Monthly reset
  const resetAt = new Date(sub.generations_reset_at);
  const now = new Date();
  if (now.getTime() - resetAt.getTime() > 30 * 24 * 60 * 60 * 1000) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('subscriptions')
        .update({ generations_used: 0, generations_reset_at: now.toISOString() })
        .eq('user_id', user.id);
    }
    return { allowed: true };
  }

  if (sub.generations_used >= plan.generations) {
    return { allowed: false, reason: `Limite de ${plan.generations} générations/mois atteinte.` };
  }

  return { allowed: true };
}

export async function incrementGenerations(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const sub = await getSubscription();
  await supabase.from('subscriptions')
    .update({ generations_used: (sub.generations_used || 0) + 1 })
    .eq('user_id', user.id);
}
