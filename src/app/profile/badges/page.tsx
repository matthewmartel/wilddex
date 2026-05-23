import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";
import { getUserStats, getCurrentUserIsAdmin } from "@/lib/supabase/queries";
import { ALL_BADGES, computeEarnedBadges } from "@/lib/badges";
import BadgeGrid from "./BadgeGrid";

export default async function BadgesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [stats, isAdmin] = user
    ? await Promise.all([getUserStats(), getCurrentUserIsAdmin()])
    : [null, false];
  const earnedIds = stats ? [...computeEarnedBadges(stats, isAdmin)] : [];
  const featuredIds: string[] =
    (user?.user_metadata?.featured_badge_ids as string[] | undefined) ?? [];

  const validFeaturedIds = featuredIds.filter((id) =>
    earnedIds.includes(id)
  );

  return (
    <div className="pb-28 min-h-screen bg-surface">
      <header className="bg-surface border-b-[3px] border-on-background relative flex items-center justify-center w-full px-4 h-16 sticky top-0 z-40">
        <Link
          href="/profile"
          className="absolute left-4 flex items-center gap-1 active:opacity-70"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            arrow_back
          </span>
        </Link>
        <div className="font-display text-[32px] font-extrabold text-primary tracking-tighter">
          WildDex
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 flex flex-col gap-4 mt-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-display text-2xl font-extrabold text-on-background">
            Badge Collection
          </h2>
          <p className="font-sans text-sm text-on-surface-variant">
            Select up to 4 badges to display on your profile.
          </p>
        </div>

        <BadgeGrid
          badges={ALL_BADGES}
          earnedIds={earnedIds}
          initialFeaturedIds={validFeaturedIds}
        />
      </main>

      <BottomNav />
    </div>
  );
}
