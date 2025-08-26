import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GearType, MainStatType, StatTypes } from "#prisma";
import {
  getMainStatLabel,
  getGearTypeLabel,
  getMainStatOptionsForGearType,
} from "@/lib/stat-labels";
import type { Item } from "../hooks/use-recommendation-form";
import { SUBSTAT_LABELS } from "../constants/form-constants";

// ============================================================================
// GEAR ITEM FORM FIELDS COMPONENT
// ============================================================================

interface GearItemFieldsProps {
  item: Item;
  index: number;
  statTypes: StatTypes[];
  onUpdate: (index: number, patch: Partial<Item>) => void;
}

export function GearItemFields({
  item,
  index,
  statTypes,
  onUpdate,
}: GearItemFieldsProps) {
  const updateItem = (patch: Partial<Item>) => onUpdate(index, patch);

  return (
    <div className="border p-4 rounded-md space-y-4">
      {/* Gear Type and Main Stat Row */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={{
            value: item.type,
            onChange: (v) => updateItem({ type: v as GearType }),
            name: `items.${index}.type`,
            errors: [],
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gear Type</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(val) => field.onChange(val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(GearType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {getGearTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={{
            value: item.mainStatType,
            onChange: (v) => updateItem({ mainStatType: v as MainStatType }),
            name: `items.${index}.mainStatType`,
            errors: [],
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Main Stat</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(val) => field.onChange(val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getMainStatOptionsForGearType(item.type).map(
                      (statType) => (
                        <SelectItem key={statType} value={statType}>
                          {getMainStatLabel(statType)}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Substat Fields Row */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((subStatNum) => {
          const key = `statType${subStatNum}Id` as keyof Item;
          return (
            <FormField
              key={subStatNum}
              control={{
                value: (item as Record<string, string>)[key] || "",
                onChange: (v) =>
                  updateItem({ [key]: String(v) } as Partial<Item>),
                name: `items.${index}.${String(key)}`,
                errors: [],
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Stat {subStatNum}</FormLabel>
                  <FormControl>
                    <Select
                      value={String(field.value ?? "")}
                      onValueChange={(val) => field.onChange(val)}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            SUBSTAT_LABELS[
                              subStatNum as keyof typeof SUBSTAT_LABELS
                            ]
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {statTypes.map((stat) => (
                          <SelectItem key={stat.id} value={stat.id.toString()}>
                            {stat.statName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
