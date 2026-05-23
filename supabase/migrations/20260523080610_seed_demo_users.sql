
-- ── Demo users ──────────────────────────────────────────────────────────
-- Three seeded accounts so empty social surfaces (friend feed, suggestions,
-- public profiles) have content from day one. Passwords are random — these
-- accounts cannot be logged into.

do $$
declare
  daphne_id constant uuid := '11111111-1111-1111-1111-100000000001';
  mateo_id  constant uuid := '11111111-1111-1111-1111-100000000002';
  kit_id    constant uuid := '11111111-1111-1111-1111-100000000003';
begin
  -- auth.users (only if not already seeded)
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values
    (daphne_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'daphne@demo.wilddex.local',
     crypt(gen_random_uuid()::text, gen_salt('bf')),
     now() - interval '60 days', now() - interval '60 days', now() - interval '60 days',
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"demo":true}'::jsonb,
     false, '', '', '', ''),
    (mateo_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'mateo@demo.wilddex.local',
     crypt(gen_random_uuid()::text, gen_salt('bf')),
     now() - interval '55 days', now() - interval '55 days', now() - interval '55 days',
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"demo":true}'::jsonb,
     false, '', '', '', ''),
    (kit_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'kit@demo.wilddex.local',
     crypt(gen_random_uuid()::text, gen_salt('bf')),
     now() - interval '50 days', now() - interval '50 days', now() - interval '50 days',
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"demo":true}'::jsonb,
     false, '', '', '', '')
  on conflict (id) do nothing;

  -- profiles
  insert into public.profiles (id, username, display_name, explorer_title, level, created_at) values
    (daphne_id, 'daphne_woods', 'Daphne · Forest Guide',  'FOREST GUIDE',    3, now() - interval '60 days'),
    (mateo_id,  'mateo_safari', 'Mateo · Field Notes',    'SAFARI VETERAN',  4, now() - interval '55 days'),
    (kit_id,    'kit_tides',    'Kit · Marine Biologist', 'MARINE BIOLOGIST', 3, now() - interval '50 days')
  on conflict (id) do nothing;
end $$;

-- Sightings (varied dates within last 28 days so they hit the notifications window)
with demo as (
  select '11111111-1111-1111-1111-100000000001'::uuid as daphne,
         '11111111-1111-1111-1111-100000000002'::uuid as mateo,
         '11111111-1111-1111-1111-100000000003'::uuid as kit
), sp as (
  select id, dex_number from public.species
)
insert into public.sightings (
  user_id, species_id, location_name, region, country,
  latitude, longitude, gps_verified, is_public,
  notes, sighted_at, created_at
)
select s.user_id, sp.id, s.location_name, s.region, s.country,
       s.lat, s.lng, true, true,
       s.notes, s.sighted_at, s.sighted_at
from sp
join (
  -- Daphne — North American forest sweep
  select (select daphne from demo) as user_id, 1  as dex, 'Green Mountain trail' as location_name, 'North America' as region, 'United States' as country, 44.21 as lat, -72.58 as lng, 'Caught the rust-tipped tail flicking through underbrush.' as notes, now() - interval '4 days' as sighted_at  union all
  select (select daphne from demo),                 5,  'Battery Park',           'North America', 'United States',        44.48, -73.21, 'Burying acorns by the bench.',                          now() - interval '6 days'    union all
  select (select daphne from demo),                 2,  'Echo Pond Loop',         'North America', 'United States',        44.31, -72.94, 'Doe and fawn at the field edge.',                       now() - interval '8 days'    union all
  select (select daphne from demo),                 24, 'Old Barn Rd',            'Europe',        'United Kingdom',       51.18,   0.43, 'Heart-shaped face, dawn flight.',                       now() - interval '11 days'   union all
  select (select daphne from demo),                 56, 'Burlington Greenbelt',   'North America', 'United States',        44.46, -73.18, 'Cheeks stuffed with sunflower seeds.',                  now() - interval '13 days'   union all
  select (select daphne from demo),                 67, 'Underhill Conifer Stand','North America', 'United States',        44.51, -72.83, 'High in a hemlock — saw the quills first.',             now() - interval '16 days'   union all
  select (select daphne from demo),                 14, 'Camel''s Hump approach', 'North America', 'United States',        44.32, -72.89, 'Black bear, brown muzzle, watching from 40 m out.',     now() - interval '18 days'   union all
  select (select daphne from demo),                 72, 'Lake Champlain shore',   'North America', 'United States',        44.49, -73.23, 'Great blue heron stalking minnows.',                    now() - interval '20 days'   union all
  -- Mateo — Africa + a couple of legendaries
  select (select mateo from demo),                  29, 'Masai Mara, north',      'Africa',        'Kenya',                -1.41,  35.06, 'Pride of seven. Male yawning at noon.',                 now() - interval '5 days'    union all
  select (select mateo from demo),                  30, 'Masai Mara, central',    'Africa',        'Kenya',                -1.50,  35.12, 'A small herd browsing the acacia tops.',                now() - interval '7 days'    union all
  select (select mateo from demo),                  31, 'Serengeti, south',       'Africa',        'Tanzania',             -2.33,  34.83, 'Migration crossing — easily a thousand.',               now() - interval '10 days'   union all
  select (select mateo from demo),                  28, 'Amboseli, east gate',    'Africa',        'Kenya',                -2.65,  37.26, 'Old matriarch leading the group to water.',             now() - interval '12 days'   union all
  select (select mateo from demo),                  32, 'Naboisho Conservancy',   'Africa',        'Kenya',                -1.38,  35.27, 'Two brothers hunting at first light.',                  now() - interval '14 days'   union all
  select (select mateo from demo),                  37, 'Hemis NP, ridgeline',    'Asia',          'India',                34.10,  77.51, 'One year tracking before this single frame.',           now() - interval '19 days'   union all
  select (select mateo from demo),                  38, 'Bandhavgarh, zone 3',    'Asia',          'India',                23.71,  81.03, 'Bengal stripes across the dry leaf litter.',            now() - interval '22 days'   union all
  -- Kit — marine
  select (select kit from demo),                    51, 'Hanauma Bay reef',       'Oceania',       'United States',        21.27, -157.69, 'Three of them holding station in the anemone.',         now() - interval '3 days'    union all
  select (select kit from demo),                    50, 'Punaluu Beach',          'South America', 'United States',        19.13, -155.51, 'Sea turtle resting on black sand.',                     now() - interval '9 days'    union all
  select (select kit from demo),                    52, 'Lime Kiln Point',        'North America', 'United States',        48.51, -123.15, 'Southern Resident pod, J-pod most likely.',             now() - interval '15 days'   union all
  select (select kit from demo),                    49, 'Off the Na Pali Coast',  'North America', 'United States',        22.21, -159.71, 'Single breath that shook the deck.',                    now() - interval '21 days'   union all
  select (select kit from demo),                    48, 'Farallon Islands',       'Africa',        'United States',        37.69, -123.00, 'Tagged shark, three breach attempts at the decoy.',     now() - interval '25 days'   union all
  select (select kit from demo),                    35, 'Mara River crossing',    'Africa',        'Kenya',                -1.55,  35.04, 'Patient and explosive on the bank.',                    now() - interval '27 days'
) as s on s.dex = sp.dex_number
on conflict do nothing;

-- user_dex_entries (so the dex unlock state matches)
insert into public.user_dex_entries (user_id, species_id, unlocked_at)
select user_id, species_id, min(sighted_at)
  from public.sightings
 where user_id in (
   '11111111-1111-1111-1111-100000000001',
   '11111111-1111-1111-1111-100000000002',
   '11111111-1111-1111-1111-100000000003'
 )
 group by user_id, species_id
on conflict (user_id, species_id) do nothing;

-- Friendships among the demo users
insert into public.friendships (requester_id, addressee_id, status, responded_at, created_at) values
  ('11111111-1111-1111-1111-100000000001', '11111111-1111-1111-1111-100000000002', 'accepted', now() - interval '40 days', now() - interval '42 days'),
  ('11111111-1111-1111-1111-100000000001', '11111111-1111-1111-1111-100000000003', 'accepted', now() - interval '38 days', now() - interval '40 days'),
  ('11111111-1111-1111-1111-100000000002', '11111111-1111-1111-1111-100000000003', 'accepted', now() - interval '35 days', now() - interval '36 days')
on conflict do nothing;

-- Auto-friend any existing real user with two of the demos (kit + daphne).
-- mateo is left out so he shows up as a friend-of-friends suggestion.
insert into public.friendships (requester_id, addressee_id, status, responded_at, created_at)
select demo_id, u.id, 'accepted', now() - interval '1 day', now() - interval '1 day'
  from auth.users u
 cross join (values
   ('11111111-1111-1111-1111-100000000001'::uuid),
   ('11111111-1111-1111-1111-100000000003'::uuid)
 ) as d(demo_id)
 where u.id not in (
   '11111111-1111-1111-1111-100000000001',
   '11111111-1111-1111-1111-100000000002',
   '11111111-1111-1111-1111-100000000003'
 )
on conflict do nothing;

-- Trigger: auto-friend every NEW user with the same two demos.
create or replace function public.auto_friend_demo_accounts()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $func$
declare
  demo_ids constant uuid[] := array[
    '11111111-1111-1111-1111-100000000001'::uuid,
    '11111111-1111-1111-1111-100000000003'::uuid
  ];
  demo_id uuid;
begin
  if new.id = any(array[
    '11111111-1111-1111-1111-100000000001'::uuid,
    '11111111-1111-1111-1111-100000000002'::uuid,
    '11111111-1111-1111-1111-100000000003'::uuid
  ]) then
    return new;
  end if;

  foreach demo_id in array demo_ids loop
    insert into public.friendships (requester_id, addressee_id, status, responded_at, created_at)
    values (demo_id, new.id, 'accepted', now(), now())
    on conflict do nothing;
  end loop;

  return new;
end;
$func$;

drop trigger if exists auto_friend_demo_accounts_trigger on auth.users;
create trigger auto_friend_demo_accounts_trigger
  after insert on auth.users
  for each row execute function public.auto_friend_demo_accounts();
