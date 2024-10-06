import { Prisma } from '@prisma/client'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import {
  ResourceType,
  ResourceTypeSchema,
  ValueResource,
  fields,
} from '@supplyside/model'
import { inject, injectable } from 'inversify'
import { z } from 'zod'

@injectable()
export class ValueResourceService {
  constructor(@inject(PrismaService) private readonly prisma: PrismaService) {}

  async findResourcesByNameOrPoNumber(
    accountId: string,
    resourceType: ResourceType,
    { input, exact, take }: { input: string; exact?: boolean; take?: number },
  ): Promise<ValueResource[]> {
    const results = await this.prisma.$queryRaw`
      WITH "View" AS (
        SELECT
          "Resource".*,
          "Value"."string" AS "name"
        FROM "Resource"
        LEFT JOIN "ResourceField" ON "Resource".id = "ResourceField"."resourceId"
        LEFT JOIN "Field" ON "ResourceField"."fieldId" = "Field".id
        LEFT JOIN "Value" ON "ResourceField"."valueId" = "Value".id
        WHERE "Resource"."type" = ${resourceType}::"ResourceType"
          AND "Resource"."accountId" = ${accountId}::"uuid"
          AND "Field"."templateId" IN (${fields.name.templateId}::uuid, ${
            fields.poNumber.templateId
          }::uuid)
          AND "Value"."string" <> ''
          AND "Value"."string" IS NOT NULL
      )
      SELECT "id", "type", "key", "name", "templateId"
      FROM "View"
      ${
        exact
          ? Prisma.sql`WHERE "name" = ${input}`
          : Prisma.sql`WHERE "name" ILIKE '%' || ${input} || '%' OR "name" % ${input} -- % operator uses pg_trgm for similarity matching`
      }
      ORDER BY similarity("name", ${input}) DESC
      LIMIT ${take ?? 15}
    `

    return z
      .object({
        id: z.string(),
        type: ResourceTypeSchema,
        name: z.string(),
        key: z.number(),
        templateId: z.string().nullable(),
      })
      .array()
      .parse(results)
  }
}
