import { z } from "zod";

export const ContactSchema = z.object({
  name: z.string().nullable(),
  title: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
});

export type Contact = z.infer<typeof ContactSchema>;
