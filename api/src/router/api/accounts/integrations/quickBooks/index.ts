import { container } from "@supplyside/api/di";
import { QuickBooksService } from "@supplyside/api/integrations/quickBooks/QuickBooksService";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export const mountQuickBooks = async <App extends FastifyInstance>(app: App) =>
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
            setupUrl: z.string().url(),
            connection: z.object({
              companyName: z.string().min(1),
              realmId: z.string().min(1),
              connectedAt: z.string().datetime(),
            }),
          }),
          404: z.undefined(),
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(QuickBooksService);

        const isConnected = await service.isConnected(req.params.accountId);

        if (isConnected) {
          const companyInfo = await service.getCompanyInfo(
            req.params.accountId
          );
          const realmId = await service.getAccountRealmId(req.params.accountId);
          const setupUrl = await service.getSetupUrl(req.params.accountId);

          res.status(200).send({
            setupUrl,
            connection: {
              companyName: companyInfo.CompanyInfo.CompanyName,
              realmId,
              connectedAt: new Date().toISOString(),
            },
          });
        } else {
          res.status(404).send();
        }
      },
    })
    .route({
      method: "PUT",
      url: "/bills/:billResourceId/",
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          billResourceId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
          }),
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(QuickBooksService);

        await service.pushBill(req.params.accountId, req.params.billResourceId);

        res.send({ success: true });
      },
    })
    .route({
      method: "POST",
      url: "/connect/",
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        querystring: z.object({
          url: z.string(),
        }),
      },
      handler: async (req, res) => {
        const service = container.resolve(QuickBooksService);

        const bills = await service.connect(
          req.params.accountId,
          req.query.url
        );

        res.send(bills);
      },
    })
    .route({
      method: "POST",
      url: "/disconnect/",
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
      },
      handler: async (req, res) => {
        const service = container.resolve(QuickBooksService);

        await service.disconnect(req.params.accountId);

        res.status(200).send({});
      },
    })
    .route({
      method: "POST",
      url: "/pull-data/",
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
      },
      handler: async (req, res) => {
        const service = container.resolve(QuickBooksService);

        await service.pullData(req.params.accountId);

        res.status(200).send({});
      },
    });
