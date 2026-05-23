import AppHeader from "@/components/AppHeader";

export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-surface pb-28">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-md flex-col gap-3 px-4 py-4 animate-pulse">
        <div className="h-8 w-40 bg-surface-variant rounded mb-2" />

        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-surface-container border-[3px] border-on-background rounded-xl p-3 hard-shadow-sm"
          >
            <div className="h-10 w-10 shrink-0 bg-surface-variant border-[3px] border-on-background rounded-xl" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3 w-3/4 bg-surface-variant rounded" />
              <div className="h-2.5 w-1/3 bg-surface-variant rounded" />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
