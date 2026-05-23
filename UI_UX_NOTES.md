# WildDex UI/UX Review Notes
_Captured via Playwright browsing — May 2026_

---

## HOME PAGE (`/`)

- **Dead space at bottom.** Below the "Field Tip" card there is ~250px of bare background before the nav bar. Either add another widget (streak, leaderboard teaser, recent activity) or collapse the padding.
- **Tip is server-randomized.** A new tip renders on every page load, which looks like a glitch if the user navigates away and back quickly (they see the tip change). Consider client-side rotation or a fixed tip per day.
- **No gamification hook.** The only progress signal is the 0/57 bar. There is no streak counter, no badge preview, no "X more to next milestone" nudge. For a 0-discovery user this page feels static and uninviting.
- **"Latest Catch" empty state.** The camera icon + copy "get out there!" is charming, but there is no CTA inside the empty state — a small "SCAN YOUR FIRST →" button here would convert better than the generic SCAN button below.
- **Two CTAs compete.** SCAN and VIEW MAP buttons are equally weighted at the same size. SCAN should be the primary action (larger, full-width?) and VIEW MAP secondary.
- **Header has no app-logo icon.** The login page shows a leaf icon above "WildDex" and looks polished. The in-app header is just plain text. Adding the icon (even small, left of the title) would reinforce brand identity.

---

## DEX PAGE (`/dex`)

- **57 identical "???" cards are visually monotonous.** A brand-new user lands here and sees a wall of the same locked card. Consider showing silhouette art or a blurred emoji instead of a generic `help` icon so the grid has visual variety even when locked.
- **Zero-padded count ("000/57") may confuse.** The "000" reads as an error code to some users. "0 / 57" or "0 of 57" is more readable for a dashboard counter. The zero-padding is fine on individual dex cards (stylistic), but not on the prominent DISCOVERED header.
- **No search or filter by type/rarity.** Users who remember spotting a "bird" have no way to filter. Even a simple type chip row (Mammal / Bird / Reptile…) would help.
- **"BY REGION" toggle has no visual transition.** Switching between DEX NUMBER and BY REGION is an instant full-page reload (it's a link). There is no loading indicator and the scroll position jumps to the top, which is disorienting.
- **"FILTER →" buttons in region view are too small.** The pill buttons are ~10px font and only about 60px wide. They are easy to miss and hard to tap on mobile.
- **Antarctica is always an orphan.** In the by-region view, Antarctica has 1 species and sits alone in the last row of a 3-column grid, left-aligned. Either center it, give it a full-width card, or add a visual divider to separate it.
- **No indication of total per region** without switching to "BY REGION." A small continent badge on each card (like the Regions page has) would orient users spatially.

---

## ANIMAL DETAIL PAGE (`/animal/[id]`)

- **Back button is hardcoded to `/dex`.** If a user arrives from the Map or from a notification, the back arrow still drops them on the Dex. Use `router.back()` or track the referrer.
- **Back button has no text label.** Just an arrow icon — add "DEX" or "BACK" text beside it for clarity, matching platform conventions.
- **"VIEW ON MAP" makes no sense for a locked animal.** If the species hasn't been sighted, the map shows nothing relevant. For locked species, replace this CTA with "LOG A SIGHTING" pointing to `/scan`.
- **#001 badge has poor contrast.** The badge uses `bg-tertiary text-on-tertiary` which renders as dark olive-green — the number is hard to read. Switch to a higher-contrast pairing (white text on dark background).
- **Large blank card for locked species.** The hero card is `aspect-square` filled with a solid mint color, a lone "?" character, and "???" text. That is a lot of real estate for no information. A silhouette illustration, a habitat hint, or a "Found in: ???" teaser would be more engaging.
- **"DEX ENTRY" floats on the border.** The section header is absolutely positioned over the card border (the "label on the outline" pattern). This is a deliberate design choice but it can look like a rendering bug. If kept, ensure the background color matches precisely on all themes.
- **Stats grid labels are uniform for locked/unlocked.** "TYPE: Unknown", "REGION: Unknown", "RARITY: LOCKED", "LOCATION: Not logged" — four nearly identical grey tiles. At minimum, show a continent icon in REGION even when locked (e.g., 🌿 North America) to give a geographic hint.
- **No "LOG A SIGHTING" action on the detail page.** Users who look up a locked animal have no inline path to unlock it. A secondary button below the stats grid ("Seen this species? LOG A SIGHTING →") would close the loop.

---

## SCAN PAGE (`/scan`)

**Unauthenticated state:**
- The "Log In To Scan" card is centred on a very empty page. Below the card there is ~500px of dead background before the bottom nav. The page should either fill this space or centre the card vertically in the viewport.
- The lock icon inside a white rounded square on a mint card background creates three visual layers (icon → square → card). Simplifying to just the icon on the card background would be cleaner.

**Authenticated / form state:**
- **LOCATION vs. CONTINENT vs. COUNTRY are three separate fields.** This is a lot of friction for what most users experience as "I spotted it here." GPS auto-fill or the map pin should pre-fill all three. Until GPS is captured, showing three blank required text inputs is daunting.
- **Field label says "CONTINENT" but the input's `name` attribute is `region`.** This naming mismatch will confuse developers and may surface in error messages.
- **GPS and Pin-on-Map share equal 50/50 width.** GPS should be the default action (primary button style) and Pin-on-Map secondary. After GPS is captured both buttons keep the same green "captured" highlight, making it unclear which method is active.
- **Continent dropdown defaults to "North America"** even if GPS hasn't been used. A user in Australia who forgets to change this will mislabel their sighting.
- **Submit button requires significant scroll.** On a typical mobile screen the "LOG SIGHTING" button is below the fold after all the fields. Sticky submit button at the bottom, or collapsing optional fields (notes, GPS) behind a disclosure, would improve the flow.
- **Photo field is `required` but AI identification is optional.** If the user skips AI and just picks a species manually, they still must provide a photo. This is a reasonable design choice but should be communicated upfront ("A photo is required to log a sighting") rather than discovered via a validation error.
- **"UPLOADING…" text during submit has no progress indicator.** A spinner or animated ellipsis would reduce perceived wait time.

---

## MAP PAGE (`/map`)

- **Continent grid appears below the map on mobile.** On small screens the user must scroll past the map to switch continents, then scroll back up to see the map update. A horizontal scrollable tab strip pinned above (or inside) the map would be much better.
- **Antarctica sits as an orphaned 7th item** in a 2-column or 4-column grid regardless of breakpoint. Give it a full-width card or merge it with another region.
- **"NORTH AMERICA" chip in the map header looks like a button** but isn't interactive. Either make it tap-able (opens continent picker) or remove the border styling that implies interactivity.
- **Recent sightings list is desktop-sidebar-only.** On mobile, users can see the map and the continent grid but not the list of recent sightings for the selected continent. This data is hidden unless the viewport is wide. Move a condensed version into the mobile flow.
- **50vh map height is too short on small/landscape phones.** Consider `min-h-64` and capping at 60vh, or use a fixed pixel height that works better across orientations.
- **"No GPS sightings yet" overlay** in the center of the map is semi-transparent — if the basemap is active behind it the text can be hard to read. Increase the background opacity or add a solid panel instead.
- **"LOG SIGHTING" button placement.** On mobile, after the map, progress bar, and 7-continent grid, the LOG SIGHTING button is very far down. It should float or be placed more prominently.

---

## LOGIN PAGE (`/login`)

- **Large vertical gap between hero and form.** The teal hero section ends, a horizontal rule divides it, and then there is ~180px of white space before "Welcome back!" appears. The form should sit closer to the fold.
- **No "Forgot password?" link.** This is a standard expectation on any login form.
- **No back/escape route.** A user who lands on login (because they tried to visit `/profile`) cannot return to the public app without hitting the browser back button. A small "← Explore without signing in" link in the hero would help.
- **"Don't have an account? Sign up"** is plain underlined text at the bottom. Make it slightly more prominent (or integrate the choice into the page structure) to serve new users better.
- **No OAuth/social login options visible.** Whether this is planned or not, users will expect it. If it's intentionally email-only, a brief note ("we keep it simple — just email + password") builds trust.

---

## REGIONS PAGE (`/regions`)

- **Not linked from the bottom nav or home page.** The page exists at `/regions` but there is no navigation item pointing to it. It appears to be a dead-end accessible only by direct URL. Either add it to the nav or remove it and consolidate its content into the Map or Dex pages.
- **Duplicates the Map page's continent progress.** Both pages show continent names, species counts, and progress bars. The Regions page adds colour-coded cards and habitat labels, but the Map page has a live map. The two should be merged or clearly differentiated in purpose.
- **Antarctica card is cut off by the bottom nav.** The card is only partially visible at the bottom of the viewport with no visual affordance that more content exists below. Add a scroll-shadow or ensure the card clears the nav with enough padding.
- **"VIEW SPECIES →"** (Regions page) and **"FILTER →"** (Dex by-region) do the same thing but have different labels. Standardise the CTA language.
- **Habitat sub-labels per region** ("Forest · Wetland · Prairie") are present on the Regions page but not on the Map page sidebar or the Dex. Either show them consistently or remove from Regions.

---

## GENERAL / CROSS-CUTTING

- **All browser tab titles read "WildDex".** Every page should have a descriptive `<title>` (e.g., "Dex | WildDex", "Discovery Map | WildDex") for bookmarks, browser history, and accessibility.
- **No page-specific H1.** Every page uses "WildDex" as the H1 in the sticky header, then H2 for the actual page content ("Dex Completion", "Discovery Map"). Semantically, the page-level content heading should be H1.
- **ThemeToggle component exists in the codebase but is not surfaced anywhere in the UI.** If dark mode is supported, the toggle should be accessible (e.g., in the profile page or header settings menu).
- **Hard-shadow inconsistency.** Some interactive elements have `hard-shadow-active` (press-down effect) and some don't. The SCAN button on home has it; the LOG SIGHTING button on the map page does not. Audit and apply consistently to all tappable surfaces.
- **Material Symbols icons depend on Google Fonts CDN.** If the font fails to load, icons render as plain text strings ("photo_camera", "home", etc.) throughout the UI. Consider a fallback or self-hosting the icon font.
- **No global loading / skeleton states.** Page transitions are server-rendered and instant when cached, but on slow connections the page goes blank before content appears. Add loading skeletons for the Dex grid and the animal detail hero.
- **No toast/notification system.** Success after logging a sighting uses a URL query param (`?logged=1`) which shows a banner on the animal detail page. This approach breaks if the user navigates away and returns to the URL. A global toast would be more robust.
- **Bottom nav active-tab detection is path-exact.** If a user is on `/animal/5` the nav shows no active tab, because none of the nav hrefs match. Consider marking DEX active for any `/animal/*` path, and SCAN active for `/scan/*`.
- **No offline / PWA support indicators.** For a field app meant to be used outdoors, users will expect the app to work with spotty connectivity. Even a simple "you are offline" banner would set expectations.
