export type BadgeCategory =
  | "milestone"
  | "rarity"
  | "geography"
  | "type"
  | "dedication"
  | "quest";

export interface UserStats {
  uniqueSpecies: number;
  rareSightings: number;
  regionsCount: number;
  typeBreakdown: Record<string, number>;
  photosCount: number;
  notesCount: number;
  streakDays: number;
  completedQuests: Set<string>;
}

export interface BadgeDef {
  id: string;
  icon: string;
  label: string;
  description: string;
  category: BadgeCategory;
  color: string;
}

export const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  milestone: "Milestones",
  rarity: "Rarity",
  geography: "Geography",
  type: "Species Type",
  dedication: "Dedication",
  quest: "Quests",
};

export const ALL_BADGES: BadgeDef[] = [
  // ── Milestones ────────────────────────────────────────────────────────────
  {
    id: "first_catch",
    icon: "emoji_events",
    label: "First Sighting",
    description: "Log your very first sighting.",
    category: "milestone",
    color: "bg-secondary",
  },
  {
    id: "field_scout",
    icon: "explore",
    label: "Field Scout",
    description: "Log 5 unique species.",
    category: "milestone",
    color: "bg-primary",
  },
  {
    id: "naturalist",
    icon: "forest",
    label: "Naturalist",
    description: "Log 10 unique species.",
    category: "milestone",
    color: "bg-tertiary",
  },
  {
    id: "expert_tracker",
    icon: "track_changes",
    label: "Expert Tracker",
    description: "Log 25 unique species.",
    category: "milestone",
    color: "bg-amber",
  },
  {
    id: "master_explorer",
    icon: "military_tech",
    label: "Master Explorer",
    description: "Log 50 unique species.",
    category: "milestone",
    color: "bg-error",
  },
  {
    id: "dex_legend",
    icon: "workspace_premium",
    label: "Dex Legend",
    description: "Log 100 unique species.",
    category: "milestone",
    color: "bg-indigo",
  },

  // ── Rarity ───────────────────────────────────────────────────────────────
  {
    id: "rare_find",
    icon: "star",
    label: "Rare Find",
    description: "Log a Rare, Epic, or Legendary species.",
    category: "rarity",
    color: "bg-tertiary",
  },
  {
    id: "rare_hunter",
    icon: "diamond",
    label: "Rare Hunter",
    description: "Log 5 Rare, Epic, or Legendary species.",
    category: "rarity",
    color: "bg-amber",
  },
  {
    id: "rarity_master",
    icon: "auto_awesome",
    label: "Rarity Master",
    description: "Log 10 Rare, Epic, or Legendary species.",
    category: "rarity",
    color: "bg-error",
  },

  // ── Geography ────────────────────────────────────────────────────────────
  {
    id: "dual_continent",
    icon: "language",
    label: "Dual Continent",
    description: "Log species on 2 different continents.",
    category: "geography",
    color: "bg-secondary",
  },
  {
    id: "world_traveler",
    icon: "flight",
    label: "World Traveler",
    description: "Log species on 4 different continents.",
    category: "geography",
    color: "bg-primary",
  },
  {
    id: "globe_trotter",
    icon: "public",
    label: "Globe Trotter",
    description: "Log species on 6 different continents.",
    category: "geography",
    color: "bg-indigo",
  },

  // ── Species Type ─────────────────────────────────────────────────────────
  {
    id: "bird_watcher",
    icon: "air",
    label: "Bird Watcher",
    description: "Log 3 different bird species.",
    category: "type",
    color: "bg-secondary",
  },
  {
    id: "mammal_tracker",
    icon: "pets",
    label: "Mammal Tracker",
    description: "Log 3 different mammal species.",
    category: "type",
    color: "bg-primary",
  },
  {
    id: "reptile_ranger",
    icon: "pest_control",
    label: "Reptile Ranger",
    description: "Log 3 different reptile species.",
    category: "type",
    color: "bg-tertiary",
  },
  {
    id: "marine_spotter",
    icon: "water",
    label: "Marine Spotter",
    description: "Log 3 different marine or fish species.",
    category: "type",
    color: "bg-indigo",
  },
  {
    id: "insect_hunter",
    icon: "nature",
    label: "Insect Hunter",
    description: "Log 3 different insect species.",
    category: "type",
    color: "bg-amber",
  },

  // ── Dedication ───────────────────────────────────────────────────────────
  {
    id: "photo_pro",
    icon: "photo_camera",
    label: "Photo Pro",
    description: "Attach photos to 10 sightings.",
    category: "dedication",
    color: "bg-secondary",
  },
  {
    id: "field_journalist",
    icon: "edit_note",
    label: "Field Journalist",
    description: "Add notes to 10 sightings.",
    category: "dedication",
    color: "bg-primary",
  },
  {
    id: "on_a_roll",
    icon: "local_fire_department",
    label: "On a Roll",
    description: "Log sightings 3 days in a row.",
    category: "dedication",
    color: "bg-tertiary",
  },
  {
    id: "weekly_warrior",
    icon: "calendar_month",
    label: "Weekly Warrior",
    description: "Log sightings 7 days in a row.",
    category: "dedication",
    color: "bg-amber",
  },
  {
    id: "unstoppable",
    icon: "bolt",
    label: "Unstoppable",
    description: "Log sightings 30 days in a row.",
    category: "dedication",
    color: "bg-error",
  },

  // ── Quests ───────────────────────────────────────────────────────────────
  {
    id: "pathfinder",
    icon: "flag",
    label: "Pathfinder",
    description: "Complete the First Tracks quest.",
    category: "quest",
    color: "bg-primary",
  },
  {
    id: "polar_giant_hunter",
    icon: "ac_unit",
    label: "Polar Giant",
    description: "Complete the Polar Giant legendary hunt.",
    category: "quest",
    color: "bg-indigo",
  },
  {
    id: "albino_witness",
    icon: "auto_awesome",
    label: "Albino Witness",
    description: "Complete the Albino legendary hunt.",
    category: "quest",
    color: "bg-amber",
  },
  {
    id: "mountain_ghost_tracker",
    icon: "landscape",
    label: "Ghost Tracker",
    description: "Complete the Mountain Ghost legendary hunt.",
    category: "quest",
    color: "bg-tertiary",
  },
  {
    id: "frozen_coast_witness",
    icon: "severe_cold",
    label: "Frozen Coast",
    description: "Complete the Frozen Coast legendary hunt.",
    category: "quest",
    color: "bg-secondary",
  },
  {
    id: "leviathan_witness",
    icon: "water",
    label: "Leviathan",
    description: "Complete the Leviathan legendary hunt.",
    category: "quest",
    color: "bg-error",
  },
];

export function badgeCondition(id: string, stats: UserStats): boolean {
  switch (id) {
    case "first_catch":      return stats.uniqueSpecies >= 1;
    case "field_scout":      return stats.uniqueSpecies >= 5;
    case "naturalist":       return stats.uniqueSpecies >= 10;
    case "expert_tracker":   return stats.uniqueSpecies >= 25;
    case "master_explorer":  return stats.uniqueSpecies >= 50;
    case "dex_legend":       return stats.uniqueSpecies >= 100;
    case "rare_find":        return stats.rareSightings >= 1;
    case "rare_hunter":      return stats.rareSightings >= 5;
    case "rarity_master":    return stats.rareSightings >= 10;
    case "dual_continent":   return stats.regionsCount >= 2;
    case "world_traveler":   return stats.regionsCount >= 4;
    case "globe_trotter":    return stats.regionsCount >= 6;
    case "bird_watcher":     return (stats.typeBreakdown["bird"] ?? 0) >= 3;
    case "mammal_tracker":   return (stats.typeBreakdown["mammal"] ?? 0) >= 3;
    case "reptile_ranger":   return (stats.typeBreakdown["reptile"] ?? 0) >= 3;
    case "marine_spotter":   return (stats.typeBreakdown["marine"] ?? 0) + (stats.typeBreakdown["fish"] ?? 0) >= 3;
    case "insect_hunter":    return (stats.typeBreakdown["insect"] ?? 0) >= 3;
    case "photo_pro":        return stats.photosCount >= 10;
    case "field_journalist": return stats.notesCount >= 10;
    case "on_a_roll":        return stats.streakDays >= 3;
    case "weekly_warrior":   return stats.streakDays >= 7;
    case "unstoppable":      return stats.streakDays >= 30;

    case "pathfinder":             return stats.completedQuests.has("first_tracks");
    case "polar_giant_hunter":     return stats.completedQuests.has("the_polar_giant");
    case "albino_witness":         return stats.completedQuests.has("the_albino");
    case "mountain_ghost_tracker": return stats.completedQuests.has("the_mountain_ghost");
    case "frozen_coast_witness":   return stats.completedQuests.has("the_frozen_coast");
    case "leviathan_witness":      return stats.completedQuests.has("the_leviathan");
    default:                 return false;
  }
}

export function computeEarnedBadges(stats: UserStats, isAdmin = false): Set<string> {
  if (isAdmin) return new Set(ALL_BADGES.map((b) => b.id));
  return new Set(ALL_BADGES.filter((b) => badgeCondition(b.id, stats)).map((b) => b.id));
}
