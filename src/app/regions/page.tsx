import type { Metadata } from "next";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import AppHeader from "@/components/AppHeader";

export const metadata: Metadata = { title: "Regions" };
import ProgressBar from "@/components/ProgressBar";
import { getRegionProgress, type RegionProgress } from "@/lib/supabase/queries";

interface ContinentDef {
  slug: string;
  name: string;
  shortName: string;
  habitat: string;
  color: string;
  textColor: string;
  badgeColor: string;
  progressColor: string;
}

const CONTINENT_DEFS: ContinentDef[] = [
  {
    slug: "north-america",
    name: "North America",
    shortName: "NA",
    habitat: "Forest · Wetland · Prairie",
    color: "bg-primary-container",
    textColor: "text-on-primary-container",
    badgeColor: "bg-primary text-on-primary",
    progressColor: "bg-primary",
  },
  {
    slug: "south-america",
    name: "South America",
    shortName: "SA",
    habitat: "Rainforest · Savanna · Coast",
    color: "bg-secondary-container",
    textColor: "text-on-secondary-container",
    badgeColor: "bg-secondary text-on-secondary",
    progressColor: "bg-secondary",
  },
  {
    slug: "europe",
    name: "Europe",
    shortName: "EU",
    habitat: "Woodland · Farmland · Coast",
    color: "bg-tertiary-container",
    textColor: "text-on-tertiary-container",
    badgeColor: "bg-tertiary text-on-tertiary",
    progressColor: "bg-tertiary",
  },
  {
    slug: "africa",
    name: "Africa",
    shortName: "AF",
    habitat: "Savanna · Desert · Rainforest",
    color: "bg-error-container",
    textColor: "text-on-error-container",
    badgeColor: "bg-error text-on-error",
    progressColor: "bg-error",
  },
  {
    slug: "asia",
    name: "Asia",
    shortName: "AS",
    habitat: "Mountain · Jungle · Wetland",
    color: "bg-amber-container",
    textColor: "text-on-amber-container",
    badgeColor: "bg-amber text-on-amber",
    progressColor: "bg-amber",
  },
  {
    slug: "oceania",
    name: "Oceania",
    shortName: "OC",
    habitat: "Outback · Reef · Rainforest",
    color: "bg-indigo-container",
    textColor: "text-on-indigo-container",
    badgeColor: "bg-indigo text-on-indigo",
    progressColor: "bg-indigo",
  },
  {
    slug: "antarctica",
    name: "Antarctica",
    shortName: "AN",
    habitat: "Ice · Coast",
    color: "bg-surface-variant",
    textColor: "text-on-surface-variant",
    badgeColor: "bg-outline text-on-primary",
    progressColor: "bg-outline",
  },
];

function RegionCard({
  def,
  progress,
}: {
  def: ContinentDef;
  progress: RegionProgress | undefined;
}) {
  const total = progress?.total ?? 0;
  const unlocked = progress?.unlocked ?? 0;
  const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return (
    <div
      className={`${def.color} ${def.textColor} border-[3px] border-on-background rounded-lg hard-shadow flex flex-col gap-3 p-4`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span
            className={`inline-block ${def.badgeColor} border-[2px] border-on-background rounded-md px-2 py-0.5 font-display text-[11px] font-extrabold tracking-widest mb-2`}
          >
            {def.shortName}
          </span>
          <h2 className="font-display text-2xl font-extrabold leading-tight">
            {def.name}
          </h2>
          <p className="font-sans text-xs font-bold opacity-70 mt-0.5">
            {def.habitat}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="font-display text-3xl font-extrabold leading-none">
            {pct}
            <span className="text-base">%</span>
          </span>
          <p className="font-display text-[11px] font-bold opacity-70 tracking-widest">
            {unlocked}/{total}
          </p>
        </div>
      </div>

      <ProgressBar value={pct} color={def.progressColor} height="h-3" />

      {total === 0 ? (
        <span className="font-display text-[11px] font-bold opacity-50 tracking-widest">
          NO SPECIES YET
        </span>
      ) : (
        <Link
          href={`/dex?continent=${def.name}`}
          className="w-full bg-on-background text-surface font-display font-bold text-sm py-2 rounded-lg border-[3px] border-on-background hard-shadow-sm hard-shadow-active text-center transition-all"
        >
          VIEW SPECIES →
        </Link>
      )}
    </div>
  );
}

export default async function RegionsPage() {
  const progressList = await getRegionProgress();
  const progressByContinent = Object.fromEntries(
    progressList.map((p) => [p.continent, p])
  );

  const totalSpecies = progressList.reduce((s, p) => s + p.total, 0);
  const totalUnlocked = progressList.reduce((s, p) => s + p.unlocked, 0);
  const overallPct =
    totalSpecies > 0 ? Math.round((totalUnlocked / totalSpecies) * 100) : 0;

  return (
    <div className="pb-28 min-h-screen bg-surface">
      <AppHeader />

      <main className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-on-background">
            Regions
          </h2>
          <span className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest border-[3px] border-on-background px-2 py-1 rounded-lg bg-surface hard-shadow-sm">
            {totalUnlocked}/{totalSpecies} GLOBAL
          </span>
        </div>

        <div className="bg-surface-container border-[3px] border-on-background rounded-lg p-3 hard-shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest">
              GLOBAL COMPLETION
            </span>
            <span className="font-display text-[11px] font-bold text-primary tracking-widest">
              {overallPct}%
            </span>
          </div>
          <ProgressBar value={overallPct} height="h-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONTINENT_DEFS.map((def) => (
            <RegionCard
              key={def.slug}
              def={def}
              progress={progressByContinent[def.name]}
            />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
