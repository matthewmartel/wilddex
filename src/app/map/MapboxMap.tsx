"use client";

import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapSighting } from "@/lib/supabase/queries";

interface MapboxMapProps {
  markers: (MapSighting & { latitude: number; longitude: number })[];
  compact?: boolean;
  initialCenter?: [number, number];
  initialZoom?: number;
}

const RARITY_COLORS: Record<string, string> = {
  Common: "#2c6956",
  Uncommon: "#3b656b",
  Rare: "#646027",
  "Very Rare": "#ba1a1a",
};

interface TimeStyle {
  mapStyle: string;
  cssFilter: string;
  overlay: string | null;
}

// new Date().getHours() is already in the browser's local timezone
function getTimeStyle(hour: number): TimeStyle {
  if (hour >= 21 || hour < 5) {
    return { mapStyle: "mapbox://styles/mapbox/dark-v11", cssFilter: "", overlay: null };
  }
  if (hour >= 18) {
    return { mapStyle: "mapbox://styles/mapbox/outdoors-v12", cssFilter: "", overlay: "rgba(180, 55, 10, 0.18)" };
  }
  if (hour < 7) {
    return { mapStyle: "mapbox://styles/mapbox/outdoors-v12", cssFilter: "", overlay: "rgba(230, 165, 45, 0.15)" };
  }
  return { mapStyle: "mapbox://styles/mapbox/outdoors-v12", cssFilter: "", overlay: null };
}

export default function MapboxMap({ markers, compact, initialCenter, initialZoom }: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ remove: () => void } | null>(null);
  const [timeStyle] = useState(() => getTimeStyle(new Date().getHours()));

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let alive = true;

    import("mapbox-gl").then((mod) => {
      const mapboxgl = mod.default;
      if (!alive || !containerRef.current || mapRef.current) return;

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      const first = markers[0];
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: timeStyle.mapStyle,
        center: initialCenter ?? (first ? [first.longitude, first.latitude] : [0, 20]),
        zoom: initialZoom ?? (first ? 8 : 1.5),
      });

      if (!compact) map.addControl(new mapboxgl.NavigationControl(), "top-right");

      markers.forEach((m) => {
        const accent = RARITY_COLORS[m.species_rarity] ?? RARITY_COLORS.Common;

        const el = document.createElement("div");
        el.innerHTML = `
          <div style="
            width:40px;height:40px;
            background:linear-gradient(135deg,#fcf9f8 60%,${accent}22 100%);
            border:3px solid #1b1c1c;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            display:flex;align-items:center;justify-content:center;
            box-shadow:3px 3px 0 #1b1c1c;
            cursor:pointer;
          ">
            <span style="transform:rotate(45deg);font-size:18px;line-height:1;display:block;">
              ${m.species_sprite}
            </span>
          </div>
        `;

        const dateStr = m.sighted_at
          ? new Date(m.sighted_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "";

        const popup = new mapboxgl.Popup({
          className: "wd-popup-wrapper",
          maxWidth: "220px",
          offset: 44,
        }).setHTML(`
          <div class="wd-popup">
            <span class="wd-popup-emoji">${m.species_sprite}</span>
            <strong class="wd-popup-name">${m.species_name}</strong>
            ${m.location_name ? `<span class="wd-popup-loc">📍 ${m.location_name}</span>` : ""}
            ${dateStr ? `<span class="wd-popup-date">${dateStr}</span>` : ""}
            <a href="/animal/${m.dex_number}" class="wd-popup-btn">VIEW ENTRY →</a>
          </div>
        `);

        new mapboxgl.Marker({ element: el })
          .setLngLat([m.longitude, m.latitude])
          .setPopup(popup)
          .addTo(map);
      });

      mapRef.current = map;
    });

    return () => {
      alive = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {timeStyle.overlay && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: timeStyle.overlay,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
