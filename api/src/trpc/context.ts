import { TRPCError } from "@trpc/server";
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { config } from "config";

export function createContext({ req }: CreateFastifyContextOptions) {
  if (req.headers.authorization !== `Bearer ${config.API_KEY}`) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return {}
}

export type Context = Awaited<ReturnType<typeof createContext>>;
