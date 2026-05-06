import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import {
  getRecentSpecies,
  getDiscoveredCount,
  getSpeciesTotal,
} from "@/lib/supabase/queries";

export default async function HomePage() {
  const [discovered, total, recentSpecies] = await Promise.all([
    getDiscoveredCount(),
    getSpeciesTotal(),
    getRecentSpecies(1),
  ]);

  const pct = total > 0 ? Math.round((discovered / total) * 100) : 0;
  const latestCatch = recentSpecies[0] ?? null;

  return (
    <div className="pb-28 min-h-screen bg-surface">
      {/* Header */}
      <header className="flex items-center justify-center w-full px-4 h-16 bg-surface border-b-[3px] border-on-background sticky top-0 z-40">
        <h1 className="font-display text-[32px] font-extrabold text-primary tracking-tighter">
          WildDex
        </h1>
      </header>

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

        {/* Latest Catch */}
        <section>
          <h2 className="font-display text-2xl font-bold text-on-background mb-2 px-2">
            Latest Catch
          </h2>
          {latestCatch ? (
            <Link href={`/animal/${latestCatch.dexNumber}`}>
              <div className="bg-secondary-container rounded-lg border-[3px] border-on-background hard-shadow overflow-hidden">
                <div className="bg-secondary p-6 flex items-center justify-center border-b-[3px] border-on-background">
                  <span className="text-8xl">{latestCatch.emoji}</span>
                </div>
                <div className="p-4 bg-surface flex justify-between items-center">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-on-background">
                      {latestCatch.name}
                    </h3>
                    <p className="font-sans text-sm text-on-surface-variant">
                      {latestCatch.region}
                    </p>
                  </div>
                  <div className="bg-tertiary-container border-[2px] border-on-background px-2 py-1 rounded-full">
                    <span className="font-display text-[12px] font-bold text-on-tertiary-container tracking-widest uppercase">
                      {latestCatch.rarity}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="bg-surface-container border-[3px] border-on-background rounded-lg p-8 hard-shadow flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-outline text-4xl">
                photo_camera
              </span>
              <p className="font-display font-bold text-on-surface-variant text-center">
                No catches yet — get out there!
              </p>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-4">
          <Link href="/scan">
            <button className="w-full bg-primary text-on-primary font-display font-bold text-2xl py-4 px-2 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active flex flex-col items-center justify-center gap-2 transition-all duration-75">
              <span className="material-symbols-outlined text-[32px]">
                photo_camera
              </span>
              SCAN
            </button>
          </Link>
          <Link href="/map">
            <button className="w-full bg-secondary text-on-secondary font-display font-bold text-2xl py-4 px-2 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active flex flex-col items-center justify-center gap-2 transition-all duration-75">
              <span className="material-symbols-outlined text-[32px]">map</span>
              VIEW MAP
            </button>
          </Link>
        </section>

        {/* Tip Box */}
        <section className="bg-surface-container border-[3px] border-on-background rounded-lg p-6 hard-shadow relative">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary rounded-full border-[3px] border-on-background flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary">info</span>
            </div>
            <p className="font-sans text-lg text-on-background leading-loose">
              Tip: Try scanning near bodies of water at dusk to find rare
              aquatic species!
            </p>
          </div>
          <div className="absolute bottom-2 right-2 animate-bounce">
            <span className="material-symbols-outlined text-on-background">
              arrow_drop_down
            </span>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
