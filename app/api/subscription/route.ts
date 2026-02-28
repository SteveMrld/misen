import { NextResponse } from 'next/server';
import { getSubscription } from '@/lib/db/subscriptions';
import { PLANS, PlanId } from '@/lib/stripe/config';

export async function GET() {
  try {
    const sub = await getSubscription();
    if (!sub) {
      return NextResponse.json({ plan: 'free', planDetails: PLANS.free });
    }
    const plan = PLANS[sub.plan as PlanId] || PLANS.free;
    return NextResponse.json({
      ...sub,
      planDetails: plan,
    });
  } catch (error: any) {
    // Fallback to free plan on any error
    return NextResponse.json({ plan: 'free', planDetails: PLANS.free });
  }
}
