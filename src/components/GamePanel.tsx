interface GamePanelProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export default function GamePanel({
  children,
  className = "",
  color = "bg-surface-container",
}: GamePanelProps) {
  return (
    <div
      className={`${color} border-[3px] border-on-background rounded-xl p-4 hard-shadow ${className}`}
    >
      {children}
    </div>
  );
}
