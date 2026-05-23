import type { Metadata } from "next";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import AppHeader from "@/components/AppHeader";

export const metadata: Metadata = { title: "Profile" };
import Badge from "@/components/Badge";
import MapCanvas from "@/app/map/MapCanvas";
import ThemeToggle from "@/components/ThemeToggle";
import ShareProfileButton from "@/components/ShareProfileButton";
import { createClient } from "@/lib/supabase/server";
import {
  getCurrentUserIsAdmin,
  getDiscoveredCount,
  getMapSightings,
  getProfile,
  getRareFindsCount,
  getRecentSpecies,
  getRegionsCount,
  getUserStats,
  type MapSighting,
} from "@/lib/supabase/queries";
import { logout } from "@/app/actions/auth";
import { ALL_BADGES, computeEarnedBadges } from "@/lib/badges";

function levelFromCount(n: number): number {
  if (n >= 50) return 4;
  if (n >= 25) return 3;
  if (n >= 10) return 2;
  return 1;
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [discovered, recentSightings, isAdmin, mapSightings, regionsCount, rareFinds, userStats, profile] =
    await Promise.all([
      getDiscoveredCount(),
      getRecentSpecies(3),
      getCurrentUserIsAdmin(),
      getMapSightings(),
      getRegionsCount(),
      getRareFindsCount(),
      getUserStats(),
      getProfile(),
    ]);

  const profileMarkers = mapSightings.filter(
    (s): s is MapSighting & { latitude: number; longitude: number } =>
      s.latitude != null && s.longitude != null
  );

  const username =
    profile?.username ??
    (user?.user_metadata?.username as string | undefined) ??
    "Explorer";
  const displayName = profile?.display_name ?? username;
  const avatarUrl = profile?.avatar_url ?? null;
  const explorerTitle = profile?.explorer_title ?? null;
  const level = levelFromCount(discovered);

  const earnedIds = computeEarnedBadges(userStats, isAdmin);
  const rawFeaturedIds: string[] =
    (user?.user_metadata?.featured_badge_ids as string[] | undefined) ?? [];
  const featuredIds = rawFeaturedIds.length > 0
    ? rawFeaturedIds.filter((id) => earnedIds.has(id))
    : [...earnedIds].slice(0, 4);
  const featuredBadges = featuredIds.map((id) => ALL_BADGES.find((b) => b.id === id)!).filter(Boolean);

  const stats = [
    { icon: "grid_view", value: String(discovered), label: "Logged", color: "bg-primary-container", href: "/dex" },
    { icon: "public", value: String(regionsCount), label: "Regions", color: "bg-secondary-container", iconColor: "text-secondary", href: "/regions" },
    { icon: "star", value: String(rareFinds), label: "Rare Finds", color: "bg-tertiary-container", iconColor: "text-tertiary", href: "/dex" },
    { icon: "local_fire_department", value: String(userStats.streakDays), label: "Day Streak", color: "bg-surface", iconColor: "text-error", href: "/profile/badges" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface pb-32">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-4">
        {/* Avatar */}
        <section className="flex min-w-0 items-center gap-3 rounded-lg border-[3px] border-on-background bg-primary-container p-3 hard-shadow sm:gap-4 sm:p-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border-[3px] border-on-background bg-primary flex items-center justify-center text-3xl hard-shadow sm:h-20 sm:w-20 sm:text-4xl">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              "🧭"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-xl font-extrabold text-on-background sm:text-2xl">
              {displayName}
            </h2>
            {profile?.display_name && (
              <p className="font-sans text-xs text-on-surface-variant">@{username}</p>
            )}
            <span className="mt-1 inline-block max-w-full truncate rounded-full border-[2px] border-on-background bg-primary px-2 py-0.5 font-display text-[10px] font-bold tracking-widest text-on-primary sm:text-[11px]">
              {isAdmin ? "ADMIN DEX" : explorerTitle ?? `EXPLORER LVL ${level}`}
            </span>
          </div>
          <div className="shrink-0 flex flex-col gap-1.5">
            <Link
              href="/profile/edit"
              className="w-9 h-9 bg-surface border-[2px] border-on-background rounded-lg flex items-center justify-center hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
              title="Edit profile"
            >
              <span className="material-symbols-outlined text-on-background" style={{ fontSize: "18px" }}>
                edit
              </span>
            </Link>
            {profile?.username && (
              <Link
                href={`/u/${profile.username}`}
                className="w-9 h-9 bg-surface border-[2px] border-on-background rounded-lg flex items-center justify-center hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
                title="View public profile"
              >
                <span className="material-symbols-outlined text-on-background" style={{ fontSize: "18px" }}>
                  visibility
                </span>
              </Link>
            )}
          </div>
        </section>

        {profile?.username && (
          <ShareProfileButton
            username={profile.username}
            displayName={displayName}
          />
        )}

        {/* Stats */}
        <section className="grid min-w-0 grid-cols-2 gap-2">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className={`${stat.color} min-w-0 rounded-lg border-[3px] border-on-background p-2 hard-shadow hard-shadow-active flex flex-col items-center justify-center text-center transition-all`}
            >
              <span
                className={`material-symbols-outlined ${stat.iconColor ?? "text-primary"} mb-1`}
                style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}
              >
                {stat.icon}
              </span>
              <span className="font-display text-2xl font-bold text-on-background">
                {stat.value}
              </span>
              <span className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest">
                {stat.label.toUpperCase()}
              </span>
            </Link>
          ))}
        </section>

        {/* Map preview */}
        <section className="bg-surface border-[3px] border-on-background rounded-lg p-2 hard-shadow">
          <h3 className="font-display font-bold text-on-background mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">map</span>
            Discovery Map
          </h3>
          <div className="relative w-full h-64 border-[2px] border-on-background rounded overflow-hidden mb-2">
            <MapCanvas markers={profileMarkers} compact />
          </div>
          <Link href="/map">
            <button className="w-full bg-primary text-on-primary font-display font-bold text-base py-2 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active transition-all">
              View Full Map
            </button>
          </Link>
        </section>

        {/* Recent sightings */}
        {recentSightings.length > 0 && (
          <section>
            <h3 className="font-display font-bold text-on-background mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined">photo_camera</span>
              Recent Sightings
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {recentSightings.map((animal) => (
                <Link key={animal.id} href={`/animal/${animal.dexNumber}`}>
                  <div className="bg-surface border-[3px] border-on-background rounded-lg p-1 hard-shadow flex flex-col items-center hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer">
                    <div className="w-full aspect-square border-[2px] border-on-background rounded bg-secondary-container mb-1 overflow-hidden flex items-center justify-center text-3xl">
                      {animal.emoji}
                    </div>
                    <span className="font-display text-[10px] font-bold text-center text-on-background tracking-wide">
                      {animal.name}
                    </span>
                    {animal.sightingLocation && (
                      <span className="w-full truncate font-sans text-[10px] text-on-surface-variant text-center leading-tight mt-0.5">
                        {animal.sightingLocation}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Badges */}
        <section className="bg-surface border-[3px] border-on-background rounded-lg p-3 hard-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined">military_tech</span>
              Badges
            </h3>
            <Link
              href="/profile/badges"
              className="font-display text-[10px] font-bold text-primary tracking-widest flex items-center gap-1"
            >
              {[...earnedIds].length} EARNED
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>chevron_right</span>
            </Link>
          </div>
          <div className="flex flex-wrap gap-4">
            {featuredBadges.length > 0
              ? featuredBadges.map((badge) => (
                  <Badge
                    key={badge.id}
                    icon={badge.icon}
                    label={badge.label}
                    color={badge.color}
                  />
                ))
              : (
                <p className="font-sans text-sm text-on-surface-variant py-2">
                  Log sightings to earn badges, then{" "}
                  <Link href="/profile/badges" className="text-primary font-bold underline">
                    manage your collection
                  </Link>.
                </p>
              )
            }
            {featuredBadges.length > 0 && featuredBadges.length < 4 && (
              <Link href="/profile/badges" className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-14 h-14 rounded-full border-[3px] border-dashed border-on-background flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "20px" }}>add</span>
                </div>
                <span className="font-display text-[9px] font-bold text-on-surface-variant tracking-wide">
                  ADD
                </span>
              </Link>
            )}
          </div>
        </section>

        {/* Settings */}
        <section className="bg-surface-container border-[3px] border-on-background rounded-lg hard-shadow overflow-hidden">
          <ThemeToggle />
          <Link
            href="/quests"
            className="w-full flex items-center gap-3 px-4 py-3 text-on-background hover:bg-secondary-container transition-colors border-b-[3px] border-on-background"
          >
            <span className="material-symbols-outlined text-on-surface-variant">flag</span>
            <span className="font-sans text-sm font-medium flex-1 text-left">Quests</span>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </Link>
          <Link
            href="/friends"
            className="w-full flex items-center gap-3 px-4 py-3 text-on-background hover:bg-secondary-container transition-colors border-b-[3px] border-on-background"
          >
            <span className="material-symbols-outlined text-on-surface-variant">group</span>
            <span className="font-sans text-sm font-medium flex-1 text-left">Friends</span>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </Link>
          <Link
            href="/notifications"
            className="w-full flex items-center gap-3 px-4 py-3 text-on-background hover:bg-secondary-container transition-colors border-b-[3px] border-on-background"
          >
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            <span className="font-sans text-sm font-medium flex-1 text-left">Notifications</span>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </Link>
          <Link
            href="/privacy"
            className="w-full flex items-center gap-3 px-4 py-3 text-on-background hover:bg-secondary-container transition-colors border-b-[3px] border-on-background"
          >
            <span className="material-symbols-outlined text-on-surface-variant">privacy_tip</span>
            <span className="font-sans text-sm font-medium flex-1 text-left">Privacy</span>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </Link>
          <a
            href="mailto:feedback@wilddex.app"
            className="w-full flex items-center gap-3 px-4 py-3 text-on-background hover:bg-secondary-container transition-colors border-b-[3px] border-on-background"
          >
            <span className="material-symbols-outlined text-on-surface-variant">help</span>
            <span className="font-sans text-sm font-medium flex-1 text-left">Help & Feedback</span>
            <span className="material-symbols-outlined text-on-surface-variant">open_in_new</span>
          </a>
          {/* Logout — Server Action via form */}
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-sans text-sm font-medium flex-1 text-left">
                Sign Out
              </span>
              <span className="material-symbols-outlined text-on-surface-variant">
                chevron_right
              </span>
            </button>
          </form>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
