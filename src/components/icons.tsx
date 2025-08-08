// Per .cursor/rules/epic7-verification.mdc, prefer Unicode emoji icons
// Weapon: ⚔️, Helmet: 🪖, Armor: 🛡️, Necklace: 📿, Ring: 💍, Boots: 🥾
export function getGearIcon(gearType: string): string {
  if (!gearType) return "❓";
  switch (gearType.toLowerCase()) {
    case "weapon":
      return "⚔️";
    case "armor":
      return "🛡️";
    case "helmet":
    case "helm":
      return "🪖";
    case "necklace":
    case "neck":
      return "📿";
    case "ring":
      return "💍";
    case "boots":
    case "boot":
      return "🥾";
    default:
      return "❓";
  }
}

export function getRankColor(rank: string): string {
  switch (rank.toLowerCase()) {
    case "common":
      return "text-gray-500";
    case "uncommon":
      return "text-green-600";
    case "rare":
      return "text-blue-600";
    case "epic":
      return "text-purple-600";
    case "heroic":
      return "text-orange-600";
    default:
      return "text-gray-500";
  }
}
