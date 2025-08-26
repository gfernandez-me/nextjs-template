import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { FormValues } from "../hooks/use-recommendation-form";

// ============================================================================
// NAME FIELD COMPONENT
// ============================================================================

interface NameFieldProps {
  value: string;
  onChange: (value?: string) => void;
  errors?: string[];
}

export function NameField({ value, onChange, errors }: NameFieldProps) {
  return (
    <FormField
      control={{
        value,
        onChange,
        name: "name",
        errors,
      }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input
              value={field.value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter recommendation name"
            />
          </FormControl>
          <FormMessage>{errors?.[0]}</FormMessage>
        </FormItem>
      )}
    />
  );
}
