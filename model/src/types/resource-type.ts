import { z } from "zod";

export const resourceTypes = [
  "Bill",
  "Customer",
  "Item",
  "Purchase",
  "PurchaseLine",
  "Vendor",
] as const;

export const ResourceTypeSchema = z.enum(resourceTypes);

export type ResourceType = z.infer<typeof ResourceTypeSchema>;
