import type { Metadata } from "next";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import BackButton from "@/app/animal/[id]/BackButton";
import {
  getNotifications,
  type NotificationItem,
} from "@/lib/supabase/queries";
import { ALL_BADGES } from "@/lib/badges";

export const metadata: Metadata = { title: "Notifications" };

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
}

export default async function NotificationsPage() {
  const items = await getNotifications();

  return (
    <div className="min-h-screen bg-surface pb-28">
      <AppHeader left={<BackButton />} />

      <main className="mx-auto flex w-full max-w-md flex-col gap-3 px-4 py-4">
        <h1 className="font-display text-3xl font-extrabold text-on-background px-1">
          Notifications
        </h1>

        {items.length === 0 ? (
          <section className="bg-surface-container border-[3px] border-on-background rounded-xl p-6 hard-shadow flex flex-col items-center gap-3 text-center mt-4">
            <span
              className="material-symbols-outlined text-outline text-5xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              notifications_none
            </span>
            <p className="font-display font-bold text-on-surface-variant">
              Nothing here yet.
            </p>
            <p className="font-sans text-sm text-on-surface-variant max-w-xs">
              Friend requests, rare sightings from friends, and your quest
              completions will show up here.
            </p>
          </section>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item, i) => (
              <li key={`${item.kind}-${item.created_at}-${i}`}>
                <NotificationRow item={item} />
              </li>
            ))}
          </ul>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function NotificationRow({ item }: { item: NotificationItem }) {
  if (item.kind === "friend_request") {
    const display = item.from.display_name?.trim() || item.from.username;
    return (
      <Link
        href="/friends"
        className="flex items-center gap-3 bg-primary-container border-[3px] border-on-background rounded-xl p-3 hard-shadow-sm"
      >
        <Avatar profile={item.from} />
        <div className="min-w-0 flex-1">
          <p className="font-sans text-sm text-on-primary-container">
            <span className="font-bold">{display}</span> sent you a friend request.
          </p>
          <p className="font-display text-[10px] font-bold text-on-surface-variant tracking-widest mt-0.5">
            {timeAgo(item.created_at)} · TAP TO REVIEW
          </p>
        </div>
        <span
          className="material-symbols-outlined text-primary text-2xl shrink-0"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          person_add
        </span>
      </Link>
    );
  }

  if (item.kind === "friend_accepted") {
    const display = item.friend.display_name?.trim() || item.friend.username;
    return (
      <Link
        href={`/u/${item.friend.username}`}
        className="flex items-center gap-3 bg-surface-container border-[3px] border-on-background rounded-xl p-3 hard-shadow-sm"
      >
        <Avatar profile={item.friend} />
        <div className="min-w-0 flex-1">
          <p className="font-sans text-sm text-on-background">
            <span className="font-bold">{display}</span> accepted your friend request.
          </p>
          <p className="font-display text-[10px] font-bold text-on-surface-variant tracking-widest mt-0.5">
            {timeAgo(item.created_at)}
          </p>
        </div>
        <span
          className="material-symbols-outlined text-primary text-2xl shrink-0"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          group
        </span>
      </Link>
    );
  }

  if (item.kind === "friend_sighting") {
    const display = item.friend.display_name?.trim() || item.friend.username;
    return (
      <Link
        href={`/animal/${item.dex_number}`}
        className="flex items-center gap-3 bg-tertiary-container border-[3px] border-on-background rounded-xl p-3 hard-shadow-sm"
      >
        <div className="h-10 w-10 shrink-0 bg-surface border-[3px] border-on-background rounded-xl flex items-center justify-center text-xl">
          {item.species_sprite}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-sans text-sm text-on-tertiary-container">
            <span className="font-bold">{display}</span> logged a{" "}
            <span className="font-bold">{item.rarity.toLowerCase()}</span>{" "}
            <span className="font-bold">{item.species_name}</span>.
          </p>
          <p className="font-display text-[10px] font-bold text-on-surface-variant tracking-widest mt-0.5">
            {timeAgo(item.created_at)}
          </p>
        </div>
        <span
          className="material-symbols-outlined text-tertiary text-2xl shrink-0"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      </Link>
    );
  }

  // quest_completed
  const reward = item.reward_badge_id
    ? ALL_BADGES.find((b) => b.id === item.reward_badge_id)
    : null;
  return (
    <Link
      href="/quests"
      className="flex items-center gap-3 bg-secondary-container border-[3px] border-on-background rounded-xl p-3 hard-shadow-sm"
    >
      <div className="h-10 w-10 shrink-0 bg-surface border-[3px] border-on-background rounded-xl flex items-center justify-center">
        <span
          className="material-symbols-outlined text-secondary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          flag
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-sans text-sm text-on-secondary-container">
          You completed <span className="font-bold">{item.quest_name}</span>.
        </p>
        <p className="font-display text-[10px] font-bold text-on-surface-variant tracking-widest mt-0.5">
          {timeAgo(item.created_at)}
          {reward && ` · BADGE: ${reward.label.toUpperCase()}`}
        </p>
      </div>
      <span
        className="material-symbols-outlined text-secondary text-2xl shrink-0"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        emoji_events
      </span>
    </Link>
  );
}

function Avatar({
  profile,
}: {
  profile: { username: string; display_name: string | null; avatar_url: string | null };
}) {
  const display = profile.display_name?.trim() || profile.username;
  return (
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border-[3px] border-on-background bg-primary flex items-center justify-center text-lg">
      {profile.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatar_url}
          alt={display}
          className="w-full h-full object-cover"
        />
      ) : (
        "🧭"
      )}
    </div>
  );
}
