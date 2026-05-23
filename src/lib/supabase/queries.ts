import { createClient } from "./server";
import type { Animal } from "@/lib/animals";
import type { UserStats } from "@/lib/badges";

const SIGHTING_PHOTOS_BUCKET = "sighting-photos";

// Exact column names from the species table in Supabase
interface SpeciesRow {
  id: string;
  dex_number: number;
  common_name: string;
  scientific_name: string | null;
  type: string;
  rarity: string;
  default_region: string | null;
  description: string | null;
  sprite: string | null;
  silhouette: string | null;
  continent: string | null;
}

export interface SpeciesOption {
  id: string;
  dexNumber: number;
  number: string;
  name: string;
  region: string;
  type: string;
  rarity: string;
  sprite: string;
}

export interface LatestSighting {
  id: string;
  latitude: number | null;
  longitude: number | null;
  photo_url: string | null;
  photoDisplayUrl: string | null;
  location_name: string | null;
  region: string | null;
  country: string | null;
  notes: string | null;
  created_at: string | null;
}

export interface UserSighting {
  id: string;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  region: string | null;
  country: string | null;
  notes: string | null;
  created_at: string | null;
  is_public: boolean;
  gps_verified: boolean;
}

interface AuthUser {
  id: string;
  email?: string | null;
}

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

function envList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function isEnvAdminUser(user: AuthUser | null): boolean {
  if (!user) return false;

  const adminIds = envList(process.env.WILDDEX_ADMIN_USER_IDS);
  const adminEmails = envList(process.env.WILDDEX_ADMIN_EMAILS);
  const email = user.email?.toLowerCase();

  return (
    adminIds.includes(user.id.toLowerCase()) ||
    Boolean(email && adminEmails.includes(email))
  );
}

async function getIsAdminUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: AuthUser | null
): Promise<boolean> {
  if (!user) return false;
  if (isEnvAdminUser(user)) return true;

  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return Boolean((data as { is_admin?: boolean } | null)?.is_admin);
}

function toAnimal(
  s: SpeciesRow,
  unlocked: boolean,
  sightingLocation = ""
): Animal {
  return {
    id: s.id,
    dexNumber: s.dex_number,
    number: pad(s.dex_number),
    name: s.common_name,
    emoji: s.sprite ?? "?",
    silhouette: s.silhouette ?? "?",
    type: s.type,
    region: s.default_region ?? "Unknown",
    continent: s.continent ?? "Unknown",
    rarity: s.rarity as Animal["rarity"],
    description: s.description ?? "",
    unlocked,
    sightingLocation,
  };
}

async function getUnlockedIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<Set<string>> {
  const { data } = await supabase
    .from("user_dex_entries")
    .select("species_id")
    .eq("user_id", userId);
  return new Set((data ?? []).map((e: { species_id: string }) => e.species_id));
}

function sightingLocation(row: {
  location_name?: string | null;
  region?: string | null;
  country?: string | null;
}): string {
  return [row.location_name, row.region, row.country].filter(Boolean).join(", ");
}

async function signedPhotoUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  photoUrl: string | null
): Promise<string | null> {
  if (!photoUrl) return null;
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl;

  const { data, error } = await supabase.storage
    .from(SIGHTING_PHOTOS_BUCKET)
    .createSignedUrl(photoUrl, 60 * 30);

  if (error) return null;
  return data.signedUrl;
}

async function getLatestSightingForSpeciesWithClient(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  speciesId: string
): Promise<LatestSighting | null> {
  const { data } = await supabase
    .from("sightings")
    .select("id, latitude, longitude, photo_url, location_name, region, country, notes, created_at")
    .eq("user_id", userId)
    .eq("species_id", speciesId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  const row = data as Omit<LatestSighting, "photoDisplayUrl">;

  return {
    ...row,
    photoDisplayUrl: await signedPhotoUrl(supabase, row.photo_url),
  };
}

export async function getLatestSightingForSpecies(
  userId: string,
  speciesId: string
): Promise<LatestSighting | null> {
  const supabase = await createClient();
  return getLatestSightingForSpeciesWithClient(supabase, userId, speciesId);
}

async function getLatestSightingLocation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  speciesId: string
): Promise<string> {
  const sighting = await getLatestSightingForSpeciesWithClient(
    supabase,
    userId,
    speciesId
  );

  return sighting ? sightingLocation(sighting) : "";
}

// All species ordered by dex_number, merged with the user's unlock state.
// Pass { continent } to filter to a single continent.
export async function getAllSpecies(filter?: { continent?: string }): Promise<Animal[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = await getIsAdminUser(supabase, user);

  let query = supabase.from("species").select("*").order("dex_number");
  if (filter?.continent) query = query.eq("continent", filter.continent);

  const [{ data: rows }, unlockedIds] = await Promise.all([
    query,
    user && !admin
      ? getUnlockedIds(supabase, user.id)
      : Promise.resolve(new Set<string>()),
  ]);

  return (rows ?? []).map((s: SpeciesRow) =>
    toAnimal(s, admin || unlockedIds.has(s.id))
  );
}

export async function getSpeciesOptions(): Promise<SpeciesOption[]> {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("species")
    .select("id, dex_number, common_name, default_region, type, rarity, sprite")
    .order("dex_number");

  return (rows ?? []).map(
    (s: Pick<
      SpeciesRow,
      | "id"
      | "dex_number"
      | "common_name"
      | "default_region"
      | "type"
      | "rarity"
      | "sprite"
    >) => ({
      id: s.id,
      dexNumber: s.dex_number,
      number: pad(s.dex_number),
      name: s.common_name,
      region: s.default_region ?? "Unknown",
      type: s.type,
      rarity: s.rarity,
      sprite: s.sprite ?? "?",
    })
  );
}

// Single species by dex_number (the integer used in /animal/[id] URLs).
// Returns null only if no species has that dex_number.
// unlocked=false when the user hasn't logged a sighting for it yet.
export async function getSpeciesByDexNumber(
  dexNumber: number
): Promise<Animal | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = await getIsAdminUser(supabase, user);

  const [{ data: row }, unlockedIds] = await Promise.all([
    supabase
      .from("species")
      .select("*")
      .eq("dex_number", dexNumber)
      .single(),
    user && !admin
      ? getUnlockedIds(supabase, user.id)
      : Promise.resolve(new Set<string>()),
  ]);

  if (!row) return null;
  const sightingLocation = user
    ? await getLatestSightingLocation(supabase, user.id, row.id)
    : "";

  return toAnimal(
    row as SpeciesRow,
    admin || unlockedIds.has(row.id),
    sightingLocation
  );
}

export async function getSpeciesById(id: string): Promise<Animal | null> {
  const dexNumber = Number(id);
  if (!Number.isInteger(dexNumber) || dexNumber < 1) return null;

  return getSpeciesByDexNumber(dexNumber);
}

// How many species this user has unlocked.
export async function getDiscoveredCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  if (await getIsAdminUser(supabase, user)) {
    const { count } = await supabase
      .from("species")
      .select("*", { count: "exact", head: true });

    return count ?? 0;
  }

  const { count } = await supabase
    .from("user_dex_entries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return count ?? 0;
}

// Total number of species in the dex.
export async function getSpeciesTotal(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("species")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

// The most recent real sightings for this user, deduplicated by species.
export async function getRecentSpecies(limit = 3): Promise<Animal[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Fetch more than needed so we have enough unique species after deduplication.
  const { data: sightings } = await supabase
    .from("sightings")
    .select("location_name, region, country, species(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit * 10);

  const seen = new Set<string>();
  return (sightings ?? [])
    .map(
      (row: {
        location_name: string | null;
        region: string | null;
        country: string | null;
        species: SpeciesRow | SpeciesRow[] | null;
      }) => {
        const species = Array.isArray(row.species)
          ? row.species[0]
          : row.species;
        return species ? toAnimal(species, true, sightingLocation(row)) : null;
      }
    )
    .filter((animal): animal is Animal => {
      if (!animal) return false;
      if (seen.has(animal.id)) return false;
      seen.add(animal.id);
      return true;
    })
    .slice(0, limit);
}

// All sightings a user has logged for a specific species, newest first.
export async function getSightingsForSpecies(
  userId: string,
  speciesId: string
): Promise<UserSighting[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sightings")
    .select("id, latitude, longitude, location_name, region, country, notes, created_at, is_public, gps_verified")
    .eq("user_id", userId)
    .eq("species_id", speciesId)
    .order("created_at", { ascending: false });
  return (data ?? []) as UserSighting[];
}

export interface MapSighting {
  id: string;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  region: string | null;
  sighted_at: string | null;
  species_name: string;
  species_sprite: string;
  species_rarity: string;
  dex_number: number;
}

// Rounds to ~1.1 km precision and adds a deterministic ±550 m jitter based on
// the sighting ID, so the exact capture location is never exposed on the map.
function fuzzCoord(coord: number, id: string, axis: "lat" | "lng"): number {
  let hash = 0;
  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) & 0xffffffff;
  }
  const seed = axis === "lat" ? hash & 0xff : (hash >> 8) & 0xff;
  const jitter = (seed / 255 - 0.5) * 0.01;
  return Math.round((coord + jitter) * 100) / 100;
}

export async function getMapSightings(): Promise<MapSighting[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("sightings")
    .select(
      "id, latitude, longitude, location_name, region, sighted_at, species(common_name, sprite, rarity, dex_number)"
    )
    .eq("user_id", user.id)
    .order("sighted_at", { ascending: false });

  type MapSpeciesSubset = {
    common_name: string | null;
    sprite: string | null;
    rarity: string;
    dex_number: number;
  };
  type MapRow = {
    id: string;
    latitude: number | null;
    longitude: number | null;
    location_name: string | null;
    region: string | null;
    sighted_at: string | null;
    species: MapSpeciesSubset | MapSpeciesSubset[] | null;
  };

  return (data ?? []).map((row: MapRow) => {
    const sp = Array.isArray(row.species) ? row.species[0] : row.species;
    return {
      id: row.id,
      latitude: row.latitude != null ? fuzzCoord(row.latitude, row.id, "lat") : null,
      longitude: row.longitude != null ? fuzzCoord(row.longitude, row.id, "lng") : null,
      location_name: row.location_name,
      region: row.region,
      sighted_at: row.sighted_at,
      species_name: sp?.common_name ?? "Unknown",
      species_sprite: sp?.sprite ?? "?",
      species_rarity: sp?.rarity ?? "Common",
      dex_number: sp?.dex_number ?? 0,
    };
  });
}

export async function getSpeciesCountPerContinent(): Promise<
  Record<string, number>
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("species")
    .select("continent")
    .not("continent", "is", null);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const c = (row as { continent: string }).continent;
    counts[c] = (counts[c] ?? 0) + 1;
  }
  return counts;
}

export type { UserStats };

function computeStreak(createdAts: (string | null)[]): number {
  const dateSet = new Set(
    createdAts
      .filter(Boolean)
      .map((ts) => (ts as string).slice(0, 10)) // "YYYY-MM-DD" UTC
  );
  if (dateSet.size === 0) return 0;

  const sorted = [...dateSet].sort().reverse(); // newest first

  const todayUTC = new Date().toISOString().slice(0, 10);
  const yesterdayUTC = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  // Streak must include today or yesterday to still be active
  if (sorted[0] !== todayUTC && sorted[0] !== yesterdayUTC) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]).getTime();
    const curr = new Date(sorted[i]).getTime();
    if (Math.round((prev - curr) / 86_400_000) === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export async function getUserStats(): Promise<UserStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const empty: UserStats = {
    uniqueSpecies: 0,
    rareSightings: 0,
    regionsCount: 0,
    typeBreakdown: {},
    photosCount: 0,
    notesCount: 0,
    streakDays: 0,
    completedQuests: new Set(),
  };
  if (!user) return empty;


  // All badge progress is derived from GPS-verified sightings only. Uploaded
  // or map-pinned sightings still unlock the dex (discovery) but they don't
  // move badge stats forward.
  const [{ data: verifiedSightings }, { data: completions }] = await Promise.all([
    supabase
      .from("sightings")
      .select("species_id, region, photo_url, notes, created_at, species(type, rarity)")
      .eq("user_id", user.id)
      .eq("gps_verified", true),
    supabase
      .from("user_quest_completions")
      .select("quest_id")
      .eq("user_id", user.id),
  ]);

  type VerifiedRow = {
    species_id: string;
    region: string | null;
    photo_url: string | null;
    notes: string | null;
    created_at: string | null;
    species:
      | { type: string; rarity: string }
      | { type: string; rarity: string }[]
      | null;
  };

  const typeBreakdown: Record<string, number> = {};
  const verifiedSpeciesIds = new Set<string>();
  const verifiedRareSpeciesIds = new Set<string>();
  const seenTypeBySpecies = new Map<string, string>();
  const regions = new Set<string>();
  let photosCount = 0;
  let notesCount = 0;
  const createdAts: (string | null)[] = [];

  for (const row of (verifiedSightings ?? []) as VerifiedRow[]) {
    verifiedSpeciesIds.add(row.species_id);
    const sp = Array.isArray(row.species) ? row.species[0] : row.species;
    if (sp) {
      if (["Rare", "Epic", "Legendary"].includes(sp.rarity)) {
        verifiedRareSpeciesIds.add(row.species_id);
      }
      // Count each species' type once toward the breakdown.
      const t = sp.type.toLowerCase();
      if (!seenTypeBySpecies.has(row.species_id)) {
        seenTypeBySpecies.set(row.species_id, t);
        typeBreakdown[t] = (typeBreakdown[t] ?? 0) + 1;
      }
    }
    if (row.region) regions.add(row.region);
    if (row.photo_url) photosCount++;
    if (row.notes?.trim()) notesCount++;
    createdAts.push(row.created_at);
  }

  const completedQuests = new Set(
    (completions ?? []).map((c: { quest_id: string }) => c.quest_id)
  );

  return {
    uniqueSpecies: verifiedSpeciesIds.size,
    rareSightings: verifiedRareSpeciesIds.size,
    regionsCount: regions.size,
    typeBreakdown,
    photosCount,
    notesCount,
    streakDays: computeStreak(createdAts),
    completedQuests,
  };
}

export async function getRegionsCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data } = await supabase
    .from("sightings")
    .select("region")
    .eq("user_id", user.id)
    .not("region", "is", null);

  return new Set(
    (data ?? []).map((r: { region: string }) => r.region).filter(Boolean)
  ).size;
}

export async function getRareFindsCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data } = await supabase
    .from("user_dex_entries")
    .select("species(rarity)")
    .eq("user_id", user.id);

  return (data ?? []).filter((row) => {
    const species = Array.isArray(row.species) ? row.species[0] : row.species;
    return (
      ["Rare", "Epic", "Legendary"].includes(
        (species as { rarity: string } | null)?.rarity ?? ""
      )
    );
  }).length;
}

export interface UserProfile {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  explorer_title: string | null;
}

export async function getProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, explorer_title")
    .eq("id", user.id)
    .maybeSingle();

  return (data as UserProfile | null) ?? null;
}

export async function getCurrentUserIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return getIsAdminUser(supabase, user);
}

export interface RegionProgress {
  continent: string;
  total: number;
  unlocked: number;
}

export async function getRegionProgress(): Promise<RegionProgress[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = await getIsAdminUser(supabase, user);

  const { data: allSpecies } = await supabase
    .from("species")
    .select("id, continent")
    .not("continent", "is", null);

  const totals: Record<string, number> = {};
  const idsByContinent: Record<string, string[]> = {};
  for (const row of allSpecies ?? []) {
    const r = row as { id: string; continent: string };
    totals[r.continent] = (totals[r.continent] ?? 0) + 1;
    (idsByContinent[r.continent] ??= []).push(r.id);
  }

  const unlockedByContinent: Record<string, number> = {};

  if (user) {
    if (admin) {
      for (const [cont, count] of Object.entries(totals)) {
        unlockedByContinent[cont] = count;
      }
    } else {
      const { data: entries } = await supabase
        .from("user_dex_entries")
        .select("species_id")
        .eq("user_id", user.id);

      const unlockedIds = new Set(
        (entries ?? []).map((e: { species_id: string }) => e.species_id)
      );

      for (const [cont, ids] of Object.entries(idsByContinent)) {
        unlockedByContinent[cont] = ids.filter((id) => unlockedIds.has(id)).length;
      }
    }
  }

  return Object.entries(totals).map(([continent, total]) => ({
    continent,
    total,
    unlocked: unlockedByContinent[continent] ?? 0,
  }));
}

// ── Friends ───────────────────────────────────────────────────────────────

export interface FriendProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface PendingRequest extends FriendProfile {
  friendship_id: string;
  created_at: string;
}

async function hydrateProfiles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userIds: string[]
): Promise<Map<string, FriendProfile>> {
  if (userIds.length === 0) return new Map();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", userIds);
  const map = new Map<string, FriendProfile>();
  for (const row of (data ?? []) as FriendProfile[]) {
    map.set(row.id, row);
  }
  return map;
}

export async function getFriends(): Promise<FriendProfile[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id, responded_at")
    .eq("status", "accepted")
    .order("responded_at", { ascending: false });

  const friendIds = (data ?? []).map((row) =>
    row.requester_id === user.id ? row.addressee_id : row.requester_id
  );

  const profiles = await hydrateProfiles(supabase, friendIds);
  return friendIds
    .map((id) => profiles.get(id))
    .filter((p): p is FriendProfile => Boolean(p));
}

export async function getIncomingFriendRequests(): Promise<PendingRequest[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("friendships")
    .select("id, requester_id, created_at")
    .eq("addressee_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as {
    id: string;
    requester_id: string;
    created_at: string;
  }[];
  const profiles = await hydrateProfiles(supabase, rows.map((r) => r.requester_id));
  return rows
    .map((r) => {
      const p = profiles.get(r.requester_id);
      if (!p) return null;
      return { ...p, friendship_id: r.id, created_at: r.created_at };
    })
    .filter((r): r is PendingRequest => Boolean(r));
}

export async function getOutgoingFriendRequests(): Promise<PendingRequest[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("friendships")
    .select("id, addressee_id, created_at")
    .eq("requester_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as {
    id: string;
    addressee_id: string;
    created_at: string;
  }[];
  const profiles = await hydrateProfiles(supabase, rows.map((r) => r.addressee_id));
  return rows
    .map((r) => {
      const p = profiles.get(r.addressee_id);
      if (!p) return null;
      return { ...p, friendship_id: r.id, created_at: r.created_at };
    })
    .filter((r): r is PendingRequest => Boolean(r));
}

export interface FriendFeedItem {
  sighting_id: string;
  created_at: string | null;
  notes: string | null;
  location_name: string | null;
  region: string | null;
  country: string | null;
  photoDisplayUrl: string | null;
  friend: FriendProfile;
  species_name: string;
  species_sprite: string;
  species_rarity: string;
  dex_number: number;
}

export async function getFriendsFeed(limit = 20): Promise<FriendFeedItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Find friend user ids
  const { data: friendshipRows } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .eq("status", "accepted");

  const friendIds = (friendshipRows ?? []).map((row) =>
    row.requester_id === user.id ? row.addressee_id : row.requester_id
  );

  if (friendIds.length === 0) return [];

  const { data: sightingRows } = await supabase
    .from("sightings")
    .select(
      "id, user_id, photo_url, location_name, region, country, notes, created_at, species(common_name, sprite, rarity, dex_number)"
    )
    .in("user_id", friendIds)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  type FeedSpeciesSubset = {
    common_name: string | null;
    sprite: string | null;
    rarity: string;
    dex_number: number;
  };
  type FeedRow = {
    id: string;
    user_id: string;
    photo_url: string | null;
    location_name: string | null;
    region: string | null;
    country: string | null;
    notes: string | null;
    created_at: string | null;
    species: FeedSpeciesSubset | FeedSpeciesSubset[] | null;
  };

  const rows = (sightingRows ?? []) as FeedRow[];
  const profiles = await hydrateProfiles(
    supabase,
    Array.from(new Set(rows.map((r) => r.user_id)))
  );

  const items = await Promise.all(
    rows.map(async (row): Promise<FriendFeedItem | null> => {
      const friend = profiles.get(row.user_id);
      if (!friend) return null;
      const sp = Array.isArray(row.species) ? row.species[0] : row.species;
      return {
        sighting_id: row.id,
        created_at: row.created_at,
        notes: row.notes,
        location_name: row.location_name,
        region: row.region,
        country: row.country,
        photoDisplayUrl: await signedPhotoUrl(supabase, row.photo_url),
        friend,
        species_name: sp?.common_name ?? "Unknown",
        species_sprite: sp?.sprite ?? "?",
        species_rarity: sp?.rarity ?? "Common",
        dex_number: sp?.dex_number ?? 0,
      };
    })
  );

  return items.filter((i): i is FriendFeedItem => Boolean(i));
}

// ── Quests ───────────────────────────────────────────────────────────────

export type QuestTier = "tutorial" | "intermediate" | "advanced" | "legendary";

export interface QuestRow {
  id: string;
  name: string;
  description: string;
  tier: QuestTier;
  required_dex_numbers: number[];
  reward_badge_id: string | null;
  unlock_after_quest_id: string | null;
  order_index: number;
}

export interface QuestSpeciesPreview {
  dex_number: number;
  common_name: string;
  sprite: string | null;
  rarity: string;
  unlocked: boolean;
}

export interface QuestWithProgress {
  quest: QuestRow;
  required: number;
  completed: number;
  progressPct: number;
  isCompleted: boolean;
  completedAt: string | null;
  isLocked: boolean;
  species: QuestSpeciesPreview[];
}

interface QuestProgressContext {
  quests: QuestRow[];
  completedQuestIds: Set<string>;
  unlockedDexNumbers: Set<number>;
  completedAtByQuest: Map<string, string>;
  speciesByDex: Map<number, { common_name: string; sprite: string | null; rarity: string }>;
}

async function loadQuestContext(): Promise<QuestProgressContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: questData } = await supabase
    .from("quests")
    .select("*")
    .order("order_index", { ascending: true });
  const quests = (questData ?? []) as QuestRow[];
  if (quests.length === 0) return null;

  const allDex = Array.from(
    new Set(quests.flatMap((q) => q.required_dex_numbers))
  );

  const { data: speciesRows } = await supabase
    .from("species")
    .select("dex_number, common_name, sprite, rarity")
    .in("dex_number", allDex);

  const speciesByDex = new Map<
    number,
    { common_name: string; sprite: string | null; rarity: string }
  >();
  for (const row of (speciesRows ?? []) as {
    dex_number: number;
    common_name: string;
    sprite: string | null;
    rarity: string;
  }[]) {
    speciesByDex.set(row.dex_number, {
      common_name: row.common_name,
      sprite: row.sprite,
      rarity: row.rarity,
    });
  }

  if (!user) {
    return {
      quests,
      completedQuestIds: new Set(),
      unlockedDexNumbers: new Set(),
      completedAtByQuest: new Map(),
      speciesByDex,
    };
  }

  // Quest progress only counts GPS-verified sightings. The dex itself unlocks
  // on any sighting (including uploads), but verifiable field captures are
  // what move quests forward.
  const [{ data: verifiedSightings }, { data: completions }] = await Promise.all([
    supabase
      .from("sightings")
      .select("species(dex_number)")
      .eq("user_id", user.id)
      .eq("gps_verified", true),
    supabase
      .from("user_quest_completions")
      .select("quest_id, completed_at")
      .eq("user_id", user.id),
  ]);

  const unlockedDexNumbers = new Set<number>();
  for (const row of (verifiedSightings ?? []) as {
    species: { dex_number: number } | { dex_number: number }[] | null;
  }[]) {
    const sp = Array.isArray(row.species) ? row.species[0] : row.species;
    if (sp?.dex_number) unlockedDexNumbers.add(sp.dex_number);
  }

  const completedQuestIds = new Set<string>();
  const completedAtByQuest = new Map<string, string>();
  for (const row of (completions ?? []) as {
    quest_id: string;
    completed_at: string;
  }[]) {
    completedQuestIds.add(row.quest_id);
    completedAtByQuest.set(row.quest_id, row.completed_at);
  }

  return {
    quests,
    completedQuestIds,
    unlockedDexNumbers,
    completedAtByQuest,
    speciesByDex,
  };
}

function buildQuestWithProgress(
  quest: QuestRow,
  ctx: QuestProgressContext
): QuestWithProgress {
  const required = quest.required_dex_numbers.length;
  const completed = quest.required_dex_numbers.filter((d) =>
    ctx.unlockedDexNumbers.has(d)
  ).length;
  const progressPct =
    required === 0 ? 0 : Math.round((completed / required) * 100);
  const isCompleted = ctx.completedQuestIds.has(quest.id);
  const isLocked =
    quest.unlock_after_quest_id != null &&
    !ctx.completedQuestIds.has(quest.unlock_after_quest_id);

  const species: QuestSpeciesPreview[] = quest.required_dex_numbers.map((d) => {
    const sp = ctx.speciesByDex.get(d);
    return {
      dex_number: d,
      common_name: sp?.common_name ?? `#${d}`,
      sprite: sp?.sprite ?? null,
      rarity: sp?.rarity ?? "Common",
      unlocked: ctx.unlockedDexNumbers.has(d),
    };
  });

  return {
    quest,
    required,
    completed,
    progressPct,
    isCompleted,
    completedAt: ctx.completedAtByQuest.get(quest.id) ?? null,
    isLocked,
    species,
  };
}

export async function getQuestProgress(): Promise<QuestWithProgress[]> {
  const ctx = await loadQuestContext();
  if (!ctx) return [];
  return ctx.quests.map((q) => buildQuestWithProgress(q, ctx));
}

// Returns the best "what to hunt next" quest:
//   - in-progress unlocked-incomplete (highest progress first)
//   - falls back to unlocked-incomplete with 0 progress (lowest order_index)
//   - returns null if every quest is locked or completed
export async function getActiveQuest(): Promise<QuestWithProgress | null> {
  const ctx = await loadQuestContext();
  if (!ctx) return null;

  const candidates = ctx.quests
    .map((q) => buildQuestWithProgress(q, ctx))
    .filter((q) => !q.isCompleted && !q.isLocked);

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    if (b.completed !== a.completed) return b.completed - a.completed;
    return a.quest.order_index - b.quest.order_index;
  });

  return candidates[0];
}

export async function getQuestsByIds(ids: string[]): Promise<QuestRow[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("quests")
    .select("*")
    .in("id", ids);
  return (data ?? []) as QuestRow[];
}

// Returns quests whose progress just reached 100% but aren't yet recorded as
// completed. Used by the sighting-log flow to insert completion rows.
export async function getNewlyCompletedQuests(): Promise<QuestWithProgress[]> {
  const ctx = await loadQuestContext();
  if (!ctx) return [];

  return ctx.quests
    .map((q) => buildQuestWithProgress(q, ctx))
    .filter(
      (q) =>
        !q.isCompleted &&
        !q.isLocked &&
        q.required > 0 &&
        q.completed === q.required
    );
}

// ── Public profile ──────────────────────────────────────────────────────────

export interface PublicProfileSighting {
  sighting_id: string;
  species_name: string;
  species_sprite: string;
  dex_number: number;
  created_at: string | null;
  photoDisplayUrl: string | null;
}

export type PublicProfileRelation =
  | "none"
  | "self"
  | "friends"
  | "pending_outgoing"
  | "pending_incoming";

export interface PublicProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  explorer_title: string | null;
  created_at: string | null;
  visibleSightingsCount: number;
  rareCount: number;
  continentsCount: number;
  recentSightings: PublicProfileSighting[];
  relation: PublicProfileRelation;
}

export async function getPublicProfile(
  username: string
): Promise<PublicProfile | null> {
  const supabase = await createClient();
  const cleanUsername = username.replace(/^@/, "");

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, explorer_title, created_at")
    .ilike("username", cleanUsername)
    .maybeSingle();
  if (!profileRow) return null;

  const profile = profileRow as {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    explorer_title: string | null;
    created_at: string | null;
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Relation
  let relation: PublicProfileRelation = "none";
  if (user) {
    if (user.id === profile.id) {
      relation = "self";
    } else {
      const { data: friendshipRow } = await supabase
        .from("friendships")
        .select("requester_id, addressee_id, status")
        .or(
          `and(requester_id.eq.${user.id},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${user.id})`
        )
        .maybeSingle();
      if (friendshipRow) {
        if (friendshipRow.status === "accepted") {
          relation = "friends";
        } else if (friendshipRow.status === "pending") {
          relation =
            friendshipRow.requester_id === user.id
              ? "pending_outgoing"
              : "pending_incoming";
        }
      }
    }
  }

  // Sightings visibility:
  // - self: see everything via own RLS policy
  // - friends: see is_public via friend RLS policy
  // - others: nothing via RLS
  const { data: sightingRows } = await supabase
    .from("sightings")
    .select(
      "id, photo_url, created_at, region, species_id, species(common_name, sprite, rarity, dex_number)"
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  type SightingRow = {
    id: string;
    photo_url: string | null;
    created_at: string | null;
    region: string | null;
    species_id: string;
    species:
      | {
          common_name: string | null;
          sprite: string | null;
          rarity: string;
          dex_number: number;
        }
      | {
          common_name: string | null;
          sprite: string | null;
          rarity: string;
          dex_number: number;
        }[]
      | null;
  };
  const rows = (sightingRows ?? []) as SightingRow[];

  const uniqueSpeciesIds = new Set<string>();
  const rareSpeciesIds = new Set<string>();
  const continents = new Set<string>();
  for (const r of rows) {
    uniqueSpeciesIds.add(r.species_id);
    const sp = Array.isArray(r.species) ? r.species[0] : r.species;
    if (sp && ["Rare", "Epic", "Legendary"].includes(sp.rarity)) {
      rareSpeciesIds.add(r.species_id);
    }
    if (r.region) continents.add(r.region);
  }

  // Distinct sightings (by species, most recent), top 6
  const seenSpecies = new Set<string>();
  const recentDistinct: SightingRow[] = [];
  for (const r of rows) {
    if (seenSpecies.has(r.species_id)) continue;
    seenSpecies.add(r.species_id);
    recentDistinct.push(r);
    if (recentDistinct.length >= 6) break;
  }

  const recentSightings: PublicProfileSighting[] = await Promise.all(
    recentDistinct.map(async (r) => {
      const sp = Array.isArray(r.species) ? r.species[0] : r.species;
      return {
        sighting_id: r.id,
        species_name: sp?.common_name ?? "Unknown",
        species_sprite: sp?.sprite ?? "?",
        dex_number: sp?.dex_number ?? 0,
        created_at: r.created_at,
        photoDisplayUrl: await signedPhotoUrl(supabase, r.photo_url),
      };
    })
  );

  return {
    id: profile.id,
    username: profile.username,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    explorer_title: profile.explorer_title,
    created_at: profile.created_at,
    visibleSightingsCount: uniqueSpeciesIds.size,
    rareCount: rareSpeciesIds.size,
    continentsCount: continents.size,
    recentSightings,
    relation,
  };
}

export interface FriendSuggestion extends FriendProfile {
  mutual_count: number;
}

// ── Notifications ──────────────────────────────────────────────────────────

export type NotificationItem =
  | {
      kind: "friend_request";
      created_at: string;
      from: FriendProfile;
    }
  | {
      kind: "friend_accepted";
      created_at: string;
      friend: FriendProfile;
    }
  | {
      kind: "friend_sighting";
      created_at: string;
      friend: FriendProfile;
      species_name: string;
      species_sprite: string;
      rarity: string;
      dex_number: number;
    }
  | {
      kind: "quest_completed";
      created_at: string;
      quest_name: string;
      quest_id: string;
      reward_badge_id: string | null;
    };

const NOTIFICATION_WINDOW_DAYS = 30;

export async function getNotifications(limit = 30): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const sinceISO = new Date(
    Date.now() - NOTIFICATION_WINDOW_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const items: NotificationItem[] = [];

  // 1. Incoming friend requests (always show, no date window)
  const { data: incomingRows } = await supabase
    .from("friendships")
    .select("requester_id, created_at")
    .eq("addressee_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const incomingIds = (incomingRows ?? []).map(
    (r: { requester_id: string }) => r.requester_id
  );

  // 2. Recently accepted friendships I requested
  const { data: acceptedRows } = await supabase
    .from("friendships")
    .select("addressee_id, responded_at")
    .eq("requester_id", user.id)
    .eq("status", "accepted")
    .gte("responded_at", sinceISO)
    .order("responded_at", { ascending: false });

  const acceptedIds = (acceptedRows ?? []).map(
    (r: { addressee_id: string }) => r.addressee_id
  );

  // 3. Friends' recent rare sightings
  const { data: friendshipsRows } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .eq("status", "accepted");
  const friendIds = (friendshipsRows ?? []).map((row) =>
    row.requester_id === user.id ? row.addressee_id : row.requester_id
  );

  type FriendSightingRow = {
    user_id: string;
    created_at: string | null;
    species:
      | {
          common_name: string | null;
          sprite: string | null;
          rarity: string;
          dex_number: number;
        }
      | {
          common_name: string | null;
          sprite: string | null;
          rarity: string;
          dex_number: number;
        }[]
      | null;
  };
  let friendSightingRows: FriendSightingRow[] = [];
  if (friendIds.length > 0) {
    const { data } = await supabase
      .from("sightings")
      .select(
        "user_id, created_at, species(common_name, sprite, rarity, dex_number)"
      )
      .in("user_id", friendIds)
      .eq("is_public", true)
      .in("species.rarity", ["Rare", "Epic", "Legendary"])
      .gte("created_at", sinceISO)
      .order("created_at", { ascending: false })
      .limit(15);
    friendSightingRows = (data ?? []) as FriendSightingRow[];
  }

  // 4. My recent quest completions
  const { data: questCompletionRows } = await supabase
    .from("user_quest_completions")
    .select("quest_id, completed_at, quests(name, reward_badge_id)")
    .eq("user_id", user.id)
    .gte("completed_at", sinceISO)
    .order("completed_at", { ascending: false })
    .limit(10);

  // Hydrate profiles in one batch
  const profileIds = Array.from(
    new Set([
      ...incomingIds,
      ...acceptedIds,
      ...friendSightingRows.map((r) => r.user_id),
    ])
  );
  const profiles = await hydrateProfiles(supabase, profileIds);

  for (const r of (incomingRows ?? []) as {
    requester_id: string;
    created_at: string;
  }[]) {
    const p = profiles.get(r.requester_id);
    if (!p) continue;
    items.push({ kind: "friend_request", created_at: r.created_at, from: p });
  }

  for (const r of (acceptedRows ?? []) as {
    addressee_id: string;
    responded_at: string;
  }[]) {
    const p = profiles.get(r.addressee_id);
    if (!p) continue;
    items.push({
      kind: "friend_accepted",
      created_at: r.responded_at,
      friend: p,
    });
  }

  for (const r of friendSightingRows) {
    const sp = Array.isArray(r.species) ? r.species[0] : r.species;
    if (!sp || !r.created_at) continue;
    const p = profiles.get(r.user_id);
    if (!p) continue;
    items.push({
      kind: "friend_sighting",
      created_at: r.created_at,
      friend: p,
      species_name: sp.common_name ?? "Unknown",
      species_sprite: sp.sprite ?? "?",
      rarity: sp.rarity,
      dex_number: sp.dex_number,
    });
  }

  for (const r of (questCompletionRows ?? []) as {
    quest_id: string;
    completed_at: string;
    quests:
      | { name: string; reward_badge_id: string | null }
      | { name: string; reward_badge_id: string | null }[]
      | null;
  }[]) {
    const q = Array.isArray(r.quests) ? r.quests[0] : r.quests;
    if (!q) continue;
    items.push({
      kind: "quest_completed",
      created_at: r.completed_at,
      quest_id: r.quest_id,
      quest_name: q.name,
      reward_badge_id: q.reward_badge_id,
    });
  }

  items.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return items.slice(0, limit);
}

export async function getFriendsWithSighting(
  speciesId: string
): Promise<FriendProfile[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: friendshipRows } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .eq("status", "accepted");

  const friendIds = (friendshipRows ?? []).map((row) =>
    row.requester_id === user.id ? row.addressee_id : row.requester_id
  );
  if (friendIds.length === 0) return [];

  const { data: sightingRows } = await supabase
    .from("sightings")
    .select("user_id")
    .eq("species_id", speciesId)
    .eq("is_public", true)
    .in("user_id", friendIds);

  const seen = new Set<string>();
  for (const row of (sightingRows ?? []) as { user_id: string }[]) {
    seen.add(row.user_id);
  }
  if (seen.size === 0) return [];

  const profiles = await hydrateProfiles(supabase, Array.from(seen));
  return Array.from(seen)
    .map((id) => profiles.get(id))
    .filter((p): p is FriendProfile => Boolean(p));
}

export async function getFriendSuggestions(
  limit = 10
): Promise<FriendSuggestion[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: rpcData } = await supabase.rpc("get_friend_suggestions", {
    limit_count: limit,
  });

  const rows = (rpcData ?? []) as { user_id: string; mutual_count: number }[];
  if (rows.length === 0) return [];

  const userIds = rows.map((r) => r.user_id);
  const profiles = await hydrateProfiles(supabase, userIds);

  return rows
    .map((r) => {
      const p = profiles.get(r.user_id);
      if (!p) return null;
      return { ...p, mutual_count: Number(r.mutual_count) };
    })
    .filter((r): r is FriendSuggestion => Boolean(r));
}

export async function searchUsersByUsername(
  query: string,
  limit = 10
): Promise<FriendProfile[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const trimmed = query.trim().replace(/^@/, "");
  if (!user || trimmed.length < 2) return [];

  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .ilike("username", `${trimmed}%`)
    .neq("id", user.id)
    .limit(limit);

  return (data ?? []) as FriendProfile[];
}

