import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { CREDIT_PACKS, type CreditPackId } from '@/lib/stripe/config';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_placeholder', { apiVersion: '2026-02-25.clover' });
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { packId } = await request.json();
    const pack = CREDIT_PACKS[packId as CreditPackId];
    if (!pack) return NextResponse.json({ error: 'Pack invalide' }, { status: 400 });

    // Get or create Stripe customer
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = sub?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from('subscriptions')
        .upsert({ user_id: user.id, stripe_customer_id: customerId, plan: 'free', status: 'active' });
    }

    // Create one-time checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `MISEN Credits — Pack ${pack.name}`,
            description: `${pack.credits} crédits de génération vidéo IA`,
          },
          unit_amount: Math.round(pack.price * 100),
        },
        quantity: 1,
      }],
      success_url: `${request.nextUrl.origin}/settings?tab=usage&credits_success=true`,
      cancel_url: `${request.nextUrl.origin}/settings?tab=usage&credits_canceled=true`,
      metadata: {
        user_id: user.id,
        type: 'credit_purchase',
        pack_id: packId,
        credits: pack.credits.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
