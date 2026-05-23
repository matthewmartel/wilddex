import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export default function PrivacyPage() {
  return (
    <div className="pb-28 min-h-screen bg-surface">
      <header className="bg-surface text-primary font-display text-2xl font-bold border-b-[3px] border-on-background relative flex items-center justify-center w-full px-4 h-16 sticky top-0 z-40">
        <Link href="/profile" className="absolute left-4 flex items-center gap-1 active:opacity-70">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            arrow_back
          </span>
        </Link>
        <div className="font-display text-[32px] font-extrabold text-primary tracking-tighter">
          WildDex
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 flex flex-col gap-4 mt-2">
        <h2 className="font-display text-2xl font-extrabold text-on-background">Privacy</h2>

        <section className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              location_on
            </span>
            <h3 className="font-display font-bold text-on-background">GPS Fuzzing</h3>
          </div>
          <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
            When you log a sighting with GPS enabled, your exact coordinates are never shown on the map.
            WildDex applies a small random offset (~500 m) before displaying any location, protecting
            your privacy if you spot something near your home.
          </p>
        </section>

        <section className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock
            </span>
            <h3 className="font-display font-bold text-on-background">Your Data</h3>
          </div>
          <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
            Your sightings are private by default — only you can see them. Photos are stored securely
            and are not shared with other users. You can delete any sighting at any time from its
            entry page.
          </p>
        </section>

        <section className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
              photo_camera
            </span>
            <h3 className="font-display font-bold text-on-background">Photos</h3>
          </div>
          <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
            Sighting photos are only accessible to your account. Deleting a sighting removes the
            associated photo from storage permanently.
          </p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
