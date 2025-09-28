import {
  MainStatType,
  GearType,
  GearRank,
  HeroElement,
  HeroRarity,
  HeroClass,
} from "#prisma";

// ============================================================================
// HERO METADATA INTERFACES
// ============================================================================

export interface HeroMetadata {
  element: HeroElement | null;
  rarity: HeroRarity | null;
  class: HeroClass | null;
}

interface FribbelsHeroData {
  code: string;
  name: string;
  attribute: string; // "fire", "ice", "wind", "light", "dark"
  role: string; // "warrior", "knight", "ranger", "mage", "manauser", "assassin"
  rarity: number; // 3, 4, 5, 6
}

// ============================================================================
// FRIBBELS API INTEGRATION
// ============================================================================

// Cache for hero data to avoid repeated API calls
let heroDataCache: Map<string, FribbelsHeroData> | null = null;

/**
 * Fetch hero data from Fribbels API
 */
async function fetchFribbelsHeroData(): Promise<Map<string, FribbelsHeroData>> {
  if (heroDataCache) {
    return heroDataCache;
  }

  try {
    const response = await fetch(
      "http://e7-optimizer-game-data.s3-accelerate.amazonaws.com/herodata.json"
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch hero data: ${response.status}`);
    }

    const data = await response.json();
    const heroMap = new Map<string, FribbelsHeroData>();

    // Convert the API data to our format
    for (const [name, heroData] of Object.entries(data)) {
      const hero = heroData as Record<string, unknown>;
      if (hero.code && hero.attribute && hero.role && hero.rarity) {
        heroMap.set(hero.code, {
          code: hero.code,
          name: hero.name || name,
          attribute: hero.attribute,
          role: hero.role,
          rarity: hero.rarity,
        });
      }
    }

    heroDataCache = heroMap;
    return heroMap;
  } catch (error) {
    console.error("Failed to fetch Fribbels hero data:", error);
    return new Map();
  }
}

/**
 * Map Fribbels attribute to our HeroElement enum
 */
function mapAttributeToElement(attribute: string): HeroElement | null {
  switch (attribute.toLowerCase()) {
    case "fire":
      return HeroElement.FIRE;
    case "ice":
      return HeroElement.ICE;
    case "wind":
      return HeroElement.EARTH; // Wind = Earth in Epic 7
    case "light":
      return HeroElement.LIGHT;
    case "dark":
      return HeroElement.DARK;
    default:
      return null;
  }
}

/**
 * Map Fribbels role to our HeroClass enum
 */
function mapRoleToClass(role: string): HeroClass | null {
  switch (role.toLowerCase()) {
    case "warrior":
      return HeroClass.WARRIOR;
    case "knight":
      return HeroClass.KNIGHT;
    case "ranger":
      return HeroClass.RANGER;
    case "mage":
      return HeroClass.MAGE;
    case "manauser":
      return HeroClass.SOUL_WEAVER; // Manauser = SoulWeaver
    case "assassin":
      return HeroClass.THIEF; // Assassin = Thief
    default:
      return null;
  }
}

/**
 * Map Fribbels rarity to our HeroRarity enum
 */
function mapRarityToEnum(rarity: number): HeroRarity | null {
  switch (rarity) {
    case 3:
      return HeroRarity.THREE_STAR;
    case 4:
      return HeroRarity.FOUR_STAR;
    case 5:
      return HeroRarity.FIVE_STAR;
    case 6:
      return HeroRarity.SIX_STAR;
    default:
      return null;
  }
}

/**
 * Get hero metadata from Fribbels API data
 */
export async function getHeroMetadataFromFribbels(
  heroCode: string
): Promise<HeroMetadata> {
  try {
    const heroDataMap = await fetchFribbelsHeroData();
    const heroData = heroDataMap.get(heroCode);

    if (!heroData) {
      return {
        element: null,
        rarity: null,
        class: null,
      };
    }

    return {
      element: mapAttributeToElement(heroData.attribute),
      rarity: mapRarityToEnum(heroData.rarity),
      class: mapRoleToClass(heroData.role),
    };
  } catch (error) {
    console.error("Failed to get hero metadata from Fribbels:", error);
    return {
      element: null,
      rarity: null,
      class: null,
    };
  }
}

/**
 * Get hero metadata by name (fallback)
 */
export async function getHeroMetadataByNameFromFribbels(
  heroName: string
): Promise<HeroMetadata> {
  try {
    const heroDataMap = await fetchFribbelsHeroData();

    // Find hero by name
    for (const heroData of Array.from(heroDataMap.values())) {
      if (heroData.name.toLowerCase() === heroName.toLowerCase()) {
        return {
          element: mapAttributeToElement(heroData.attribute),
          rarity: mapRarityToEnum(heroData.rarity),
          class: mapRoleToClass(heroData.role),
        };
      }
    }

    return {
      element: null,
      rarity: null,
      class: null,
    };
  } catch (error) {
    console.error("Failed to get hero metadata by name from Fribbels:", error);
    return {
      element: null,
      rarity: null,
      class: null,
    };
  }
}

/**
 * Clear the hero data cache (useful for testing or when data might be stale)
 */
export function clearHeroDataCache(): void {
  heroDataCache = null;
}

/**
 * Extract hero metadata from Fribbels hero data
 * This function uses the Fribbels API for accurate data
 */
export async function extractHeroMetadata(
  heroData: Record<string, unknown>
): Promise<HeroMetadata> {
  // Try to get metadata from Fribbels API using hero code
  const code = heroData.code as string;
  if (code) {
    const metadata = await getHeroMetadataFromFribbels(code);
    if (metadata.element || metadata.rarity || metadata.class) {
      return metadata;
    }
  }

  // Fallback: try to get metadata by name
  const name = heroData.name as string;
  if (name) {
    const metadata = await getHeroMetadataByNameFromFribbels(name);
    if (metadata.element || metadata.rarity || metadata.class) {
      return metadata;
    }
  }

  // If all else fails, return null values
  return {
    element: null,
    rarity: null,
    class: null,
  };
}

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
    duplicateCount: 1, // Will be calculated during upload process
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
