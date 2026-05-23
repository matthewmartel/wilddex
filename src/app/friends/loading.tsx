import AppHeader from "@/components/AppHeader";

export default function FriendsLoading() {
  return (
    <div className="min-h-screen bg-surface pb-28">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-4 animate-pulse">
        {/* Search box */}
        <div className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow flex flex-col gap-2">
          <div className="h-3 w-24 bg-surface-variant rounded" />
          <div className="h-12 bg-surface-variant border-[3px] border-on-background rounded-xl" />
        </div>

        {/* Friends list */}
        <div className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow flex flex-col gap-3">
          <div className="h-3 w-24 bg-surface-variant rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 bg-surface-variant border-[3px] border-on-background rounded-xl" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-4 w-32 bg-surface-variant rounded" />
                <div className="h-3 w-20 bg-surface-variant rounded" />
              </div>
              <div className="h-9 w-20 bg-surface-variant border-[3px] border-on-background rounded-lg" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
