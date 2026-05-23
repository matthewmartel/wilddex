"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  acceptFriendRequest,
  cancelOutgoingRequest,
  searchFriendCandidates,
  sendFriendRequestById,
  type FriendCandidate,
  type FriendshipState,
} from "@/app/actions/friends";

const STORAGE_KEY = "wd-recent-friend-searches";
const MAX_RECENT = 5;
const DEBOUNCE_MS = 250;

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((s): s is string => typeof s === "string").slice(0, MAX_RECENT)
      : [];
  } catch {
    return [];
  }
}

function saveRecent(username: string) {
  if (typeof window === "undefined") return;
  const current = loadRecent().filter((u) => u !== username);
  const next = [username, ...current].slice(0, MAX_RECENT);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota errors
  }
}

export default function FriendSearchPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FriendCandidate[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const requestSeqRef = useRef(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(loadRecent());
  }, []);

  useEffect(() => {
    const trimmed = query.trim().replace(/^@/, "");
    if (trimmed.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const seq = ++requestSeqRef.current;
    const timer = setTimeout(async () => {
      const found = await searchFriendCandidates(trimmed);
      if (seq === requestSeqRef.current) {
        setResults(found);
        setSearching(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  function patchResult(id: string, state: FriendshipState) {
    setResults((rs) => rs.map((r) => (r.id === id ? { ...r, state } : r)));
  }

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor="friend-search"
        className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest"
      >
        FIND FRIENDS
      </label>
      <div className="relative">
        <span
          className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
          style={{ fontSize: "20px" }}
        >
          search
        </span>
        <input
          id="friend-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder="@username"
          className="w-full bg-surface border-[3px] border-on-background rounded-xl pl-10 pr-10 py-3 font-sans text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear"
            className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            style={{ fontSize: "20px" }}
          >
            close
          </button>
        )}
      </div>

      {query.trim().length < 2 && recent.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-display text-[10px] font-bold text-on-surface-variant tracking-widest">
            RECENT
          </p>
          <div className="flex flex-wrap gap-2">
            {recent.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setQuery(u)}
                className="px-3 py-1.5 bg-surface border-[2px] border-on-background rounded-full font-sans text-xs font-bold text-on-background hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
              >
                @{u}
              </button>
            ))}
          </div>
        </div>
      )}

      {searching && (
        <p className="font-sans text-sm text-on-surface-variant">Searching…</p>
      )}

      {!searching && query.trim().length >= 2 && results.length === 0 && (
        <p className="font-sans text-sm text-on-surface-variant">
          No one found matching <span className="font-bold">@{query.trim().replace(/^@/, "")}</span>.
        </p>
      )}

      {results.length > 0 && (
        <ul className="flex flex-col gap-2">
          {results.map((r) => (
            <ResultRow
              key={r.id}
              candidate={r}
              onStateChange={(state) => patchResult(r.id, state)}
              onAddSuccess={() => {
                saveRecent(r.username);
                setRecent(loadRecent());
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface ResultRowProps {
  candidate: FriendCandidate;
  onStateChange: (state: FriendshipState) => void;
  onAddSuccess: () => void;
}

function ResultRow({ candidate, onStateChange, onAddSuccess }: ResultRowProps) {
  const [pending, startTransition] = useTransition();
  const display = candidate.display_name?.trim() || candidate.username;

  function handleAdd() {
    startTransition(async () => {
      const result = await sendFriendRequestById(candidate.id);
      if (result.error) return;
      onStateChange(result.state);
      if (result.state === "pending_outgoing" || result.state === "friends") {
        onAddSuccess();
      }
    });
  }

  function handleAccept() {
    startTransition(async () => {
      await acceptFriendRequest(candidate.id);
      onStateChange("friends");
      onAddSuccess();
    });
  }

  function handleCancel() {
    startTransition(async () => {
      await cancelOutgoingRequest(candidate.id);
      onStateChange("none");
    });
  }

  return (
    <li className="flex items-center gap-3 bg-surface border-[3px] border-on-background rounded-xl p-2 hard-shadow-sm">
      <Link
        href={`/u/${candidate.username}`}
        className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border-[2px] border-on-background bg-primary flex items-center justify-center text-lg"
      >
        {candidate.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={candidate.avatar_url}
            alt={display}
            className="w-full h-full object-cover"
          />
        ) : (
          "🧭"
        )}
      </Link>
      <Link
        href={`/u/${candidate.username}`}
        className="min-w-0 flex-1"
      >
        <p className="truncate font-display text-sm font-bold text-on-background">
          {display}
        </p>
        {candidate.display_name && (
          <p className="truncate font-sans text-xs text-on-surface-variant">
            @{candidate.username}
          </p>
        )}
      </Link>
      <StateButton
        state={candidate.state}
        pending={pending}
        onAdd={handleAdd}
        onAccept={handleAccept}
        onCancel={handleCancel}
      />
    </li>
  );
}

interface StateButtonProps {
  state: FriendshipState;
  pending: boolean;
  onAdd: () => void;
  onAccept: () => void;
  onCancel: () => void;
}

function StateButton({
  state,
  pending,
  onAdd,
  onAccept,
  onCancel,
}: StateButtonProps) {
  const base =
    "shrink-0 font-display font-bold text-xs px-3 py-2 rounded-lg border-[3px] border-on-background hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] transition-all disabled:opacity-70";

  if (state === "friends") {
    return (
      <span
        className={`${base} bg-primary-container text-on-primary-container flex items-center gap-1`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
          check
        </span>
        FRIENDS
      </span>
    );
  }

  if (state === "pending_outgoing") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={onCancel}
        className={`${base} bg-surface text-on-background`}
      >
        {pending ? "…" : "CANCEL"}
      </button>
    );
  }

  if (state === "pending_incoming") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={onAccept}
        className={`${base} bg-primary text-on-primary`}
      >
        {pending ? "…" : "ACCEPT"}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={onAdd}
      className={`${base} bg-primary text-on-primary flex items-center gap-1`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
        person_add
      </span>
      {pending ? "…" : "ADD"}
    </button>
  );
}
