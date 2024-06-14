import { Prisma, ResourceType } from '@prisma/client'
import { Sql } from '@prisma/client/runtime/library'
import { JsonLogic } from './types'
import { Schema } from '@/lib/schema/types'

export type MapToSqlParams = {
  accountId: string
  resourceType: ResourceType
  query: JsonLogic
}

export const createSql = ({ accountId, resourceType, query }: MapToSqlParams) =>
  Prisma.sql`
    WITH "View" AS (
      SELECT
        "Resource"."id" AS "resourceId",
        "Resource"."type" AS "resourceType",
        "Field"."name" AS "fieldName",
        "Value"."boolean" AS "valueBoolean",
        "Value"."number" AS "valueNumber",
        "Value"."string" AS "valueString",
        "Value"."userId" AS "valueUserId",
        "Value"."optionId" AS "valueOptionId",
        "Value"."
      FROM "Resource"
      LEFT JOIN "ResourceField" ON "ResourceField"."resourceId" = "Resource"."id"
      LEFT JOIN "Field" ON "Field"."id" = "ResourceField"."fieldId"
      LEFT JOIN "Value" ON "Value"."id" = "ResourceField"."valueId"
    )
    SELECT "id"
    FROM "Resource"
    WHERE "accountId" = ${accountId}
      AND "type" = ${resourceType}
  `

const mapToClause = (schema: Schema, query: JsonLogic): Sql =>
  Prisma.sql`
  `
