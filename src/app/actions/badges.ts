"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ALL_BADGES } from "@/lib/badges";

const MAX_FEATURED = 4;

export async function updateFeaturedBadges(ids: string[]): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const validIds = ids
    .filter((id) => ALL_BADGES.some((b) => b.id === id))
    .slice(0, MAX_FEATURED);

  const { error } = await supabase.auth.updateUser({
    data: { featured_badge_ids: validIds },
  });

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/profile/badges");
  return {};
}
