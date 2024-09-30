import { FastifyInstance } from "fastify";
import { BlobService } from "@supplyside/api/domain/blob/BlobService";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { container } from "@supplyside/api/di";
import { z } from "zod";

export const mountBlobs = async <App extends FastifyInstance>(app: App) =>
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:blobId/",
    schema: {
      params: z.object({
        accountId: z.string().uuid(),
        blobId: z.string().uuid(),
      }),
    },
    handler: async (req, res) => {
      const service = container.resolve(BlobService);

      const blob = await service.readBlob({
        accountId: req.params.accountId,
        blobId: req.params.blobId,
      });

      res.send(blob);
    },
  });
