
create table if not exists public.quests (
  id text primary key,
  name text not null,
  description text not null,
  tier text not null check (tier in ('tutorial', 'intermediate', 'advanced', 'legendary')),
  required_dex_numbers int[] not null,
  reward_badge_id text,
  unlock_after_quest_id text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists quests_tier_idx on public.quests (tier, order_index);

create table if not exists public.user_quest_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_id text not null references public.quests(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, quest_id)
);

create index if not exists uqc_user_idx on public.user_quest_completions (user_id);

alter table public.quests enable row level security;
create policy "quests_public_read"
  on public.quests for select
  using (true);

alter table public.user_quest_completions enable row level security;

create policy "uqc_select_own"
  on public.user_quest_completions for select
  using (auth.uid() = user_id);

create policy "uqc_insert_own"
  on public.user_quest_completions for insert
  with check (auth.uid() = user_id);

create policy "uqc_delete_own"
  on public.user_quest_completions for delete
  using (auth.uid() = user_id);
