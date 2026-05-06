import Link from "next/link";
import { Animal, rarityColors } from "@/lib/animals";

interface DexCardProps {
  animal: Animal;
}

export default function DexCard({ animal }: DexCardProps) {
  if (!animal.unlocked) {
    return (
      <article
        className="bg-surface border-[3px] border-outline rounded-lg flex flex-col p-1 aspect-[4/5] relative"
        style={{ boxShadow: "4px 4px 0 0 #707974" }}
      >
        <div className="flex justify-start mb-2 opacity-60">
          <span className="font-display text-[10px] font-bold text-on-surface-variant">
            {animal.number}
          </span>
        </div>
        <div className="flex-grow w-full bg-surface-variant border-[3px] border-outline rounded-sm mb-2 flex items-center justify-center overflow-hidden">
          <span className="material-symbols-outlined text-outline text-3xl">
            help
          </span>
        </div>
        <h2 className="font-display text-[11px] font-bold text-center text-outline truncate px-1">
          ???
        </h2>
      </article>
    );
  }

  return (
    <Link href={`/animal/${animal.id}`}>
      <article
        className={`${rarityColors[animal.rarity]} border-[3px] border-on-background rounded-lg flex flex-col p-2 aspect-[4/5] relative cursor-pointer hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#1b1c1c] transition-all shadow-[4px_4px_0_0_#1b1c1c]`}
      >
        <div className="flex justify-start mb-2">
          <span
            className="font-display text-[10px] font-bold leading-none text-on-background bg-surface border-[3px] border-on-background px-1.5 py-0.5 rounded-sm"
            style={{ boxShadow: "2px 2px 0 0 #1b1c1c" }}
          >
            {animal.number}
          </span>
        </div>
        <div className="flex-grow w-full bg-surface border-[3px] border-on-background rounded-sm mb-2 overflow-hidden flex items-center justify-center">
          <span className="text-4xl">{animal.emoji}</span>
        </div>
        <h2 className="font-display text-[11px] font-bold text-center text-on-background truncate px-1">
          {animal.name.toUpperCase()}
        </h2>
      </article>
    </Link>
  );
}
