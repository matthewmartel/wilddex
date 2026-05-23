"use client";

import { useActionState, useEffect, useState } from "react";
import { deleteSighting, updateSighting } from "@/app/actions/sightings";
import { initialSightingActionState } from "@/app/scan/state";

const CONTINENTS = [
  "North America",
  "South America",
  "Europe",
  "Africa",
  "Asia",
  "Oceania",
  "Antarctica",
];

interface Props {
  sightingId: string;
  dexNumber: number;
  initial: {
    locationName: string;
    region: string;
    country: string;
    notes: string;
    isPublic: boolean;
  };
}

type View = "idle" | "editing" | "deleting";

export default function SightingActions({ sightingId, dexNumber, initial }: Props) {
  const [view, setView] = useState<View>("idle");
  const [editState, editAction, editPending] = useActionState(
    updateSighting,
    initialSightingActionState
  );

  useEffect(() => {
    if (editState.status === "success") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView("idle");
    }
  }, [editState.status]);

  if (view === "deleting") {
    return (
      <div className="mt-4 border-t-[2px] border-on-background pt-3 flex flex-col gap-3">
        <p className="font-sans text-sm text-on-surface-variant">
          Delete this sighting? The photo will be removed and this action cannot be undone.
        </p>
        <div className="flex gap-2">
          <form action={deleteSighting} className="flex-1">
            <input type="hidden" name="sighting_id" value={sightingId} />
            <input type="hidden" name="dex_number" value={dexNumber} />
            <button
              type="submit"
              className="w-full bg-error text-on-error font-display font-bold text-sm py-2 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active transition-all"
            >
              YES, DELETE
            </button>
          </form>
          <button
            onClick={() => setView("idle")}
            className="flex-1 bg-surface-container font-display font-bold text-sm py-2 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active transition-all text-on-surface"
          >
            CANCEL
          </button>
        </div>
      </div>
    );
  }

  if (view === "editing") {
    return (
      <form action={editAction} className="mt-4 border-t-[2px] border-on-background pt-3 flex flex-col gap-3">
        <input type="hidden" name="sighting_id" value={sightingId} />

        {editState.status === "error" && editState.message && (
          <p className="font-sans text-sm font-bold text-on-error-container bg-error-container border-[2px] border-on-background rounded-lg px-3 py-2">
            {editState.message}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest">
            LOCATION
          </label>
          <input
            name="location_name"
            type="text"
            required
            maxLength={160}
            defaultValue={initial.locationName}
            disabled={editPending}
            className="w-full bg-surface border-[3px] border-on-background rounded-xl px-4 py-3 font-sans text-on-surface focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest">
              CONTINENT
            </label>
            <select
              name="region"
              required
              defaultValue={initial.region}
              disabled={editPending}
              className="w-full bg-surface border-[3px] border-on-background rounded-xl px-3 py-3 font-sans text-on-surface focus:outline-none focus:border-primary transition-colors"
            >
              {CONTINENTS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest">
              COUNTRY
            </label>
            <input
              name="country"
              type="text"
              required
              maxLength={160}
              defaultValue={initial.country}
              disabled={editPending}
              className="w-full bg-surface border-[3px] border-on-background rounded-xl px-4 py-3 font-sans text-on-surface focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest">
            NOTES
          </label>
          <textarea
            name="notes"
            maxLength={500}
            rows={3}
            defaultValue={initial.notes}
            disabled={editPending}
            className="w-full bg-surface border-[3px] border-on-background rounded-xl px-4 py-3 font-sans text-on-surface focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        <label className="flex items-start gap-3 bg-surface border-[3px] border-on-background rounded-xl px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_public"
            defaultChecked={initial.isPublic}
            disabled={editPending}
            className="mt-1 w-5 h-5 accent-primary shrink-0"
          />
          <span className="flex flex-col gap-0.5">
            <span className="font-display text-sm font-bold text-on-background">
              Share with friends
            </span>
            <span className="font-sans text-xs text-on-surface-variant">
              When on, this sighting appears in your friends&apos; home feed.
              Location is fuzzed to ~1&nbsp;km.
            </span>
          </span>
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={editPending}
            className="flex-1 bg-primary text-on-primary font-display font-bold text-sm py-2 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active transition-all disabled:opacity-70"
          >
            {editPending ? "SAVING…" : "SAVE CHANGES"}
          </button>
          <button
            type="button"
            onClick={() => setView("idle")}
            disabled={editPending}
            className="flex-1 bg-surface-container font-display font-bold text-sm py-2 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active transition-all text-on-surface"
          >
            CANCEL
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-4 border-t-[2px] border-on-background pt-3 flex gap-2">
      <button
        onClick={() => setView("editing")}
        className="flex items-center gap-1.5 px-3 py-2 bg-surface-container border-[3px] border-on-background rounded-lg font-display font-bold text-sm text-on-surface hard-shadow-sm hard-shadow-active transition-all"
      >
        <span className="material-symbols-outlined text-base">edit</span>
        EDIT
      </button>
      <button
        onClick={() => setView("deleting")}
        className="flex items-center gap-1.5 px-3 py-2 bg-error-container border-[3px] border-on-background rounded-lg font-display font-bold text-sm text-on-error-container hard-shadow-sm hard-shadow-active transition-all"
      >
        <span className="material-symbols-outlined text-base">delete</span>
        DELETE
      </button>
    </div>
  );
}
