import AppHeader from "@/components/AppHeader";

export default function PublicProfileLoading() {
  return (
    <div className="min-h-screen bg-surface pb-28">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-4 animate-pulse">
        {/* Identity card */}
        <div className="flex items-center gap-3 rounded-lg border-[3px] border-on-background bg-primary-container p-4 hard-shadow">
          <div className="h-20 w-20 shrink-0 bg-surface-variant border-[3px] border-on-background rounded-xl" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-6 w-32 bg-surface-variant rounded" />
            <div className="h-3 w-20 bg-surface-variant rounded" />
            <div className="h-4 w-24 bg-surface-variant rounded-full mt-1" />
          </div>
        </div>

        {/* Action button */}
        <div className="h-12 bg-surface-variant border-[3px] border-on-background rounded-lg" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-container border-[3px] border-on-background rounded-lg p-2 h-24"
            />
          ))}
        </div>

        {/* Sightings */}
        <div className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow flex flex-col gap-3">
          <div className="h-3 w-32 bg-surface-variant rounded" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-surface-variant border-[3px] border-on-background rounded-lg"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
