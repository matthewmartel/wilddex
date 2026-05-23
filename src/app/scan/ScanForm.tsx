"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { logSighting } from "@/app/actions/sightings";
import { initialSightingActionState } from "./state";
import type { SpeciesOption } from "@/lib/supabase/queries";
import MapPicker from "./MapPicker";

interface ScanFormProps {
  species: SpeciesOption[];
}

interface AICandidate {
  species_id: string;
  name: string;
  dex_number: number;
  number: string;
  confidence: number;
  sprite: string;
  type: string;
  rarity: string;
}

type AIState = "idle" | "identifying" | "results" | "no-match" | "error";

const continents = [
  "North America",
  "South America",
  "Europe",
  "Africa",
  "Asia",
  "Oceania",
  "Antarctica",
];

function getContinentFromCoords(lat: number, lng: number): string {
  if (lat < -60) return "Antarctica";
  if (lat >= -55 && lat <= 15 && lng >= -82 && lng <= -34) return "South America";
  if (lat >= 15 && lat <= 85 && lng >= -170 && lng <= -50) return "North America";
  if (lat >= -35 && lat <= 37 && lng >= -18 && lng <= 52) return "Africa";
  if (lat >= 35 && lat <= 72 && lng >= -25 && lng <= 45) return "Europe";
  if (lat >= -50 && lat <= 10 && lng >= 110 && lng <= 180) return "Oceania";
  if (lat >= 5 && lat <= 80 && lng >= 26 && lng <= 180) return "Asia";
  return "North America";
}

function confidenceColor(pct: number): string {
  if (pct >= 75) return "bg-primary text-on-primary";
  if (pct >= 45) return "bg-secondary text-on-secondary";
  return "bg-surface-variant text-on-surface-variant";
}

export default function ScanForm({ species }: ScanFormProps) {
  const [state, formAction, pending] = useActionState(
    logSighting,
    initialSightingActionState
  );

  // Manual picker state
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(
    species[0]?.id ?? ""
  );

  // Photo state
  const [photoName, setPhotoName] = useState("");
  const photoFileRef = useRef<File | null>(null);

  // GPS state
  const [gpsStatus, setGpsStatus] = useState<
    "idle" | "pending" | "captured" | "denied"
  >("idle");
  const [gpsCoords, setGpsCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [gpsSource, setGpsSource] = useState<"geolocation" | "map_pin" | null>(
    null
  );
  const [selectedContinent, setSelectedContinent] = useState("");

  // Map picker state
  const [showMapPicker, setShowMapPicker] = useState(false);

  // AI state
  const [aiState, setAiState] = useState<AIState>("idle");
  const [aiCandidates, setAiCandidates] = useState<AICandidate[]>([]);
  const [aiSelectedId, setAiSelectedId] = useState<string>("");
  const [useManualPicker, setUseManualPicker] = useState(false);

  const useAI = aiState === "results" && !useManualPicker;

  const selectedSpecies = useMemo(() => {
    if (useAI) {
      const c = aiCandidates.find((c) => c.species_id === aiSelectedId);
      if (c) {
        return {
          id: c.species_id,
          dexNumber: c.dex_number,
          number: c.number,
          name: c.name,
          sprite: c.sprite,
          type: c.type,
          rarity: c.rarity,
          region: "",
        } as SpeciesOption;
      }
    }
    return species.find((s) => s.id === selectedSpeciesId);
  }, [useAI, aiSelectedId, aiCandidates, selectedSpeciesId, species]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    photoFileRef.current = file;
    setPhotoName(file?.name ?? "");
    // Reset AI state when a new photo is selected
    setAiState("idle");
    setAiCandidates([]);
    setAiSelectedId("");
    setUseManualPicker(false);
  }

  function captureGps() {
    if (!navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }
    setGpsStatus("pending");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsCoords({ latitude, longitude });
        setSelectedContinent(getContinentFromCoords(latitude, longitude));
        setGpsStatus("captured");
        setGpsSource("geolocation");
      },
      () => setGpsStatus("denied")
    );
  }

  async function identifyWithAI() {
    const file = photoFileRef.current;
    if (!file) return;

    setAiState("identifying");
    setUseManualPicker(false);

    try {
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch("/api/identify", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const { candidates } = (await res.json()) as { candidates: AICandidate[] };

      if (!candidates?.length) {
        setAiState("no-match");
        return;
      }

      setAiCandidates(candidates);
      setAiSelectedId(candidates[0].species_id);
      setAiState("results");
    } catch {
      setAiState("error");
    }
  }

  if (!species.length) {
    return (
      <section className="bg-error-container border-[3px] border-on-background rounded-lg p-4 hard-shadow">
        <h2 className="font-display text-2xl font-extrabold text-on-error-container">
          Dex Link Offline
        </h2>
        <p className="font-sans text-sm text-on-error-container mt-2 leading-relaxed">
          The species table did not return any entries. Check the Supabase
          species read policy, then reload this page.
        </p>
      </section>
    );
  }

  function handleMapPickerConfirm(lat: number, lng: number) {
    setGpsCoords({ latitude: lat, longitude: lng });
    setSelectedContinent(getContinentFromCoords(lat, lng));
    setGpsStatus("captured");
    setGpsSource("map_pin");
    setShowMapPicker(false);
  }

  const isVerified = gpsSource === "geolocation";

  return (
    <>
    {showMapPicker && (
      <MapPicker
        initialCoords={gpsCoords}
        onConfirm={handleMapPickerConfirm}
        onClose={() => setShowMapPicker(false)}
      />
    )}
    <form action={formAction} className="flex flex-col gap-4">
      {/* Viewfinder */}
      <section className="bg-on-background border-[3px] border-on-background rounded-lg hard-shadow relative overflow-hidden p-4 min-h-48 flex flex-col items-center justify-center text-center">
        <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br" />

        {aiState === "identifying" ? (
          <>
            <span className="material-symbols-outlined text-primary text-5xl mb-2 animate-pulse">
              search
            </span>
            <p className="font-display text-xl font-extrabold text-primary-container">
              Identifying…
            </p>
            <p className="font-display text-[11px] font-bold text-surface-container-high tracking-widest mt-1">
              AI SCAN IN PROGRESS
            </p>
          </>
        ) : aiState === "results" ? (
          <>
            <span
              className="material-symbols-outlined text-primary text-5xl mb-2"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <p className="font-display text-xl font-extrabold text-primary-container">
              Match Found
            </p>
            <p className="font-display text-[11px] font-bold text-surface-container-high tracking-widest mt-1">
              {aiCandidates.length} CANDIDATE
              {aiCandidates.length !== 1 ? "S" : ""} RETURNED
            </p>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-surface-container-high text-7xl mb-2">
              photo_camera
            </span>
            <h2 className="font-display text-2xl font-extrabold text-primary-container">
              Field Log
            </h2>
            <p className="font-display text-[11px] font-bold text-surface-container-high tracking-widest mt-1">
              {photoName ? "PHOTO READY — IDENTIFY OR LOG MANUALLY" : "UPLOAD A PHOTO TO BEGIN"}
            </p>
          </>
        )}
      </section>

      {state.status === "error" && state.message && (
        <div className="bg-error-container border-[3px] border-on-background rounded-lg p-3 hard-shadow-sm">
          <p className="font-sans text-sm font-bold text-on-error-container">
            {state.message}
          </p>
        </div>
      )}

      <section className="bg-surface-container border-[3px] border-on-background rounded-lg p-4 hard-shadow flex flex-col gap-4">
        {/* Photo upload */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="photo"
              className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest"
            >
              PHOTO
            </label>
            <span className="font-display text-[10px] font-bold text-error tracking-widest">REQUIRED</span>
          </div>
          <label
            htmlFor="photo"
            className="bg-surface border-[3px] border-on-background rounded-xl px-4 py-4 flex items-center gap-3 cursor-pointer hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            <span className="material-symbols-outlined text-primary text-3xl">
              add_photo_alternate
            </span>
            <span className="font-sans text-sm font-bold text-on-surface truncate">
              {photoName || "Choose sighting photo"}
            </span>
          </label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            capture="environment"
            required
            disabled={pending}
            onChange={handlePhotoChange}
            className="sr-only"
          />
        </div>

        {/* AI identify button */}
        {photoName && aiState !== "identifying" && (
          <button
            type="button"
            disabled={pending}
            onClick={identifyWithAI}
            className="w-full flex items-center justify-center gap-2 bg-secondary text-on-secondary font-display font-bold text-sm py-3 rounded-xl border-[3px] border-on-background hard-shadow hard-shadow-active transition-all disabled:opacity-70"
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            {aiState === "results" ? "RE-IDENTIFY WITH AI" : "IDENTIFY WITH AI"}
          </button>
        )}

        {/* AI error / no-match feedback */}
        {(aiState === "error" || aiState === "no-match") && (
          <div className="bg-error-container border-[3px] border-on-background rounded-lg p-3 hard-shadow-sm">
            <p className="font-sans text-sm font-bold text-on-error-container">
              {aiState === "error"
                ? "AI identification failed. Pick the species manually below."
                : "No confident match found. Pick the species manually below."}
            </p>
          </div>
        )}

        {/* AI candidates */}
        {aiState === "results" && !useManualPicker && (
          <div className="flex flex-col gap-2">
            <span className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest">
              AI MATCHES — SELECT THE CORRECT SPECIES
            </span>
            {aiCandidates.map((candidate) => (
              <label key={candidate.species_id} className="cursor-pointer block">
                <input
                  type="radio"
                  name="_ai_candidate"
                  className="sr-only"
                  checked={aiSelectedId === candidate.species_id}
                  onChange={() => setAiSelectedId(candidate.species_id)}
                />
                <div
                  className={`rounded-lg border-[3px] border-on-background p-2 flex items-center gap-3 transition-all ${
                    aiSelectedId === candidate.species_id
                      ? "bg-primary-container shadow-[4px_4px_0_0_rgba(27,28,28,1)] -translate-y-[2px] -translate-x-[2px]"
                      : "bg-surface shadow-[2px_2px_0_0_rgba(27,28,28,1)] hover:bg-surface-container"
                  }`}
                >
                  <div className="w-14 h-14 shrink-0 bg-secondary-container rounded-md border-[2px] border-on-background flex items-center justify-center text-3xl">
                    {candidate.sprite}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <p className="font-display text-base font-bold text-on-surface truncate">
                        #{candidate.number} {candidate.name}
                      </p>
                      <span
                        className={`${confidenceColor(candidate.confidence)} px-1.5 py-0.5 rounded font-display text-[10px] font-bold shrink-0 border border-on-background tracking-wider`}
                      >
                        {candidate.confidence}%
                      </span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <span className="bg-tertiary text-on-tertiary px-2 py-0.5 rounded-full border border-on-background font-display text-[10px] font-bold">
                        {candidate.type.toUpperCase()}
                      </span>
                      <span className="bg-surface text-on-surface px-2 py-0.5 rounded-full border border-on-background font-display text-[10px] font-bold">
                        {candidate.rarity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-[3px] border-on-background bg-surface flex items-center justify-center shrink-0">
                    {aiSelectedId === candidate.species_id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              </label>
            ))}
            <button
              type="button"
              onClick={() => setUseManualPicker(true)}
              className="text-on-surface-variant font-display text-[11px] font-bold tracking-widest underline underline-offset-2 text-left mt-1"
            >
              NONE OF THESE — PICK MANUALLY
            </button>
          </div>
        )}

        {/* Species field: hidden when AI mode is active, visible for manual */}
        {useAI && (
          <input type="hidden" name="species_id" value={aiSelectedId} />
        )}

        {(!useAI || aiState !== "results") && (
          <div>
            {useManualPicker && (
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest">
                  MANUAL SPECIES SELECTION
                </span>
                <button
                  type="button"
                  onClick={() => setUseManualPicker(false)}
                  className="font-display text-[11px] font-bold text-primary tracking-widest underline underline-offset-2"
                >
                  ← BACK TO AI RESULTS
                </button>
              </div>
            )}
            <div className="flex flex-col gap-1">
              {!useManualPicker && (
                <label
                  htmlFor="species_id"
                  className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest"
                >
                  SPECIES
                </label>
              )}
              <select
                id="species_id"
                name={useAI ? "_species_id_ignored" : "species_id"}
                required={!useAI}
                value={selectedSpeciesId}
                disabled={pending}
                onChange={(e) => setSelectedSpeciesId(e.target.value)}
                className="w-full bg-surface border-[3px] border-on-background rounded-xl px-3 py-3 font-display text-sm font-bold text-on-surface focus:outline-none focus:border-primary transition-colors"
              >
                {species.map((item) => (
                  <option key={item.id} value={item.id}>
                    #{item.number} {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Selected species preview card */}
        {selectedSpecies && (
          <div className="bg-surface border-[3px] border-on-background rounded-lg p-3 flex items-center gap-3">
            <div className="w-16 h-16 bg-secondary-container border-[2px] border-on-background rounded-md flex items-center justify-center text-4xl shrink-0">
              {selectedSpecies.sprite}
            </div>
            <div className="min-w-0">
              <p className="font-display text-lg font-extrabold text-on-background truncate">
                {selectedSpecies.name}
              </p>
              <p className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest">
                {selectedSpecies.type.toUpperCase()} /{" "}
                {selectedSpecies.rarity.toUpperCase()}
              </p>
            </div>
          </div>
        )}

        {/* Location fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="location_name"
              className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest"
            >
              LOCATION
            </label>
            <input
              id="location_name"
              name="location_name"
              type="text"
              required
              maxLength={160}
              disabled={pending}
              placeholder="North trail"
              className="w-full bg-surface border-[3px] border-on-background rounded-xl px-4 py-3 font-sans text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="region"
              className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest"
            >
              CONTINENT
            </label>
            <select
              id="region"
              name="region"
              required
              value={selectedContinent}
              disabled={pending}
              onChange={(e) => setSelectedContinent(e.target.value)}
              className="w-full bg-surface border-[3px] border-on-background rounded-xl px-4 py-3 font-sans text-on-surface focus:outline-none focus:border-primary transition-colors"
            >
              <option value="" disabled>
                Select continent…
              </option>
              {continents.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="country"
            className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest"
          >
            COUNTRY
          </label>
          <input
            id="country"
            name="country"
            type="text"
            required
            maxLength={160}
            disabled={pending}
            placeholder="United States"
            className="w-full bg-surface border-[3px] border-on-background rounded-xl px-4 py-3 font-sans text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* GPS */}
        <div className="flex flex-col gap-1">
          <span className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest">
            GPS LOCATION
          </span>
          <div className="flex flex-col gap-2">
            {/* GPS — primary action */}
            <button
              type="button"
              disabled={pending || gpsStatus === "pending"}
              onClick={captureGps}
              className={`w-full flex items-center justify-center gap-2 px-3 py-3 border-[3px] border-on-background rounded-xl font-display font-bold text-sm tracking-widest transition-all hard-shadow hard-shadow-active
                ${gpsStatus === "captured" ? "bg-primary-container text-on-primary-container" : ""}
                ${gpsStatus === "denied" ? "bg-error-container text-on-error-container" : ""}
                ${gpsStatus === "idle" || gpsStatus === "pending" ? "bg-primary text-on-primary" : ""}
              `}
            >
              <span
                className="material-symbols-outlined text-xl shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {gpsStatus === "captured" ? "location_on" : gpsStatus === "denied" ? "location_off" : "my_location"}
              </span>
              <span className="truncate">
                {gpsStatus === "idle" && "USE MY GPS LOCATION"}
                {gpsStatus === "pending" && "LOCATING…"}
                {gpsStatus === "captured" && "GPS CAPTURED"}
                {gpsStatus === "denied" && "GPS UNAVAILABLE"}
              </span>
            </button>
            {/* Pin on Map — secondary */}
            <button
              type="button"
              disabled={pending}
              onClick={() => setShowMapPicker(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border-[3px] border-on-background rounded-xl font-sans text-sm font-bold transition-all hard-shadow-sm hard-shadow-active bg-surface text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                pin_drop
              </span>
              <span className="truncate">Pin on Map instead</span>
            </button>
          </div>
          {gpsCoords && (
            <>
              <input type="hidden" name="latitude" value={gpsCoords.latitude} />
              <input type="hidden" name="longitude" value={gpsCoords.longitude} />
              <input
                type="hidden"
                name="gps_verified"
                value={isVerified ? "true" : "false"}
              />
              <div className="flex items-center justify-between gap-2 mt-1">
                <p className="font-sans text-[11px] text-on-surface-variant tabular-nums">
                  {gpsCoords.latitude.toFixed(5)}, {gpsCoords.longitude.toFixed(5)}
                </p>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border-[2px] border-on-background font-display text-[10px] font-bold tracking-widest ${
                    isVerified
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-surface text-on-surface-variant"
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "12px", fontVariationSettings: "'FILL' 1" }}
                  >
                    {isVerified ? "verified" : "info"}
                  </span>
                  {isVerified ? "GPS VERIFIED" : "UNVERIFIED"}
                </span>
              </div>
              {!isVerified && (
                <p className="font-sans text-[11px] text-on-surface-variant leading-snug mt-1">
                  Manually-pinned sightings won&apos;t count toward quest progress.
                  Use <span className="font-bold">USE MY GPS LOCATION</span> in the
                  field to log a verified sighting.
                </p>
              )}
            </>
          )}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="notes"
            className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest"
          >
            NOTES
          </label>
          <textarea
            id="notes"
            name="notes"
            maxLength={500}
            rows={4}
            disabled={pending}
            placeholder="Tracks, behavior, weather..."
            className="w-full bg-surface border-[3px] border-on-background rounded-xl px-4 py-3 font-sans text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={pending || aiState === "identifying"}
        className="w-full bg-primary text-on-primary font-display font-bold text-xl py-4 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {pending ? "UPLOADING..." : "LOG SIGHTING"}
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {pending ? "hourglass_top" : "check_circle"}
        </span>
      </button>

      <p className="sr-only" aria-live="polite">
        {pending ? "Uploading sighting." : state.message ?? ""}
      </p>
    </form>
    </>
  );
}
