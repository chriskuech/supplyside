import { z } from "zod";

export const resourceTypes = [
  "Bill",
  "Customer",
  "Item",
  "Line",
  "Purchase",
  "Vendor",
] as const;

export const ResourceTypeSchema = z.enum(resourceTypes);

export type ResourceType = z.infer<typeof ResourceTypeSchema>;
