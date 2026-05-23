"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,20}$/;
const AVATAR_BUCKET = "avatars";

export interface ProfileState {
  error?: string;
  success?: boolean;
}

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const username = (formData.get("username") as string ?? "").trim();
  const displayName = (formData.get("display_name") as string ?? "").trim();
  const photo = formData.get("avatar") as File | null;

  if (!USERNAME_RE.test(username)) {
    return { error: "Username must be 3–20 characters: letters, numbers, _ or -" };
  }

  // Upload avatar if provided
  let avatarUrl: string | undefined;
  if (photo && photo.size > 0) {
    const path = `${user.id}/avatar`;
    const { error: uploadErr } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, photo, { upsert: true, contentType: photo.type });
    if (uploadErr) return { error: `Photo upload failed: ${uploadErr.message}` };
    const { data: urlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(path);
    // Append cache-buster so the browser fetches the new image
    avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
  }

  const upsertData: Record<string, unknown> = {
    id: user.id,
    username,
    display_name: displayName || null,
  };
  if (avatarUrl !== undefined) upsertData.avatar_url = avatarUrl;

  const { error: dbErr } = await supabase
    .from("profiles")
    .upsert(upsertData, { onConflict: "id" });

  if (dbErr) {
    if (dbErr.code === "23505") {
      return { error: "That username is already taken — try another." };
    }
    if (dbErr.code === "23514") {
      return { error: "Username must be 3–20 characters: letters, numbers, _ or -" };
    }
    return { error: dbErr.message };
  }

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  return { success: true };
}
