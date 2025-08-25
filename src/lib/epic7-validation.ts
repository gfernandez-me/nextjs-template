import {
  MainStatType,
  GearType,
  GearRank,
  HeroElement,
  HeroRarity,
  HeroClass,
} from "#prisma";

/**
 * Validation and casting utilities for Fribbels data
 * Provides clean, type-safe data transformation
 */

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

export function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isBigInt(value: unknown): value is bigint {
  return typeof value === "bigint";
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

// ============================================================================
// SAFE CASTING FUNCTIONS
// ============================================================================

/**
 * Safely cast to number with fallback
 */
export function safeNumber(value: unknown, fallback: number = 0): number {
  if (isNumber(value)) return value;
  if (isString(value)) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

/**
 * Safely cast to string with fallback
 */
export function safeString(value: unknown, fallback: string = ""): string {
  if (isString(value)) return value.trim();
  if (isNumber(value)) return String(value);
  return fallback;
}

/**
 * Safely cast to bigint with fallback
 */
export function safeBigInt(
  value: unknown,
  fallback: bigint = BigInt(0)
): bigint {
  if (isBigInt(value)) return value;
  if (isNumber(value)) return BigInt(Math.floor(value));
  if (isString(value)) {
    try {
      return BigInt(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/**
 * Safely cast to boolean with fallback
 */
export function safeBoolean(
  value: unknown,
  fallback: boolean = false
): boolean {
  if (isBoolean(value)) return value;
  if (isString(value)) {
    const lower = value.toLowerCase();
    return lower === "true" || lower === "1" || lower === "yes";
  }
  if (isNumber(value)) return value !== 0;
  return fallback;
}

// ============================================================================
// EPIC 7 SPECIFIC VALIDATION
// ============================================================================

/**
 * Validate and cast gear type
 */
export function validateGearType(value: unknown): GearType {
  if (isString(value)) {
    const normalized = value.toLowerCase();
    const typeMap: Record<string, GearType> = {
      weapon: GearType.WEAPON,
      armor: GearType.ARMOR,
      helm: GearType.HELM,
      helmet: GearType.HELM,
      neck: GearType.NECK,
      necklace: GearType.NECK,
      ring: GearType.RING,
      boot: GearType.BOOTS,
      boots: GearType.BOOTS,
    };
    return typeMap[normalized] || GearType.WEAPON;
  }
  return GearType.WEAPON;
}

/**
 * Validate and cast gear rank
 */
export function validateGearRank(value: unknown): GearRank {
  if (isString(value)) {
    const normalized = value.toLowerCase();
    const rankMap: Record<string, GearRank> = {
      common: GearRank.COMMON,
      uncommon: GearRank.UNCOMMON,
      rare: GearRank.RARE,
      epic: GearRank.EPIC,
      heroic: GearRank.HEROIC,
    };
    return rankMap[normalized] || GearRank.COMMON;
  }
  return GearRank.COMMON;
}

/**
 * Validate and cast main stat type
 */
export function validateMainStatType(type: string): MainStatType {
  switch (type) {
    case "EffectivenessPercent":
      return MainStatType.ACC;
    case "Defense":
      return MainStatType.DEF;
    case "AttackPercent":
      return MainStatType.ATT_RATE;
    case "HealthPercent":
      return MainStatType.MAX_HP_RATE;
    case "CriticalHitDamagePercent":
      return MainStatType.CRI_DMG;
    case "Attack":
      return MainStatType.ATT;
    case "Speed":
      return MainStatType.SPEED;
    case "Health":
      return MainStatType.MAX_HP;
    case "DefensePercent":
      return MainStatType.DEF_RATE;
    case "CriticalHitChancePercent":
      return MainStatType.CRI;
    case "EffectResistancePercent":
      return MainStatType.RES;
    default:
      throw new Error(`Unknown main stat type: ${type}`);
  }
}

/**
 * Validate and cast hero element
 */
export function validateHeroElement(value: unknown): HeroElement | null {
  if (!value) return null;
  if (isString(value)) {
    const normalized = value.toLowerCase();
    const elementMap: Record<string, HeroElement> = {
      fire: HeroElement.FIRE,
      ice: HeroElement.ICE,
      earth: HeroElement.EARTH,
      light: HeroElement.LIGHT,
      dark: HeroElement.DARK,
    };
    return elementMap[normalized] || null;
  }
  return null;
}

/**
 * Validate and cast hero rarity
 */
export function validateHeroRarity(value: unknown): HeroRarity | null {
  if (!value) return null;
  const normalized = String(value).toLowerCase();
  const rarityMap: Record<string, HeroRarity> = {
    "3": HeroRarity.THREE_STAR,
    "4": HeroRarity.FOUR_STAR,
    "5": HeroRarity.FIVE_STAR,
    "6": HeroRarity.SIX_STAR,
    three: HeroRarity.THREE_STAR,
    four: HeroRarity.FOUR_STAR,
    five: HeroRarity.FIVE_STAR,
    six: HeroRarity.SIX_STAR,
    threestar: HeroRarity.THREE_STAR,
    fourstar: HeroRarity.FOUR_STAR,
    fivestar: HeroRarity.FIVE_STAR,
    sixstar: HeroRarity.SIX_STAR,
  };
  return rarityMap[normalized] || null;
}

/**
 * Validate and cast hero class
 */
export function validateHeroClass(value: unknown): HeroClass | null {
  if (!value) return null;
  if (isString(value)) {
    const normalized = value.toLowerCase().replace(/[^a-z]/g, "");
    const classMap: Record<string, HeroClass> = {
      warrior: HeroClass.WARRIOR,
      knight: HeroClass.KNIGHT,
      ranger: HeroClass.RANGER,
      mage: HeroClass.MAGE,
      soulweaver: HeroClass.SOUL_WEAVER,
      soul_weaver: HeroClass.SOUL_WEAVER,
      thief: HeroClass.THIEF,
    };
    return classMap[normalized] || null;
  }
  return null;
}

// ============================================================================
// COMPOSITE VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate and cast hero data
 */
export function validateHeroData(rawData: Record<string, unknown>) {
  return {
    ingameId: safeBigInt(rawData.id || rawData.ingameId),
    name: safeString(rawData.name, "Unknown Hero") || "Unknown Hero", // Ensure name is never null
    element: validateHeroElement(rawData.element),
    rarity: validateHeroRarity(rawData.rarity),
    class: validateHeroClass(rawData.class),
    attack: safeNumber(rawData.attack),
    defense: safeNumber(rawData.defense),
    health: safeNumber(rawData.health),
    speed: safeNumber(rawData.speed),
    criticalHitChance: safeNumber(rawData.criticalHitChance),
    criticalHitDamage: safeNumber(rawData.criticalHitDamage),
    effectiveness: safeNumber(rawData.effectiveness),
    effectResistance: safeNumber(rawData.effectResistance),
    weaponId: safeNumber(rawData.weaponId),
    armorId: safeNumber(rawData.armorId),
    helmetId: safeNumber(rawData.helmetId),
    necklaceId: safeNumber(rawData.necklaceId),
    ringId: safeNumber(rawData.ringId),
    bootId: safeNumber(rawData.bootId),
  };
}

/**
 * Validate and cast gear data
 */
export function validateGearData(rawData: Record<string, unknown>) {
  return {
    ingameId: safeBigInt(rawData.id || rawData.ingameId),
    code: safeString(rawData.code), // code is nullable
    type: validateGearType(rawData.type),
    rank: validateGearRank(rawData.rank),
    set: safeString(rawData.set), // set is required, default to empty string as fallback
    level: safeNumber(rawData.level, 1), // Ensure level is never null
    enhance: safeNumber(rawData.enhance, 0), // Ensure enhance is never null
    mainStatType: null, // will be linked later
    mainStatValue: safeNumber(rawData.mainStatValue, 0), // Ensure mainStatValue is never null
    mainStatBaseValue: safeNumber(rawData.mainStatBaseValue, 0), // Ensure mainStatBaseValue is never null
    statMultiplier: safeNumber(rawData.statMultiplier, 1), // Ensure statMultiplier is never null
    tierMultiplier: safeNumber(rawData.tierMultiplier, 1), // Ensure tierMultiplier is never null
    storage: safeBoolean(rawData.storage, true), // Ensure storage is never null
    equipped: safeBoolean(rawData.equipped, false), // Whether gear is equipped
    ingameEquippedId: safeBigInt(rawData.ingameEquippedId), // Keep track of equipped hero ID from the game
    heroId: null, // Will be linked based on ingameEquippedId
    fScore: null, // Will be calculated later
    score: null, // Will be calculated later
  };
}

/**
 * Validate and cast substat data
 */
export function validateSubstatData(rawData: Record<string, unknown>) {
  return {
    statValue: safeNumber(rawData.value, 0) || 0, // Ensure statValue is never null
    rolls: safeNumber(rawData.rolls, 1) || 1, // Ensure rolls is never null
    weight: 1.0, // Default weight
    isModified: false, // Default to not modified
  };
}
