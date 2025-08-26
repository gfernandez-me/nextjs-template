import { Button } from "@/components/ui/button";
import { GearItemFields } from "../form-fields/gear-item-fields";
import type { StatTypes } from "#prisma";
import { Item } from "../hooks/use-recommendation-form";

// ============================================================================
// ITEMS MANAGEMENT COMPONENT
// ============================================================================

interface ItemsManagementProps {
  items: Item[];
  statTypes: StatTypes[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, patch: Partial<Item>) => void;
}

export function ItemsManagement({
  items,
  statTypes,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}: ItemsManagementProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Gear Items</h3>
        <Button type="button" onClick={onAddItem} variant="secondary">
          Add Item
        </Button>
      </div>

      {items.map((item, idx) => (
        <div key={idx} className="space-y-4">
          <GearItemFields
            item={item}
            index={idx}
            statTypes={statTypes}
            onUpdate={onUpdateItem}
          />

          {items.length > 1 && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="destructive"
                onClick={() => onRemoveItem(idx)}
              >
                Remove Item
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
