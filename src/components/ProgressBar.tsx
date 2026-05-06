interface ProgressBarProps {
  value: number;
  color?: string;
  height?: string;
  className?: string;
}

export default function ProgressBar({
  value,
  color = "bg-primary",
  height = "h-4",
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={`${height} border-[3px] border-on-background rounded-full overflow-hidden bg-surface-variant ${className}`}
    >
      {clamped > 0 && (
        <div className={`h-full ${color}`} style={{ width: `${clamped}%` }} />
      )}
    </div>
  );
}
