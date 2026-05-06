"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const matches = [
  { name: "Red Fox", pct: 94, type: "MAMMAL", rarity: "RARE", emoji: "🦊" },
  { name: "Arctic Fox", pct: 61, type: "MAMMAL", rarity: "RARE", emoji: "🦊" },
  { name: "Fennec Fox", pct: 22, type: "MAMMAL", rarity: "VERY RARE", emoji: "🦊" },
];

export default function ConfirmPage() {
  const [selected, setSelected] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <div className="pb-28 min-h-screen bg-surface flex flex-col items-center justify-center p-4 gap-6">
        <div className="text-9xl animate-bounce">{matches[selected].emoji}</div>
        <div className="bg-primary-container border-[3px] border-on-background rounded-lg p-6 hard-shadow text-center max-w-sm w-full">
          <h2 className="font-display text-[32px] font-extrabold text-primary mb-2">
            LOGGED!
          </h2>
          <p className="font-sans text-on-background">
            {matches[selected].name} added to your WildDex!
          </p>
        </div>
        <Link href="/dex">
          <button className="bg-primary text-on-primary font-display font-bold text-xl px-8 py-4 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active transition-all">
            VIEW IN DEX →
          </button>
        </Link>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <header className="flex justify-between items-center w-full px-4 h-16 bg-surface border-b-[3px] border-on-background shrink-0 z-40">
        <Link href="/scan" className="text-primary active:opacity-70">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            arrow_back
          </span>
        </Link>
        <h1 className="font-display text-[32px] font-extrabold text-primary tracking-tighter">
          WildDex
        </h1>
        <div className="w-6" />
      </header>

      <main className="flex flex-col flex-1 overflow-hidden">
        {/* Photo + question */}
        <div className="flex items-center gap-4 p-4 border-b-[3px] border-on-background shrink-0">
          <div className="w-24 h-24 shrink-0 bg-secondary-container rounded-lg border-[3px] border-on-background hard-shadow flex items-center justify-center text-5xl overflow-hidden">
            🌿
          </div>
          <div className="bg-surface-container-high flex-1 p-3 rounded-lg border-[3px] border-on-background shadow-[2px_2px_0_0_rgba(27,28,28,1)] relative self-center">
            <p className="font-display text-lg font-bold text-on-surface leading-tight">
              Is this the animal you found?
            </p>
            {/* Arrow pointing left */}
            <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-3 h-3 bg-surface-container-high border-b-[3px] border-l-[3px] border-on-background rotate-45" />
          </div>
        </div>

        {/* Match options */}
        <div className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto">
          {matches.map((match, i) => (
            <label key={match.name} className="cursor-pointer block">
              <input
                type="radio"
                name="animal_match"
                className="sr-only peer"
                checked={selected === i}
                onChange={() => setSelected(i)}
              />
              <div
                className={`rounded-lg border-[3px] border-on-background p-2 flex items-center gap-3 transition-all ${
                  selected === i
                    ? "bg-primary-container shadow-[4px_4px_0_0_rgba(27,28,28,1)] -translate-y-[2px] -translate-x-[2px]"
                    : "bg-surface-container shadow-[2px_2px_0_0_rgba(27,28,28,1)] hover:bg-surface-container-high"
                }`}
              >
                {/* Sprite */}
                <div className="w-16 h-16 shrink-0 bg-white rounded-md border-[2px] border-on-background overflow-hidden flex items-center justify-center text-4xl">
                  {match.emoji}
                </div>
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-display text-lg font-bold text-on-surface truncate pr-2">
                      {match.name}
                    </h3>
                    <span className="bg-secondary text-on-secondary px-1 py-0.5 rounded font-display text-[10px] font-bold shrink-0 border border-on-background tracking-wider">
                      {match.pct}% MATCH
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <span className="bg-tertiary text-on-tertiary px-2 py-0.5 rounded-full border border-on-background font-display text-[10px] font-bold">
                      {match.type}
                    </span>
                    <span className="bg-surface text-on-surface px-2 py-0.5 rounded-full border border-on-background font-display text-[10px] font-bold">
                      {match.rarity}
                    </span>
                  </div>
                </div>
                {/* Radio indicator */}
                <div className="w-5 h-5 rounded-full border-[3px] border-on-background bg-surface flex items-center justify-center shrink-0">
                  {selected === i && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 p-4 bg-surface border-t-[3px] border-on-background shrink-0 pb-28">
          <Link href="/scan" className="flex-1">
            <button className="w-full bg-error-container text-on-error-container font-display font-bold text-lg py-3 px-2 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active transition-all flex items-center justify-center gap-2">
              <span
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                replay
              </span>
              RETRY
            </button>
          </Link>
          <button
            onClick={() => setConfirmed(true)}
            className="flex-1 bg-primary text-on-primary font-display font-bold text-lg py-3 px-2 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active transition-all flex items-center justify-center gap-2"
          >
            CONFIRM
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
