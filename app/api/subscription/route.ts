import { NextResponse } from 'next/server';
import { getSubscription, PLANS } from '@/lib/db/subscriptions';

export async function GET() {
  try {
    const sub = await getSubscription();
    const plan = PLANS[sub.plan];
    return NextResponse.json({
      ...sub,
      planDetails: plan,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
