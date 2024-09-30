import { z } from "zod";
import { FieldTypeSchema } from "./field-type";
import { ValueSchema } from "./value";
import { ResourceTypeSchema } from "./resource-type";
import { CostSchema } from "./cost";

export const ResourceFieldSchema = z.object({
  fieldId: z.string(),
  fieldType: FieldTypeSchema,
  name: z.string(),
  templateId: z.string().nullable(),
  value: ValueSchema,
});

export const ResourceSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  templateId: z.string().nullable(),
  type: ResourceTypeSchema,
  key: z.number(),
  fields: z.array(ResourceFieldSchema),
  costs: z.array(CostSchema),
});

export type ResourceField = z.infer<typeof ResourceFieldSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
