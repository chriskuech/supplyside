import z from "zod";

export const config = z
  .object({
    PORT: z.coerce.number(),
  })
  .parse(process.env);
