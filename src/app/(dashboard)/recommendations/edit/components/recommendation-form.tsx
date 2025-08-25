"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";

import { GearType, MainStatType, Heroes, StatTypes } from "#prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { useAuth } from "@/hooks/useAuth";
import { createRecommendation } from "../data/actions";

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
  heroId: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

type Item = z.infer<typeof itemSchema>;
type FormValues = z.infer<typeof schema>;

interface RecommendationFormProps {
  heroes: Heroes[];
  statTypes: StatTypes[];
}

export function RecommendationForm({
  heroes,
  statTypes,
}: RecommendationFormProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [values, setValues] = React.useState<FormValues>({
    name: "",
    heroId: "",
    items: [
      {
        type: GearType.WEAPON,
        mainStatType: MainStatType.ATT,
        statType1Id: "",
      },
    ],
  });

  const [errors, setErrors] = React.useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = React.useState(false);

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

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitting(true);
    setErrors({});

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const zErrors: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(parsed.error.format())) {
        if (Array.isArray((v as any)._errors) && (v as any)._errors.length) {
          zErrors[k] = (v as any)._errors as string[];
        }
      }
      setErrors(zErrors);
      setSubmitting(false);
      return;
    }

    try {
      if (!user?.id) throw new Error("Not authenticated");

      await createRecommendation({
        name: parsed.data.name,
        userId: user.id,
        heroId: parsed.data.heroId ? parseInt(parsed.data.heroId) : undefined,
        items: parsed.data.items.map((it) => ({
          type: it.type,
          mainStatType: it.mainStatType,
          statType1Id: parseInt(it.statType1Id),
          statType2Id: it.statType2Id ? parseInt(it.statType2Id) : undefined,
          statType3Id: it.statType3Id ? parseInt(it.statType3Id) : undefined,
          statType4Id: it.statType4Id ? parseInt(it.statType4Id) : undefined,
        })),
      });

      toast.success("Recommendation created successfully");
      router.push("/recommendations");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create recommendation");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <FormField
        control={{
          value: values.name,
          onChange: (v) => setValues((s) => ({ ...s, name: String(v) })),
          name: "name",
          errors: errors["name"],
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange((e.target as HTMLInputElement).value)
                }
                placeholder="Enter recommendation name"
              />
            </FormControl>
            <FormMessage>{errors["name"]?.[0]}</FormMessage>
          </FormItem>
        )}
      />

      <FormField
        control={{
          value: values.heroId,
          onChange: (v) => setValues((s) => ({ ...s, heroId: String(v) })),
          name: "heroId",
          errors: errors["heroId"],
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hero</FormLabel>
            <FormControl>
              <Select
                value={field.value ?? ""}
                onValueChange={(val) => field.onChange(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a hero" />
                </SelectTrigger>
                <SelectContent>
                  {heroes.map((hero) => (
                    <SelectItem key={hero.id} value={hero.id.toString()}>
                      {hero.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage>{errors["heroId"]?.[0]}</FormMessage>
          </FormItem>
        )}
      />

      <div className="space-y-6">
        {values.items.map((item, idx) => (
          <div key={idx} className="border p-4 rounded-md space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={{
                  value: item.type,
                  onChange: (v) => updateItem(idx, { type: v as GearType }),
                  name: `items.${idx}.type`,
                  errors: [],
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gear Type</FormLabel>
                    <FormControl>
                      <Select
                        value={String(field.value)}
                        onValueChange={(val) => field.onChange(val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gear type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(GearType).map((t) => (
                            <SelectItem key={t} value={String(t)}>
                              {String(t)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={{
                  value: item.mainStatType,
                  onChange: (v) =>
                    updateItem(idx, { mainStatType: v as MainStatType }),
                  name: `items.${idx}.mainStatType`,
                  errors: [],
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Stat</FormLabel>
                    <FormControl>
                      <Select
                        value={String(field.value)}
                        onValueChange={(val) => field.onChange(val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select main stat" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(MainStatType).map((t) => (
                            <SelectItem key={t} value={String(t)}>
                              {String(t)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {[1, 2, 3, 4].map((n) => {
              const key = `statType${n}Id` as keyof Item;
              return (
                <FormField
                  key={n}
                  control={{
                    value: (item as any)[key],
                    onChange: (v) =>
                      updateItem(idx, { [key]: String(v) } as any),
                    name: `items.${idx}.${String(key)}`,
                    errors: [],
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub Stat {n}</FormLabel>
                      <FormControl>
                        <Select
                          value={String(field.value ?? "")}
                          onValueChange={(val) => field.onChange(val)}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                n === 1
                                  ? "Select stat (required)"
                                  : "Select stat (optional)"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {statTypes.map((stat) => (
                              <SelectItem
                                key={stat.id}
                                value={stat.id.toString()}
                              >
                                {stat.statName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            })}

            <div className="flex gap-2 justify-end">
              <Button variant="destructive" onClick={() => removeItem(idx)}>
                Remove
              </Button>
            </div>
          </div>
        ))}

        <div>
          <Button type="button" onClick={addItem} variant="secondary">
            Add Item
          </Button>
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create Recommendation"}
        </Button>
      </div>

      {/* Sub Stats */}
      {[1, 2, 3, 4].map((subStatNum) => (
        <FormField
          key={subStatNum}
          control={form.control}
          name={`items.${index}.statType${subStatNum}Id` as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub Stat {subStatNum}</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value as string}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        subStatNum === 1
                          ? "Select stat (required)"
                          : "Select stat (optional)"
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
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
      <Button type="submit">Create Recommendation</Button>
    </form>
  );
}
