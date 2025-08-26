import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import {
  GearType,
  MainStatType,
  StatTypes,
  GearRecommendation,
  GearRecommendationItem,
  StatTypes as StatTypesModel,
} from "#prisma";
import type { HeroForRecommendation } from "../../data/actions";
import { hasMainSubstatConflict } from "@/lib/stat-validation";
import {
  DEFAULT_FORM_VALUES,
  FORM_MESSAGES,
} from "../constants/form-constants";

// Type for recommendation with included relations (with serialized decimals)
type RecommendationWithItems = GearRecommendation & {
  GearRecommendationItem: (GearRecommendationItem & {
    StatType1: Omit<StatTypesModel, "weight"> & { weight: number };
    StatType2: (Omit<StatTypesModel, "weight"> & { weight: number }) | null;
    StatType3: (Omit<StatTypesModel, "weight"> & { weight: number }) | null;
    StatType4: (Omit<StatTypesModel, "weight"> & { weight: number }) | null;
  })[];
};

// ============================================================================
// FORM SCHEMAS AND TYPES
// ============================================================================

const itemSchema = z.object({
  type: z.nativeEnum(GearType),
  mainStatType: z.nativeEnum(MainStatType),
  statType1Id: z.string().min(1),
  statType2Id: z.string().optional(),
  statType3Id: z.string().optional(),
  statType4Id: z.string().optional(),
});

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  heroName: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

export type Item = z.infer<typeof itemSchema>;
export type FormValues = z.infer<typeof schema>;

// ============================================================================
// FORM LOGIC HOOK
// ============================================================================

export function useRecommendationForm(
  heroes: HeroForRecommendation[],
  statTypes: StatTypes[],
  recommendation?: RecommendationWithItems
) {
  const router = useRouter();

  // Initialize form with existing data if editing
  const initialValues = React.useMemo(() => {
    if (!recommendation) return DEFAULT_FORM_VALUES;

    return {
      name: recommendation.name,
      heroName: recommendation.heroName || "",
      items: recommendation.GearRecommendationItem.map((item) => ({
        type: item.type,
        mainStatType: item.mainStatType,
        statType1Id: item.statType1Id.toString(),
        statType2Id: item.statType2Id?.toString() || "",
        statType3Id: item.statType3Id?.toString() || "",
        statType4Id: item.statType4Id?.toString() || "",
      })),
    };
  }, [recommendation]);

  const [values, setValues] = React.useState<FormValues>(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = React.useState(false);

  // ============================================================================
  // ITEM MANAGEMENT FUNCTIONS
  // ============================================================================

  function updateItem(index: number, patch: Partial<Item>) {
    setValues((v) => {
      const next = { ...v };
      next.items = v.items.map((it, i) =>
        i === index ? { ...it, ...patch } : it
      );
      return next;
    });
  }

  function addItem() {
    setValues((v) => ({
      ...v,
      items: [
        ...v.items,
        {
          type: GearType.WEAPON,
          mainStatType: MainStatType.ATT,
          statType1Id: "",
        },
      ],
    }));
  }

  function removeItem(index: number) {
    setValues((v) => ({ ...v, items: v.items.filter((_, i) => i !== index) }));
  }

  // ============================================================================
  // FORM SUBMISSION LOGIC
  // ============================================================================

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const zErrors: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(parsed.error.format())) {
        const errorValue = v as { _errors?: string[] };
        if (Array.isArray(errorValue._errors) && errorValue._errors.length) {
          zErrors[k] = errorValue._errors;
        }
      }
      setErrors(zErrors);
      setSubmitting(false);
      return;
    }

    // Validate main stat and substat conflicts
    const validationErrors: Record<string, string[]> = {};
    for (let i = 0; i < parsed.data.items.length; i++) {
      const item = parsed.data.items[i];
      const substatIds = [
        item.statType1Id,
        item.statType2Id,
        item.statType3Id,
        item.statType4Id,
      ];

      if (hasMainSubstatConflict(item.mainStatType, substatIds, statTypes)) {
        validationErrors[`items.${i}.mainStatType`] = [
          "Cannot have main stat as substat on the same gear",
        ];
        break;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: recommendation?.id, // Include ID for updates
          name: parsed.data.name,
          heroName: parsed.data.heroName || undefined,
          items: parsed.data.items.map((it) => ({
            type: it.type,
            mainStatType: it.mainStatType,
            statType1Id: parseInt(it.statType1Id),
            statType2Id: it.statType2Id ? parseInt(it.statType2Id) : undefined,
            statType3Id: it.statType3Id ? parseInt(it.statType3Id) : undefined,
            statType4Id: it.statType4Id ? parseInt(it.statType4Id) : undefined,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(
          recommendation
            ? "Failed to update recommendation"
            : "Failed to create recommendation"
        );
      }

      const successMessage = recommendation
        ? FORM_MESSAGES.UPDATE_SUCCESS
        : FORM_MESSAGES.CREATE_SUCCESS;
      toast.success(successMessage);
      router.push("/recommendations");
      router.refresh();
    } catch (err) {
      console.error(err);
      const errorMessage = recommendation
        ? FORM_MESSAGES.UPDATE_ERROR
        : FORM_MESSAGES.CREATE_ERROR;
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================================
  // HERO SELECTION LOGIC
  // ============================================================================

  const selectedHero = heroes.find((h) => h.name === values.heroName);

  const handleHeroChange = (heroName: string | null) => {
    if (heroName) {
      setValues((v) => ({ ...v, heroName }));
    } else {
      setValues((v) => ({ ...v, heroName: "" }));
    }
  };

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    values,
    setValues,
    errors,
    submitting,
    selectedHero,
    handleSubmit,
    updateItem,
    addItem,
    removeItem,
    handleHeroChange,
  };
}
