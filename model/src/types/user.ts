import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  fullName: z.string().nullable(),
  email: z.string(),
  profilePicPath: z.string().nullable(),
  tsAndCsSignedAt: z.string().datetime().nullable(),
  isAdmin: z.boolean(),
  isApprover: z.boolean(),
  isGlobalAdmin: z.boolean(),
});

export type User = z.infer<typeof UserSchema>;
