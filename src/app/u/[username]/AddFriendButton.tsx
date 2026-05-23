"use client";

import { useState, useTransition } from "react";
import {
  acceptFriendRequest,
  cancelOutgoingRequest,
  removeFriend,
  sendFriendRequestById,
  type FriendshipState,
} from "@/app/actions/friends";

interface AddFriendButtonProps {
  targetUserId: string;
  initialState: FriendshipState;
}

export default function AddFriendButton({
  targetUserId,
  initialState,
}: AddFriendButtonProps) {
  const [state, setState] = useState<FriendshipState>(initialState);
  const [pending, startTransition] = useTransition();

  if (state === "self") return null;

  const base =
    "w-full font-display font-bold text-base py-3 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active transition-all disabled:opacity-70 flex items-center justify-center gap-2";

  if (state === "friends") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await removeFriend(targetUserId);
            setState("none");
          });
        }}
        className={`${base} bg-surface text-on-background`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
          group
        </span>
        {pending ? "REMOVING…" : "FRIENDS · REMOVE"}
      </button>
    );
  }

  if (state === "pending_outgoing") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await cancelOutgoingRequest(targetUserId);
            setState("none");
          });
        }}
        className={`${base} bg-surface text-on-background`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
          schedule
        </span>
        {pending ? "CANCELING…" : "REQUEST SENT · CANCEL"}
      </button>
    );
  }

  if (state === "pending_incoming") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await acceptFriendRequest(targetUserId);
            setState("friends");
          });
        }}
        className={`${base} bg-primary text-on-primary`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
          check
        </span>
        {pending ? "ACCEPTING…" : "ACCEPT REQUEST"}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await sendFriendRequestById(targetUserId);
          if (!result.error) setState(result.state);
        });
      }}
      className={`${base} bg-primary text-on-primary`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
        person_add
      </span>
      {pending ? "SENDING…" : "ADD FRIEND"}
    </button>
  );
}
