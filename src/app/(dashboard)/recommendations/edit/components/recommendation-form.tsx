"use client";

import { Button } from "@/components/ui/button";
import type { StatTypes } from "#prisma";
import type { HeroForRecommendation } from "../data/actions";
import { useRecommendationForm } from "./hooks/use-recommendation-form";
import { NameField } from "./form-fields/name-field";
import { HeroField } from "./form-fields/hero-field";
import { ItemsManagement } from "./items-management/items-management";
import { FORM_MESSAGES } from "./constants/form-constants";

// ============================================================================
// RECOMMENDATION FORM COMPONENT
// ============================================================================

interface RecommendationFormProps {
  heroes: HeroForRecommendation[];
  statTypes: StatTypes[];
  userId: string;
}

export function RecommendationForm({
  heroes,
  statTypes,
  userId,
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
  } = useRecommendationForm(heroes, statTypes, userId);

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
          {submitting ? FORM_MESSAGES.CREATING : FORM_MESSAGES.CREATE}
        </Button>
      </div>
    </form>
  );
}
