import Link from "next/link";
import { Animal, rarityColors } from "@/lib/animals";

interface DexCardProps {
  animal: Animal;
}

const continentCodes: Record<string, string> = {
  "North America": "NA",
  "South America": "SA",
  Europe: "EU",
  Africa: "AF",
  Asia: "AS",
  Oceania: "OC",
  Antarctica: "AN",
};

export default function DexCard({ animal }: DexCardProps) {
  const continentCode =
    continentCodes[animal.continent] ?? animal.continent.slice(0, 2).toUpperCase();

  if (!animal.unlocked) {
    return (
      <Link href={`/animal/${animal.dexNumber}`}>
        <article
          className="bg-surface border-[3px] border-outline rounded-lg flex flex-col p-1 aspect-[4/5] relative cursor-pointer hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          style={{ boxShadow: "4px 4px 0 0 #707974" }}
        >
          <div className="flex justify-start mb-2 opacity-60">
            <span className="font-display text-[10px] font-bold text-on-surface-variant">
              {animal.number}
            </span>
            <span className="ml-auto rounded-sm border-[2px] border-outline bg-surface-variant px-1 font-display text-[9px] font-bold text-on-surface-variant">
              {continentCode}
            </span>
          </div>
          <div className="flex-grow w-full bg-surface-variant border-[3px] border-outline rounded-sm mb-2 flex items-center justify-center overflow-hidden">
            <span className="text-3xl select-none" style={{ filter: "grayscale(1) opacity(0.18) blur(1.5px)" }}>{animal.emoji}</span>
          </div>
          <h2
            className="min-h-[2.1em] px-1 text-center font-display text-[10px] font-bold leading-tight text-outline"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            ???
          </h2>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/animal/${animal.dexNumber}`}>
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
          <span
            className="ml-auto rounded-sm border-[3px] border-on-background bg-surface px-1.5 py-0.5 font-display text-[9px] font-bold leading-none text-on-background"
            style={{ boxShadow: "2px 2px 0 0 #1b1c1c" }}
          >
            {continentCode}
          </span>
        </div>
        <div className="flex-grow w-full bg-surface border-[3px] border-on-background rounded-sm mb-2 overflow-hidden flex items-center justify-center">
          <span className="text-4xl">{animal.emoji}</span>
        </div>
        <h2
          className="min-h-[2.1em] px-1 text-center font-display text-[10px] font-bold leading-tight text-on-background"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {animal.name.toUpperCase()}
        </h2>
      </article>
    </Link>
  );
}
