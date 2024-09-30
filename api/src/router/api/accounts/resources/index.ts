import { container } from "@supplyside/api/di";
import { ResourceService } from "@supplyside/api/domain/resource/ResourceService";
import {
  ResourceSchema,
  ResourceTypeSchema,
  ValueInputSchema,
  ValueResourceSchema,
} from "@supplyside/model";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { mountCosts } from "./costs";
import { JsonLogicSchema } from "@supplyside/api/domain/resource/json-logic/types";
import { pick } from "remeda";

export const mountResources = async <App extends FastifyInstance>(app: App) =>
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(mountCosts, { prefix: "/:resourceId/costs" })
    .route({
      method: "GET",
      url: "/",
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        querystring: z.object({
          resourceType: ResourceTypeSchema,
          where: JsonLogicSchema.optional(),
        }),
        response: {
          200: z.array(ResourceSchema),
        },
        tags: ["Resources"],
      },
      handler: async (req, res) => {
        const service = container.resolve(ResourceService);

        const resources = await service.readResources({
          accountId: req.params.accountId,
          type: req.query.resourceType,
        });

        res.status(200).send(resources);
      },
    })
    .route({
      method: "GET",
      url: "/find-by-name-or-po-number/",
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        querystring: z.object({
          resourceType: ResourceTypeSchema,
          input: z.string(),
          exact: z.boolean().optional(),
        }),
        response: {
          200: z.array(ValueResourceSchema),
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(ResourceService);

        const resources = await service.findResourcesByNameOrPoNumber({
          accountId: req.params.accountId,
          resourceType: req.query.resourceType,
          input: req.query.input,
          exact: req.query.exact,
        });

        res.status(200).send(resources);
      },
    })
    .route({
      method: "GET",
      url: "/find-backlinks/",
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        querystring: z.object({
          resourceType: ResourceTypeSchema,
          resourceId: z.string().uuid(),
        }),
        response: {
          200: z.array(ResourceSchema),
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(ResourceService);

        const resources = await service.findBacklinks(
          req.params.accountId,
          req.query.resourceType,
          req.query.resourceId
        );

        res.status(200).send(resources);
      },
    })
    .route({
      method: "POST",
      url: "/",
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        body: z.object({
          resourceType: ResourceTypeSchema,
          fields: z
            .array(
              z.object({
                fieldId: z.string().uuid(),
                valueInput: ValueInputSchema,
              })
            )
            .optional(),
        }),
        response: {
          200: ResourceSchema,
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(ResourceService);

        const resource = await service.createResource({
          accountId: req.params.accountId,
          type: req.body.resourceType,
          fields: req.body.fields,
        });

        res.status(200).send(resource);
      },
    })
    .route({
      method: "GET",
      url: "/head/",
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
        }),
        querystring: z.object({
          resourceType: ResourceTypeSchema,
          resourceKey: z.number().int().positive(),
        }),
        response: {
          200: z.object({
            id: z.string().uuid(),
            key: z.number().int().positive(),
            type: ResourceTypeSchema,
          }),
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(ResourceService);

        const resource = await service.readResource({
          accountId: req.params.accountId,
          type: req.query.resourceType,
          key: req.query.resourceKey,
        });

        res.status(200).send(pick(resource, ["id", "key", "type"]));
      },
    })
    .route({
      method: "GET",
      url: "/:resourceId/",
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceId: z.string().uuid(),
        }),
        response: {
          200: ResourceSchema,
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(ResourceService);

        const resource = await service.readResource({
          accountId: req.params.accountId,
          id: req.params.resourceId,
        });

        res.send(resource);
      },
    })
    .route({
      method: "PATCH",
      url: "/:resourceId/",
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceId: z.string().uuid(),
        }),
        body: z.array(
          z.object({ fieldId: z.string().uuid(), valueInput: ValueInputSchema })
        ),
        response: {
          200: ResourceSchema,
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(ResourceService);

        const resource = await service.updateResource({
          accountId: req.params.accountId,
          resourceId: req.params.resourceId,
          fields: req.body,
        });

        res.status(200).send(resource);
      },
    })
    .route({
      method: "DELETE",
      url: "/:resourceId/",
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceId: z.string().uuid(),
        }),
      },
      handler: async (req, res) => {
        const service = container.resolve(ResourceService);

        await service.deleteResource({
          accountId: req.params.accountId,
          id: req.params.resourceId,
        });

        res.send();
      },
    })
    .route({
      method: "POST",
      url: "/:resourceId/clone/",
      schema: {
        params: z.object({
          accountId: z.string().uuid(),
          resourceId: z.string().uuid(),
        }),
        response: {
          200: ResourceSchema,
        },
      },
      handler: async (req, res) => {
        const service = container.resolve(ResourceService);

        const resource = await service.cloneResource(
          req.params.accountId,
          req.params.resourceId
        );

        res.send(resource);
      },
    });
