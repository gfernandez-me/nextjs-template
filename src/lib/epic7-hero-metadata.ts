/**
 * Epic 7 Hero Metadata Extraction
 * Dynamically extracts hero metadata from Fribbels export data
 */

import { HeroElement, HeroRarity, HeroClass } from "#prisma";

export interface HeroMetadata {
  element: HeroElement | null;
  rarity: HeroRarity | null;
  class: HeroClass | null;
}

/**
 * Extract hero metadata from Fribbels hero data
 * This function analyzes the hero data structure and attempts to determine
 * element, rarity, and class from available information
 */
export function extractHeroMetadata(
  heroData: Record<string, unknown>
): HeroMetadata {
  const metadata: HeroMetadata = {
    element: null,
    rarity: null,
    class: null,
  };

  // Extract rarity from stars field
  if (heroData.stars && typeof heroData.stars === "number") {
    const stars = heroData.stars;
    if (stars === 3) metadata.rarity = HeroRarity.THREE_STAR;
    else if (stars === 4) metadata.rarity = HeroRarity.FOUR_STAR;
    else if (stars === 5) metadata.rarity = HeroRarity.FIVE_STAR;
    else if (stars === 6) metadata.rarity = HeroRarity.SIX_STAR;
  }

  // Extract element and class from hero code pattern
  const code = heroData.code as string;
  if (code) {
    // Hero codes follow patterns like c0001, c1017, c2022, etc.
    // First digit after 'c' often indicates element:
    // 0-1: Fire, 2: Ice, 3: Earth, 4: Light, 5: Dark
    const firstDigit = code.charAt(1);

    switch (firstDigit) {
      case "0":
      case "1":
        metadata.element = HeroElement.FIRE;
        break;
      case "2":
        metadata.element = HeroElement.ICE;
        break;
      case "3":
        metadata.element = HeroElement.EARTH;
        break;
      case "4":
        metadata.element = HeroElement.LIGHT;
        break;
      case "5":
        metadata.element = HeroElement.DARK;
        break;
    }

    // Extract class from code pattern (this is more complex and may need refinement)
    // For now, we'll use a simple heuristic based on common patterns
    const codeNumber = parseInt(code.substring(1), 10);

    // This is a simplified heuristic - in reality, we'd need a comprehensive mapping
    if (codeNumber >= 1000 && codeNumber < 2000) {
      metadata.class = HeroClass.WARRIOR;
    } else if (codeNumber >= 2000 && codeNumber < 3000) {
      metadata.class = HeroClass.MAGE;
    } else if (codeNumber >= 3000 && codeNumber < 4000) {
      metadata.class = HeroClass.THIEF;
    } else if (codeNumber >= 4000 && codeNumber < 5000) {
      metadata.class = HeroClass.RANGER;
    } else if (codeNumber >= 5000 && codeNumber < 6000) {
      metadata.class = HeroClass.KNIGHT;
    } else if (codeNumber >= 6000 && codeNumber < 7000) {
      metadata.class = HeroClass.SOUL_WEAVER;
    }
  }

  // Fallback: try to extract from name patterns (for known heroes)
  const name = heroData.name as string;
  if (name && !metadata.element) {
    // Simple name-based element detection
    if (name.includes("Fire") || name.includes("Flame")) {
      metadata.element = HeroElement.FIRE;
    } else if (name.includes("Ice") || name.includes("Frost")) {
      metadata.element = HeroElement.ICE;
    } else if (name.includes("Earth") || name.includes("Nature")) {
      metadata.element = HeroElement.EARTH;
    } else if (name.includes("Light") || name.includes("Holy")) {
      metadata.element = HeroElement.LIGHT;
    } else if (name.includes("Dark") || name.includes("Shadow")) {
      metadata.element = HeroElement.DARK;
    }
  }

  return metadata;
}

/**
 * Get hero metadata by code (for known heroes)
 * This can be expanded as we learn more about hero code patterns
 */
export function getHeroMetadataByCode(heroCode: string): HeroMetadata | null {
  // For now, we'll use the dynamic extraction
  return extractHeroMetadata({ code: heroCode });
}

/**
 * Get hero metadata by name (fallback)
 */
export function getHeroMetadataByName(heroName: string): HeroMetadata | null {
  return extractHeroMetadata({ name: heroName });
}
