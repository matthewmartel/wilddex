/**
 * WildDex sprite style guide
 * ──────────────────────────
 * Canvas:      24×24 logical pixels. "." = transparent.
 * Outline:     every opaque region is bounded by `o` (C.outline) pixels, 1px thick.
 * Shading:     2–3 tone ramps, light source top-left. Uppercase char = dark tone,
 *              lowercase = mid tone, trailing chars (h, etc.) = highlight.
 * Eye:         outline-dark pupil with a single `w` (C.eyeWhite) highlight pixel
 *              where the sprite is large enough to afford it.
 * Margin:      keep ≥1px transparent border on all four sides.
 * Facing:      subject faces LEFT (matches the Gen-1/2 reference).
 * Proportions: big readable head, chunky silhouette; favor shape clarity
 *              over anatomical detail at this resolution.
 *
 * Every per-sprite palette value must come from `C` or `ramps` below so the
 * whole dex shares one color world. One-off colors go in the sprite's
 * `localColors` allowlist (generator warns otherwise).
 */

export const C = {
  outline: "#1a1c2c",
  eyeWhite: "#ffffff",
  hoof: "#2e3138",
  belly: "#f5e6c4",
};

// [dark, mid, light]
export const ramps = {
  furOrange: ["#9c4a1a", "#d97a2b", "#f2a65a"],
  furRust: ["#7a3520", "#a8542e", "#cf7a45"],
  furBrown: ["#5c3a21", "#8a5a32", "#b8854f"],
  furTan: ["#8a6a3a", "#c19a5e", "#e3c389"],
  furGray: ["#4a4e57", "#7b8089", "#aab0b8"],
  furBlack: ["#16181d", "#2e3138", "#4a4e57"],
  furCream: ["#b89a6a", "#e0c898", "#f5e6c4"],
  snowWhite: ["#9aa7b8", "#cdd6e0", "#f4f7fa"],
  goldYellow: ["#b8860b", "#e8b830", "#f7d860"],
  scaleGreen: ["#2e5d2e", "#4e8c3a", "#7ab648"],
  leafGreen: ["#1f4d33", "#357a4d", "#5aa86e"],
  swampGreen: ["#3a4a2a", "#5c7340", "#86a05c"],
  featherBlue: ["#1f4f8f", "#3a7bd5", "#7db1ec"],
  waterBlue: ["#1f4f6e", "#2e7ba0", "#5cb3d4"],
  deepBlue: ["#16304f", "#244e78", "#3a76a8"],
  redAccent: ["#8f1f1f", "#cc2f2f", "#e8645a"],
  pinkAccent: ["#b85a7a", "#e88aa8", "#f7bccb"],
  purpleGray: ["#4a4258", "#6e6480", "#968aa8"],
  iceBlue: ["#7a9ab0", "#a8c8d8", "#d8ecf4"],
};
