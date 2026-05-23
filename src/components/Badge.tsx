interface BadgeProps {
  icon: string;
  label: string;
  sublabel?: string;
  color?: string;
  locked?: boolean;
}

export default function Badge({
  icon,
  label,
  sublabel,
  color = "bg-primary",
  locked = false,
}: BadgeProps) {
  return (
    <div
      className={`flex flex-col items-center gap-1 shrink-0 ${
        locked ? "opacity-50 grayscale" : ""
      }`}
    >
      <div
        className={`w-14 h-14 rounded-full ${
          locked ? "bg-surface-variant" : color
        } border-[3px] border-on-background flex items-center justify-center`}
        style={{ boxShadow: "2px 2px 0 0 var(--wd-shadow)" }}
      >
        <span
          className="material-symbols-outlined text-2xl"
          style={{
            color: locked ? "var(--color-on-surface-variant)" : "white",
            fontVariationSettings: "'FILL' 1",
          }}
        >
          {icon}
        </span>
      </div>
      <span className="text-[10px] font-bold text-center tracking-wide text-on-background font-display max-w-[64px] leading-tight">
        {label}
      </span>
      {sublabel && (
        <span className="text-[9px] text-center text-on-surface-variant font-sans max-w-[64px] leading-tight">
          {sublabel}
        </span>
      )}
    </div>
  );
}
