"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);

  return (
    <div className="pb-28 min-h-screen bg-surface">
      {/* Header */}
      <header className="flex justify-between items-center w-full px-4 h-16 bg-surface border-b-[3px] border-on-background sticky top-0 z-40">
        <span className="material-symbols-outlined text-primary">
          battery_charging_full
        </span>
        <h1 className="font-display text-[32px] font-extrabold text-primary tracking-tighter">
          WildDex
        </h1>
        <span className="material-symbols-outlined text-primary">
          signal_cellular_alt
        </span>
      </header>

      <main className="max-w-md mx-auto p-4 flex flex-col gap-4">
        <h2 className="font-display text-2xl font-bold text-on-background">
          Scan Animal
        </h2>

        {/* Viewfinder */}
        <div className="w-full aspect-square bg-on-background border-[3px] border-on-background rounded-lg hard-shadow relative overflow-hidden flex items-center justify-center">
          {scanning ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 border-4 border-primary rounded-full animate-spin border-t-transparent" />
              <span className="font-display text-surface-container-high font-bold tracking-widest text-sm">
                SCANNING...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-surface-container-high text-8xl">
                photo_camera
              </span>
              <span className="font-display text-on-surface-variant font-bold tracking-wider text-sm">
                TAP BELOW TO SCAN
              </span>
            </div>
          )}

          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br" />
        </div>

        {/* Shutter / scan button */}
        <div className="flex justify-center items-center py-4">
          <Link href={scanning ? "/confirm" : "#"}>
            <button
              onClick={() => setScanning(true)}
              className="w-24 h-24 rounded-full border-[3px] border-on-background hard-shadow hard-shadow-active flex items-center justify-center transition-all relative"
              style={{
                background: "linear-gradient(180deg, #404945 0%, #1b1c1c 100%)",
              }}
            >
              <div className="absolute inset-2 border-2 border-white/20 rounded-full pointer-events-none" />
            </button>
          </Link>
        </div>

        {/* OR divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[3px] bg-on-background" />
          <span className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest">
            OR
          </span>
          <div className="flex-1 h-[3px] bg-on-background" />
        </div>

        <button className="w-full bg-surface-container-high text-on-background font-display font-bold text-xl py-4 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active flex items-center justify-center gap-3 transition-all">
          <span className="material-symbols-outlined">upload</span>
          UPLOAD PHOTO
        </button>

        {/* Tip */}
        <div className="bg-primary-container border-[3px] border-on-background rounded-lg p-4 hard-shadow">
          <p className="font-sans text-sm text-on-background leading-relaxed">
            <strong className="font-display font-bold">Pro tip:</strong> Get
            within 3 metres of the animal and ensure good lighting for the best
            results.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
