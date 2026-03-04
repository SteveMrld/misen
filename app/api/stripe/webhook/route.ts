import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient as createServiceClient } from '@supabase/supabase-js';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_placeholder', { apiVersion: '2026-02-25.clover' });
}

// Service client (bypass RLS for webhooks)
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getServiceClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      const userId = session.metadata?.user_id;
      const type = session.metadata?.type;

      // ─── Credit Pack Purchase (one-time) ───
      if (type === 'credit_purchase' && userId) {
        const credits = parseInt(session.metadata?.credits || '0', 10);
        const packId = session.metadata?.pack_id || 'unknown';

        if (credits > 0) {
          // Upsert user_credits (create if not exists, add balance)
          const { data: existing } = await supabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', userId)
            .single();

          if (existing) {
            await supabase
              .from('user_credits')
              .update({ balance: existing.balance + credits })
              .eq('user_id', userId);
          } else {
            await supabase
              .from('user_credits')
              .insert({ user_id: userId, balance: credits });
          }

          // Log transaction
          await supabase
            .from('credit_transactions')
            .insert({
              user_id: userId,
              amount: credits,
              type: 'purchase',
              description: `Pack ${packId} — ${credits} crédits`,
              stripe_session_id: session.id,
            });
        }
        break;
      }

      // ─── Subscription Purchase ───
      const subId = session.subscription as string;

      if (userId && subId) {
        const subResponse = await stripe.subscriptions.retrieve(subId);
        const sub = subResponse as any;
        const priceId = sub.items?.data?.[0]?.price?.id;
        const plan = priceId === process.env.STRIPE_STUDIO_PRICE_ID ? 'studio' : 'pro';

        await supabase
          .from('subscriptions')
          .update({
            stripe_subscription_id: subId,
            stripe_customer_id: session.customer as string,
            plan,
            status: 'active',
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            analyses_used: 0,
            generations_used: 0,
          })
          .eq('user_id', userId);
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as any;
      const subId = invoice.subscription as string;
      if (subId) {
        const subResponse = await stripe.subscriptions.retrieve(subId);
        const sub = subResponse as any;
        // Reset usage chaque mois
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            analyses_used: 0,
            generations_used: 0,
          })
          .eq('stripe_subscription_id', subId);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as any;
      const subId = invoice.subscription as string;
      if (subId) {
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', subId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as any;
      await supabase
        .from('subscriptions')
        .update({ plan: 'free', status: 'canceled', stripe_subscription_id: null })
        .eq('stripe_subscription_id', sub.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
