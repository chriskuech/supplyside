import { z } from "zod";
import { AddressSchema } from "./address";
import { ContactSchema } from "./contact";

export const ValueInputSchema = z
  .object({
    address: AddressSchema.nullable(),
    boolean: z.boolean().nullable(),
    contact: ContactSchema.nullable(),
    date: z.string().datetime().nullable(),
    number: z.number().nullable(),
    optionId: z.string().uuid().nullable(),
    optionIds: z.array(z.string().uuid()),
    string: z.string().nullable(),
    userId: z.string().uuid().nullable(),
    fileId: z.string().uuid().nullable(),
    fileIds: z.array(z.string().uuid()),
    resourceId: z.string().uuid().nullable(),
  })
  .partial();

export type ValueInput = z.infer<typeof ValueInputSchema>;
