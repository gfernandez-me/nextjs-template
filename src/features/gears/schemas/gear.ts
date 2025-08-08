import { z } from "zod";

export const FiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(200).default(50),
  type: z.string().optional(),
  rank: z.string().optional(), // e.g. "Epic|Heroic"
  main: z.string().optional(),
  q: z.string().optional(),
  maxed: z.coerce.boolean().optional(),
});

export type FiltersInput = z.infer<typeof FiltersSchema>;
