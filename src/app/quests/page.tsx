import type { Metadata } from "next";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import BackButton from "@/app/animal/[id]/BackButton";
import {
  getQuestProgress,
  type QuestTier,
  type QuestWithProgress,
} from "@/lib/supabase/queries";
import { ALL_BADGES } from "@/lib/badges";

export const metadata: Metadata = { title: "Quests" };

const TIER_LABELS: Record<QuestTier, string> = {
  tutorial: "TUTORIAL",
  intermediate: "EXPEDITIONS",
  advanced: "EXPERT",
  legendary: "LEGENDARY HUNTS",
};

const TIER_ORDER: QuestTier[] = [
  "tutorial",
  "intermediate",
  "advanced",
  "legendary",
];

const TIER_ACCENT: Record<QuestTier, string> = {
  tutorial: "bg-primary-container",
  intermediate: "bg-secondary-container",
  advanced: "bg-tertiary-container",
  legendary: "bg-error-container",
};

export default async function QuestsPage() {
  const quests = await getQuestProgress();

  const byTier = new Map<QuestTier, QuestWithProgress[]>();
  for (const q of quests) {
    const arr = byTier.get(q.quest.tier) ?? [];
    arr.push(q);
    byTier.set(q.quest.tier, arr);
  }

  return (
    <div className="min-h-screen bg-surface pb-28">
      <AppHeader left={<BackButton />} />

      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-4">
        <header>
          <h1 className="font-display text-3xl font-extrabold text-on-background">
            Quests
          </h1>
          <p className="font-sans text-sm text-on-surface-variant mt-1">
            Pick a hunt and head out. New quests unlock as you complete the
            ones above them.
          </p>
        </header>

        <section className="bg-surface-container border-[3px] border-on-background rounded-xl p-3 hard-shadow flex items-start gap-3">
          <span
            className="material-symbols-outlined text-primary text-2xl shrink-0 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified
          </span>
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="font-display text-sm font-bold text-on-background">
              Only GPS-verified sightings count.
            </p>
            <p className="font-sans text-xs text-on-surface-variant leading-snug">
              Use the in-app camera with{" "}
              <span className="font-bold">USE MY GPS LOCATION</span> on the scan
              page. Uploaded photos and map-pinned locations don&apos;t move quest
              progress forward.
            </p>
          </div>
        </section>

        {TIER_ORDER.map((tier) => {
          const tierQuests = byTier.get(tier);
          if (!tierQuests || tierQuests.length === 0) return null;
          return (
            <section key={tier} className="flex flex-col gap-3">
              <h2 className="font-display text-[12px] font-bold text-on-surface-variant tracking-widest px-1">
                {TIER_LABELS[tier]}
              </h2>
              {tierQuests.map((q) => (
                <QuestCard key={q.quest.id} item={q} />
              ))}
            </section>
          );
        })}
      </main>

      <BottomNav />
    </div>
  );
}

function QuestCard({ item }: { item: QuestWithProgress }) {
  const accent = TIER_ACCENT[item.quest.tier];
  const reward = item.quest.reward_badge_id
    ? ALL_BADGES.find((b) => b.id === item.quest.reward_badge_id)
    : null;

  return (
    <article
      className={`${accent} border-[3px] border-on-background rounded-xl p-4 hard-shadow flex flex-col gap-3 relative ${
        item.isLocked ? "opacity-60" : ""
      }`}
    >
      <header className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-extrabold text-on-background leading-tight">
            {item.quest.name}
          </h3>
          <p className="font-sans text-sm text-on-surface-variant mt-1 leading-snug">
            {item.quest.description}
          </p>
        </div>
        {item.isCompleted && (
          <span
            className="material-symbols-outlined text-primary text-3xl shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-label="Completed"
          >
            check_circle
          </span>
        )}
        {item.isLocked && (
          <span
            className="material-symbols-outlined text-on-surface-variant text-3xl shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-label="Locked"
          >
            lock
          </span>
        )}
      </header>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-3 bg-surface border-[2px] border-on-background rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${item.progressPct}%` }}
          />
        </div>
        <span className="font-display text-[11px] font-bold text-on-background tracking-widest shrink-0">
          {item.completed}/{item.required}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {item.species.map((s) => (
          <Link
            key={s.dex_number}
            href={`/animal/${s.dex_number}`}
            className={`flex flex-col items-center gap-1 bg-surface border-[2px] border-on-background rounded-lg p-2 ${
              s.unlocked ? "" : "opacity-60"
            }`}
          >
            <span
              className="text-2xl select-none"
              style={
                s.unlocked
                  ? undefined
                  : { filter: "grayscale(1) opacity(0.45)" }
              }
            >
              {s.sprite ?? "?"}
            </span>
            <span className="font-display text-[9px] font-bold text-on-background tracking-wide text-center leading-tight truncate w-full">
              {s.unlocked ? s.common_name : "???"}
            </span>
          </Link>
        ))}
      </div>

      {reward && (
        <div className="flex items-center gap-2 bg-surface border-[2px] border-on-background rounded-lg px-3 py-2">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}
          >
            {reward.icon}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-display text-[10px] font-bold text-on-surface-variant tracking-widest">
              REWARD
            </p>
            <p className="font-display text-sm font-bold text-on-background truncate">
              {reward.label}
            </p>
          </div>
        </div>
      )}
    </article>
  );
}
