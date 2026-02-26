-- ============================================
-- MISEN V7 — Session 3 : Schéma BDD
-- Tables : projects, analyses, generations
-- RLS : chaque user voit uniquement ses données
-- ============================================

-- 1. PROJECTS
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  script_text text,
  status text default 'draft' check (status in ('draft', 'analyzing', 'production', 'complete')),
  scenes_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. ANALYSES (versionning — chaque analyse est une version)
create table if not exists public.analyses (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  version integer default 1,
  result jsonb not null default '{}',
  style_preset text default 'cinematique',
  scenes_count integer default 0,
  plans_count integer default 0,
  cost_total numeric(10,2) default 0,
  continuity_score integer default 100,
  compliance_level text default 'OK',
  created_at timestamptz default now()
);

-- 3. GENERATIONS (suivi des générations vidéo par plan)
create table if not exists public.generations (
  id uuid default gen_random_uuid() primary key,
  analysis_id uuid references public.analyses(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_index integer not null,
  scene_index integer not null,
  model_id text not null,
  prompt text not null,
  negative_prompt text,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  result_url text,
  cost numeric(10,4) default 0,
  duration_seconds numeric(6,2),
  error_message text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_projects_updated_at on public.projects(updated_at desc);
create index if not exists idx_analyses_project_id on public.analyses(project_id);
create index if not exists idx_analyses_version on public.analyses(project_id, version desc);
create index if not exists idx_generations_analysis_id on public.generations(analysis_id);
create index if not exists idx_generations_status on public.generations(status);

-- ============================================
-- RLS — Row Level Security
-- ============================================
alter table public.projects enable row level security;
alter table public.analyses enable row level security;
alter table public.generations enable row level security;

-- Projects : user voit/modifie uniquement ses projets
create policy "Users can view own projects" on public.projects
  for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on public.projects
  for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on public.projects
  for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on public.projects
  for delete using (auth.uid() = user_id);

-- Analyses : user voit/crée ses analyses
create policy "Users can view own analyses" on public.analyses
  for select using (auth.uid() = user_id);
create policy "Users can insert own analyses" on public.analyses
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own analyses" on public.analyses
  for delete using (auth.uid() = user_id);

-- Generations : user voit/crée ses générations
create policy "Users can view own generations" on public.generations
  for select using (auth.uid() = user_id);
create policy "Users can insert own generations" on public.generations
  for insert with check (auth.uid() = user_id);
create policy "Users can update own generations" on public.generations
  for update using (auth.uid() = user_id);

-- ============================================
-- FUNCTION : auto-update updated_at
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_project_updated
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- ============================================
-- FUNCTION : auto-increment analysis version
-- ============================================
create or replace function public.increment_analysis_version()
returns trigger as $$
begin
  new.version = coalesce(
    (select max(version) from public.analyses where project_id = new.project_id),
    0
  ) + 1;
  return new;
end;
$$ language plpgsql;

create trigger on_analysis_insert
  before insert on public.analyses
  for each row execute function public.increment_analysis_version();
