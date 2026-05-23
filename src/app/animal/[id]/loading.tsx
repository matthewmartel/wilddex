export default function AnimalLoading() {
  return (
    <div className="pb-28 min-h-screen bg-surface animate-pulse">
      {/* Header placeholder */}
      <div className="h-16 bg-surface border-b-[3px] border-on-background" />

      <div className="p-4 max-w-2xl mx-auto flex flex-col gap-4 mt-2">
        {/* Hero card */}
        <div className="bg-surface-variant border-[3px] border-on-background rounded-xl aspect-square" />

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-container border-[3px] border-on-background rounded-lg p-3 h-20" />
          ))}
        </div>

        {/* Dex entry */}
        <div className="bg-surface border-[3px] border-on-background rounded-xl p-4 flex flex-col gap-2">
          <div className="h-4 bg-surface-variant rounded w-3/4" />
          <div className="h-4 bg-surface-variant rounded w-full" />
          <div className="h-4 bg-surface-variant rounded w-2/3" />
        </div>

        {/* CTA */}
        <div className="h-14 bg-surface-variant border-[3px] border-on-background rounded-lg mt-2" />
      </div>
    </div>
  );
}
