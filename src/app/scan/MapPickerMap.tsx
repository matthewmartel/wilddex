"use client";

import { useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapPickerMapProps {
  initialCoords?: { latitude: number; longitude: number } | null;
  onPick: (lat: number, lng: number) => void;
}

export default function MapPickerMap({ initialCoords, onPick }: MapPickerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ remove: () => void } | null>(null);
  const markerRef = useRef<{ setLngLat: (lngLat: [number, number]) => void } | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let alive = true;

    import("mapbox-gl").then((mod) => {
      const mapboxgl = mod.default;
      if (!alive || !containerRef.current || mapRef.current) return;

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      const center: [number, number] = initialCoords
        ? [initialCoords.longitude, initialCoords.latitude]
        : [0, 20];

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center,
        zoom: initialCoords ? 8 : 1.5,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      const placeMarker = (lng: number, lat: number) => {
        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
        } else {
          const marker = new mapboxgl.Marker({ color: "#2c6956", draggable: true })
            .setLngLat([lng, lat])
            .addTo(map);
          marker.on("dragend", () => {
            const pos = marker.getLngLat();
            onPick(pos.lat, pos.lng);
          });
          markerRef.current = marker;
        }
        onPick(lat, lng);
      };

      if (initialCoords) {
        placeMarker(initialCoords.longitude, initialCoords.latitude);
      }

      map.on("click", (e) => {
        placeMarker(e.lngLat.lng, e.lngLat.lat);
      });

      mapRef.current = map;
    });

    return () => {
      alive = false;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
