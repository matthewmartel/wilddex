import Link from "next/link";
import { notFound } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { animals, rarityColors, rarityLabels } from "@/lib/animals";

export default async function AnimalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const animal = animals.find((a) => a.id === id);

  if (!animal || !animal.unlocked) {
    notFound();
  }

  return (
    <div className="pb-28 min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-surface text-primary font-display text-2xl font-bold border-b-[3px] border-on-background flex justify-between items-center w-full px-4 h-16 sticky top-0 z-40">
        <Link
          href="/dex"
          className="flex items-center gap-1 active:opacity-70"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            arrow_back
          </span>
        </Link>
        <div className="font-display text-[32px] font-extrabold text-primary tracking-tighter">
          WildDex
        </div>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined">signal_cellular_alt</span>
          <span className="material-symbols-outlined">battery_charging_full</span>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto flex flex-col gap-4 mt-2">
        {/* Sprite / image area */}
        <section
          className={`${rarityColors[animal.rarity]} border-[3px] border-on-background rounded-xl p-4 flex flex-col items-center justify-center hard-shadow relative overflow-hidden aspect-square`}
        >
          <div className="absolute top-3 right-3">
            <span className="bg-tertiary text-on-tertiary font-display text-[12px] font-bold px-2 py-1 border-[2px] border-on-background rounded-full tracking-widest">
              #{animal.number}
            </span>
          </div>
          <span className="text-9xl mb-4">{animal.emoji}</span>
          <h1 className="font-display text-[32px] font-extrabold text-on-background tracking-tighter">
            {animal.name}
          </h1>
        </section>

        {/* Stats grid */}
        <section className="grid grid-cols-2 gap-2">
          <div className="bg-surface-container border-[3px] border-on-background rounded-lg p-2 hard-shadow flex flex-col items-center">
            <span className="font-display text-[12px] font-bold text-on-surface-variant mb-1 tracking-widest">
              TYPE
            </span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-secondary">
                pets
              </span>
              <span className="font-sans font-bold text-on-background capitalize">
                {animal.type}
              </span>
            </div>
          </div>
          <div className="bg-surface-container border-[3px] border-on-background rounded-lg p-2 hard-shadow flex flex-col items-center">
            <span className="font-display text-[12px] font-bold text-on-surface-variant mb-1 tracking-widest">
              REGION
            </span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary">
                forest
              </span>
              <span className="font-sans font-bold text-on-background">
                {animal.region}
              </span>
            </div>
          </div>
          <div className="bg-surface-container border-[3px] border-on-background rounded-lg p-2 hard-shadow flex flex-col items-center">
            <span className="font-display text-[12px] font-bold text-on-surface-variant mb-1 tracking-widest">
              RARITY
            </span>
            <span className="font-display text-[12px] font-bold text-on-background tracking-widest">
              {rarityLabels[animal.rarity]}
            </span>
          </div>
          <div className="bg-surface-container border-[3px] border-on-background rounded-lg p-2 hard-shadow flex flex-col items-center">
            <span className="font-display text-[12px] font-bold text-on-surface-variant mb-1 tracking-widest">
              LOCATION
            </span>
            <span className="font-sans text-sm font-bold text-on-background text-center">
              {animal.caughtLocation}
            </span>
          </div>
        </section>

        {/* Dex entry */}
        <section className="bg-surface border-[3px] border-on-background rounded-xl p-4 hard-shadow relative">
          <h2 className="font-display text-[12px] font-bold text-on-surface-variant absolute -top-3 left-4 bg-surface px-2 border-x-[3px] border-t-[3px] border-on-background rounded-t tracking-widest">
            DEX ENTRY
          </h2>
          <p className="font-sans text-base text-on-background leading-relaxed mt-1">
            {animal.description}
          </p>
          <div className="absolute bottom-2 right-2 animate-pulse">
            <span className="material-symbols-outlined text-primary">
              play_arrow
            </span>
          </div>
        </section>

        {/* CTA */}
        <Link href="/map">
          <button className="w-full bg-secondary text-on-secondary font-display font-bold text-2xl border-[3px] border-on-background rounded-lg py-4 hard-shadow hard-shadow-active flex items-center justify-center gap-2 transition-all mt-2">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              map
            </span>
            VIEW ON MAP
          </button>
        </Link>
      </main>

      <BottomNav />
    </div>
  );
}
