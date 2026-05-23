import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import AppHeader from "@/components/AppHeader";
import FriendFeedRow from "@/components/FriendFeedRow";
import ActiveQuestCard from "@/components/ActiveQuestCard";
import {
  getActiveQuest,
  getCurrentUserIsAdmin,
  getRecentSpecies,
  getDiscoveredCount,
  getFriends,
  getFriendsFeed,
  getSpeciesTotal,
  getUserStats,
} from "@/lib/supabase/queries";
import { ALL_BADGES, computeEarnedBadges } from "@/lib/badges";

const TIPS = [
  "Try scanning near bodies of water at dusk to find rare aquatic species!",
  "Dense forest edges are hotspots — many species prefer the boundary between habitats.",
  "Early morning is prime time for bird sightings before midday heat drives them to shade.",
  "Check under logs and rocks for small reptiles and amphibians hiding from predators.",
  "Coastal tidal pools reveal different species depending on the tide — visit at low tide for the best finds.",
  "Mammals are most active at dawn and dusk. Stay quiet and downwind for a closer look.",
  "Fresh tracks in mud or snow are a clue that a species is nearby even if you can't see it.",
  "Flowering plants draw pollinators — insects and birds both cluster around blooms.",
  "Listen before you look. Many animals reveal themselves through calls before you spot them visually.",
  "Adding detailed notes to a sighting — weather, time of day, behavior — makes it more valuable over time.",
];

function getDailyTip() {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return TIPS[dayIndex % TIPS.length];
}

export default async function HomePage() {
  const [
    discovered,
    total,
    recentSpecies,
    userStats,
    isAdmin,
    friendsFeed,
    friends,
    activeQuest,
  ] = await Promise.all([
    getDiscoveredCount(),
    getSpeciesTotal(),
    getRecentSpecies(1),
    getUserStats(),
    getCurrentUserIsAdmin(),
    getFriendsFeed(15),
    getFriends(),
    getActiveQuest(),
  ]);

  const tip = getDailyTip();

  const pct = total > 0 ? Math.round((discovered / total) * 100) : 0;
  const latestSighted = recentSpecies[0] ?? null;
  const earnedBadges = computeEarnedBadges(userStats, isAdmin);
  const nextMilestone = [5, 10, 25, 50, 100].find((n) => discovered < n);
  const remainingToMilestone = nextMilestone ? nextMilestone - discovered : 0;
  const nextBadge = ALL_BADGES.find((badge) => !earnedBadges.has(badge.id));

  return (
    <div className="pb-28 min-h-screen bg-surface">
      <AppHeader />

      <main className="max-w-2xl mx-auto p-4 space-y-6 mt-2">
        {/* Dex Progress */}
        <section className="bg-surface-container-high p-6 rounded-lg border-[3px] border-on-background hard-shadow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-display text-2xl font-bold text-on-background">
              Dex Completion
            </h2>
            <span className="font-display text-2xl font-bold text-primary">
              {discovered}/{total}
            </span>
          </div>
          <div className="w-full h-7 border-[3px] border-on-background rounded-full overflow-hidden bg-surface-variant">
            <div
              className="h-full bg-primary relative"
              style={{ width: `${pct}%` }}
            >
              <div className="absolute inset-0 flex justify-evenly items-center">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-px h-full bg-black/20" />
                ))}
              </div>
            </div>
          </div>
          <p className="font-sans text-sm text-on-surface-variant mt-2 text-center">
            Gotta log &apos;em all! Keep exploring.
          </p>
        </section>

        {/* Field Status */}
        <section className="grid grid-cols-2 gap-3">
          <Link
            href="/profile/badges"
            className="rounded-lg border-[3px] border-on-background bg-tertiary-container p-3 hard-shadow hard-shadow-active transition-all"
          >
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-tertiary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                military_tech
              </span>
              <span className="font-display text-[10px] font-bold tracking-widest text-on-surface-variant">
                BADGES
              </span>
            </div>
            <p className="mt-2 font-display text-2xl font-extrabold leading-none text-on-background">
              {earnedBadges.size}
            </p>
            <p className="mt-1 min-h-[2.25em] font-sans text-[11px] font-bold leading-tight text-on-surface-variant">
              {nextBadge ? `Next: ${nextBadge.label}` : "Collection complete"}
            </p>
          </Link>

          <Link
            href="/scan"
            className="rounded-lg border-[3px] border-on-background bg-primary-container p-3 hard-shadow hard-shadow-active transition-all"
          >
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
              <span className="font-display text-[10px] font-bold tracking-widest text-on-surface-variant">
                STREAK
              </span>
            </div>
            <p className="mt-2 font-display text-2xl font-extrabold leading-none text-on-background">
              {userStats.streakDays}
            </p>
            <p className="mt-1 min-h-[2.25em] font-sans text-[11px] font-bold leading-tight text-on-surface-variant">
              {remainingToMilestone > 0
                ? `${remainingToMilestone} to ${nextMilestone}`
                : "Milestone maxed"}
            </p>
          </Link>
        </section>

        {/* Active Quest */}
        <ActiveQuestCard quest={activeQuest} />

        {/* Latest Sighting */}
        <section>
          <h2 className="font-display text-2xl font-bold text-on-background mb-2 px-2">
            Latest Sighting
          </h2>
          {latestSighted ? (
            <Link href={`/animal/${latestSighted.dexNumber}`}>
              <div className="bg-secondary-container rounded-lg border-[3px] border-on-background hard-shadow overflow-hidden">
                <div className="bg-secondary p-6 flex items-center justify-center border-b-[3px] border-on-background">
                  <span className="text-8xl">{latestSighted.emoji}</span>
                </div>
                <div className="p-4 bg-surface flex justify-between items-center">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-on-background">
                      {latestSighted.name}
                    </h3>
                    <p className="font-sans text-sm text-on-surface-variant">
                      {latestSighted.sightingLocation || latestSighted.region}
                    </p>
                  </div>
                  <div className="bg-tertiary-container border-[2px] border-on-background px-2 py-1 rounded-full">
                    <span className="font-display text-[12px] font-bold text-on-tertiary-container tracking-widest uppercase">
                      {latestSighted.rarity}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="bg-surface-container border-[3px] border-on-background rounded-lg p-6 hard-shadow flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-outline text-4xl">
                photo_camera
              </span>
              <p className="font-display font-bold text-on-surface-variant text-center">
                No sightings yet — get out there!
              </p>
              <Link href="/scan" className="w-full">
                <button className="w-full bg-primary text-on-primary font-display font-bold text-base py-2 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active transition-all">
                  SCAN YOUR FIRST →
                </button>
              </Link>
            </div>
          )}
        </section>

        {/* Friends' Sightings */}
        <FriendFeedRow items={friendsFeed} friendCount={friends.length} />

        {/* Quick Actions */}
        <section className="flex flex-col gap-3">
          <Link href="/scan">
            <button className="w-full bg-primary text-on-primary font-display font-bold text-2xl py-5 px-2 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active flex items-center justify-center gap-3 transition-all duration-75">
              <span className="material-symbols-outlined text-[32px]">photo_camera</span>
              SCAN
            </button>
          </Link>
          <Link href="/map">
            <button className="w-full bg-secondary text-on-secondary font-display font-bold text-lg py-3 px-2 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active flex items-center justify-center gap-2 transition-all duration-75">
              <span className="material-symbols-outlined text-[24px]">map</span>
              VIEW MAP
            </button>
          </Link>
        </section>

        {/* Tip Box */}
        <section className="bg-surface-container border-[3px] border-on-background rounded-lg p-6 hard-shadow">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary rounded-full border-[3px] border-on-background flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary">lightbulb</span>
            </div>
            <div>
              <p className="font-display text-[10px] font-bold text-on-surface-variant tracking-widest mb-1">FIELD TIP</p>
              <p className="font-sans text-base text-on-background leading-relaxed">
                {tip}
              </p>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
