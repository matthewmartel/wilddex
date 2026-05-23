import Link from "next/link";
import type { FriendFeedItem } from "@/lib/supabase/queries";
import { rarityColors } from "@/lib/animals";
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
      <div className="flex items-center justify-between mb-2 px-2">
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
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
          {items.map((item) => {
            const rarity = item.species_rarity as Rarity;
            const cardColor =
              rarityColors[rarity] ?? "bg-secondary-container";
            const friendDisplay =
              item.friend.display_name?.trim() || item.friend.username;
            const location =
              [item.location_name, item.region].filter(Boolean).join(", ") ||
              null;
            return (
              <article
                key={item.sighting_id}
                className={`${cardColor} snap-start shrink-0 w-44 border-[3px] border-on-background rounded-lg hard-shadow flex flex-col overflow-hidden h-full`}
              >
                <Link
                  href={`/animal/${item.dex_number}`}
                  className="aspect-square bg-surface border-b-[3px] border-on-background flex items-center justify-center relative"
                >
                  {item.photoDisplayUrl ? (
                    <div
                      role="img"
                      aria-label={`${item.species_name} sighting`}
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url("${item.photoDisplayUrl}")` }}
                    />
                  ) : (
                    <span className="text-5xl">{item.species_sprite}</span>
                  )}
                </Link>
                <div className="p-2 flex flex-col gap-1 bg-surface flex-1">
                  <Link
                    href={`/animal/${item.dex_number}`}
                    className="font-display text-sm font-bold text-on-background truncate"
                  >
                    {item.species_name}
                  </Link>
                  <Link
                    href={`/u/${item.friend.username}`}
                    className="flex items-center gap-1.5 min-w-0"
                  >
                    <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full border-[2px] border-on-background bg-primary flex items-center justify-center text-[10px]">
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
                    <span className="font-sans text-[11px] font-bold text-on-background truncate">
                      {friendDisplay}
                    </span>
                  </Link>
                  <p className="font-sans text-[10px] text-on-surface-variant truncate">
                    {location ?? "Location hidden"} · {timeAgo(item.created_at)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
