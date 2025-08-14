import { 
  MainStatType, 
  GearType, 
  GearRank, 
  HeroElement, 
  HeroRarity, 
  HeroClass 
} from "#prisma";

/**
 * Maps Fribbels stat types to Prisma MainStatType enum
 * Uses toLowerCase for flexible matching
 */
export function mapMainStatType(statType: string): MainStatType {
  const normalized = statType.toLowerCase().replace(/[^a-z_]/g, '');
  
  // Try exact match first
  const exactMatch = Object.values(MainStatType).find(
    type => type.toLowerCase() === normalized
  );
  if (exactMatch) return exactMatch;
  
  // Try partial matches for common variations
  if (normalized.includes('att') && normalized.includes('rate')) return MainStatType.ATT_RATE;
  if (normalized.includes('def') && normalized.includes('rate')) return MainStatType.DEF_RATE;
  if (normalized.includes('max') && normalized.includes('hp') && normalized.includes('rate')) return MainStatType.MAX_HP_RATE;
  if (normalized.includes('cri') && normalized.includes('dmg')) return MainStatType.CRI_DMG;
  
  // Default fallback
  return MainStatType.ATT;
}

/**
 * Maps Fribbels gear types to Prisma GearType enum
 * Uses toLowerCase for flexible matching
 */
export function mapGearType(gearType: string): GearType {
  const normalized = gearType.toLowerCase();
  
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

/**
 * Maps Fribbels gear ranks to Prisma GearRank enum
 * Uses toLowerCase for flexible matching
 */
export function mapGearRank(rank: string): GearRank {
  const normalized = rank.toLowerCase();
  
  const rankMap: Record<string, GearRank> = {
    common: GearRank.COMMON,
    uncommon: GearRank.UNCOMMON,
    rare: GearRank.RARE,
    epic: GearRank.EPIC,
    heroic: GearRank.HEROIC,
  };
  
  return rankMap[normalized] || GearRank.COMMON;
}

/**
 * Maps Fribbels hero elements to Prisma HeroElement enum
 * Uses toLowerCase for flexible matching
 */
export function mapHeroElement(element: string): HeroElement | null {
  if (!element) return null;
  
  const normalized = element.toLowerCase();
  
  const elementMap: Record<string, HeroElement> = {
    fire: HeroElement.FIRE,
    ice: HeroElement.ICE,
    earth: HeroElement.EARTH,
    light: HeroElement.LIGHT,
    dark: HeroElement.DARK,
  };
  
  return elementMap[normalized] || null;
}

/**
 * Maps Fribbels hero rarities to Prisma HeroRarity enum
 * Handles both string and numeric inputs
 */
export function mapHeroRarity(rarity: string | number): HeroRarity | null {
  if (!rarity) return null;
  
  const normalized = String(rarity).toLowerCase();
  
  const rarityMap: Record<string, HeroRarity> = {
    '3': HeroRarity.THREE_STAR,
    '4': HeroRarity.FOUR_STAR,
    '5': HeroRarity.FIVE_STAR,
    '6': HeroRarity.SIX_STAR,
    'three': HeroRarity.THREE_STAR,
    'four': HeroRarity.FOUR_STAR,
    'five': HeroRarity.FIVE_STAR,
    'six': HeroRarity.SIX_STAR,
    'threestar': HeroRarity.THREE_STAR,
    'fourstar': HeroRarity.FOUR_STAR,
    'fivestar': HeroRarity.FIVE_STAR,
    'sixstar': HeroRarity.SIX_STAR,
  };
  
  return rarityMap[normalized] || null;
}

/**
 * Maps Fribbels hero classes to Prisma HeroClass enum
 * Uses toLowerCase for flexible matching
 */
export function mapHeroClass(heroClass: string): HeroClass | null {
  if (!heroClass) return null;
  
  const normalized = heroClass.toLowerCase().replace(/[^a-z]/g, '');
  
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

/**
 * Maps Fribbels stat names to database stat names
 * Uses toLowerCase for flexible matching
 */
export function mapStatName(statName: string): string {
  const normalized = statName.toLowerCase();
  
  const statNameMap: Record<string, string> = {
    'criticalhitchancepercent': 'Crit %',
    'criticalhitdamagepercent': 'Crit Dmg %',
    'attackpercent': 'Attack %',
    'defensepercent': 'Defense %',
    'healthpercent': 'Health %',
    'effectivenesspercent': 'Effectiveness %',
    'effectresistancepercent': 'Effect Resist %',
    'speed': 'Speed',
    'attack': 'Attack',
    'defense': 'Defense',
    'health': 'Health',
  };
  
  return statNameMap[normalized] || statName;
}
