import { MainStatType } from "#prisma";

/**
 * Maps main stat types to forbidden substat types
 * A gear piece cannot have a substat that is the same as its main stat
 */
export const FORBIDDEN_SUBSTAT_MAP: Record<MainStatType, MainStatType[]> = {
  [MainStatType.ATT]: [MainStatType.ATT], // Flat Attack
  [MainStatType.DEF]: [MainStatType.DEF], // Flat Defense
  [MainStatType.MAX_HP]: [MainStatType.MAX_HP], // Flat Health
  [MainStatType.ATT_RATE]: [MainStatType.ATT_RATE], // Attack %
  [MainStatType.DEF_RATE]: [MainStatType.DEF_RATE], // Defense %
  [MainStatType.MAX_HP_RATE]: [MainStatType.MAX_HP_RATE], // Health %
  [MainStatType.CRI]: [MainStatType.CRI], // Crit Rate %
  [MainStatType.CRI_DMG]: [MainStatType.CRI_DMG], // Crit Damage %
  [MainStatType.SPEED]: [MainStatType.SPEED], // Speed
  [MainStatType.ACC]: [MainStatType.ACC], // Effectiveness
  [MainStatType.RES]: [MainStatType.RES], // Effect Resistance
};

/**
 * Maps MainStatType enum values to their corresponding stat names
 * This is used to match between MainStatType and StatTypes.statName
 *
 * IMPORTANT: These names must match exactly what's stored in the StatTypes.statName field
 */
export const MAIN_STAT_TO_NAME_MAP: Record<MainStatType, string> = {
  [MainStatType.ATT]: "Attack", // Flat Attack
  [MainStatType.DEF]: "Defense", // Flat Defense
  [MainStatType.MAX_HP]: "Health", // Flat Health
  [MainStatType.ATT_RATE]: "Attack%", // Attack %
  [MainStatType.DEF_RATE]: "Defense%", // Defense %
  [MainStatType.MAX_HP_RATE]: "Health%", // Health %
  [MainStatType.CRI]: "Crit Rate", // Crit Rate %
  [MainStatType.CRI_DMG]: "Crit Damage", // Crit Damage %
  [MainStatType.SPEED]: "Speed", // Speed
  [MainStatType.ACC]: "Effectiveness", // Effectiveness
  [MainStatType.RES]: "Effect Resistance", // Effect Resistance
};

/**
 * Get available substats for a given main stat type
 * Filters out substats that would conflict with the main stat
 */
export function getAvailableSubstats(
  mainStatType: MainStatType,
  allStatTypes: Array<{ id: number; statName: string }>
) {
  const forbiddenStatName = MAIN_STAT_TO_NAME_MAP[mainStatType];
  return allStatTypes.filter((stat) => stat.statName !== forbiddenStatName);
}

/**
 * Check if a gear item has conflicting main stat and substats
 */
export function hasMainSubstatConflict(
  mainStatType: MainStatType,
  substatIds: (string | number | null | undefined)[],
  statTypes: Array<{ id: number; statName: string }>
): boolean {
  const forbiddenStatName = MAIN_STAT_TO_NAME_MAP[mainStatType];

  // Check if any substat conflicts with main stat
  return substatIds.some((substatId) => {
    if (!substatId) return false;

    const substat = statTypes.find(
      (stat) => stat.id.toString() === substatId.toString()
    );
    return substat?.statName === forbiddenStatName;
  });
}

/**
 * Get the label for a forbidden substat conflict
 */
export function getForbiddenSubstatMessage(mainStatType: MainStatType): string {
  const forbiddenStatName = MAIN_STAT_TO_NAME_MAP[mainStatType];
  if (!forbiddenStatName) return "";

  const statLabel = forbiddenStatName.replace("_", " ").toLowerCase();
  return `Cannot have ${statLabel} as substat when it's the main stat`;
}
