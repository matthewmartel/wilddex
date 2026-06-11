import { SPRITE_DEX } from "@/lib/sprite-manifest";

export const SPRITE_SIZES = {
  xs: 24,
  sm: 40,
  md: 64,
  lg: 96,
  xl: 128,
} as const;

export type SpriteSize = keyof typeof SPRITE_SIZES;

export function spriteUrl(dexNumber: number) {
  return `/sprites/${String(dexNumber).padStart(3, "0")}.svg`;
}

export function hasSprite(dexNumber: number) {
  return SPRITE_DEX.has(dexNumber);
}

interface SpriteProps {
  dexNumber: number;
  /** Emoji from the species `sprite` column — fallback while pixel art rolls out. */
  emoji: string;
  name: string;
  size?: SpriteSize;
  locked?: boolean;
  className?: string;
}

export default function Sprite({
  dexNumber,
  emoji,
  name,
  size = "sm",
  locked = false,
  className = "",
}: SpriteProps) {
  const px = SPRITE_SIZES[size];

  if (!hasSprite(dexNumber)) {
    return (
      <span
        aria-label={locked ? "Unknown species" : name}
        role="img"
        className={className}
        style={{
          fontSize: px * 0.85,
          lineHeight: 1,
          filter: locked ? "grayscale(1) opacity(0.18) blur(1.5px)" : undefined,
        }}
      >
        {emoji}
      </span>
    );
  }

  if (locked) {
    // Alpha mask of the colored sprite — silhouette adapts to light/dark theme.
    const mask = `url(${spriteUrl(dexNumber)})`;
    return (
      <span
        role="img"
        aria-label="Unknown species"
        className={className}
        style={{
          width: px,
          height: px,
          display: "inline-block",
          backgroundColor: "var(--color-on-surface-variant)",
          opacity: 0.5,
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny local SVG; the optimizer passes SVGs through untouched
    <img
      src={spriteUrl(dexNumber)}
      alt={name}
      width={px}
      height={px}
      draggable={false}
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
