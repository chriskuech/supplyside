import { z } from "zod";

export const fieldTypes = [
  "Address",
  "Checkbox",
  "Contact",
  "Date",
  "File",
  "Files",
  "Money",
  "MultiSelect",
  "Number",
  "Select",
  "Text",
  "Textarea",
  "User",
  "Resource",
] as const;

export const FieldTypeSchema = z.enum(fieldTypes);

export type FieldType = z.infer<typeof FieldTypeSchema>;
