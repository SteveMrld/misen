import { createClient } from '@/lib/supabase/server';

// ── Plans ──
export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    analyses: 5,
    generations: 10,
    models: 2,
    features: ['5 analyses/mois', '10 générations/mois', '2 modèles IA', 'Export JSON'],
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    analyses: 50,
    generations: 200,
    models: 5,
    features: ['50 analyses/mois', '200 générations/mois', '5 modèles IA', 'Export JSON + vidéo', 'Priorité file'],
  },
  studio: {
    name: 'Studio',
    price: 99,
    priceId: process.env.STRIPE_STUDIO_PRICE_ID || '',
    analyses: -1, // illimité
    generations: -1,
    models: 7,
    features: ['Analyses illimitées', 'Générations illimitées', '7 modèles IA', 'Export tous formats', 'API access', 'Support prioritaire'],
  },
} as const;

export type PlanId = keyof typeof PLANS;

// ── Subscription CRUD ──
export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: PlanId;
  status: string;
  current_period_end: string | null;
  analyses_used: number;
  generations_used: number;
}

export async function getSubscription(): Promise<Subscription> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (data) return data as Subscription;

  // Crée un plan free par défaut
  const { data: newSub } = await supabase
    .from('subscriptions')
    .insert({ user_id: user.id, plan: 'free', status: 'active', analyses_used: 0, generations_used: 0 })
    .select()
    .single();

  return newSub as Subscription;
}

export async function updateSubscription(userId: string, updates: Partial<Subscription>) {
  const supabase = await createClient();
  await supabase
    .from('subscriptions')
    .update(updates)
    .eq('user_id', userId);
}

export async function incrementUsage(type: 'analyses' | 'generations') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const field = type === 'analyses' ? 'analyses_used' : 'generations_used';
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!sub) return;

  await supabase
    .from('subscriptions')
    .update({ [field]: (sub[field] || 0) + 1 })
    .eq('user_id', user.id);
}

export async function checkLimit(type: 'analyses' | 'generations'): Promise<{ allowed: boolean; used: number; limit: number }> {
  const sub = await getSubscription();
  const plan = PLANS[sub.plan];
  const limit = type === 'analyses' ? plan.analyses : plan.generations;
  const used = type === 'analyses' ? sub.analyses_used : sub.generations_used;

  if (limit === -1) return { allowed: true, used, limit: -1 };
  return { allowed: used < limit, used, limit };
}
