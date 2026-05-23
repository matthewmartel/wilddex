import Link from "next/link";
import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries";
import EditForm from "./EditForm";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile();

  const currentUsername =
    profile?.username ??
    (user.user_metadata?.username as string | undefined) ??
    "";
  const currentDisplayName = profile?.display_name ?? "";
  const currentAvatarUrl = profile?.avatar_url ?? null;

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
            Edit Profile
          </h2>
          <p className="font-sans text-sm text-on-surface-variant">
            Customize how you appear in WildDex.
          </p>
        </div>

        <EditForm
          initialUsername={currentUsername}
          initialDisplayName={currentDisplayName}
          initialAvatarUrl={currentAvatarUrl}
        />
      </main>

      <BottomNav />
    </div>
  );
}
