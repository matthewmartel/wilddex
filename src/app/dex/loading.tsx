import AppHeader from "@/components/AppHeader";

export default function DexLoading() {
  return (
    <div className="min-h-screen bg-surface pb-28">
      <AppHeader />

      <div className="mx-auto max-w-md px-4 py-4 animate-pulse">
        {/* Counter skeleton */}
        <div className="bg-surface-container border-[3px] border-on-background rounded-lg p-3 mb-4 flex items-center gap-4">
          <div className="flex flex-col gap-1 shrink-0">
            <div className="h-3 w-16 bg-surface-variant rounded" />
            <div className="h-7 w-20 bg-surface-variant rounded" />
          </div>
          <div className="flex-1 h-5 bg-surface-variant rounded-full" />
        </div>

        {/* Toggle skeleton */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 h-9 bg-surface-variant border-[3px] border-on-background rounded-lg" />
          <div className="flex-1 h-9 bg-surface-variant border-[3px] border-on-background rounded-lg" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-variant border-[3px] border-outline rounded-lg aspect-[4/5]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
