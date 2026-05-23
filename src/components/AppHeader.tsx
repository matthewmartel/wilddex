interface AppHeaderProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export default function AppHeader({ left, right }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between w-full px-4 h-16 bg-surface border-b-[3px] border-on-background sticky top-0 z-40">
      <div className="w-16 flex justify-start">{left ?? <span />}</div>
      <div className="flex items-center gap-2">
        <span className="text-xl leading-none">🌿</span>
        <h1 className="font-display text-[28px] font-extrabold text-primary tracking-tighter">
          WildDex
        </h1>
      </div>
      <div className="w-16 flex justify-end">{right ?? <span />}</div>
    </header>
  );
}
