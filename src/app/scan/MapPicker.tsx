"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const MapPickerMap = dynamic(() => import("./MapPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-secondary-container">
      <p className="font-display text-sm font-bold text-on-surface-variant animate-pulse tracking-widest">
        LOADING MAP…
      </p>
    </div>
  ),
});

interface MapPickerProps {
  initialCoords?: { latitude: number; longitude: number } | null;
  onConfirm: (lat: number, lng: number) => void;
  onClose: () => void;
}

export default function MapPicker({ initialCoords, onConfirm, onClose }: MapPickerProps) {
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(
    initialCoords ? { lat: initialCoords.latitude, lng: initialCoords.longitude } : null
  );

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-surface">
      <div className="flex items-center justify-between px-4 h-14 border-b-[3px] border-on-background shrink-0 bg-surface">
        <button
          type="button"
          onClick={onClose}
          className="font-display text-sm font-bold text-on-surface-variant tracking-widest"
        >
          CANCEL
        </button>
        <span className="font-display text-base font-extrabold text-on-background tracking-tight">
          PIN LOCATION
        </span>
        <div className="w-16" />
      </div>

      <div className="flex-1 relative min-h-0">
        <MapPickerMap initialCoords={initialCoords} onPick={(lat, lng) => setPicked({ lat, lng })} />
        {!picked && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none z-10">
            <div className="bg-surface border-[3px] border-on-background rounded-lg px-4 py-2 hard-shadow mx-4">
              <p className="font-display text-sm font-bold text-on-surface text-center">
                TAP THE MAP TO DROP A PIN
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t-[3px] border-on-background shrink-0 bg-surface">
        {picked && (
          <p className="font-sans text-xs text-on-surface-variant text-center mb-3 tabular-nums">
            {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
          </p>
        )}
        <button
          type="button"
          disabled={!picked}
          onClick={() => picked && onConfirm(picked.lat, picked.lng)}
          className="w-full bg-primary text-on-primary font-display font-bold text-xl py-4 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          CONFIRM LOCATION
        </button>
      </div>
    </div>
  );
}
