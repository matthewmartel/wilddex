export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export interface Animal {
  id: string;        // UUID — internal, not used in URLs
  dexNumber: number; // dex_number integer — used in /animal/[id] URLs
  number: string;    // zero-padded display string, e.g. "001"
  name: string;
  emoji: string;     // sprite column
  silhouette: string;
  type: string;
  region: string;    // default_region column (biome/habitat)
  continent: string; // continent column
  rarity: Rarity;
  description: string;
  unlocked: boolean;
  sightingLocation?: string;
}

export const rarityColors: Record<Rarity, string> = {
  Common: "bg-secondary-container",
  Uncommon: "bg-primary-container",
  Rare: "bg-tertiary-container",
  Epic: "bg-error-container",
  Legendary: "bg-tertiary-container",
};

export const rarityLabels: Record<Rarity, string> = {
  Common: "COMMON",
  Uncommon: "UNCOMMON",
  Rare: "RARE",
  Epic: "EPIC",
  Legendary: "LEGENDARY",
};
