"use client";

import * as React from "react";
import { ChevronDownIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxDisplay?: number;
  searchable?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onSelectionChange,
  placeholder = "Select options...",
  className,
  disabled = false,
  maxDisplay = 3,
  searchable = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchQuery) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchable, searchQuery]);

  const handleSelect = (value: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selected, value]);
    } else {
      onSelectionChange(selected.filter((item) => item !== value));
    }
  };

  const handleRemove = (value: string) => {
    onSelectionChange(selected.filter((item) => item !== value));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const displayCount = selected.length;
  const displayOptions = selected.slice(0, maxDisplay);
  const remainingCount = displayCount - maxDisplay;

  return (
    <div className={cn("relative", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2">
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="flex-1 justify-between"
              disabled={disabled}
            >
              <div className="flex flex-wrap gap-1 max-w-[calc(100%-20px)]">
                {displayCount === 0 ? (
                  <span className="text-muted-foreground">{placeholder}</span>
                ) : (
                  <>
                    {displayOptions.map((value) => {
                      const option = options.find((opt) => opt.value === value);
                      return (
                        <Badge
                          key={value}
                          variant="secondary"
                          className="mr-1 px-1 py-0.5 text-xs"
                        >
                          {option?.label || value}
                        </Badge>
                      );
                    })}
                    {remainingCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="px-1 py-0.5 text-xs"
                      >
                        +{remainingCount} more
                      </Badge>
                    )}
                  </>
                )}
              </div>
              <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>

          {/* Separate remove buttons outside dropdown trigger */}
          {displayOptions.map((value) => {
            const option = options.find((opt) => opt.value === value);
            return (
              <Button
                key={`remove-${value}`}
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted"
                onClick={() => {
                  handleRemove(value);
                }}
                title={`Remove ${option?.label || value}`}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
            );
          })}
        </div>
        <DropdownMenuContent className="w-full min-w-[200px] p-2">
          {searchable && (
            <div className="mb-2">
              <input
                type="text"
                placeholder="Search options..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
          <div className="max-h-[200px] overflow-y-auto">
            {filteredOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={selected.includes(option.value)}
                onCheckedChange={(checked) =>
                  handleSelect(option.value, !!checked)
                }
                disabled={option.disabled}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </div>
          {selected.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClearAll();
                }}
                className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                type="button"
              >
                Clear all
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
