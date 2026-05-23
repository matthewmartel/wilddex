import Link from "next/link";
import type { QuestWithProgress } from "@/lib/supabase/queries";

interface ActiveQuestCardProps {
  quest: QuestWithProgress | null;
}

export default function ActiveQuestCard({ quest }: ActiveQuestCardProps) {
  if (!quest) {
    return (
      <section className="bg-surface-container border-[3px] border-on-background rounded-lg p-4 hard-shadow flex items-center gap-3">
        <div className="w-12 h-12 shrink-0 bg-primary-container border-[3px] border-on-background rounded-lg flex items-center justify-center">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            flag
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-base font-bold text-on-background">
            All quests complete
          </p>
          <p className="font-sans text-xs text-on-surface-variant">
            More quests are on the way. Keep logging in the meantime.
          </p>
        </div>
      </section>
    );
  }

  const nextSpecies = quest.species.find((s) => !s.unlocked);

  return (
    <Link href="/quests" className="block">
      <section className="bg-primary-container border-[3px] border-on-background rounded-lg p-4 hard-shadow hard-shadow-active transition-all flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            flag
          </span>
          <span className="font-display text-[10px] font-bold text-on-surface-variant tracking-widest">
            ACTIVE QUEST
          </span>
          <span className="ml-auto material-symbols-outlined text-on-surface-variant">
            chevron_right
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-xl font-extrabold text-on-background leading-tight">
            {quest.quest.name}
          </h2>
          <span className="font-display text-sm font-bold text-on-background tracking-widest shrink-0">
            {quest.completed}/{quest.required}
          </span>
        </div>

        <div className="h-3 bg-surface border-[2px] border-on-background rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${quest.progressPct}%` }}
          />
        </div>

        {nextSpecies && (
          <p className="font-sans text-sm text-on-surface-variant leading-snug">
            Next up: <span className="font-bold text-on-background">{nextSpecies.common_name}</span>
          </p>
        )}
      </section>
    </Link>
  );
}
