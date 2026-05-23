import type { Metadata } from "next";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import AppHeader from "@/components/AppHeader";

export const metadata: Metadata = { title: "Discovery Map" };
import ProgressBar from "@/components/ProgressBar";
import {
  getMapSightings,
  getRegionProgress,
  type MapSighting,
} from "@/lib/supabase/queries";
import MapCanvas from "./MapCanvas";

interface ContinentDef {
  slug: string;
  name: string;
  shortName: string;
  habitat: string;
  color: string;
  textColor: string;
  badgeColor: string;
  progressColor: string;
  regionName: string;
  mapCenter: [number, number];
  mapZoom: number;
}

interface Continent extends ContinentDef {
  found: number;
  total: number;
}

const CONTINENT_DEFS: ContinentDef[] = [
  {
    slug: "north-america",
    name: "North America",
    shortName: "NA",
    habitat: "FOREST / WETLAND",
    color: "bg-primary-container",
    textColor: "text-on-primary-container",
    badgeColor: "bg-primary text-on-primary",
    progressColor: "bg-primary",
    regionName: "North America",
    mapCenter: [-100, 45],
    mapZoom: 1.8,
  },
  {
    slug: "south-america",
    name: "South America",
    shortName: "SA",
    habitat: "RAINFOREST / GRASSLAND",
    color: "bg-secondary-container",
    textColor: "text-on-secondary-container",
    badgeColor: "bg-secondary text-on-secondary",
    progressColor: "bg-secondary",
    regionName: "South America",
    mapCenter: [-58, -15],
    mapZoom: 1.8,
  },
  {
    slug: "europe",
    name: "Europe",
    shortName: "EU",
    habitat: "WOODLAND / COAST",
    color: "bg-tertiary-container",
    textColor: "text-on-tertiary-container",
    badgeColor: "bg-tertiary text-on-tertiary",
    progressColor: "bg-tertiary",
    regionName: "Europe",
    mapCenter: [15, 52],
    mapZoom: 2.2,
  },
  {
    slug: "africa",
    name: "Africa",
    shortName: "AF",
    habitat: "SAVANNA / DESERT",
    color: "bg-error-container",
    textColor: "text-on-error-container",
    badgeColor: "bg-error text-on-error",
    progressColor: "bg-error",
    regionName: "Africa",
    mapCenter: [20, 5],
    mapZoom: 1.4,
  },
  {
    slug: "asia",
    name: "Asia",
    shortName: "AS",
    habitat: "MOUNTAIN / WETLAND",
    color: "bg-amber-container",
    textColor: "text-on-amber-container",
    badgeColor: "bg-amber text-on-amber",
    progressColor: "bg-amber",
    regionName: "Asia",
    mapCenter: [95, 35],
    mapZoom: 1.4,
  },
  {
    slug: "oceania",
    name: "Oceania",
    shortName: "OC",
    habitat: "REEF / SCRUB",
    color: "bg-indigo-container",
    textColor: "text-on-indigo-container",
    badgeColor: "bg-indigo text-on-indigo",
    progressColor: "bg-indigo",
    regionName: "Oceania",
    mapCenter: [133, -27],
    mapZoom: 2.2,
  },
  {
    slug: "antarctica",
    name: "Antarctica",
    shortName: "AN",
    habitat: "ICE / COAST",
    color: "bg-surface-variant",
    textColor: "text-on-surface-variant",
    badgeColor: "bg-outline text-on-primary",
    progressColor: "bg-outline",
    regionName: "Antarctica",
    mapCenter: [0, -90],
    mapZoom: 1.5,
  },
];

function ContinentLink({
  continent,
  active,
}: {
  continent: Continent;
  active: boolean;
}) {
  return (
    <Link
      href={`/map?continent=${continent.slug}`}
      className={`block w-full min-w-0 border-[3px] border-on-background rounded-lg p-3 hard-shadow-sm transition-all ${
        active
          ? `${continent.color} ${continent.textColor} translate-x-[1px] translate-y-[1px]`
          : "bg-surface-container text-on-surface hover:bg-surface-variant"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-xl font-extrabold leading-none">
          {continent.shortName}
        </span>
        <span className="font-display text-[11px] font-bold tracking-widest">
          {continent.found}/{continent.total}
        </span>
      </div>
      <p className="mt-1 truncate font-sans text-sm font-bold">
        {continent.name}
      </p>
    </Link>
  );
}

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ continent?: string | string[]; sighting?: string | string[] }>;
}) {
  const { continent: continentParam, sighting: sightingParam } = await searchParams;
  const selectedSlug = Array.isArray(continentParam)
    ? continentParam[0]
    : continentParam;
  const sightingId = Array.isArray(sightingParam) ? sightingParam[0] : sightingParam;

  const [allSightings, regionProgress] = await Promise.all([
    getMapSightings(),
    getRegionProgress(),
  ]);

  const progressByContinent = Object.fromEntries(
    regionProgress.map((p) => [p.continent, p])
  );

  const continents: Continent[] = CONTINENT_DEFS.map((def) => {
    const p = progressByContinent[def.regionName];
    return {
      ...def,
      found: p?.unlocked ?? 0,
      total: p?.total ?? 0,
    };
  });

  const selected =
    continents.find((c) => c.slug === selectedSlug) ?? continents[0];

  const allMarkers = allSightings.filter(
    (s: MapSighting): s is MapSighting & { latitude: number; longitude: number } =>
      s.latitude != null && s.longitude != null
  );

  // Determine the map's initial center/zoom.
  // Priority: specific sighting > selected continent > most recent marker.
  let mapInitialCenter: [number, number] | undefined;
  let mapInitialZoom: number | undefined;

  const focusSighting = sightingId
    ? allMarkers.find((m: MapSighting) => m.id === sightingId)
    : null;

  if (focusSighting) {
    mapInitialCenter = [focusSighting.longitude, focusSighting.latitude];
    mapInitialZoom = 12;
  } else if (selectedSlug) {
    mapInitialCenter = selected.mapCenter;
    mapInitialZoom = selected.mapZoom;
  }

  const recentSightings = allSightings
    .filter((s: MapSighting) => s.region === selected.regionName)
    .slice(0, 5);

  const progress =
    selected.total > 0
      ? Math.round((selected.found / selected.total) * 100)
      : 0;

  // Key forces MapCanvas to remount (and re-center) when focus changes.
  const mapKey = sightingId ?? selectedSlug ?? "default";

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface pb-32">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold text-on-background">
              Discovery Map
            </h2>
            <Link href="/regions" className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest border-[3px] border-on-background px-2 py-1 rounded-lg bg-surface-container hard-shadow-sm hard-shadow-active transition-all">
              {selected.name.toUpperCase()} ↗
            </Link>
          </div>

          <section className="w-full h-[50vh] min-h-72 bg-secondary-container border-[3px] border-on-background rounded-lg hard-shadow relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none z-10">
              {[20, 40, 60, 80].map((p) => (
                <div
                  key={`h${p}`}
                  className="absolute w-full h-px bg-on-background"
                  style={{ top: `${p}%` }}
                />
              ))}
              {[20, 40, 60, 80].map((p) => (
                <div
                  key={`v${p}`}
                  className="absolute h-full w-px bg-on-background"
                  style={{ left: `${p}%` }}
                />
              ))}
            </div>

            <div className="absolute inset-0">
              <MapCanvas
                key={mapKey}
                markers={allMarkers}
                initialCenter={mapInitialCenter}
                initialZoom={mapInitialZoom}
              />
            </div>

            {allMarkers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="bg-surface-container/95 border-[2px] border-on-background rounded-lg px-4 py-2 text-center">
                  <p className="font-display text-sm font-bold text-on-surface-variant">
                    No GPS sightings yet
                  </p>
                  <p className="font-sans text-xs text-outline mt-1">
                    Enable GPS when logging a sighting
                  </p>
                </div>
              </div>
            )}
          </section>

          <div className="bg-surface-container p-3 rounded-lg border-[3px] border-on-background hard-shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest">
                {selected.name.toUpperCase()} PROGRESS
              </span>
              <span className="font-display text-[11px] font-bold text-primary tracking-wider">
                {selected.found}/{selected.total} SPECIES
              </span>
            </div>
            <ProgressBar
              value={progress}
              color={selected.progressColor}
              height="h-4"
            />
          </div>

          {/* Continent grid — mobile only, sits below the map */}
          <section
            aria-label="Continents"
            className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:hidden"
          >
            {continents.map((item, i) => (
              <div key={item.slug} className={`min-w-0 ${i === continents.length - 1 && continents.length % 2 !== 0 ? "col-span-2 sm:col-span-1" : ""}`}>
                <ContinentLink continent={item} active={item.slug === selected.slug} />
              </div>
            ))}
          </section>

          <Link href="/regions" className="lg:hidden">
            <button className="w-full py-2 bg-surface-container text-on-surface-variant font-display font-bold text-[11px] tracking-widest rounded-lg border-[3px] border-on-background hard-shadow-sm hard-shadow-active transition-all">
              VIEW ALL REGIONS →
            </button>
          </Link>

          {/* Recent sightings — mobile only */}
          {recentSightings.length > 0 && (
            <section className="lg:hidden bg-surface-container rounded-lg border-[3px] border-on-background hard-shadow p-3 flex flex-col gap-2">
              <h3 className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest">
                RECENT — {selected.name.toUpperCase()}
              </h3>
              {recentSightings.map((s) => (
                <Link
                  key={s.id}
                  href={`/animal/${s.dex_number}`}
                  className="flex items-center gap-3 p-2 bg-surface-container rounded-lg border-[2px] border-on-background"
                >
                  <span className="w-9 h-9 bg-secondary-container rounded-lg border-[2px] border-on-background flex items-center justify-center text-lg shrink-0">
                    {s.species_sprite}
                  </span>
                  <div className="min-w-0">
                    <p className="font-sans font-bold text-sm text-on-surface truncate">{s.species_name}</p>
                    {s.location_name && (
                      <p className="font-sans text-xs text-outline truncate">{s.location_name}</p>
                    )}
                  </div>
                </Link>
              ))}
            </section>
          )}

          <Link href="/scan">
            <button className="w-full py-4 bg-primary text-on-primary font-display font-bold text-2xl rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active flex items-center justify-center gap-2 transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
              LOG SIGHTING
            </button>
          </Link>
        </div>

        <aside className="hidden lg:flex flex-col w-80 gap-4">
          <section className="bg-surface-container rounded-lg border-[3px] border-on-background hard-shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-2xl font-bold">
                Continents
              </h2>
              <Link href="/regions" className="font-display text-[10px] font-bold text-primary tracking-widest hover:underline">
                ALL REGIONS →
              </Link>
            </div>
            <div className="grid gap-2">
              {continents.map((item) => (
                <ContinentLink
                  key={item.slug}
                  continent={item}
                  active={item.slug === selected.slug}
                />
              ))}
            </div>
          </section>

          <section className="bg-surface-container rounded-lg border-[3px] border-on-background hard-shadow p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-display text-[12px] font-bold text-on-surface-variant tracking-widest">
                {selected.habitat}
              </h3>
              <span
                className={`${selected.badgeColor} px-2 py-1 rounded-full border-[2px] border-on-background font-display text-[11px] font-bold tracking-widest`}
              >
                {progress}%
              </span>
            </div>
            <div className="grid gap-2">
              {(recentSightings.length ? recentSightings : [null]).map(
                (s: MapSighting | null, i: number) =>
                  s ? (
                    <Link
                      key={s.id}
                      href={`/animal/${s.dex_number}`}
                      className="flex items-center gap-3 p-2 bg-surface-container rounded-lg border-[3px] border-on-background hover:bg-surface-variant transition-colors"
                    >
                      <span className="w-10 h-10 bg-secondary-container rounded-lg border-[2px] border-on-background flex items-center justify-center text-xl shrink-0">
                        {s.species_sprite}
                      </span>
                      <div className="min-w-0">
                        <p className="font-sans font-bold text-on-surface truncate">
                          {s.species_name}
                        </p>
                        {s.location_name && (
                          <p className="font-sans text-xs text-outline truncate">
                            {s.location_name}
                          </p>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 bg-surface-container rounded-lg border-[3px] border-on-background"
                    >
                      <span className="w-10 h-10 bg-secondary-container rounded-lg border-[2px] border-on-background flex items-center justify-center font-display text-sm font-extrabold">
                        ?
                      </span>
                      <span className="font-sans font-bold text-on-surface-variant">
                        No sightings yet
                      </span>
                    </div>
                  )
              )}
            </div>
          </section>
        </aside>
      </main>

      <BottomNav />
    </div>
  );
}
