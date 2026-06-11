# WildDex Day 0 Recap

This recap separates the inherited WildDex work from the work completed with Codex during Day 0. The older `../README.md` and `ROADMAP.md` (sibling file in `docs/`) still describe an earlier frontend-only state, so this file reflects the current project state at the end of Day 0.

## Work Completed Before Codex

### Product Direction

- WildDex was already defined as a mobile-first wildlife collecting app.
- The core loop was already clear: upload or scan an animal, identify or confirm the species, unlock it in a numbered Dex, and view sightings on a personal map.
- The roadmap already laid out the main implementation phases:
  - Auth and database
  - Sighting flow
  - Maps and location
  - Regions and progress
  - Social and gamification

### App Foundation

- The project was already a Next.js App Router app using TypeScript and Tailwind CSS.
- The retro handheld visual direction already existed and was visually cohesive.
- Core routes already existed:
  - `/`
  - `/dex`
  - `/animal/[id]`
  - `/scan`
  - `/confirm`
  - `/map`
  - `/regions`
  - `/profile`
  - `/login`
  - `/signup`
- Shared UI pieces already existed, including:
  - `BottomNav`
  - `DexCard`
  - `ProgressBar`
  - `Badge`
  - panel and card styling utilities

### Supabase Foundation

- Supabase packages were already installed.
- Supabase auth was already wired with sign up, log in, sign out, and session refresh through `src/proxy.ts`.
- Server and browser Supabase clients already existed under `src/lib/supabase/`.
- Species reads from Supabase were already working.
- Normal user unlock state was already based on `user_dex_entries`.
- Admin preview mode existed conceptually and was working for the admin account.
- The app already had a seeded `species` table expectation using columns such as:
  - `id`
  - `dex_number`
  - `common_name`
  - `scientific_name`
  - `type`
  - `rarity`
  - `default_region`
  - `description`
  - `sprite`
  - `silhouette`

### Existing UX Before Codex

- Dex cards already used a locked versus unlocked presentation.
- Animal detail pages already showed species data from Supabase.
- The profile page already showed user-oriented panels and recent catch placeholders.
- The scan page existed visually, but it was not yet a real manual upload and unlock flow.
- The map and regions pages existed as separate placeholder experiences.

## Work Completed By Codex On Day 0

### Mobile Navigation Polish

- Fixed cramped mobile bottom navigation.
- Changed the bottom nav layout to a more stable grid.
- Reduced mobile border and shadow weight so buttons fit better on narrow screens.
- Added `aria-current` for the active nav item.

### Header Cleanup

- Removed fake battery and signal icons from page headers.
- Centered the WildDex wordmark without relying on decorative corner icons.
- Preserved the animal detail back button.

### Supabase Audit

- Audited the codebase instead of assuming schema.
- Confirmed active app references to:
  - `species`
  - `user_dex_entries`
  - `profiles`
  - `sightings`
  - Supabase Storage
- Confirmed `regions` was not yet a real Supabase table in app code.
- Confirmed `user_species` was roadmap-only and not used by current app code.
- Confirmed `.env.local` contains environment variables only.

### Admin Preview Alignment

- Updated admin detection to read `profiles.is_admin`.
- Preserved the existing environment-variable admin fallback so the current admin account would not lose preview access unexpectedly.
- Kept admin preview from creating fake sightings or fake dex entries.

### Phase 2 Manual Sighting Upload

- Added a real manual sighting flow on `/scan`.
- Logged-in users can now:
  - choose a species from the `species` table
  - upload a photo
  - enter a location name
  - select a continent in the existing `region` field
  - enter a country
  - enter notes
- Logged-out users now see a retro login prompt on `/scan`.
- Added the server action:
  - `src/app/actions/sightings.ts`
- Added the scan form:
  - `src/app/scan/ScanForm.tsx`
- Added state/type helpers:
  - `src/app/scan/state.ts`
  - `src/lib/sightings/types.ts`

### Upload And Unlock Behavior

- Uploads go to the private Supabase Storage bucket:
  - `sighting-photos`
- Storage paths use the authenticated user id:
  - `{auth.uid()}/{sighting_id}.{ext}`
- The server action inserts into `sightings`.
- The image path is stored in:
  - `sightings.photo_url`
- The server action upserts into `user_dex_entries`.
- Successful uploads redirect to:
  - `/animal/{dex_number}?logged=1`
- No service role key is used in frontend or server action code.

### Server Action Fix

- Fixed the Next.js error where a `"use server"` file exported a non-async object.
- Moved non-function state and types out of `src/app/actions/sightings.ts`.
- `sightings.ts` now exports only the async `logSighting` server action.

### Animal Detail Photo Display

- Added a latest-sighting helper:
  - `getLatestSightingForSpecies(userId, speciesId)`
- The animal detail page now shows the current user's most recent uploaded sighting photo as the main image when available.
- Private Storage photos are displayed through signed URLs.
- If no uploaded photo exists, unlocked animals fall back to their sprite.
- Locked animals keep the mystery or silhouette state.
- Admin preview only shows a real uploaded photo if that admin user has a real sighting for the species.
- Added a "Your latest sighting" detail card with location, date, and notes when available.

### Dex And Profile Behavior

- Dex grid behavior was preserved:
  - unlocked animals show sprites
  - locked animals show mystery state
  - uploaded photos do not appear in the grid
- Recent catches now use real sightings instead of fake admin preview data.
- Home latest catch can show the latest sighting location when available.

### Map And Regions Merge

- Combined the old `/map` and `/regions` concepts.
- `/map` now has a continent selector and placeholder map surface in one page.
- `/regions` now redirects to `/map`.
- The bottom nav no longer has a separate Regions tab.
- The scan form now treats region as a continent dropdown for now, while still saving into the existing `region` column.

### Build And Validation

- Ran lint checks repeatedly after changes.
- Ran production builds repeatedly after changes.
- Smoke checked routes including:
  - `/scan`
  - `/animal/1`
  - `/animal/1?logged=1`
  - `/map?continent=africa`
  - `/regions`
- Known remaining lint warning:
  - `src/app/layout.tsx` has an existing Next.js font warning about the Google Material Symbols stylesheet link.

## Current End-Of-Day State

- Auth works.
- Species reads work.
- Manual sighting upload works.
- Uploaded photos are stored privately in Supabase Storage.
- `sightings.photo_url` stores the private Storage object path.
- Uploaded sighting photos appear on animal detail pages through signed URLs.
- User unlocks are driven by `user_dex_entries`.
- Admin preview is preserved.
- Dex cards remain sprite-based.
- Map and regions are combined into a continent-based placeholder map.
- AI identification is not implemented yet.
- Real GPS coordinates and real map markers are not implemented yet.
- Mapbox is not implemented yet.

## Recommended Next Step

The next roadmap-aligned milestone is Phase 3:

- Add optional GPS capture during sighting upload.
- Store `lat` and `lng` on `sightings`.
- Query the current user's real sightings for `/map`.
- Replace placeholder continent markers with real user sighting markers.
- Keep Mapbox optional until the data flow is solid.
