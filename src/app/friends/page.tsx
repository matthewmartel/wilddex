import type { Metadata } from "next";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import BackButton from "@/app/animal/[id]/BackButton";
import {
  getFriendSuggestions,
  getFriends,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  type FriendProfile,
  type PendingRequest,
} from "@/lib/supabase/queries";
import {
  acceptFriendRequest,
  rejectFriendRequest,
  cancelOutgoingRequest,
  removeFriend,
} from "@/app/actions/friends";
import FriendSearchPanel from "./FriendSearchPanel";
import FriendSuggestionsRow from "./FriendSuggestionsRow";

export const metadata: Metadata = { title: "Friends" };

function ProfileLink({ profile }: { profile: FriendProfile }) {
  const display = profile.display_name?.trim() || profile.username;
  return (
    <Link
      href={`/u/${profile.username}`}
      className="flex items-center gap-3 min-w-0 flex-1"
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border-[3px] border-on-background bg-primary flex items-center justify-center text-xl hard-shadow-sm">
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
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base font-bold text-on-background">
          {display}
        </p>
        {profile.display_name && (
          <p className="truncate font-sans text-xs text-on-surface-variant">
            @{profile.username}
          </p>
        )}
      </div>
    </Link>
  );
}

export default async function FriendsPage() {
  const [friends, incoming, outgoing, suggestions] = await Promise.all([
    getFriends(),
    getIncomingFriendRequests(),
    getOutgoingFriendRequests(),
    getFriendSuggestions(10),
  ]);

  return (
    <div className="min-h-screen bg-surface pb-28">
      <AppHeader left={<BackButton />} />

      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-4">
        <section className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow">
          <FriendSearchPanel />
        </section>

        {suggestions.length > 0 && (
          <FriendSuggestionsRow suggestions={suggestions} />
        )}

        {incoming.length > 0 && (
          <section className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow flex flex-col gap-3">
            <h2 className="font-display text-[12px] font-bold text-on-surface-variant tracking-widest">
              INCOMING REQUESTS ({incoming.length})
            </h2>
            <ul className="flex flex-col gap-3">
              {incoming.map((req) => (
                <li key={req.friendship_id} className="flex items-center gap-3">
                  <ProfileLink profile={req} />
                  <div className="shrink-0 flex gap-2">
                    <form action={acceptFriendRequest.bind(null, req.id)}>
                      <button
                        type="submit"
                        className="bg-primary text-on-primary font-display font-bold text-xs px-3 py-2 rounded-lg border-[3px] border-on-background hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
                      >
                        ACCEPT
                      </button>
                    </form>
                    <form action={rejectFriendRequest.bind(null, req.id)}>
                      <button
                        type="submit"
                        className="bg-surface text-on-background font-display font-bold text-xs px-3 py-2 rounded-lg border-[3px] border-on-background hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
                      >
                        DENY
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {outgoing.length > 0 && (
          <section className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow flex flex-col gap-3">
            <h2 className="font-display text-[12px] font-bold text-on-surface-variant tracking-widest">
              PENDING ({outgoing.length})
            </h2>
            <ul className="flex flex-col gap-3">
              {outgoing.map((req) => (
                <PendingOutgoingRow key={req.friendship_id} req={req} />
              ))}
            </ul>
          </section>
        )}

        <section className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[12px] font-bold text-on-surface-variant tracking-widest">
              FRIENDS ({friends.length})
            </h2>
          </div>

          {friends.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <span
                className="material-symbols-outlined text-outline text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                group
              </span>
              <p className="font-display font-bold text-on-surface-variant">
                No friends yet.
              </p>
              <p className="font-sans text-sm text-on-surface-variant">
                Send a request above by @username.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {friends.map((friend) => (
                <FriendRow key={friend.id} friend={friend} />
              ))}
            </ul>
          )}
        </section>

        <Link
          href="/profile"
          className="self-center font-display text-sm font-bold text-primary underline"
        >
          ← Back to profile
        </Link>
      </main>

      <BottomNav />
    </div>
  );
}

function PendingOutgoingRow({ req }: { req: PendingRequest }) {
  return (
    <li className="flex items-center gap-3">
      <ProfileLink profile={req} />
      <form action={cancelOutgoingRequest.bind(null, req.id)} className="shrink-0">
        <button
          type="submit"
          className="bg-surface text-on-background font-display font-bold text-xs px-3 py-2 rounded-lg border-[3px] border-on-background hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
        >
          CANCEL
        </button>
      </form>
    </li>
  );
}

function FriendRow({ friend }: { friend: FriendProfile }) {
  return (
    <li className="flex items-center gap-3">
      <ProfileLink profile={friend} />
      <form action={removeFriend.bind(null, friend.id)} className="shrink-0">
        <button
          type="submit"
          className="bg-surface text-on-background font-display font-bold text-xs px-3 py-2 rounded-lg border-[3px] border-on-background hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
          aria-label={`Remove ${friend.username}`}
        >
          REMOVE
        </button>
      </form>
    </li>
  );
}
