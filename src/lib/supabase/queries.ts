import { createClient } from "./server";
import type { Animal } from "@/lib/animals";

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

function isAdminUser(user: AuthUser | null): boolean {
  if (!user) return false;

  const adminIds = envList(process.env.WILDDEX_ADMIN_USER_IDS);
  const adminEmails = envList(process.env.WILDDEX_ADMIN_EMAILS);
  const email = user.email?.toLowerCase();

  return (
    adminIds.includes(user.id.toLowerCase()) ||
    Boolean(email && adminEmails.includes(email))
  );
}

function toAnimal(s: SpeciesRow, unlocked: boolean): Animal {
  return {
    id: s.id,
    dexNumber: s.dex_number,
    number: pad(s.dex_number),
    name: s.common_name,
    emoji: s.sprite ?? "?",
    silhouette: s.silhouette ?? "?",
    type: s.type,
    region: s.default_region ?? "Unknown",
    rarity: s.rarity as Animal["rarity"],
    description: s.description ?? "",
    unlocked,
    caughtLocation: "",
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

// All species ordered by dex_number, merged with the user's unlock state.
export async function getAllSpecies(): Promise<Animal[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = isAdminUser(user);

  const [{ data: rows }, unlockedIds] = await Promise.all([
    supabase.from("species").select("*").order("dex_number"),
    user && !admin
      ? getUnlockedIds(supabase, user.id)
      : Promise.resolve(new Set<string>()),
  ]);

  return (rows ?? []).map((s: SpeciesRow) =>
    toAnimal(s, admin || unlockedIds.has(s.id))
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
  const admin = isAdminUser(user);

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
  return toAnimal(row as SpeciesRow, admin || unlockedIds.has(row.id));
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

  if (isAdminUser(user)) {
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

// The most recently unlocked species for this user.
export async function getRecentSpecies(limit = 3): Promise<Animal[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  if (isAdminUser(user)) {
    const { data: rows } = await supabase
      .from("species")
      .select("*")
      .order("dex_number")
      .limit(limit);

    return (rows ?? []).map((s: SpeciesRow) => toAnimal(s, true));
  }

  const { data: entries } = await supabase
    .from("user_dex_entries")
    .select("species_id")
    .eq("user_id", user.id)
    .order("unlocked_at", { ascending: false })
    .limit(limit);

  if (!entries?.length) return [];

  const ids = entries.map((e: { species_id: string }) => e.species_id);
  const { data: rows } = await supabase
    .from("species")
    .select("*")
    .in("id", ids);

  return (rows ?? []).map((s: SpeciesRow) => toAnimal(s, true));
}

export async function getCurrentUserIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return isAdminUser(user);
}
