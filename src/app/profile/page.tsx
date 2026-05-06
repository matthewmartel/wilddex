import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Badge from "@/components/Badge";
import { unlockedAnimals } from "@/lib/animals";

const stats = [
  { icon: "grid_view", value: "12", label: "Logged", color: "bg-primary-container" },
  { icon: "explore", value: "3", label: "Regions", color: "bg-secondary-container", iconColor: "text-secondary" },
  { icon: "star", value: "5", label: "Rare Finds", color: "bg-tertiary-container", iconColor: "text-tertiary" },
  { icon: "local_fire_department", value: "7", label: "Day Streak", color: "bg-surface", iconColor: "text-error" },
];

const badges = [
  { icon: "forest", label: "Forest Scout", color: "bg-primary", locked: false },
  { icon: "emoji_events", label: "First Catch", color: "bg-secondary", locked: false },
  { icon: "visibility", label: "Rare Spotter", color: "bg-tertiary", locked: false },
  { icon: "lock", label: "Locked", color: "bg-surface-variant", locked: true },
];

const recentCatches = unlockedAnimals.slice(0, 3);

export default function ProfilePage() {
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

      <main className="max-w-md mx-auto p-4 flex flex-col gap-4">
        {/* Avatar */}
        <section className="bg-primary-container border-[3px] border-on-background rounded-lg p-4 hard-shadow flex items-center gap-4">
          <div className="w-20 h-20 bg-primary border-[3px] border-on-background rounded-xl flex items-center justify-center text-4xl hard-shadow shrink-0">
            🧭
          </div>
          <div>
            <h2 className="font-display text-2xl font-extrabold text-on-background">
              TrailMatt
            </h2>
            <p className="font-sans text-sm text-on-surface-variant">
              mattmartel14@gmail.com
            </p>
            <span className="inline-block mt-1 font-display text-[11px] font-bold text-on-primary bg-primary px-2 py-0.5 rounded-full border-[2px] border-on-background tracking-widest">
              EXPLORER LVL 4
            </span>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.color} border-[3px] border-on-background rounded-lg p-2 hard-shadow flex flex-col items-center justify-center text-center`}
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
            </div>
          ))}
        </section>

        {/* Map preview */}
        <section className="bg-surface border-[3px] border-on-background rounded-lg p-2 hard-shadow">
          <h3 className="font-display font-bold text-on-background mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">map</span>
            Discovery Map
          </h3>
          <div className="relative w-full h-48 border-[2px] border-on-background rounded bg-secondary-container overflow-hidden mb-2">
            <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-30">🗺️</div>
            <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-error border-[2px] border-on-background rounded-full shadow-[2px_2px_0_0_#1b1c1c]" />
            <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-tertiary border-[2px] border-on-background rounded-full shadow-[2px_2px_0_0_#1b1c1c]" />
            <div className="absolute bottom-1/4 left-1/2 w-4 h-4 bg-primary border-[2px] border-on-background rounded-full shadow-[2px_2px_0_0_#1b1c1c]" />
          </div>
          <Link href="/map">
            <button className="w-full bg-primary text-on-primary font-display font-bold text-base py-2 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active transition-all">
              View Full Map
            </button>
          </Link>
        </section>

        {/* Recent catches */}
        <section>
          <h3 className="font-display font-bold text-on-background mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">photo_camera</span>
            Recent Catches
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {recentCatches.map((animal) => (
              <Link key={animal.id} href={`/animal/${animal.id}`}>
                <div className="bg-surface border-[3px] border-on-background rounded-lg p-1 hard-shadow flex flex-col items-center hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer">
                  <div className="w-full aspect-square border-[2px] border-on-background rounded bg-secondary-container mb-1 overflow-hidden flex items-center justify-center text-3xl">
                    {animal.emoji}
                  </div>
                  <span className="font-display text-[10px] font-bold text-center text-on-background tracking-wide">
                    {animal.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Badges */}
        <section className="bg-surface border-[3px] border-on-background rounded-lg p-2 hard-shadow">
          <h3 className="font-display font-bold text-on-background mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined">military_tech</span>
            Badges
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
            {badges.map((badge) => (
              <div key={badge.label} className="snap-center">
                <Badge
                  icon={badge.icon}
                  label={badge.label}
                  color={badge.color}
                  locked={badge.locked}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Settings */}
        <section className="bg-surface-container border-[3px] border-on-background rounded-lg hard-shadow overflow-hidden">
          {[
            { icon: "notifications", label: "Notifications" },
            { icon: "privacy_tip", label: "Privacy" },
            { icon: "help", label: "Help & Feedback" },
            { icon: "logout", label: "Sign Out" },
          ].map((item, i, arr) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 text-on-background hover:bg-secondary-container transition-colors ${
                i < arr.length - 1 ? "border-b-[3px] border-on-background" : ""
              }`}
            >
              <span className="material-symbols-outlined text-on-surface-variant">
                {item.icon}
              </span>
              <span className="font-sans text-sm font-medium flex-1 text-left">
                {item.label}
              </span>
              <span className="material-symbols-outlined text-on-surface-variant">
                chevron_right
              </span>
            </button>
          ))}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
