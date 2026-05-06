import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import ProgressBar from "@/components/ProgressBar";

const markers = [
  { top: "25%", left: "20%", color: "bg-error", label: "Red Fox" },
  { top: "45%", left: "62%", color: "bg-tertiary", label: "Owl" },
  { top: "65%", left: "35%", color: "bg-primary", label: "Duck" },
  { top: "30%", left: "75%", color: "bg-secondary", label: "Sparrow" },
  { top: "70%", left: "68%", color: "bg-primary", label: "Rabbit" },
];

export default function MapPage() {
  return (
    <div className="pb-28 min-h-screen bg-surface">
      {/* Header */}
      <header className="flex justify-between items-center w-full px-4 h-16 bg-surface border-b-[3px] border-on-background sticky top-0 z-40">
        <span className="material-symbols-outlined text-primary">
          battery_charging_full
        </span>
        <h1 className="font-display text-[32px] font-extrabold text-primary tracking-tighter">
          WildDex
        </h1>
        <span className="material-symbols-outlined text-primary">
          signal_cellular_alt
        </span>
      </header>

      <main className="flex flex-col md:flex-row gap-4 p-4 max-w-4xl mx-auto">
        {/* Map */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-2xl font-bold text-on-background">
              Discovery Map
            </h2>
            <span className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest border-[3px] border-on-background px-2 py-1 rounded-lg bg-surface hard-shadow-sm">
              FOREST REGION
            </span>
          </div>

          {/* Map placeholder */}
          <div className="w-full aspect-square bg-secondary-container border-[3px] border-on-background rounded-lg hard-shadow relative overflow-hidden">
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-10">
              {[20, 40, 60, 80].map((p) => (
                <div key={`h${p}`} className="absolute w-full h-px bg-on-background" style={{ top: `${p}%` }} />
              ))}
              {[20, 40, 60, 80].map((p) => (
                <div key={`v${p}`} className="absolute h-full w-px bg-on-background" style={{ left: `${p}%` }} />
              ))}
            </div>

            {/* Terrain blobs */}
            <div className="absolute top-[15%] left-[10%] w-24 h-20 bg-primary opacity-20 rounded-full blur-sm" />
            <div className="absolute top-[50%] left-[40%] w-32 h-24 bg-primary opacity-25 rounded-full blur-sm" />
            <div className="absolute top-[20%] left-[55%] w-20 h-16 bg-tertiary opacity-20 rounded-full blur-sm" />
            <div className="absolute bottom-[15%] left-[15%] w-28 h-20 bg-secondary opacity-20 rounded-full blur-sm" />

            {/* Discovery markers */}
            {markers.map((m, i) => (
              <div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ top: m.top, left: m.left }}
              >
                <div className={`w-5 h-5 ${m.color} border-[2px] border-on-background rounded-full shadow-[2px_2px_0_0_#1b1c1c] transition-transform group-hover:scale-125`} />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block pointer-events-none">
                  <span className="bg-surface border-[2px] border-on-background rounded px-1 font-display text-[10px] font-bold text-on-background whitespace-nowrap shadow-[2px_2px_0_0_#1b1c1c]">
                    {m.label}
                  </span>
                </div>
              </div>
            ))}

            {/* Player location */}
            <div className="absolute bottom-1/4 left-1/2 flex flex-col items-center -translate-x-1/2">
              <div className="w-10 h-10 bg-primary rounded-full border-[3px] border-on-background hard-shadow flex items-center justify-center z-10 animate-bounce">
                <span
                  className="material-symbols-outlined text-on-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  person
                </span>
              </div>
              <div className="w-6 h-2 bg-black/30 rounded-full mt-1 blur-sm" />
            </div>

            {/* Progress overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-surface p-3 rounded-lg border-[3px] border-on-background hard-shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest">
                  AREA DISCOVERY
                </span>
                <span className="font-display text-[11px] font-bold text-primary tracking-wider">
                  3/12 FOUND
                </span>
              </div>
              <ProgressBar value={25} height="h-4" />
            </div>
          </div>

          {/* Scan area button */}
          <Link href="/scan">
            <button className="w-full py-4 bg-primary text-on-primary font-display font-bold text-2xl rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active transition-all">
              SCAN AREA
            </button>
          </Link>
        </div>

        {/* Desktop side panel */}
        <aside className="hidden md:flex flex-col w-72 gap-4">
          <div className="bg-surface rounded-lg border-[3px] border-on-background hard-shadow p-4">
            <h2 className="font-display text-2xl font-bold mb-2">Region Info</h2>
            <p className="font-sans text-sm text-on-surface-variant mb-4">
              A dense forest teeming with elusive wildlife. Perfect for
              beginners to hone their tracking skills.
            </p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-tertiary-container text-on-tertiary-container font-display text-[11px] font-bold rounded-full border-[2px] border-on-background tracking-widest">
                FOREST
              </span>
              <span className="px-2 py-1 bg-secondary-container text-on-secondary-container font-display text-[11px] font-bold rounded-full border-[2px] border-on-background tracking-widest">
                LVL 1-5
              </span>
            </div>
          </div>
          <div className="bg-surface rounded-lg border-[3px] border-on-background hard-shadow p-4 flex-grow">
            <h3 className="font-display text-[12px] font-bold text-on-surface-variant mb-4 tracking-widest">
              RECENT DISCOVERIES
            </h3>
            {["Red Fox 🦊", "Sparrow 🐦"].map((name) => (
              <div key={name} className="flex items-center gap-3 p-2 bg-surface-container rounded-lg border-[3px] border-on-background mb-2 hover:bg-surface-variant cursor-pointer transition-colors">
                <div className="w-10 h-10 bg-secondary-container rounded-lg border-[2px] border-on-background flex items-center justify-center text-xl">
                  {name.split(" ").pop()}
                </div>
                <div>
                  <div className="font-sans font-bold text-on-surface">{name.split(" ").slice(0, -1).join(" ")}</div>
                  <div className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest">Common</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </main>

      <BottomNav />
    </div>
  );
}
