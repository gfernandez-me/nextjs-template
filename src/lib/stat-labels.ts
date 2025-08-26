import { MainStatType, GearType } from "#prisma";

// Main stat type to human-readable label mapping
export const mainStatLabels: Record<MainStatType, string> = {
  [MainStatType.ATT]: "Attack",
  [MainStatType.DEF]: "Defense",
  [MainStatType.MAX_HP]: "Health",
  [MainStatType.ATT_RATE]: "Attack%",
  [MainStatType.DEF_RATE]: "Defense%",
  [MainStatType.MAX_HP_RATE]: "Health%",
  [MainStatType.SPEED]: "Speed",
  [MainStatType.CRI]: "Crit Rate",
  [MainStatType.CRI_DMG]: "Crit Damage",
  [MainStatType.ACC]: "Effectiveness",
  [MainStatType.RES]: "Effect Resistance",
};

// Gear type to human-readable label mapping
export const gearTypeLabels: Record<GearType, string> = {
  [GearType.WEAPON]: "Weapon",
  [GearType.HELM]: "Helm",
  [GearType.ARMOR]: "Armor",
  [GearType.NECK]: "Necklace",
  [GearType.RING]: "Ring",
  [GearType.BOOTS]: "Boots",
};

// Get main stat label
export function getMainStatLabel(statType: MainStatType): string {
  return mainStatLabels[statType] || statType;
}

// Get gear type label
export function getGearTypeLabel(gearType: GearType): string {
  return gearTypeLabels[gearType] || gearType;
}

// Get main stat options for a specific gear type
export function getMainStatOptionsForGearType(
  gearType: GearType
): MainStatType[] {
  switch (gearType) {
    case GearType.WEAPON:
      return [MainStatType.ATT];
    case GearType.HELM:
      return [MainStatType.MAX_HP];
    case GearType.ARMOR:
      return [MainStatType.DEF];
    case GearType.NECK:
      return [
        MainStatType.ATT,
        MainStatType.DEF,
        MainStatType.MAX_HP,
        MainStatType.ATT_RATE,
        MainStatType.MAX_HP_RATE,
        MainStatType.DEF_RATE,
        MainStatType.CRI,
        MainStatType.CRI_DMG,
      ];
    case GearType.RING:
      return [
        MainStatType.ATT,
        MainStatType.DEF,
        MainStatType.MAX_HP,
        MainStatType.ATT_RATE,
        MainStatType.MAX_HP_RATE,
        MainStatType.DEF_RATE,
        MainStatType.ACC,
        MainStatType.RES,
      ];
    case GearType.BOOTS:
      return [
        MainStatType.ATT,
        MainStatType.DEF,
        MainStatType.MAX_HP,
        MainStatType.ATT_RATE,
        MainStatType.MAX_HP_RATE,
        MainStatType.DEF_RATE,
        MainStatType.SPEED,
      ];
    default:
      return [];
  }
}
