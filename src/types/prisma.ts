export enum GearType {
  WEAPON = "WEAPON",
  HELMET = "HELMET",
  ARMOR = "ARMOR",
  NECKLACE = "NECKLACE",
  RING = "RING",
  BOOTS = "BOOTS",
}

export enum MainStatType {
  ATT = "ATT",
  ATT_PER = "ATT_PER",
  HP = "HP",
  HP_PER = "HP_PER",
  DEF = "DEF",
  DEF_PER = "DEF_PER",
  SPD = "SPD",
  CRIT = "CRIT",
  CRIT_DMG = "CRIT_DMG",
  EFF = "EFF",
  RES = "RES",
}

export interface Heroes {
  id: number;
  ingameId: bigint;
  name: string;
  element: HeroElement | null;
  rarity: HeroRarity | null;
  class: HeroClass | null;
}

export interface StatTypes {
  id: number;
  originalStatName: string;
  statName: string;
  statCategory: StatCategory;
  weight: number;
}

export enum HeroElement {
  FIRE = "FIRE",
  ICE = "ICE",
  EARTH = "EARTH",
  LIGHT = "LIGHT",
  DARK = "DARK",
}

export enum HeroRarity {
  THREE = "THREE",
  FOUR = "FOUR",
  FIVE = "FIVE",
}

export enum HeroClass {
  KNIGHT = "KNIGHT",
  WARRIOR = "WARRIOR",
  THIEF = "THIEF",
  RANGER = "RANGER",
  MAGE = "MAGE",
  SOULWEAVER = "SOULWEAVER",
}

export enum StatCategory {
  ATTACK = "ATTACK",
  HEALTH = "HEALTH",
  DEFENSE = "DEFENSE",
  SPEED = "SPEED",
  CRITICAL = "CRITICAL",
  OTHER = "OTHER",
}
