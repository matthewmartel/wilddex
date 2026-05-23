import type { Metadata } from "next";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import AppHeader from "@/components/AppHeader";
import ScanForm from "./ScanForm";
import { getSpeciesOptions } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Scan" };

function LoginPrompt() {
  return (
    <section className="bg-primary-container border-[3px] border-on-background rounded-lg p-5 hard-shadow text-center flex flex-col items-center gap-4">
      <span
        className="material-symbols-outlined text-primary text-6xl"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        lock
      </span>
      <div>
        <h2 className="font-display text-3xl font-extrabold text-primary tracking-tight">
          Log In To Scan
        </h2>
        <p className="font-sans text-sm text-on-primary-container mt-2 leading-relaxed">
          Field logs need an explorer profile before they can unlock your Dex.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full">
        <Link
          href="/login"
          className="bg-primary text-on-primary font-display font-bold text-base py-3 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active transition-all"
        >
          LOG IN
        </Link>
        <Link
          href="/signup"
          className="bg-surface text-on-background font-display font-bold text-base py-3 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active transition-all"
        >
          SIGN UP
        </Link>
      </div>
    </section>
  );
}

export default async function ScanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const species = user ? await getSpeciesOptions() : [];

  return (
    <div className="pb-28 min-h-screen bg-surface">
      <AppHeader />

      <main className={`max-w-md mx-auto p-4 flex flex-col gap-4 ${!user ? "min-h-[calc(100dvh-8rem)] justify-center" : ""}`}>
        {user ? <ScanForm species={species} /> : <LoginPrompt />}
      </main>

      <BottomNav />
    </div>
  );
}
