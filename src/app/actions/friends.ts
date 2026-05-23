"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface FriendsActionState {
  error?: string;
  success?: string;
}

export type FriendshipState =
  | "none"
  | "self"
  | "friends"
  | "pending_outgoing"
  | "pending_incoming";

export interface FriendCandidate {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  state: FriendshipState;
}

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,20}$/;

export async function sendFriendRequest(
  _prev: FriendsActionState,
  formData: FormData
): Promise<FriendsActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const usernameRaw = (formData.get("username") as string ?? "").trim();
  const username = usernameRaw.startsWith("@") ? usernameRaw.slice(1) : usernameRaw;

  if (!USERNAME_RE.test(username)) {
    return { error: "Enter a valid username (3–20 letters, numbers, _ or -)." };
  }

  const { data: target } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", username)
    .maybeSingle();

  if (!target) return { error: `No user found with username @${username}.` };
  if (target.id === user.id) return { error: "You can't friend yourself." };

  // Look for any existing relationship in either direction
  const { data: existing } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id, status")
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${target.id}),and(requester_id.eq.${target.id},addressee_id.eq.${user.id})`
    )
    .maybeSingle();

  if (existing) {
    if (existing.status === "accepted") {
      return { error: `You and @${username} are already friends.` };
    }
    // pending
    if (existing.requester_id === user.id) {
      return { error: `Friend request to @${username} is already pending.` };
    }
    // Reverse pending — they already invited me. Auto-accept.
    const { error: acceptErr } = await supabase
      .from("friendships")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (acceptErr) return { error: acceptErr.message };
    revalidatePath("/friends");
    revalidatePath("/");
    return { success: `You and @${username} are now friends.` };
  }

  const { error: insertErr } = await supabase.from("friendships").insert({
    requester_id: user.id,
    addressee_id: target.id,
    status: "pending",
  });
  if (insertErr) return { error: insertErr.message };

  revalidatePath("/friends");
  return { success: `Friend request sent to @${username}.` };
}

export async function acceptFriendRequest(requesterId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("friendships")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("requester_id", requesterId)
    .eq("addressee_id", user.id)
    .eq("status", "pending");

  revalidatePath("/friends");
  revalidatePath("/");
}

export async function rejectFriendRequest(requesterId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("friendships")
    .delete()
    .eq("requester_id", requesterId)
    .eq("addressee_id", user.id)
    .eq("status", "pending");

  revalidatePath("/friends");
}

export async function removeFriend(friendUserId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("friendships")
    .delete()
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${friendUserId}),and(requester_id.eq.${friendUserId},addressee_id.eq.${user.id})`
    );

  revalidatePath("/friends");
  revalidatePath("/");
}

export async function searchFriendCandidates(
  rawQuery: string
): Promise<FriendCandidate[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const query = rawQuery.trim().replace(/^@/, "");
  if (query.length < 2) return [];

  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .ilike("username", `${query}%`)
    .neq("id", user.id)
    .limit(20);

  const profiles = (profileRows ?? []) as {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  }[];

  if (profiles.length === 0) return [];

  const candidateIds = profiles.map((p) => p.id);
  const { data: friendshipRows } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id, status")
    .or(
      `requester_id.in.(${candidateIds.join(",")}),addressee_id.in.(${candidateIds.join(",")})`
    );

  const stateById = new Map<string, FriendshipState>();
  for (const row of (friendshipRows ?? []) as {
    requester_id: string;
    addressee_id: string;
    status: string;
  }[]) {
    if (row.requester_id !== user.id && row.addressee_id !== user.id) continue;
    const other =
      row.requester_id === user.id ? row.addressee_id : row.requester_id;
    if (row.status === "accepted") {
      stateById.set(other, "friends");
    } else if (row.status === "pending") {
      stateById.set(
        other,
        row.requester_id === user.id ? "pending_outgoing" : "pending_incoming"
      );
    }
  }

  return profiles.map((p) => ({
    id: p.id,
    username: p.username,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    state: stateById.get(p.id) ?? "none",
  }));
}

export async function sendFriendRequestById(
  targetId: string
): Promise<{ error?: string; state: FriendshipState }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated.", state: "none" };
  if (user.id === targetId) {
    return { error: "You can't friend yourself.", state: "self" };
  }

  // Reuse the same auto-accept logic as the form-based action.
  const { data: existing } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id, status")
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${targetId}),and(requester_id.eq.${targetId},addressee_id.eq.${user.id})`
    )
    .maybeSingle();

  if (existing) {
    if (existing.status === "accepted") {
      return { state: "friends" };
    }
    if (existing.requester_id === user.id) {
      return { state: "pending_outgoing" };
    }
    // Reverse pending — auto-accept.
    const { error: acceptErr } = await supabase
      .from("friendships")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (acceptErr) return { error: acceptErr.message, state: "pending_incoming" };
    revalidatePath("/friends");
    revalidatePath("/");
    return { state: "friends" };
  }

  const { error: insertErr } = await supabase.from("friendships").insert({
    requester_id: user.id,
    addressee_id: targetId,
    status: "pending",
  });
  if (insertErr) return { error: insertErr.message, state: "none" };

  revalidatePath("/friends");
  return { state: "pending_outgoing" };
}

export async function cancelOutgoingRequest(addresseeId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("friendships")
    .delete()
    .eq("requester_id", user.id)
    .eq("addressee_id", addresseeId)
    .eq("status", "pending");

  revalidatePath("/friends");
}
