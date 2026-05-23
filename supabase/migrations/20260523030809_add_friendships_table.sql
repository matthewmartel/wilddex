
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('pending', 'accepted')) default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint friendships_no_self check (requester_id <> addressee_id),
  constraint friendships_unique_pair unique (requester_id, addressee_id)
);

create index if not exists friendships_requester_idx on public.friendships (requester_id);
create index if not exists friendships_addressee_idx on public.friendships (addressee_id);
create index if not exists friendships_status_idx on public.friendships (status);

alter table public.friendships enable row level security;

create policy "friendships_select_own"
  on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "friendships_insert_as_requester"
  on public.friendships for insert
  with check (auth.uid() = requester_id and status = 'pending');

create policy "friendships_update_by_addressee"
  on public.friendships for update
  using (auth.uid() = addressee_id and status = 'pending')
  with check (auth.uid() = addressee_id and status = 'accepted');

create policy "friendships_delete_either_party"
  on public.friendships for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);
