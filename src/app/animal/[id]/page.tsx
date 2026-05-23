import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { rarityColors, rarityLabels } from "@/lib/animals";
import {
  getFriendsWithSighting,
  getLatestSightingForSpecies,
  getQuestsByIds,
  getSightingsForSpecies,
  getSpeciesById,
} from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import SightingActions from "./SightingActions";
import BackButton from "./BackButton";
import AppHeader from "@/components/AppHeader";
import { ALL_BADGES } from "@/lib/badges";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const animal = await getSpeciesById(id);
  if (!animal || !animal.unlocked) return { title: "???" };
  return { title: animal.name };
}

function formatSightingDate(value: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function AnimalDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ logged?: string; quest?: string }>;
}) {
  const { id } = await params;
  const { logged, quest: questParam } = await searchParams;
  const animal = await getSpeciesById(id);

  if (!animal) {
    notFound();
  }

  const completedQuestIds = (questParam ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const completedQuests =
    completedQuestIds.length > 0
      ? await getQuestsByIds(completedQuestIds)
      : [];

  const isLocked = !animal.unlocked;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [latestSighting, allSightings, friendsWithSighting] = await Promise.all([
    !isLocked && user ? getLatestSightingForSpecies(user.id, animal.id) : null,
    !isLocked && user ? getSightingsForSpecies(user.id, animal.id) : [],
    user ? getFriendsWithSighting(animal.id) : [],
  ]);
  const mapUrl =
    latestSighting?.latitude != null
      ? `/map?sighting=${latestSighting.id}`
      : "/map";

  return (
    <div className="pb-28 min-h-screen bg-surface">
      {/* Header */}
      <AppHeader left={<BackButton />} />

      <main className="p-4 max-w-2xl mx-auto flex flex-col gap-4 mt-2">
        {logged === "1" && (
          <section className="bg-primary-container border-[3px] border-on-background rounded-lg p-3 hard-shadow flex items-center gap-3">
            <span
              className="material-symbols-outlined text-primary text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <div>
              <h2 className="font-display text-lg font-extrabold text-primary">
                Sighting Logged
              </h2>
              <p className="font-sans text-sm text-on-primary-container">
                This species is now unlocked in your WildDex.
              </p>
            </div>
          </section>
        )}

        {completedQuests.length > 0 && (
          <section className="bg-tertiary-container border-[3px] border-on-background rounded-lg p-3 hard-shadow flex flex-col gap-2">
            {completedQuests.map((q) => {
              const reward = q.reward_badge_id
                ? ALL_BADGES.find((b) => b.id === q.reward_badge_id)
                : null;
              return (
                <div key={q.id} className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-tertiary text-3xl shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    flag
                  </span>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display text-base font-extrabold text-tertiary">
                      Quest Complete: {q.name}
                    </h2>
                    {reward ? (
                      <p className="font-sans text-sm text-on-tertiary-container">
                        Badge earned:{" "}
                        <span className="font-bold">{reward.label}</span>
                      </p>
                    ) : (
                      <p className="font-sans text-sm text-on-tertiary-container">
                        Nice work — new quests are now in range.
                      </p>
                    )}
                  </div>
                  <Link
                    href="/quests"
                    className="material-symbols-outlined text-tertiary shrink-0"
                  >
                    chevron_right
                  </Link>
                </div>
              );
            })}
          </section>
        )}

        {/* Sprite / image area */}
        <section
          className={`${rarityColors[animal.rarity]} border-[3px] border-on-background rounded-xl p-4 flex flex-col items-center justify-center hard-shadow relative overflow-hidden aspect-square`}
        >
          <div className="absolute top-3 right-3">
            <span className="bg-on-background text-surface font-display text-[12px] font-bold px-2 py-1 rounded-full tracking-widest">
              #{animal.number}
            </span>
          </div>
          {isLocked && (
            <div className="absolute bottom-3 left-3 right-3 flex flex-col items-center gap-1 pointer-events-none">
              <span className="font-display text-[10px] font-bold text-on-background/50 tracking-widest uppercase">
                Found in
              </span>
              <span className="font-display text-sm font-bold text-on-background/70 tracking-wide">
                {animal.continent} · {animal.region}
              </span>
            </div>
          )}
          {latestSighting?.photoDisplayUrl ? (
            <div className="w-full flex-1 min-h-0 bg-surface border-[3px] border-on-background rounded-lg overflow-hidden">
              <div
                role="img"
                aria-label={`Latest sighting photo of ${animal.name}`}
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url("${latestSighting.photoDisplayUrl}")`,
                }}
              />
            </div>
          ) : (
            <span
              className="text-9xl mb-4 select-none"
              style={isLocked ? { filter: "grayscale(1) opacity(0.2) blur(2px)" } : undefined}
            >
              {animal.emoji}
            </span>
          )}
          <h1 className="font-display text-[32px] font-extrabold text-on-background tracking-tighter">
            {isLocked ? "???" : animal.name}
          </h1>
        </section>

        {allSightings.length > 0 && (
          <section className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow">
            <h2 className="font-display text-[12px] font-bold text-on-surface-variant tracking-widest mb-3">
              YOUR SIGHTINGS ({allSightings.length})
            </h2>
            <div className="flex flex-col gap-4">
              {allSightings.map((sighting, index) => {
                const date = formatSightingDate(sighting.created_at);
                const loc = [sighting.location_name, sighting.region, sighting.country]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <div
                    key={sighting.id}
                    className={index > 0 ? "border-t-[2px] border-on-background pt-4" : ""}
                  >
                    <div className="flex flex-col gap-0.5">
                      {loc && (
                        <p className="font-sans text-sm font-bold text-on-background">{loc}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        {date && (
                          <p className="font-display text-[11px] font-bold text-primary tracking-widest">
                            {date.toUpperCase()}
                          </p>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border-[2px] border-on-background font-display text-[10px] font-bold tracking-widest ${
                            sighting.gps_verified
                              ? "bg-primary-container text-on-primary-container"
                              : "bg-surface-container text-on-surface-variant"
                          }`}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "12px", fontVariationSettings: "'FILL' 1" }}
                          >
                            {sighting.gps_verified ? "verified" : "info"}
                          </span>
                          {sighting.gps_verified ? "VERIFIED" : "UNVERIFIED"}
                        </span>
                      </div>
                      {sighting.notes && (
                        <p className="font-sans text-sm text-on-surface-variant leading-relaxed mt-1 line-clamp-3">
                          {sighting.notes}
                        </p>
                      )}
                    </div>
                    <SightingActions
                      sightingId={sighting.id}
                      dexNumber={animal.dexNumber}
                      initial={{
                        locationName: sighting.location_name ?? "",
                        region: sighting.region ?? "",
                        country: sighting.country ?? "",
                        notes: sighting.notes ?? "",
                        isPublic: sighting.is_public ?? true,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {friendsWithSighting.length > 0 && (
          <section className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow flex items-center gap-3">
            <div className="flex -space-x-2 shrink-0">
              {friendsWithSighting.slice(0, 4).map((f) => (
                <Link
                  key={f.id}
                  href={`/u/${f.username}`}
                  className="h-9 w-9 overflow-hidden rounded-full border-[3px] border-on-background bg-primary flex items-center justify-center text-sm"
                  title={f.display_name?.trim() || f.username}
                >
                  {f.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={f.avatar_url}
                      alt={f.display_name ?? f.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "🧭"
                  )}
                </Link>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[12px] font-bold text-on-surface-variant tracking-widest">
                LOGGED BY {friendsWithSighting.length} FRIEND
                {friendsWithSighting.length === 1 ? "" : "S"}
              </p>
              <p className="font-sans text-sm text-on-background truncate">
                {friendsWithSighting
                  .slice(0, 3)
                  .map((f) => f.display_name?.trim() || `@${f.username}`)
                  .join(", ")}
                {friendsWithSighting.length > 3 &&
                  ` +${friendsWithSighting.length - 3} more`}
              </p>
            </div>
          </section>
        )}

        {/* Stats grid */}
        <section className="grid grid-cols-2 gap-2">
          <div className="bg-surface-container border-[3px] border-on-background rounded-lg p-3 hard-shadow flex flex-col items-center">
            <span className="font-display text-[12px] font-bold text-on-surface-variant mb-1 tracking-widest">
              TYPE
            </span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-secondary">pets</span>
              <span className="font-sans text-sm font-bold text-on-background capitalize">
                {isLocked ? "Unknown" : animal.type}
              </span>
            </div>
          </div>
          <div className="bg-surface-container border-[3px] border-on-background rounded-lg p-3 hard-shadow flex flex-col items-center">
            <span className="font-display text-[12px] font-bold text-on-surface-variant mb-1 tracking-widest">
              REGION
            </span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary">forest</span>
              <span className="font-sans text-sm font-bold text-on-background">
                {isLocked ? animal.continent ?? "Unknown" : animal.region}
              </span>
            </div>
          </div>
          <div className="bg-surface-container border-[3px] border-on-background rounded-lg p-3 hard-shadow flex flex-col items-center">
            <span className="font-display text-[12px] font-bold text-on-surface-variant mb-1 tracking-widest">
              RARITY
            </span>
            <span className="font-display text-[12px] font-bold text-on-background tracking-widest">
              {isLocked ? "LOCKED" : rarityLabels[animal.rarity]}
            </span>
          </div>
          <div className="bg-surface-container border-[3px] border-on-background rounded-lg p-3 hard-shadow flex flex-col items-center">
            <span className="font-display text-[12px] font-bold text-on-surface-variant mb-1 tracking-widest">
              LOCATION
            </span>
            <span className="font-sans text-sm font-bold text-on-background text-center">
              {isLocked ? "Not logged" : animal.sightingLocation || "—"}
            </span>
          </div>
        </section>

        {/* Dex entry */}
        <section className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow relative">
          <h2 className="font-display text-[12px] font-bold text-on-surface-variant absolute -top-3 left-4 bg-surface-container px-2 border-x-[3px] border-t-[3px] border-on-background rounded-t tracking-widest">
            DEX ENTRY
          </h2>
          <p className="font-sans text-base text-on-background leading-relaxed mt-1">
            {isLocked
              ? "This species is still a mystery. Log a confirmed sighting to unlock the full WildDex entry."
              : animal.description}
          </p>
        </section>

        {/* CTA */}
        {isLocked ? (
          <Link href="/scan">
            <button className="w-full bg-primary text-on-primary font-display font-bold text-2xl border-[3px] border-on-background rounded-lg py-4 hard-shadow hard-shadow-active flex items-center justify-center gap-2 transition-all mt-2">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                photo_camera
              </span>
              LOG A SIGHTING
            </button>
          </Link>
        ) : (
          <Link href={mapUrl}>
            <button className="w-full bg-secondary text-on-secondary font-display font-bold text-2xl border-[3px] border-on-background rounded-lg py-4 hard-shadow hard-shadow-active flex items-center justify-center gap-2 transition-all mt-2">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                map
              </span>
              VIEW ON MAP
            </button>
          </Link>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
