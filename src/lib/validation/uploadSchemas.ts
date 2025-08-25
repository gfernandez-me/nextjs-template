import { z } from "zod";

// ============================================================================
// UPLOAD SCHEMAS
// ============================================================================

/**
 * Schema for file upload validation
 */
export const uploadSchema = z.object({
  file: z
    .instanceof(File, { message: "Please select a file" })
    .refine((file) => file.size > 0, "File cannot be empty")
    .refine(
      (file) => file.name.endsWith(".txt"),
      "Only .txt files are supported"
    )
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB limit
      "File size must be less than 10MB"
    ),
});

/**
 * Schema for Fribbels export data validation
 */
export const fribbelsSubstatSchema = z.object({
  type: z.string().min(1, "Stat type is required"),
  value: z.union([z.number(), z.string()]).transform((val) => {
    if (typeof val === "string") {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    }
    return val;
  }),
  rolls: z.number().optional(),
});

export const mainStatSchema = z.object({
  type: z.string().min(1, "Main stat type is required"),
  value: z.number().min(0, "Value must be non-negative"),
});

export const fribbelsItemSchema = z.object({
  id: z.union([z.number(), z.string()]),
  ingameId: z.union([z.number(), z.string()]).optional(),
  type: z.string().min(1, "Gear type is required"),
  gear: z.string().min(1, "Gear name is required"),
  rank: z.string().min(1, "Rank is required"),
  level: z.number().optional(),
  enhance: z.number().optional(),
  mainStatType: z.string().min(1, "Main stat type is required"),
  mainStatValue: z.union([z.number(), z.string()]).transform((val) => {
    if (typeof val === "string") {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? 0 : parsed;
    }
    return val;
  }),
  mainStatBaseValue: z.union([z.number(), z.string()]).optional(),
  statMultiplier: z.union([z.number(), z.string()]).optional(),
  tierMultiplier: z.union([z.number(), z.string()]).optional(),
  storage: z.boolean().optional(),
  code: z.string().optional(),
  substats: z.array(fribbelsSubstatSchema).optional(),
  equippedBy: z.union([z.number(), z.string()]).nullable().optional(),
  ingameEquippedId: z.union([z.number(), z.string()]).nullable().optional(),
});

export const fribbelsHeroSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  ingameId: z.union([z.number(), z.string()]).optional(),
  name: z.string().optional(),
  element: z.string().optional(),
  rarity: z.union([z.string(), z.number()]).optional(),
  class: z.string().optional(),
  attack: z.number().optional(),
  defense: z.number().optional(),
  health: z.number().optional(),
  speed: z.number().optional(),
  criticalHitChance: z.number().optional(),
  criticalHitDamage: z.number().optional(),
  effectiveness: z.number().optional(),
  effectResistance: z.number().optional(),
  weaponId: z.number().optional(),
  armorId: z.number().optional(),
  helmetId: z.number().optional(),
  necklaceId: z.number().optional(),
  ringId: z.number().optional(),
  bootId: z.number().optional(),
});

export const fribbelsExportSchema = z.object({
  items: z.array(fribbelsItemSchema).min(1, "At least one item is required"),
  heroes: z.array(fribbelsHeroSchema).optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type UploadFormData = z.infer<typeof uploadSchema>;
export type FribbelsSubstat = z.infer<typeof fribbelsSubstatSchema>;
export type MainStat = z.infer<typeof mainStatSchema>;
export type FribbelsItem = z.infer<typeof fribbelsItemSchema>;
export type FribbelsHero = z.infer<typeof fribbelsHeroSchema>;
export type FribbelsExport = z.infer<typeof fribbelsExportSchema>;

// Upload result types
export interface UploadResult {
  success: boolean;
  count: number;
  errors?: string[];
  message: string;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate file upload data
 */
export function validateUploadData(data: unknown): UploadFormData {
  return uploadSchema.parse(data);
}

/**
 * Validate Fribbels export data
 */
export function validateFribbelsExport(data: unknown): FribbelsExport {
  return fribbelsExportSchema.parse(data);
}

/**
 * Validate individual Fribbels item
 */
export function validateFribbelsItem(data: unknown): FribbelsItem {
  return fribbelsItemSchema.parse(data);
}

/**
 * Validate individual Fribbels hero
 */
export function validateFribbelsHero(data: unknown): FribbelsHero {
  return fribbelsHeroSchema.parse(data);
}
