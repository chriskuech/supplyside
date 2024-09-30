import { container } from "@supplyside/api/di";
import { PlaidService } from "@supplyside/api/integrations/plaid";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export const mountPlaid = async <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .route({
      method: "GET",
      url: "/",
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            accounts: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
              })
            ),
            connectedAt: z.string().datetime(),
          }),
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(PlaidService);

        const accounts = await service.getPlaidAccounts(req.params.accountId);

        res.send({
          accounts: accounts.map((a) => ({ id: a.account_id, name: a.name })),
          connectedAt: new Date().toISOString(),
        });
      },
    })
    .route({
      method: "PUT",
      url: "/integrations/plaid/",
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
      },
      handler: async (req, res) => {
        res.send();
      },
    })
    .route({
      method: "POST",
      url: "/link-token/",
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        response: {
          200: z.string(),
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(PlaidService);

        const { link_token } = await service.createLinkToken(
          req.params.accountId
        );

        res.send(link_token);
      },
    });
