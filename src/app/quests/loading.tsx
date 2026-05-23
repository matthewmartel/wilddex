import AppHeader from "@/components/AppHeader";

export default function QuestsLoading() {
  return (
    <div className="min-h-screen bg-surface pb-28">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-4 animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-32 bg-surface-variant rounded" />
          <div className="h-3 w-3/4 bg-surface-variant rounded" />
          <div className="h-3 w-2/3 bg-surface-variant rounded" />
        </div>

        {Array.from({ length: 3 }).map((_, tier) => (
          <div key={tier} className="flex flex-col gap-3">
            <div className="h-3 w-32 bg-surface-variant rounded" />
            {Array.from({ length: 2 }).map((_, q) => (
              <div
                key={q}
                className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow flex flex-col gap-3"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="h-5 w-48 bg-surface-variant rounded" />
                  <div className="h-3 w-full bg-surface-variant rounded" />
                  <div className="h-3 w-3/4 bg-surface-variant rounded" />
                </div>
                <div className="h-3 bg-surface-variant border-[2px] border-on-background rounded-full" />
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }).map((_, s) => (
                    <div
                      key={s}
                      className="aspect-square bg-surface-variant border-[2px] border-on-background rounded-lg"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}
