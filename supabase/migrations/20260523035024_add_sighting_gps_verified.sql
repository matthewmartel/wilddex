
alter table public.sightings
  add column if not exists gps_verified boolean not null default false;

-- Backfill: legacy sightings keep their quest/badge credit.
update public.sightings
   set gps_verified = true
 where gps_verified = false;

create index if not exists sightings_verified_user_idx
  on public.sightings (user_id, gps_verified)
  where gps_verified = true;
