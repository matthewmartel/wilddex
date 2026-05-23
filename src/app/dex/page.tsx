import type { Metadata } from "next";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import AppHeader from "@/components/AppHeader";

export const metadata: Metadata = { title: "Dex" };
import DexCard from "@/components/DexCard";
import ProgressBar from "@/components/ProgressBar";
import {
  getAllSpecies,
} from "@/lib/supabase/queries";
import type { Animal } from "@/lib/animals";

const RARITY_OPTIONS = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];

const CONTINENT_ORDER = [
  "North America",
  "South America",
  "Europe",
  "Africa",
  "Asia",
  "Oceania",
  "Antarctica",
];

export default async function DexPage({
  searchParams,
}: {
  searchParams: Promise<{
    continent?: string | string[];
    view?: string | string[];
    q?: string | string[];
    type?: string | string[];
    rarity?: string | string[];
  }>;
}) {
  const {
    continent: continentParam,
    view: viewParam,
    q: qParam,
    type: typeParam,
    rarity: rarityParam,
  } = await searchParams;
  const continent = Array.isArray(continentParam) ? continentParam[0] : continentParam;
  const view = Array.isArray(viewParam) ? viewParam[0] : viewParam;
  const query = (Array.isArray(qParam) ? qParam[0] : qParam)?.trim() ?? "";
  const selectedType = Array.isArray(typeParam) ? typeParam[0] : typeParam;
  const selectedRarity = Array.isArray(rarityParam) ? rarityParam[0] : rarityParam;
  const byRegion = view === "region" && !continent;

  const [animals] = await Promise.all([
    getAllSpecies(continent ? { continent } : undefined),
  ]);

  const typeOptions = [...new Set(animals.map((a) => a.type).filter(Boolean))].sort();
  const visibleAnimals = animals.filter((animal) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      animal.name.toLowerCase().includes(q) ||
      animal.type.toLowerCase().includes(q) ||
      animal.region.toLowerCase().includes(q) ||
      animal.continent.toLowerCase().includes(q);
    const matchesType = !selectedType || animal.type === selectedType;
    const matchesRarity = !selectedRarity || animal.rarity === selectedRarity;

    return matchesQuery && matchesType && matchesRarity;
  });
  const filteredUnlocked = visibleAnimals.filter((a) => a.unlocked).length;
  const filteredTotal = visibleAnimals.length;
  const pct = filteredTotal > 0 ? Math.round((filteredUnlocked / filteredTotal) * 100) : 0;
  const hasFilters = Boolean(query || selectedType || selectedRarity);
  const activeFilterCount = [selectedType, selectedRarity].filter(Boolean).length;

  function filterHref(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    if (continent) params.set("continent", continent);
    if (view) params.set("view", view);
    if (query) params.set("q", query);
    if (selectedType) params.set("type", selectedType);
    if (selectedRarity) params.set("rarity", selectedRarity);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    const qs = params.toString();
    return qs ? `/dex?${qs}` : "/dex";
  }

  const grouped: { name: string; animals: Animal[] }[] = byRegion
    ? CONTINENT_ORDER.map((name) => ({
        name,
        animals: visibleAnimals.filter((a) => a.continent === name),
      })).filter((g) => g.animals.length > 0)
    : [];

  return (
    <div className="pb-28 min-h-screen bg-surface">
      <AppHeader />

      <main className="max-w-md mx-auto px-4">
        {continent && (
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold text-on-background">{continent}</h2>
            <Link
              href="/dex"
              className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest border-[3px] border-on-background px-2 py-1 rounded-lg bg-surface hard-shadow-sm hard-shadow-active transition-all"
            >
              ALL REGIONS ×
            </Link>
          </div>
        )}

        <div className="bg-surface-container border-[3px] border-on-background rounded-lg shadow-[4px_4px_0_0_#1b1c1c] p-3 mb-4 flex items-center gap-4">
          <div className="flex flex-col shrink-0">
            <span className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest">
              {continent ? "FOUND" : "DISCOVERED"}
            </span>
            <span className="font-display text-2xl font-bold text-primary leading-tight">
              {filteredUnlocked}
              <span className="text-on-surface-variant text-lg">/{filteredTotal}</span>
            </span>
          </div>
          <ProgressBar value={pct} height="h-5" className="flex-1" />
        </div>

        {!continent && (
          <div className="flex gap-2 mb-4">
            <Link
              href="/dex"
              scroll={false}
              className={`flex-1 text-center font-display text-[11px] font-bold tracking-widest py-2 rounded-lg border-[3px] border-on-background transition-all ${
                !byRegion
                  ? "bg-primary text-on-primary shadow-none translate-x-[1px] translate-y-[1px]"
                  : "bg-surface text-on-surface-variant hard-shadow-sm"
              }`}
            >
              DEX NUMBER
            </Link>
            <Link
              href="/dex?view=region"
              scroll={false}
              className={`flex-1 text-center font-display text-[11px] font-bold tracking-widest py-2 rounded-lg border-[3px] border-on-background transition-all ${
                byRegion
                  ? "bg-primary text-on-primary shadow-none translate-x-[1px] translate-y-[1px]"
                  : "bg-surface text-on-surface-variant hard-shadow-sm"
              }`}
            >
              BY REGION
            </Link>
          </div>
        )}

        <section className="mb-4 rounded-lg border-[3px] border-on-background bg-surface-container p-3 hard-shadow-sm">
          <form action="/dex" className="flex gap-2">
            {continent && <input type="hidden" name="continent" value={continent} />}
            {view && <input type="hidden" name="view" value={view} />}
            {selectedType && <input type="hidden" name="type" value={selectedType} />}
            {selectedRarity && <input type="hidden" name="rarity" value={selectedRarity} />}
            <label className="sr-only" htmlFor="dex-search">
              Search dex
            </label>
            <input
              id="dex-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search species"
              className="min-w-0 flex-1 rounded-lg border-[3px] border-on-background bg-surface px-3 py-2 font-sans text-sm font-bold text-on-background outline-none placeholder:text-on-surface-variant"
            />
            <button
              type="submit"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-[3px] border-on-background bg-primary text-on-primary hard-shadow-sm hard-shadow-active transition-all"
              aria-label="Search"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>
          </form>

          <details className="mt-3 group" open={activeFilterCount > 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border-[3px] border-on-background bg-surface px-3 py-2 font-display text-[11px] font-bold tracking-widest text-on-surface-variant hard-shadow-sm">
              <span>
                FILTERS
                {activeFilterCount > 0 && (
                  <span className="ml-2 text-primary">
                    {activeFilterCount}
                  </span>
                )}
              </span>
              <span className="material-symbols-outlined text-[20px] transition-transform group-open:rotate-180">
                expand_more
              </span>
            </summary>

            <div className="mt-3">
              <p className="mb-2 font-display text-[10px] font-bold tracking-widest text-on-surface-variant">
                TYPE
              </p>
              <div className="flex flex-wrap gap-2">
            <Link
              href={filterHref({ type: undefined })}
              className={`rounded-full border-[2px] border-on-background px-3 py-1.5 font-display text-[10px] font-bold tracking-widest ${
                !selectedType ? "bg-primary text-on-primary" : "bg-surface text-on-surface-variant"
              }`}
            >
              ALL
            </Link>
            {typeOptions.map((type) => (
              <Link
                key={type}
                href={filterHref({ type })}
                className={`rounded-full border-[2px] border-on-background px-3 py-1.5 font-display text-[10px] font-bold tracking-widest ${
                  selectedType === type
                    ? "bg-primary text-on-primary"
                    : "bg-surface text-on-surface-variant"
                }`}
              >
                {type.toUpperCase()}
              </Link>
            ))}
              </div>
            </div>

            <div className="mt-3">
              <p className="mb-2 font-display text-[10px] font-bold tracking-widest text-on-surface-variant">
                RARITY
              </p>
              <div className="flex flex-wrap gap-2">
            <Link
              href={filterHref({ rarity: undefined })}
              className={`rounded-full border-[2px] border-on-background px-3 py-1.5 font-display text-[10px] font-bold tracking-widest ${
                !selectedRarity ? "bg-secondary text-on-secondary" : "bg-surface text-on-surface-variant"
              }`}
            >
              ALL
            </Link>
            {RARITY_OPTIONS.map((rarity) => (
              <Link
                key={rarity}
                href={filterHref({ rarity })}
                className={`rounded-full border-[2px] border-on-background px-3 py-1.5 font-display text-[10px] font-bold tracking-widest ${
                  selectedRarity === rarity
                    ? "bg-secondary text-on-secondary"
                    : "bg-surface text-on-surface-variant"
                }`}
              >
                {rarity.toUpperCase()}
              </Link>
            ))}
              </div>
            </div>

          {hasFilters && (
            <Link
              href={filterHref({ q: undefined, type: undefined, rarity: undefined })}
              className="mt-3 inline-flex font-display text-[10px] font-bold tracking-widest text-primary underline"
            >
              CLEAR FILTERS
            </Link>
          )}
          </details>
        </section>

        {byRegion ? (
          <div className="flex flex-col gap-6 pb-4">
            {grouped.map((group) => (
              <section key={group.name}>
                <Link
                  href={`/dex?continent=${encodeURIComponent(group.name)}`}
                  className="mb-2 block rounded-lg border-[3px] border-transparent py-1 transition-colors hover:border-on-background hover:bg-surface-container"
                >
                  <h2 className="font-display text-lg font-extrabold leading-tight text-on-background">
                    {group.name.toUpperCase()}
                  </h2>
                </Link>
                <div className={group.animals.length === 1 ? "flex justify-center" : "grid grid-cols-3 gap-2"}>
                  {group.animals.map((animal) => (
                    <div key={animal.id} className={group.animals.length === 1 ? "w-1/3" : ""}>
                      <DexCard animal={animal} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 pb-4">
            {visibleAnimals.map((animal) => (
              <DexCard key={animal.id} animal={animal} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
