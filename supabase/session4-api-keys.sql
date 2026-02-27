-- ============================================
-- MISEN V7 — Session 4 : Clés API
-- ============================================

create table if not exists public.api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  provider text not null,
  api_key text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, provider)
);

create index if not exists idx_api_keys_user on public.api_keys(user_id);

alter table public.api_keys enable row level security;

create policy "Users can view own keys" on public.api_keys for select using (auth.uid() = user_id);
create policy "Users can insert own keys" on public.api_keys for insert with check (auth.uid() = user_id);
create policy "Users can update own keys" on public.api_keys for update using (auth.uid() = user_id);
create policy "Users can delete own keys" on public.api_keys for delete using (auth.uid() = user_id);

create trigger on_api_key_updated
  before update on public.api_keys
  for each row execute function public.handle_updated_at();
