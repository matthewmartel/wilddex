"use client";

import dynamic from "next/dynamic";
import type { MapSighting } from "@/lib/supabase/queries";

const MapboxMap = dynamic(() => import("./MapboxMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-secondary-container">
      <p className="font-display text-sm font-bold text-on-surface-variant animate-pulse tracking-widest">
        LOADING MAP…
      </p>
    </div>
  ),
});

interface MapCanvasProps {
  markers: (MapSighting & { latitude: number; longitude: number })[];
  compact?: boolean;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export default function MapCanvas({ markers, compact, initialCenter, initialZoom }: MapCanvasProps) {
  return <MapboxMap markers={markers} compact={compact} initialCenter={initialCenter} initialZoom={initialZoom} />;
}
