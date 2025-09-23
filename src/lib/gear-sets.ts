/**
 * Centralized gear set definitions and utilities
 *
 * This file contains all gear set information to avoid duplication across pages.
 * When new gear sets are added, update this file and all pages will automatically
 * have access to the new sets.
 */

export interface GearSetInfo {
  setName: string;
  displayName: string;
  piecesRequired: number;
  effectDescription: string;
  icon: string;
  category: "primary" | "secondary";
  isActive: boolean;
}

/**
 * Complete list of all Epic 7 gear sets
 * Updated with new sets from Fribbels Epic 7 Optimizer
 */
export const GEAR_SETS: Record<string, GearSetInfo> = {
  SpeedSet: {
    setName: "SpeedSet",
    displayName: "Speed Set",
    piecesRequired: 4,
    effectDescription: "+25% Speed",
    icon: "⚡",
    category: "primary",
    isActive: true,
  },
  AttackSet: {
    setName: "AttackSet",
    displayName: "Attack Set",
    piecesRequired: 4,
    effectDescription: "+35% Attack",
    icon: "⚔️",
    category: "primary",
    isActive: true,
  },
  DestructionSet: {
    setName: "DestructionSet",
    displayName: "Destruction Set",
    piecesRequired: 4,
    effectDescription: "+40% Crit Damage",
    icon: "💥",
    category: "primary",
    isActive: true,
  },
  LifestealSet: {
    setName: "LifestealSet",
    displayName: "Lifesteal Set",
    piecesRequired: 4,
    effectDescription: "Heal 20% of damage dealt",
    icon: "🩸",
    category: "primary",
    isActive: true,
  },
  CounterSet: {
    setName: "CounterSet",
    displayName: "Counter Set",
    piecesRequired: 4,
    effectDescription: "20% chance to counterattack",
    icon: "🔄",
    category: "primary",
    isActive: true,
  },
  InjurySet: {
    setName: "InjurySet",
    displayName: "Injury Set",
    piecesRequired: 4,
    effectDescription: "Reduces enemy max HP",
    icon: "💀",
    category: "primary",
    isActive: true,
  },
  RageSet: {
    setName: "RageSet",
    displayName: "Rage Set",
    piecesRequired: 4,
    effectDescription: "+30% Crit Dmg vs debuffed targets",
    icon: "😠",
    category: "primary",
    isActive: true,
  },
  ReversalSet: {
    setName: "ReversalSet",
    displayName: "Reversal Set",
    piecesRequired: 4,
    effectDescription:
      "Increases Speed by 15%. Upon reviving, increases Combat Readiness by 50%",
    icon: "🔄",
    category: "primary",
    isActive: true,
  },
  RiposteSet: {
    setName: "RiposteSet",
    displayName: "Riposte Set",
    piecesRequired: 4,
    effectDescription:
      "When successfully evading, has a 70% chance to counterattack",
    icon: "⚔️",
    category: "primary",
    isActive: true,
  },
  HealthSet: {
    setName: "HealthSet",
    displayName: "Health Set",
    piecesRequired: 2,
    effectDescription: "+15% Health",
    icon: "❤️",
    category: "secondary",
    isActive: true,
  },
  DefenseSet: {
    setName: "DefenseSet",
    displayName: "Defense Set",
    piecesRequired: 2,
    effectDescription: "+15% Defense",
    icon: "🛡️",
    category: "secondary",
    isActive: true,
  },
  CriticalSet: {
    setName: "CriticalSet",
    displayName: "Critical Set",
    piecesRequired: 2,
    effectDescription: "+12% Crit Chance",
    icon: "🎯",
    category: "secondary",
    isActive: true,
  },
  HitSet: {
    setName: "HitSet",
    displayName: "Hit Set",
    piecesRequired: 2,
    effectDescription: "+20% Effectiveness",
    icon: "🎯",
    category: "secondary",
    isActive: true,
  },
  ImmunitySet: {
    setName: "ImmunitySet",
    displayName: "Immunity Set",
    piecesRequired: 2,
    effectDescription: "Grants Immunity for 1 turn",
    icon: "💪",
    category: "secondary",
    isActive: true,
  },
  ResistSet: {
    setName: "ResistSet",
    displayName: "Resist Set",
    piecesRequired: 2,
    effectDescription: "+20% Effect Resistance",
    icon: "🛡️",
    category: "secondary",
    isActive: true,
  },
  TorrentSet: {
    setName: "TorrentSet",
    displayName: "Torrent Set",
    piecesRequired: 2,
    effectDescription: "+10% Atk, -10% HP",
    icon: "🌊",
    category: "secondary",
    isActive: true,
  },
  PenetrationSet: {
    setName: "PenetrationSet",
    displayName: "Penetration Set",
    piecesRequired: 2,
    effectDescription: "Ignores 15% Defense",
    icon: "⚡",
    category: "secondary",
    isActive: true,
  },
  UnitySet: {
    setName: "UnitySet",
    displayName: "Unity Set",
    piecesRequired: 2,
    effectDescription: "+4% Ally Dual Attack Chance",
    icon: "🤝",
    category: "secondary",
    isActive: true,
  },
  ProtectionSet: {
    setName: "ProtectionSet",
    displayName: "Protection Set",
    piecesRequired: 4,
    effectDescription: "+15% Barrier strength",
    icon: "🛡️",
    category: "primary",
    isActive: true,
  },
  RevengeSet: {
    setName: "RevengeSet",
    displayName: "Revenge Set",
    piecesRequired: 4,
    effectDescription:
      "15% chance to decrease buff duration by 1 turn when attacking",
    icon: "⚡",
    category: "primary",
    isActive: true,
  },
};

/**
 * Get all gear sets by category
 */
export function getGearSetsByCategory(
  category: "primary" | "secondary" | "all" = "all"
): GearSetInfo[] {
  const sets = Object.values(GEAR_SETS);

  if (category === "all") {
    return sets;
  }

  return sets.filter((set) => set.category === category);
}

/**
 * Get gear set info by name
 */
export function getGearSetInfo(setName: string): GearSetInfo | undefined {
  return GEAR_SETS[setName];
}

/**
 * Get all active gear sets
 */
export function getActiveGearSets(): GearSetInfo[] {
  return Object.values(GEAR_SETS).filter((set) => set.isActive);
}

/**
 * Get gear sets for filtering (used in dropdowns, etc.)
 */
export function getGearSetFilterOptions(): Array<{
  value: string;
  label: string;
  icon: string;
}> {
  return Object.values(GEAR_SETS)
    .filter((set) => set.isActive)
    .map((set) => ({
      value: set.setName,
      label: set.displayName,
      icon: set.icon,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Get gear sets grouped by category for display
 */
export function getGearSetsGrouped(): {
  primary: GearSetInfo[];
  secondary: GearSetInfo[];
} {
  return {
    primary: getGearSetsByCategory("primary"),
    secondary: getGearSetsByCategory("secondary"),
  };
}

/**
 * Check if a gear set name is valid
 */
export function isValidGearSet(setName: string): boolean {
  return setName in GEAR_SETS && GEAR_SETS[setName].isActive;
}

/**
 * Get gear set display name with icon
 */
export function getGearSetDisplayName(setName: string): string {
  const set = getGearSetInfo(setName);
  return set ? `${set.icon} ${set.displayName}` : setName;
}

/**
 * Get gear set statistics for display
 */
export function getGearSetStats(
  setName: string,
  totalCount: number,
  equippedCount: number
) {
  const set = getGearSetInfo(setName);
  if (!set) return null;

  return {
    setName: set.setName,
    displayName: set.displayName,
    icon: set.icon,
    piecesRequired: set.piecesRequired,
    effectDescription: set.effectDescription,
    category: set.category,
    totalCount,
    equippedCount,
    isActive: set.isActive,
  };
}
