import { GearType, MainStatType } from "#prisma";

// ============================================================================
// FORM CONSTANTS AND DEFAULT VALUES
// ============================================================================

// Default gear item values
export const DEFAULT_GEAR_ITEM = {
  type: GearType.WEAPON,
  mainStatType: MainStatType.ATT,
  statType1Id: "",
  statType2Id: "",
  statType3Id: "",
  statType4Id: "",
};

// Default form values
export const DEFAULT_FORM_VALUES = {
  name: "",
  heroName: "",
  items: [DEFAULT_GEAR_ITEM],
};

// Form validation messages
export const FORM_MESSAGES = {
  NAME_REQUIRED: "Name is required",
  CREATE_SUCCESS: "Recommendation created successfully",
  CREATE_ERROR: "Failed to create recommendation",
  CREATING: "Creating…",
  CREATE: "Create Recommendation",
} as const;

// Substat field labels
export const SUBSTAT_LABELS = {
  1: "Select stat (required)",
  2: "Select stat (optional)",
  3: "Select stat (optional)",
  4: "Select stat (optional)",
} as const;

// Form field names
export const FORM_FIELD_NAMES = {
  NAME: "name",
  HERO_NAME: "heroName",
  ITEMS: "items",
  GEAR_TYPE: "type",
  MAIN_STAT: "mainStatType",
  SUB_STAT_1: "statType1Id",
  SUB_STAT_2: "statType2Id",
  SUB_STAT_3: "statType3Id",
  SUB_STAT_4: "statType4Id",
} as const;
