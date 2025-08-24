import type { MainStatType } from "#prisma";

export function formatMainStatLabel(statType: MainStatType | string): string {
  // Convert to uppercase for case-insensitive comparison
  const normalizedStatType = String(statType).toUpperCase();

  switch (normalizedStatType) {
    case "ATT":
      return "Atk";
    case "DEF":
      return "Def";
    case "MAX_HP":
      return "HP";
    case "ATT_RATE":
      return "Atk %";
    case "DEF_RATE":
      return "Def %";
    case "MAX_HP_RATE":
      return "HP %";
    case "CRI":
      return "Crit %";
    case "CRI_DMG":
      return "Crit Dmg %";
    case "SPEED":
      return "Speed";
    case "ACC":
      return "Effectiveness %";
    case "RES":
      return "Effect Resist %";
    default:
      // Handle any unknown stat types gracefully
      return String(statType)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

export function abbreviateSubstatLabel(statName: string): string {
  switch (statName) {
    case "Attack":
      return "Atk";
    case "Attack %":
      return "Atk %";
    case "Defense":
      return "Def";
    case "Defense %":
      return "Def %";
    case "Health":
      return "HP";
    case "Health %":
      return "HP %";
    case "Crit %":
      return "CC";
    case "Crit Dmg %":
      return "CD";
    case "Effectiveness %":
      return "Eff";
    case "Effect Resist %":
      return "ER";
    case "Speed":
      return "Speed";
    default:
      return statName;
  }
}

export function formatMainStatValue(
  statType: MainStatType | string,
  value: number
): string {
  // Convert to uppercase for case-insensitive comparison
  const normalizedStatType = String(statType).toUpperCase();

  // Check if this is a percentage stat based on database categories
  const isPercent =
    normalizedStatType.includes("RATE") ||
    normalizedStatType === "CRI" ||
    normalizedStatType === "CRI_DMG" ||
    normalizedStatType === "ACC" ||
    normalizedStatType === "RES";

  // Fribbels main stat percents are often stored as decimals (e.g., 0.65 for 65%)
  // Normalize: if percent and value <= 1, multiply by 100
  const normalized = isPercent && value <= 1 ? value * 100 : value;
  const digits = isPercent ? 1 : 0;
  return `${normalized.toFixed(digits)}${isPercent ? "%" : ""}`;
}
