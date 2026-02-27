-- ============================================
-- MISEN V7 — Session 5 : Subscriptions
-- ============================================

create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text default 'free' check (plan in ('free', 'pro', 'studio')),
  status text default 'active' check (status in ('active', 'past_due', 'canceled', 'trialing')),
  current_period_end timestamptz,
  analyses_used integer default 0,
  generations_used integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create index if not exists idx_subscriptions_stripe on public.subscriptions(stripe_customer_id);

alter table public.subscriptions enable row level security;

create policy "Users can view own sub" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Users can insert own sub" on public.subscriptions for insert with check (auth.uid() = user_id);
create policy "Users can update own sub" on public.subscriptions for update using (auth.uid() = user_id);

create trigger on_subscription_updated
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();
