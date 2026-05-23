"use client";

import { useState, useTransition } from "react";
import { updateFeaturedBadges } from "@/app/actions/badges";
import type { BadgeDef, BadgeCategory } from "@/lib/badges";
import { CATEGORY_LABELS } from "@/lib/badges";

const MAX_FEATURED = 4;

const CATEGORY_ORDER: BadgeCategory[] = [
  "milestone",
  "rarity",
  "geography",
  "type",
  "dedication",
];

interface BadgeGridProps {
  badges: BadgeDef[];
  earnedIds: string[];
  initialFeaturedIds: string[];
}

export default function BadgeGrid({ badges, earnedIds, initialFeaturedIds }: BadgeGridProps) {
  const earned = new Set(earnedIds);
  const [featured, setFeatured] = useState<string[]>(initialFeaturedIds);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggle(id: string) {
    if (!earned.has(id)) return;
    setFeatured((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_FEATURED) return prev;
      return [...prev, id];
    });
    setSaved(false);
  }

  function save() {
    startTransition(async () => {
      await updateFeaturedBadges(featured);
      setSaved(true);
    });
  }

  const earnedCount = earnedIds.length;
  const totalCount = badges.length;

  return (
    <div className="flex flex-col gap-6 pb-4">
      {/* Featured slots */}
      <div className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-[12px] font-bold text-on-surface-variant tracking-widest">
            FEATURED ({featured.length}/{MAX_FEATURED})
          </h3>
          {!saved && (
            <button
              onClick={save}
              disabled={isPending}
              className="font-display text-[11px] font-bold bg-primary text-on-primary px-3 py-1 rounded-lg border-[2px] border-on-background hard-shadow-sm hard-shadow-active transition-all disabled:opacity-60"
            >
              {isPending ? "SAVING…" : "SAVE"}
            </button>
          )}
          {saved && (
            <span className="font-display text-[11px] font-bold text-primary tracking-widest">
              SAVED ✓
            </span>
          )}
        </div>
        <div className="flex gap-3">
          {Array.from({ length: MAX_FEATURED }).map((_, i) => {
            const id = featured[i];
            const badge = id ? badges.find((b) => b.id === id) : null;
            if (badge) {
              return (
                <button
                  key={badge.id}
                  onClick={() => toggle(badge.id)}
                  className="flex flex-col items-center gap-1 shrink-0 group"
                  title={`Remove ${badge.label}`}
                >
                  <div
                    className={`w-14 h-14 rounded-full ${badge.color} border-[3px] border-primary flex items-center justify-center relative`}
                    style={{ boxShadow: "2px 2px 0 0 var(--wd-shadow)" }}
                  >
                    <span
                      className="material-symbols-outlined text-2xl text-white"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {badge.icon}
                    </span>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-[2px] border-on-background flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-primary" style={{ fontSize: "12px" }}>
                        check
                      </span>
                    </span>
                  </div>
                  <span className="font-display text-[9px] font-bold text-center text-on-background tracking-wide max-w-[64px] leading-tight">
                    {badge.label}
                  </span>
                </button>
              );
            }
            return (
              <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                <div
                  className="w-14 h-14 rounded-full border-[3px] border-dashed border-on-background flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "20px" }}>
                    add
                  </span>
                </div>
                <span className="font-display text-[9px] font-bold text-center text-on-surface-variant tracking-wide max-w-[64px] leading-tight">
                  EMPTY
                </span>
              </div>
            );
          })}
        </div>
        <p className="font-sans text-xs text-on-surface-variant mt-3 leading-relaxed">
          Tap an earned badge below to feature it. Tap a featured badge to remove it.
          {featured.length >= MAX_FEATURED && (
            <span className="font-bold text-primary"> Remove one to add another.</span>
          )}
        </p>
      </div>

      {/* Badge collection by category */}
      <div className="flex items-center justify-between px-1">
        <h3 className="font-display text-sm font-bold text-on-background">Collection</h3>
        <span className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest">
          {earnedCount}/{totalCount} EARNED
        </span>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const categoryBadges = badges.filter((b) => b.category === category);
        const categoryEarned = categoryBadges.filter((b) => earned.has(b.id)).length;
        return (
          <section key={category} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h4 className="font-display text-[12px] font-bold text-on-surface-variant tracking-widest">
                {CATEGORY_LABELS[category].toUpperCase()}
              </h4>
              <span className="font-display text-[10px] font-bold text-primary">
                {categoryEarned}/{categoryBadges.length}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {categoryBadges.map((badge) => {
                const isEarned = earned.has(badge.id);
                const isFeatured = featured.includes(badge.id);
                const atMax = featured.length >= MAX_FEATURED;
                return (
                  <button
                    key={badge.id}
                    onClick={() => toggle(badge.id)}
                    disabled={!isEarned || (!isFeatured && atMax)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-[2px] transition-all text-left
                      ${isEarned
                        ? isFeatured
                          ? "bg-primary-container border-primary"
                          : atMax
                            ? "bg-surface-container border-on-background opacity-60"
                            : "bg-surface-container border-on-background hover:border-primary active:translate-x-[1px] active:translate-y-[1px]"
                        : "bg-surface-container border-on-background opacity-40 cursor-not-allowed"
                      }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full ${isEarned ? badge.color : "bg-surface-variant"} border-[2px] border-on-background flex items-center justify-center relative shrink-0`}
                      style={{ boxShadow: "2px 2px 0 0 var(--wd-shadow)" }}
                    >
                      <span
                        className="material-symbols-outlined text-xl"
                        style={{
                          color: isEarned ? "white" : "var(--color-on-surface-variant)",
                          fontVariationSettings: "'FILL' 1",
                        }}
                      >
                        {badge.icon}
                      </span>
                      {isFeatured && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-[1.5px] border-on-background flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-primary" style={{ fontSize: "10px" }}>
                            check
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 w-full">
                      <span className="font-display text-[10px] font-bold text-on-background tracking-wide leading-tight">
                        {badge.label}
                      </span>
                      <span className="font-sans text-[9px] text-on-surface-variant leading-tight">
                        {badge.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
