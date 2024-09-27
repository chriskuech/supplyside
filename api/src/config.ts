import z from "zod";

export const config = z
  .object({
    API_KEY: z.string().min(1),
    NODE_ENV: z.enum(["development", "integration", "production"]),
    PORT: z.coerce.number(),
  })
  .parse(process.env);
