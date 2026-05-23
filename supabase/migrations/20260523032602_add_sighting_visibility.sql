
alter table public.sightings
  add column if not exists is_public boolean not null default true;

create index if not exists sightings_is_public_user_idx
  on public.sightings (user_id, is_public, created_at desc);

create policy "sightings_friends_can_read_public"
  on public.sightings for select
  using (
    is_public = true
    and exists (
      select 1
      from public.friendships f
      where f.status = 'accepted'
        and (
          (f.requester_id = auth.uid() and f.addressee_id = sightings.user_id)
          or (f.requester_id = sightings.user_id and f.addressee_id = auth.uid())
        )
    )
  );
