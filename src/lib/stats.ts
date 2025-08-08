import type { MainStatType } from "#prisma";

export function formatMainStatLabel(statType: MainStatType | string): string {
  switch (statType) {
    case "att":
      return "Atk";
    case "def":
      return "Def";
    case "max_hp":
      return "HP";
    case "att_rate":
      return "Atk %";
    case "def_rate":
      return "Def %";
    case "max_hp_rate":
      return "HP %";
    case "cri":
      return "Crit %";
    case "cri_dmg":
      return "Crit Dmg %";
    case "speed":
      return "Speed";
    case "acc":
      return "Effectiveness %";
    case "res":
      return "Effect Resist %";
    default:
      return String(statType);
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
  const isPercent =
    String(statType).includes("rate") ||
    statType === "cri" ||
    statType === "cri_dmg";
  const digits = isPercent ? 1 : 0;
  return `${value.toFixed(digits)}${isPercent ? "%" : ""}`;
}
