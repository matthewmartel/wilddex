"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="absolute left-4 flex items-center gap-1 font-display text-[11px] font-bold text-on-surface-variant tracking-widest active:opacity-70"
      aria-label="Go back"
    >
      <span className="material-symbols-outlined text-[22px]">arrow_back</span>
      <span className="hidden sm:inline">BACK</span>
    </button>
  );
}
