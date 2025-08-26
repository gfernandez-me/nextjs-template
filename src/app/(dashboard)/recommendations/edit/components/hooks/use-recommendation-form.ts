import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { GearType, MainStatType, StatTypes } from "#prisma";
import type { HeroForRecommendation } from "../../data/actions";
import { createRecommendation } from "../../data/actions";
import {
  DEFAULT_FORM_VALUES,
  FORM_MESSAGES,
} from "../constants/form-constants";

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
  userId: string
) {
  const router = useRouter();

  const [values, setValues] = React.useState<FormValues>(DEFAULT_FORM_VALUES);
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

    try {
      await createRecommendation({
        name: parsed.data.name,
        userId: userId,
        heroName: parsed.data.heroName || undefined,
        items: parsed.data.items.map((it) => ({
          type: it.type,
          mainStatType: it.mainStatType,
          statType1Id: parseInt(it.statType1Id),
          statType2Id: it.statType2Id ? parseInt(it.statType2Id) : undefined,
          statType3Id: it.statType3Id ? parseInt(it.statType3Id) : undefined,
          statType4Id: it.statType4Id ? parseInt(it.statType4Id) : undefined,
        })),
      });

      toast.success(FORM_MESSAGES.CREATE_SUCCESS);
      router.push("/recommendations");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(FORM_MESSAGES.CREATE_ERROR);
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
