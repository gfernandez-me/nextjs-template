import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { HeroFilter } from "@/components/ui/hero-filter";
import type { HeroForRecommendation } from "../../data/actions";

// ============================================================================
// HERO FIELD COMPONENT
// ============================================================================

interface HeroFieldProps {
  value: string;
  onChange: (value?: string) => void;
  onHeroChange: (heroName: string | null) => void;
  selectedHero: HeroForRecommendation | undefined;
  errors?: string[];
}

export function HeroField({
  value,
  onChange,
  onHeroChange,
  selectedHero,
  errors,
}: HeroFieldProps) {
  return (
    <FormField
      control={{
        value,
        onChange,
        name: "heroName",
        errors,
      }}
      render={() => (
        <FormItem>
          <FormLabel>Hero</FormLabel>
          <FormControl>
            <HeroFilter
              value={selectedHero?.name || null}
              onValueChange={onHeroChange}
              placeholder="Select a hero"
            />
          </FormControl>
          <FormMessage>{errors?.[0]}</FormMessage>
        </FormItem>
      )}
    />
  );
}
