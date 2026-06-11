# WildDex Roadmap

## Current Status

Frontend-only shell. All routes exist (`/`, `/dex`, `/animal/[id]`, `/scan`, `/confirm`, `/map`, `/regions`, `/profile`, `/login`, `/signup`) with placeholder data hardcoded in `src/lib/animals.ts`. No auth, no database, no AI, no real maps.

---

## MVP Feature List

The minimum to make WildDex a real app:

- [ ] User auth (sign up, log in, sign out)
- [ ] Persistent dex — sightings saved to a database, not hardcoded
- [ ] Photo upload → AI species identification → confirm flow
- [ ] Log a confirmed sighting (species + location + timestamp)
- [ ] View your personal dex (locked/unlocked based on real sightings)
- [ ] Animal detail page showing real data

---

## Implementation Phases

### Phase 1 — Auth & Database (foundational)
Wire up Supabase auth and create the core tables. Replace hardcoded animal data with DB reads. Users can sign up, log in, and have a persistent session.

### Phase 2 — Sighting Flow
Connect the scan → confirm → log pipeline end-to-end. User uploads/captures a photo, AI returns species candidates, user picks one, sighting is saved. The dex unlocks that species for their account.

### Phase 3 — Maps & Location
Show real sighting locations on the map. When logging a sighting, capture GPS coordinates (with permission). Markers on `/map` link to the animal detail for that sighting.

### Phase 4 — Regions & Progress
Regions become meaningful: each species is tagged to a region, completion % is calculated from real data. Cloudy Peaks unlocks when the user reaches a threshold in earlier regions.

### Phase 5 — Social & Gamification
Streaks, badges, and leaderboards backed by real data. Heatmap of community sightings (anonymised). Rare species alerts for your area.

---

## Backend — Supabase

**Why Supabase:** Postgres + auth + storage + Row Level Security in one managed service. Works well with Next.js Server Components and the App Router.

**Client setup:** Use `@supabase/ssr` (not the legacy `auth-helpers`) for App Router compatibility. Server Components get a read-only Supabase client; route handlers and server actions get a full client.

**Auth flow:** Email/password to start. Add OAuth (Google) later. Supabase handles sessions via cookies; middleware refreshes tokens on every request.

---

## Database Tables

```sql
-- Master species list (seeded, not user-generated)
species (
  id          uuid primary key,
  number      int unique not null,        -- dex number, e.g. 001
  name        text not null,
  emoji       text,
  type        text,                        -- mammal, bird, reptile, etc.
  region_id   uuid references regions(id),
  rarity      text check (rarity in ('common','uncommon','rare','very-rare')),
  description text
)

-- Regions (seeded)
regions (
  id          uuid primary key,
  name        text not null,
  level_range text,                        -- e.g. "LVL 1-15"
  unlock_at   int default 0               -- min total sightings to unlock
)

-- One row per user per species (unlocked = at least one confirmed sighting)
user_species (
  id          uuid primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  species_id  uuid references species(id),
  first_seen  timestamptz default now(),
  unique (user_id, species_id)
)

-- Individual sighting events (many per species per user)
sightings (
  id          uuid primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  species_id  uuid references species(id),
  photo_url   text,                        -- Supabase Storage path
  lat         double precision,
  lng         double precision,
  location_name text,                      -- reverse-geocoded label
  confidence  int,                         -- AI confidence %, 0-100
  logged_at   timestamptz default now()
)

-- Badges earned
user_badges (
  id          uuid primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  badge_key   text not null,              -- e.g. "forest_scout"
  earned_at   timestamptz default now(),
  unique (user_id, badge_key)
)
```

**Row Level Security:** Every table gets RLS enabled. Users can only read/write their own rows (`auth.uid() = user_id`). `species` and `regions` are public reads.

**Storage:** One bucket `sighting-photos`. Files stored at `{user_id}/{sighting_id}.jpg`. Bucket is private; signed URLs generated server-side for display.

---

## AI Image Identification

**Plan:** Use the Claude API (claude-haiku-4-5 for speed/cost) with vision. Send the uploaded image as base64 and prompt it to return the top 3 most likely species from the WildDex species list.

**Flow:**
1. User captures/uploads photo on `/scan`
2. Photo is sent to a Next.js route handler (`POST /api/identify`)
3. Route handler calls Claude with the image + a structured prompt listing known species
4. Claude returns JSON: `[{ species_id, name, confidence }]` (top 3)
5. Response drives the `/confirm` radio-list UI
6. On confirm, the sighting is saved to Supabase

**Prompt design:** Include the full species list so Claude maps results to actual dex entries. Ask for confidence scores and fallback to "Unknown species" if nothing matches.

**Cost control:** Compress images to ≤1MB before sending. Cache results by image hash to avoid duplicate API calls. Rate-limit per user (e.g. 10 scans/hour).

**Fallback:** If confidence < 30% on all candidates, show a "no match found" state and let the user retry or manually search.

---

## Mapbox Plan

**Use:** Mapbox GL JS (`mapbox-gl` + `react-map-gl`) for the `/map` screen.

**What to show:**
- User's current GPS position (browser Geolocation API)
- Markers for the current user's sightings (colour-coded by rarity)
- Optional: anonymised community heatmap for all sightings in the region

**Implementation:**
- Map renders client-side only (`"use client"`, dynamic import with `ssr: false`)
- Sighting coordinates fetched from Supabase on load
- Clicking a marker opens a bottom sheet with the animal name, emoji, and date

**Tile style:** Use a Mapbox Outdoors or Satellite-Streets style to match the wildlife/nature theme. Consider a custom retro style later using Mapbox Studio.

**API key:** Store as `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local`. The public token is safe to expose in browser code; restrict it by URL in the Mapbox dashboard.

---

## Privacy & Location Considerations

- **Ask, don't assume.** Only request geolocation at the moment of logging a sighting. Explain why ("to pin your sighting on the map").
- **Coarse coordinates.** Store full precision in the DB but display only to ~1km accuracy on community maps. Never expose exact coordinates of other users' sightings.
- **Photo metadata.** Strip EXIF data (including embedded GPS) from uploaded photos before storing. Use `browser-image-compression` or a server-side sharp transform.
- **Opt-out.** Let users log sightings without location — `lat`/`lng` nullable. Map just won't show a pin.
- **Data deletion.** Supabase cascade deletes handle row cleanup when a user deletes their account. Storage photos need a separate cleanup job (Supabase Edge Function or cron).
- **GDPR / PIPEDA.** For a Canadian user base, be explicit in a privacy policy about what location data is collected, how long it's retained, and how to request deletion.

---

## Future Feature Ideas

- **Push notifications** — "A rare species was spotted near you!"
- **iNaturalist sync** — import past observations from iNaturalist as dex entries
- **Seasonal events** — limited-time species that only appear in certain months
- **Photo gallery** — per-species gallery of all your logged sighting photos
- **Species comparison** — side-by-side info cards for similar-looking species
- **Offline mode** — cache the species list and dex state in IndexedDB for fieldwork without signal
- **Apple/Google Wallet badges** — exportable achievement cards
- **AR viewfinder** — overlay species name on camera feed using on-device ML (TensorFlow.js or Core ML via a React Native port)
- **Community hotspots** — crowd-sourced "good spots" pinned to the map by region

---

## Backlog (from scratch notes)

Migrated from the old `futureedits.txt`; checked against the codebase June 2026.

- [ ] **Biome-tagged map locations** — designate map areas with specific biomes so the region an animal was caught in is derived from where the photo was taken, not picked manually.
- [ ] **Profile page button audit** — verify every button on `/profile` is wired up (edit and badges subpages exist; sweep for any remaining dead buttons).
- [x] ~~Rename "Wildex" → "WildDex"~~ — done, no single-d occurrences remain in `src/`.
- [x] ~~Uploaded photos tagged as GPS-unverified and excluded from badge progress~~ — done: `gps_verified` column exists and badge/quest queries filter on it (`src/lib/supabase/queries.ts`).
