import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import ProgressBar from "@/components/ProgressBar";

const regions = [
  {
    name: "Greenwood Forest",
    emoji: "🌲",
    color: "bg-primary-container",
    textColor: "text-on-primary-container",
    badgeColor: "bg-primary text-on-primary",
    level: "LVL 1-15",
    completion: 72,
    unlocked: true,
  },
  {
    name: "Blueberry Bay",
    emoji: "🌊",
    color: "bg-secondary-container",
    textColor: "text-on-secondary-container",
    badgeColor: "bg-secondary text-on-secondary",
    level: "LVL 10-25",
    completion: 52,
    unlocked: true,
  },
  {
    name: "Dusty Dunes",
    emoji: "🏜️",
    color: "bg-tertiary-container",
    textColor: "text-on-tertiary-container",
    badgeColor: "bg-tertiary text-on-tertiary",
    level: "LVL 25-40",
    completion: 15,
    unlocked: true,
  },
  {
    name: "Cloudy Peaks",
    emoji: "🏔️",
    color: "bg-surface-variant",
    textColor: "text-on-surface-variant",
    badgeColor: "bg-outline text-on-primary",
    level: "LVL 40+",
    completion: 0,
    unlocked: false,
  },
];

export default function RegionsPage() {
  return (
    <div className="pb-28 min-h-screen bg-surface">
      {/* Header */}
      <header className="flex justify-between items-center w-full px-4 h-16 bg-surface border-b-[3px] border-on-background sticky top-0 z-40">
        <span className="material-symbols-outlined text-primary">
          battery_charging_full
        </span>
        <h1 className="font-display text-[32px] font-extrabold text-primary tracking-tighter">
          WildDex
        </h1>
        <span className="material-symbols-outlined text-primary">
          signal_cellular_alt
        </span>
      </header>

      <main className="max-w-md mx-auto p-4">
        <h2 className="font-display text-2xl font-bold text-on-background mb-4">
          Select Region
        </h2>

        <div className="flex flex-col gap-4">
          {regions.map((region) => (
            <Link
              key={region.name}
              href={region.unlocked ? "/map" : "#"}
              className={region.unlocked ? "" : "pointer-events-none"}
            >
              <article
                className={`${region.color} border-[3px] border-on-background rounded-lg flex flex-col gap-2 hard-shadow relative overflow-hidden p-4 ${
                  region.unlocked
                    ? "cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#1b1c1c] transition-all duration-100"
                    : "opacity-80"
                }`}
              >
                {/* Level badge */}
                <div
                  className={`absolute top-0 right-0 ${region.badgeColor} font-display text-[11px] font-bold px-3 py-1 border-b-[3px] border-l-[3px] border-on-background rounded-bl-lg tracking-widest`}
                >
                  {region.level}
                </div>

                {/* Region image */}
                <div className="h-48 bg-surface border-[3px] border-on-background rounded overflow-hidden relative flex items-center justify-center">
                  <span className="text-8xl">{region.emoji}</span>
                  {!region.unlocked && (
                    <div className="absolute inset-0 bg-on-background/10 flex items-center justify-center">
                      <div className="bg-surface border-[3px] border-on-background rounded-full p-3 hard-shadow">
                        <span
                          className="material-symbols-outlined text-on-background text-3xl"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          lock
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <h3
                      className={`font-display text-2xl font-extrabold ${region.textColor} uppercase tracking-tight`}
                    >
                      {region.name}
                    </h3>
                    <span className={`font-display text-2xl font-bold ${region.textColor}`}>
                      {region.completion}%
                    </span>
                  </div>
                  <ProgressBar
                    value={region.completion}
                    color={region.badgeColor.split(" ")[0]}
                    height="h-5"
                    className="mt-2"
                  />
                  <p className={`font-display text-[11px] font-bold ${region.textColor} opacity-80 text-right tracking-widest`}>
                    COMPLETION
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
