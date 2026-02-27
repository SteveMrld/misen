import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSubscription } from '@/lib/db/subscriptions';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_placeholder', { apiVersion: '2026-02-25.clover' });
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const sub = await getSubscription();
    if (!sub.stripe_customer_id) {
      return NextResponse.json({ error: 'Pas de compte Stripe' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${request.nextUrl.origin}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
