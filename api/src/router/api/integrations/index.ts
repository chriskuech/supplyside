import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { mountQuickBooks } from "./quickbooks";
import { mountMcMasterCarr } from "./mcmaster";

export const mountIntegrations = async <App extends FastifyInstance>(
  app: App
) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(mountQuickBooks, {
      prefix: "/quickbooks",
    })
    // .register(mountPlaid, {
    //   prefix: "/plaid",
    // })
    .register(mountMcMasterCarr, {
      prefix: "/mcmaster",
    });
