import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import BackButton from "@/app/animal/[id]/BackButton";
import { getPublicProfile } from "@/lib/supabase/queries";
import AddFriendButton from "./AddFriendButton";
import ShareProfileButton from "@/components/ShareProfileButton";

interface RouteParams {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) return { title: "Profile not found" };
  const display = profile.display_name?.trim() || profile.username;
  return {
    title: `${display} · WildDex`,
    description: `${display}'s WildDex — ${profile.visibleSightingsCount} species logged across ${profile.continentsCount} continent${
      profile.continentsCount === 1 ? "" : "s"
    }.`,
  };
}

function formatJoined(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en", { month: "long", year: "numeric" });
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
}

export default async function PublicProfilePage({ params }: RouteParams) {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) notFound();

  const display = profile.display_name?.trim() || profile.username;
  const joined = formatJoined(profile.created_at);
  const isFriendOrSelf =
    profile.relation === "friends" || profile.relation === "self";

  return (
    <div className="min-h-screen bg-surface pb-28">
      <AppHeader left={<BackButton />} />

      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-4">
        {/* Identity card */}
        <section className="flex items-center gap-3 rounded-lg border-[3px] border-on-background bg-primary-container p-4 hard-shadow">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border-[3px] border-on-background bg-primary flex items-center justify-center text-4xl hard-shadow-sm">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={display}
                className="w-full h-full object-cover"
              />
            ) : (
              "🧭"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-2xl font-extrabold text-on-background">
              {display}
            </h1>
            <p className="truncate font-sans text-sm text-on-surface-variant">
              @{profile.username}
            </p>
            <span className="mt-1 inline-block max-w-full truncate rounded-full border-[2px] border-on-background bg-primary px-2 py-0.5 font-display text-[10px] font-bold tracking-widest text-on-primary">
              {profile.explorer_title ?? "EXPLORER"}
            </span>
          </div>
          <ShareProfileButton
            username={profile.username}
            displayName={display}
            variant="icon"
          />
        </section>

        {/* Friendship action */}
        <AddFriendButton
          targetUserId={profile.id}
          initialState={profile.relation}
        />

        {joined && (
          <p className="font-sans text-xs text-on-surface-variant text-center">
            Joined {joined}
          </p>
        )}

        {/* Stats */}
        <section className="grid grid-cols-3 gap-2">
          <StatCard
            label="LOGGED"
            value={profile.visibleSightingsCount}
            icon="grid_view"
            color="bg-primary-container"
            iconColor="text-primary"
          />
          <StatCard
            label="RARE FINDS"
            value={profile.rareCount}
            icon="star"
            color="bg-tertiary-container"
            iconColor="text-tertiary"
          />
          <StatCard
            label="REGIONS"
            value={profile.continentsCount}
            icon="public"
            color="bg-secondary-container"
            iconColor="text-secondary"
          />
        </section>

        {/* Recent public sightings */}
        <section className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow flex flex-col gap-3">
          <h2 className="font-display text-[12px] font-bold text-on-surface-variant tracking-widest">
            RECENT SIGHTINGS
          </h2>

          {profile.recentSightings.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <span
                className="material-symbols-outlined text-outline text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isFriendOrSelf ? "photo_camera" : "lock"}
              </span>
              <p className="font-display font-bold text-on-surface-variant">
                {isFriendOrSelf
                  ? "No sightings yet."
                  : "Add as a friend to see sightings."}
              </p>
              {!isFriendOrSelf && profile.relation === "none" && (
                <p className="font-sans text-xs text-on-surface-variant">
                  Public sightings are only visible to accepted friends.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {profile.recentSightings.map((s) => (
                <Link
                  key={s.sighting_id}
                  href={`/animal/${s.dex_number}`}
                  className="bg-surface border-[3px] border-on-background rounded-lg p-1 hard-shadow-sm flex flex-col items-center"
                >
                  <div className="w-full aspect-square border-[2px] border-on-background rounded bg-secondary-container mb-1 overflow-hidden flex items-center justify-center relative">
                    {s.photoDisplayUrl ? (
                      <div
                        role="img"
                        aria-label={`${s.species_name} sighting`}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url("${s.photoDisplayUrl}")` }}
                      />
                    ) : (
                      <span className="text-3xl">{s.species_sprite}</span>
                    )}
                  </div>
                  <span className="font-display text-[10px] font-bold text-center text-on-background tracking-wide truncate w-full">
                    {s.species_name}
                  </span>
                  <span className="font-sans text-[9px] text-on-surface-variant truncate w-full text-center">
                    {timeAgo(s.created_at)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
  iconColor: string;
}

function StatCard({ label, value, icon, color, iconColor }: StatCardProps) {
  return (
    <div
      className={`${color} min-w-0 rounded-lg border-[3px] border-on-background p-2 hard-shadow flex flex-col items-center justify-center text-center`}
    >
      <span
        className={`material-symbols-outlined ${iconColor} mb-1`}
        style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      <span className="font-display text-xl font-bold text-on-background">
        {value}
      </span>
      <span className="font-display text-[10px] font-bold text-on-surface-variant tracking-widest">
        {label}
      </span>
    </div>
  );
}
