import { z } from "zod";

export const CostSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  isPercentage: z.boolean(),
  value: z.number(),
});

export type Cost = z.infer<typeof CostSchema>;
