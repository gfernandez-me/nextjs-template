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
export function safeNumber(
  value: unknown,
  fallback: number | null = 0
): number | null {
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
export function safeString(
  value: unknown,
  fallback: string | null = ""
): string | null {
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
export function validateMainStatType(value: unknown): MainStatType {
  if (isString(value)) {
    const normalized = value.toLowerCase().replace(/[^a-z_]/g, "");

    // Try exact match first
    const exactMatch = Object.values(MainStatType).find(
      (type) => type.toLowerCase() === normalized
    );
    if (exactMatch) return exactMatch;

    // Try partial matches for common variations
    if (normalized.includes("att") && normalized.includes("rate"))
      return MainStatType.ATT_RATE;
    if (normalized.includes("def") && normalized.includes("rate"))
      return MainStatType.DEF_RATE;
    if (
      normalized.includes("max") &&
      normalized.includes("hp") &&
      normalized.includes("rate")
    )
      return MainStatType.MAX_HP_RATE;
    if (normalized.includes("cri") && normalized.includes("dmg"))
      return MainStatType.CRI_DMG;
  }
  return MainStatType.ATT;
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
    attack: safeNumber(rawData.attack, null),
    defense: safeNumber(rawData.defense, null),
    health: safeNumber(rawData.health, null),
    speed: safeNumber(rawData.speed, null),
    criticalHitChance: safeNumber(rawData.criticalHitChance, null),
    criticalHitDamage: safeNumber(rawData.criticalHitDamage, null),
    effectiveness: safeNumber(rawData.effectiveness, null),
    effectResistance: safeNumber(rawData.effectResistance, null),
    weaponId: safeNumber(rawData.weaponId, null),
    armorId: safeNumber(rawData.armorId, null),
    helmetId: safeNumber(rawData.helmetId, null),
    necklaceId: safeNumber(rawData.necklaceId, null),
    ringId: safeNumber(rawData.ringId, null),
    bootId: safeNumber(rawData.bootId, null),
  };
}

/**
 * Validate and cast gear data
 */
export function validateGearData(rawData: Record<string, unknown>) {
  return {
    ingameId: safeBigInt(rawData.id || rawData.ingameId),
    code: safeString(rawData.code, "unknown") || "unknown", // Ensure code is never null
    type: validateGearType(rawData.type),
    rank: validateGearRank(rawData.rank),
    level: safeNumber(rawData.level, 1) || 1, // Ensure level is never null
    enhance: safeNumber(rawData.enhance, 0) || 0, // Ensure enhance is never null
    mainStatType: validateMainStatType(rawData.mainStatType),
    mainStatValue: safeNumber(rawData.mainStatValue, 0) || 0, // Ensure mainStatValue is never null
    mainStatBaseValue: safeNumber(rawData.mainStatBaseValue, 0) || 0, // Ensure mainStatBaseValue is never null
    statMultiplier: safeNumber(rawData.statMultiplier, 1) || 1, // Ensure statMultiplier is never null
    tierMultiplier: safeNumber(rawData.tierMultiplier, 1) || 1, // Ensure tierMultiplier is never null
    storage: safeBoolean(rawData.storage, true) || true, // Ensure storage is never null
    equipped: false, // Will be set based on equippedBy
    equippedBy: null, // Will be set during processing
    // We don't need ingameEquippedId since we have equippedBy
    ingameEquippedId: null,
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

/**
 * Map Fribbels stat names to database stat names
 */
export function mapStatName(statName: string): string {
  const statNameMap: Record<string, string> = {
    CriticalHitChancePercent: "Crit %",
    CriticalHitDamagePercent: "Crit Dmg %",
    AttackPercent: "Attack %",
    DefensePercent: "Defense %",
    HealthPercent: "Health %",
    EffectivenessPercent: "Effectiveness %",
    EffectResistancePercent: "Effect Resist %",
    Speed: "Speed",
    Attack: "Attack",
    Defense: "Defense",
    Health: "Health",
  };

  return statNameMap[statName] || statName;
}
