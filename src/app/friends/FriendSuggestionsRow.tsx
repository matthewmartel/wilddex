"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  sendFriendRequestById,
  type FriendshipState,
} from "@/app/actions/friends";
import type { FriendSuggestion } from "@/lib/supabase/queries";

interface FriendSuggestionsRowProps {
  suggestions: FriendSuggestion[];
}

export default function FriendSuggestionsRow({
  suggestions,
}: FriendSuggestionsRowProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = suggestions.filter((s) => !dismissed.has(s.id));

  if (visible.length === 0) return null;

  return (
    <section className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow flex flex-col gap-3">
      <h2 className="font-display text-[12px] font-bold text-on-surface-variant tracking-widest">
        PEOPLE YOU MAY KNOW
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x snap-mandatory">
        {visible.map((s) => (
          <SuggestionCard
            key={s.id}
            suggestion={s}
            onDismiss={() =>
              setDismissed((d) => {
                const next = new Set(d);
                next.add(s.id);
                return next;
              })
            }
          />
        ))}
      </div>
    </section>
  );
}

interface SuggestionCardProps {
  suggestion: FriendSuggestion;
  onDismiss: () => void;
}

function SuggestionCard({ suggestion, onDismiss }: SuggestionCardProps) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<FriendshipState>("none");
  const display =
    suggestion.display_name?.trim() || suggestion.username;

  function handleAdd() {
    startTransition(async () => {
      const result = await sendFriendRequestById(suggestion.id);
      if (!result.error) setState(result.state);
    });
  }

  const buttonLabel =
    state === "pending_outgoing"
      ? "REQUESTED"
      : state === "friends"
      ? "FRIENDS"
      : pending
      ? "…"
      : "+ ADD";

  const buttonClasses =
    state === "pending_outgoing" || state === "friends"
      ? "bg-surface text-on-background"
      : "bg-primary text-on-primary";

  return (
    <article className="snap-start shrink-0 w-36 bg-surface border-[3px] border-on-background rounded-lg hard-shadow flex flex-col items-center p-3 gap-2 relative">
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss suggestion"
        className="absolute top-1 right-1 w-6 h-6 bg-surface-container border-[2px] border-on-background rounded-full flex items-center justify-center"
      >
        <span
          className="material-symbols-outlined text-on-surface-variant"
          style={{ fontSize: "14px" }}
        >
          close
        </span>
      </button>
      <Link
        href={`/u/${suggestion.username}`}
        className="flex flex-col items-center gap-1 w-full"
      >
        <div className="h-14 w-14 overflow-hidden rounded-xl border-[3px] border-on-background bg-primary flex items-center justify-center text-2xl">
          {suggestion.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={suggestion.avatar_url}
              alt={display}
              className="w-full h-full object-cover"
            />
          ) : (
            "🧭"
          )}
        </div>
        <p className="font-display text-sm font-bold text-on-background text-center truncate w-full">
          {display}
        </p>
      </Link>
      <p className="font-sans text-[10px] text-on-surface-variant text-center">
        {suggestion.mutual_count} mutual
        {suggestion.mutual_count === 1 ? "" : "s"}
      </p>
      <button
        type="button"
        disabled={pending || state !== "none"}
        onClick={handleAdd}
        className={`${buttonClasses} font-display font-bold text-[11px] tracking-widest w-full py-1.5 rounded-lg border-[3px] border-on-background hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] transition-all disabled:opacity-80`}
      >
        {buttonLabel}
      </button>
    </article>
  );
}
