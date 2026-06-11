# WildDex Day 1 Recap

Day 1 was focused on map depth, dark mode, gamification, and the profile experience. No new core tables were added — all work built on the Phase 1–3 foundation from Day 0.

---

## Maps & Location

### Mapbox Fully Wired
- Replaced the placeholder discovery map on `/map` with a real Mapbox GL JS implementation.
- Replaced the fake SVG globe on `/profile` with a real compact Mapbox map showing the user's personal sightings.
- Map renders client-side only via dynamic import with `ssr: false`.

### GPS Privacy — Coordinate Fuzzing
- Exact GPS coordinates are never exposed to the browser.
- A deterministic ±550 m jitter (derived from a hash of the sighting ID) is applied server-side before any coordinate reaches the client.
- Coordinates are also rounded to 2 decimal places.
- The same sighting always appears at the same fuzzed location (consistent across renders).

### Time-of-Day Map Adaptation
- Map style switches automatically based on the browser's local hour:
  - Night (21:00–05:00): Mapbox `dark-v11`
  - Dusk (18:00–21:00): `outdoors-v12` + warm orange overlay
  - Dawn (05:00–07:00): `outdoors-v12` + soft golden overlay
  - Day (07:00–18:00): `outdoors-v12`, no overlay

### Continent Navigation
- Clicking a continent card on `/map` re-centers and re-zooms the map to that continent.
- Each continent has a tuned center coordinate and zoom level.
- Map remounts with the new center via a `key` prop on `MapCanvas` — no imperative `flyTo` needed.
- Continent grid moved below the map on mobile for better UX flow.

### Deep-Link to Specific Sighting
- "View on Map" on an animal detail page now navigates to `/map?sighting={id}`, centering the map at zoom 12 on that exact sighting.
- Priority order for map center: specific sighting > selected continent > default.

### Continent Colors Fixed
- North America, South America, Europe, Africa each had unique colors already.
- Asia and Oceania were sharing colors with NA and SA respectively.
- Added `amber` and `indigo` as full theme color pairs (with dark mode variants) and assigned them to Asia and Oceania.

---

## Dark Mode

### Full CSS-Variable Dark Mode
- Dark mode implemented using `html.dark` class overriding CSS custom properties on `:root`.
- All Tailwind utilities that reference theme colors update automatically — no `dark:` classes needed on any component.
- Surface colors in dark mode are medium gray (`#252826`) rather than near-black, by user preference.
- Mapbox popup styles use CSS variables and adapt correctly.

### Anti-FOUC
- Inline `<script>` in `<head>` applies `html.dark` before first paint, preventing flash of wrong theme.
- Reads `localStorage` key `wd-theme`, falls back to `prefers-color-scheme`.

### Manual Toggle
- `ThemeToggle` component added to profile settings.
- Clicking toggles `html.dark` and persists preference to `localStorage`.
- `ThemeProvider` initializes from `localStorage` on mount and listens for `prefers-color-scheme` changes when no manual preference is set.

### Hydration Warning Fix
- Truffle browser extension was injecting a `<script>` tag into `<head>` before React hydrated, causing a DOM mismatch warning.
- Fixed by adding `suppressHydrationWarning` to `<html>`, `<head>`, and the anti-FOUC `<script>` element.

---

## Sighting Management

### Multiple Sightings Per Species
- Animal detail page now shows all of the user's sightings for a species, not just the latest.
- Each sighting shows location, date, and notes individually.
- Hero photo still comes from the most recent sighting.
- Fixed a bug where multiple sightings of the same species were being conflated in "Recent Catches" on the profile.

### Edit & Delete Sightings
- Each sighting on the animal detail page has EDIT and DELETE actions.
- Edit opens an inline form for location name, continent, country, and notes.
- Delete shows a confirmation step before removing the row and its storage photo.
- All mutations validate ownership server-side via `.eq("user_id", user.id)`.
- Paths are revalidated after any change.

---

## Gamification

### Badge System — 22 Badges Across 5 Categories
A fully fledged badge system replaced the 4 hardcoded placeholder badges.

**Milestones** (by unique species logged):
- First Catch (1), Field Scout (5), Naturalist (10), Expert Tracker (25), Master Explorer (50), Dex Legend (100)

**Rarity:**
- Rare Find (1 rare+), Rare Hunter (5 rare+), Rarity Master (10 rare+)

**Geography** (by continents with sightings):
- Dual Continent (2), World Traveler (4), Globe Trotter (6)

**Species Type** (3 of each type logged):
- Bird Watcher, Mammal Tracker, Reptile Ranger, Marine Spotter, Insect Hunter

**Dedication:**
- Photo Pro (10 sightings with photos), Field Journalist (10 sightings with notes), On a Roll (3-day streak), Weekly Warrior (7-day streak), Unstoppable (30-day streak)

### Badge Collection Page (`/profile/badges`)
- Shows all 22 badges grouped by category.
- Earned badges are full color; locked badges are grayed out with the unlock requirement shown.
- Users select up to 4 badges to feature on their profile.
- Selection is persisted to `user_metadata.featured_badge_ids` via a server action.
- Save button commits the selection; featured badges show a checkmark indicator.

### Profile Badge Display
- Profile shows 4 featured badge slots.
- Empty slots show a dashed "+" placeholder.
- "X EARNED →" link navigates to the collection page.
- If the user hasn't made a selection, the first 4 earned badges are shown as defaults.

### Admin Badge Preview
- Admin accounts see all 22 badges as earned regardless of real sighting data, so badge designs can be reviewed.
- Real stats (streak, regions, rare finds, etc.) still show accurately for admin.

### Day Streak
- Streak is computed from `sightings.created_at` timestamps — no extra DB table needed.
- Deduplicates to unique UTC dates, walks backwards from today/yesterday counting consecutive days.
- Resets to 0 if no sighting was logged today or yesterday.
- Displayed in the profile stats grid.

### Real Profile Stats
- **Logged:** unique species (was already real)
- **Regions:** distinct continents from `sightings.region` (was showing "—")
- **Rare Finds:** species with rarity Rare / Epic / Legendary from `user_dex_entries` (was showing "—" and using wrong rarity values)
- **Day Streak:** consecutive logging days (was showing "—")

---

## Profile Customization

### Edit Profile Page (`/profile/edit`)
- Users can set a username, display name, and upload a profile photo.
- Username is validated: 3–20 characters, letters/numbers/underscores/hyphens only.
- Usernames are **unique case-insensitively** at the DB level (`UNIQUE INDEX ON LOWER(username)`).
- Attempting to claim an existing username returns a clear error.
- Avatar is uploaded to a new `avatars` Supabase Storage bucket (public, 5 MB limit).
- Avatar stored at `{user_id}/avatar` and upserted into `profiles.avatar_url`.

### Profile Page Updates
- Avatar photo shown in the header card (falls back to 🧭 emoji).
- Display name shown as the headline; `@username` shown below if a separate display name is set.
- Raw email address removed from visible profile.
- `explorer_title` from `profiles` table shown instead (falls back to level badge).
- Edit button (pencil icon) in the profile card links to `/profile/edit`.

### Settings Buttons Now Navigate
- **Notifications** → `/notifications` (coming soon page)
- **Privacy** → `/privacy` (explains GPS fuzzing, data storage, photo deletion)
- **Help & Feedback** → `mailto:feedback@wilddex.app`

---

## Home Page

### Rotating Tips
- Single hardcoded tip replaced with a pool of 10 field tips.
- Server picks one at random on each render.
- Icon updated from `info` to `lightbulb`; removed the bouncing arrow decoration.

---

## Dex Entry Cleanup
- Removed the decorative animated `play_arrow` icon from the DEX ENTRY card — it had no function.

---

## Database Changes

### Migration Applied: `profile_edit_setup`
- Created `avatars` storage bucket (public, 5 MB, jpeg/png/webp).
- Added storage RLS policies for avatars (public read, owner write/update/delete).
- Added profiles RLS policies (public read, owner insert/update).
- Added case-insensitive unique index on `LOWER(profiles.username)`.
- Added username format check constraint (regex `^[a-zA-Z0-9_-]{3,20}$`).

### Species Rarity Updates
| Species | Before | After |
|---|---|---|
| Red Fox | Common | Uncommon |
| Raccoon | Common | Uncommon |
| Rattlesnake | (previous) | Epic |
| Penguin | (previous) | Legendary |

---

## Files Added or Modified

### New Files
- `src/lib/badges.ts` — badge catalog, `UserStats` interface, `computeEarnedBadges()`
- `src/app/actions/badges.ts` — `updateFeaturedBadges` server action
- `src/app/actions/profile.ts` — `updateProfile` server action
- `src/app/profile/badges/page.tsx` — badge collection server page
- `src/app/profile/badges/BadgeGrid.tsx` — interactive badge selection client component
- `src/app/profile/edit/page.tsx` — edit profile server page
- `src/app/profile/edit/EditForm.tsx` — edit profile client form
- `src/app/privacy/page.tsx` — privacy information page
- `src/app/notifications/page.tsx` — notifications coming soon page
- `src/app/map/MapboxMap.tsx` — Mapbox GL JS map component
- `src/app/map/MapCanvas.tsx` — dynamic import wrapper for MapboxMap
- `src/components/ThemeProvider.tsx` — dark mode initialization client component
- `src/components/ThemeToggle.tsx` — dark mode toggle button
- `src/app/animal/[id]/SightingActions.tsx` — edit/delete actions client component

### Modified Files
- `src/app/layout.tsx` — ThemeProvider, anti-FOUC script, suppressHydrationWarning
- `src/app/page.tsx` — rotating tips pool
- `src/app/profile/page.tsx` — real stats, profile data, badge display, settings links
- `src/app/map/page.tsx` — continent colors, map centering, sighting deep-link, mobile layout
- `src/app/animal/[id]/page.tsx` — all-sightings list, edit/delete, map deep-link
- `src/app/globals.css` — dark mode variables, amber/indigo tokens, CSS variable shadows
- `src/components/Badge.tsx` — sublabel prop, CSS variable shadow
- `src/lib/supabase/queries.ts` — getUserStats, getProfile, getRegionsCount, getRareFindsCount, fuzzCoord, getSightingsForSpecies, getMapSightings
- `src/lib/sightings/types.ts` — added "success" to status union

---

## End-of-Day State

- Auth, sighting upload, and dex unlock all working.
- GPS capture, coordinate fuzzing, and real map markers working.
- Full dark mode with system preference detection and manual toggle.
- Edit and delete for all logged sightings.
- 22-badge gamification system with collection management UI.
- Profile photos, unique usernames, and display names.
- Real stats: logged count, regions, rare finds, day streak.
- AI identification is not implemented yet.
- Social features (leaderboards, community heatmap) are not implemented yet.
- Push notifications are not implemented yet.
- Offline mode is not implemented yet.
