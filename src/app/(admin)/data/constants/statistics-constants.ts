import { HeroElement, HeroClass, HeroRarity, GearType } from "#prisma";

// ============================================================================
// CONSTANTS AND DEFAULT VALUES
// ============================================================================

// Default element counts for hero statistics
export const DEFAULT_ELEMENT_COUNTS: Record<HeroElement, number> = {
  FIRE: 0,
  ICE: 0,
  EARTH: 0,
  LIGHT: 0,
  DARK: 0,
};

// Default class counts for hero statistics
export const DEFAULT_CLASS_COUNTS: Record<HeroClass, number> = {
  WARRIOR: 0,
  KNIGHT: 0,
  RANGER: 0,
  MAGE: 0,
  SOUL_WEAVER: 0,
  THIEF: 0,
};

// Default rarity counts for hero statistics
export const DEFAULT_RARITY_COUNTS: Record<HeroRarity, number> = {
  THREE_STAR: 0,
  FOUR_STAR: 0,
  FIVE_STAR: 0,
  SIX_STAR: 0,
};

// Gear type display names mapping
export const GEAR_TYPE_DISPLAY_NAMES: Record<GearType, string> = {
  WEAPON: "Weapon",
  ARMOR: "Armor",
  HELM: "Helmet",
  NECK: "Necklace",
  RING: "Ring",
  BOOTS: "Boots",
};

// Top scores limit for gear score statistics
export const TOP_SCORES_LIMIT = 10;

// Top sets limit for gear set statistics
export const TOP_SETS_LIMIT = 5;
