import { NextResponse } from 'next/server';
import { getSubscription } from '@/lib/db/subscriptions';
import { PLANS, PlanId } from '@/lib/stripe/config';

export async function GET() {
  try {
    const sub = await getSubscription();
    const plan = PLANS[sub.plan as PlanId] || PLANS.free;
    return NextResponse.json({
      ...sub,
      planDetails: plan,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
