import BottomNav from "@/components/BottomNav";
import DexCard from "@/components/DexCard";
import ProgressBar from "@/components/ProgressBar";
import { animals, unlockedAnimals } from "@/lib/animals";

export default function DexPage() {
  const discovered = unlockedAnimals.length;
  const total = animals.length;
  const pct = Math.round((discovered / total) * 100);

  return (
    <div className="pb-28 min-h-screen bg-surface pt-20">
      {/* Fixed Header */}
      <header className="flex justify-between items-center w-full px-4 h-16 bg-surface border-b-[3px] border-on-background fixed top-0 z-50">
        <span className="material-symbols-outlined text-primary text-2xl">
          battery_charging_full
        </span>
        <h1 className="font-display text-[32px] font-extrabold text-primary tracking-tighter">
          WildDex
        </h1>
        <span className="material-symbols-outlined text-primary text-2xl">
          signal_cellular_alt
        </span>
      </header>

      <main className="max-w-md mx-auto px-4">
        {/* Stats panel */}
        <div className="bg-surface-container border-[3px] border-on-background rounded-lg shadow-[4px_4px_0_0_#1b1c1c] p-3 mb-4 flex items-center gap-4">
          <div className="flex flex-col shrink-0">
            <span className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest">
              DISCOVERED
            </span>
            <span className="font-display text-2xl font-bold text-primary leading-tight">
              {String(discovered).padStart(3, "0")}
              <span className="text-on-surface-variant text-lg">/{total}</span>
            </span>
          </div>
          <ProgressBar value={pct} height="h-5" className="flex-1" />
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-3 gap-2 pb-4">
          {animals.map((animal) => (
            <DexCard key={animal.id} animal={animal} />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
