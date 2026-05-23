import Link from "next/link";
import type { FriendFeedItem } from "@/lib/supabase/queries";
import { rarityColors, rarityLabels } from "@/lib/animals";
import type { Rarity } from "@/lib/animals";

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  const diffWk = Math.round(diffDay / 7);
  if (diffWk < 5) return `${diffWk}w ago`;
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
}

interface FriendFeedRowProps {
  items: FriendFeedItem[];
  friendCount: number;
}

export default function FriendFeedRow({ items, friendCount }: FriendFeedRowProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3 px-2">
        <h2 className="font-display text-2xl font-bold text-on-background">
          Friends&apos; Sightings
        </h2>
        <Link
          href="/friends"
          className="font-display text-[11px] font-bold text-primary tracking-widest flex items-center gap-0.5"
        >
          FRIENDS
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
            chevron_right
          </span>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-surface-container border-[3px] border-on-background rounded-lg p-6 hard-shadow flex flex-col items-center gap-3 text-center">
          <span
            className="material-symbols-outlined text-outline text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            group
          </span>
          <p className="font-display font-bold text-on-surface-variant">
            {friendCount === 0
              ? "Add friends to see their sightings here."
              : "No public sightings from your friends yet."}
          </p>
          <Link href="/friends" className="w-full max-w-xs">
            <button className="w-full bg-primary text-on-primary font-display font-bold text-base py-2 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active transition-all">
              {friendCount === 0 ? "ADD FRIENDS" : "MANAGE FRIENDS"}
            </button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <FeedCard key={item.sighting_id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

function FeedCard({ item }: { item: FriendFeedItem }) {
  const rarity = item.species_rarity as Rarity;
  const rarityBg = rarityColors[rarity] ?? "bg-secondary-container";
  const friendDisplay = item.friend.display_name?.trim() || item.friend.username;
  const location =
    [item.location_name, item.region, item.country].filter(Boolean).join(", ") ||
    null;

  return (
    <article className="bg-surface border-[3px] border-on-background rounded-xl hard-shadow overflow-hidden flex flex-col">
      {/* Header: friend identity */}
      <Link
        href={`/u/${item.friend.username}`}
        className="flex items-center gap-3 px-3 py-2 bg-surface-container border-b-[3px] border-on-background"
      >
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-[2px] border-on-background bg-primary flex items-center justify-center text-lg">
          {item.friend.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.friend.avatar_url}
              alt={friendDisplay}
              className="w-full h-full object-cover"
            />
          ) : (
            "🧭"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-bold text-on-background truncate">
            {friendDisplay}
          </p>
          <p className="font-sans text-[11px] text-on-surface-variant truncate">
            @{item.friend.username} · {timeAgo(item.created_at)}
          </p>
        </div>
      </Link>

      {/* Photo or sprite */}
      <Link
        href={`/animal/${item.dex_number}`}
        className={`${rarityBg} aspect-square border-b-[3px] border-on-background flex items-center justify-center relative`}
      >
        {item.photoDisplayUrl ? (
          <div
            role="img"
            aria-label={`${item.species_name} sighting`}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("${item.photoDisplayUrl}")` }}
          />
        ) : (
          <span className="text-9xl select-none">{item.species_sprite}</span>
        )}
      </Link>

      {/* Caption */}
      <Link
        href={`/animal/${item.dex_number}`}
        className="flex flex-col gap-1 px-4 py-3"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-xl font-extrabold text-on-background truncate">
            #{String(item.dex_number).padStart(3, "0")} {item.species_name}
          </h3>
          <span className="shrink-0 font-display text-[10px] font-bold text-on-background tracking-widest border-[2px] border-on-background bg-surface-container px-2 py-0.5 rounded-full">
            {rarityLabels[rarity] ?? rarity.toUpperCase()}
          </span>
        </div>
        {location && (
          <p className="font-sans text-sm text-on-surface-variant truncate">
            {location}
          </p>
        )}
        {item.notes && (
          <p className="font-sans text-sm text-on-background leading-snug line-clamp-3 mt-1">
            {item.notes}
          </p>
        )}
      </Link>
    </article>
  );
}
