"use client";

import { Button } from "@/components/ui/button";
import type { StatTypes } from "#prisma";
import type { HeroForRecommendation } from "../data/actions";
import { useRecommendationForm } from "./hooks/use-recommendation-form";
import { NameField } from "./form-fields/name-field";
import { HeroField } from "./form-fields/hero-field";
import { ItemsManagement } from "./items-management/items-management";
import { FORM_MESSAGES } from "./constants/form-constants";

// Type for recommendation with included relations (with serialized decimals)
type RecommendationWithItems = {
  id: number;
  name: string;
  heroName: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  GearRecommendationItem: Array<{
    id: number;
    createdAt: Date;
    updatedAt: Date;
    type: import("#prisma").GearType;
    mainStatType: import("#prisma").MainStatType;
    statType1Id: number;
    statType2Id: number | null;
    statType3Id: number | null;
    statType4Id: number | null;
    gearRecommendationId: number;
    StatType1: Omit<import("#prisma").StatTypes, "weight"> & { weight: number };
    StatType2:
      | (Omit<import("#prisma").StatTypes, "weight"> & { weight: number })
      | null;
    StatType3:
      | (Omit<import("#prisma").StatTypes, "weight"> & { weight: number })
      | null;
    StatType4:
      | (Omit<import("#prisma").StatTypes, "weight"> & { weight: number })
      | null;
  }>;
};

// ============================================================================
// RECOMMENDATION FORM COMPONENT
// ============================================================================

interface RecommendationFormProps {
  heroes: HeroForRecommendation[];
  statTypes: StatTypes[];
  recommendation?: RecommendationWithItems;
}

export function RecommendationForm({
  heroes,
  statTypes,
  recommendation,
}: RecommendationFormProps) {
  const {
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
  } = useRecommendationForm(heroes, statTypes, recommendation);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <NameField
        value={values.name}
        onChange={(value) => setValues({ ...values, name: value ?? "" })}
        errors={errors["name"]}
      />

      <HeroField
        value={values.heroName || ""}
        onChange={(value) => setValues({ ...values, heroName: value })}
        onHeroChange={handleHeroChange}
        selectedHero={selectedHero}
        errors={errors["heroName"]}
      />

      <ItemsManagement
        items={values.items}
        statTypes={statTypes}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onUpdateItem={updateItem}
      />

      <div className="pt-4">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? recommendation
              ? FORM_MESSAGES.UPDATING
              : FORM_MESSAGES.CREATING
            : recommendation
            ? FORM_MESSAGES.UPDATE
            : FORM_MESSAGES.CREATE}
        </Button>
      </div>
    </form>
  );
}
