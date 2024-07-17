import { fail } from 'assert'
import { FieldType, Value } from '@prisma/client'
import { P, match } from 'ts-pattern'
import { OrderBy, Where } from './types'
import { mapUuidToBase64, sanitizeValue } from '@/lib/sanitize'
import { Schema, Field } from '@/domain/schema/types'

export type MapToSqlParams = {
  accountId: string
  schema: Schema
  where: Where | undefined
  orderBy: OrderBy[] | undefined
}

export const createSql = ({
  accountId,
  schema,
  where,
  orderBy,
}: MapToSqlParams) => /*sql*/ `
    WITH "View" AS (
      SELECT
        ${[
          '"Resource"."id" AS "_id"',
          ...schema.allFields.map(
            (f) =>
              `(${createPropertySubquery(f)}) AS "${mapUuidToBase64(f.id)}"`,
          ),
        ].join(', ')}
      FROM "Resource"
      WHERE "Resource"."accountId" = '${accountId}'
        AND "type" = '${schema.resourceType}'
    )
    SELECT "_id"
    FROM "View"
    ${where ? `WHERE ${createWhere(where, schema)}` : ''}
    ${orderBy ? `ORDER BY ${createOrderBy(orderBy)}` : ''}
  `

const createWhere = (where: Where, schema: Schema) =>
  match(where)
    .with(
      { '==': P.any },
      ({ '==': [{ var: var_ }, val] }) =>
        `${resolveFieldNameToColumn(var_, schema)} = ${sanitizeValue(val)}`,
    )
    .with(
      { '!=': P.any },
      ({ '!=': [{ var: var_ }, val] }) =>
        `${resolveFieldNameToColumn(var_, schema)} <> ${sanitizeValue(val)}`,
    )
    .exhaustive()

const createOrderBy = (orderBy: OrderBy[]) =>
  orderBy.map((o) => `${sanitizeValue(o.var)} ${o.dir}`).join(', ')

const createPropertySubquery = (field: Field) =>
  match(field.type)
    .with(
      'Contact',
      () => /*sql*/ `
        SELECT "Contact"."name"
        FROM "ResourceField"
        LEFT JOIN "Contact" ON "Contact"."valueId" = "ResourceField"."valueId"
        WHERE "Resource"."id" = "ResourceField"."resourceId"
          AND "ResourceField"."fieldId" = '${field.id}'
      `,
    )
    .with(
      'MultiSelect',
      () => /*sql*/ `
        SELECT array_agg("ValueOption"."optionId")
        FROM "ResourceField"
        LEFT JOIN "ValueOption" ON "ValueOption"."valueId" = "ResourceField"."valueId"
        WHERE "Resource"."id" = "ResourceField"."resourceId"
          AND "ResourceField"."fieldId" = '${field.id}'
      `,
    )
    .with(
      P.any,
      (t) => /*sql*/ `
        SELECT "Value"."${mapFieldTypeToValueColumn(t)}"
        FROM "ResourceField"
        LEFT JOIN "Value" ON "Value"."id" = "ResourceField"."valueId"
        WHERE "Resource"."id" = "ResourceField"."resourceId"
          AND "ResourceField"."fieldId" = '${field.id}'
      `,
    )
    .exhaustive()

type PrimitiveFieldType = Exclude<FieldType, 'Contact' | 'MultiSelect'>

const mapFieldTypeToValueColumn = (t: PrimitiveFieldType) =>
  match<PrimitiveFieldType, keyof Value>(t)
    .with('Checkbox', () => 'boolean')
    .with('Date', () => 'date')
    .with('File', () => 'fileId')
    .with(P.union('Money', 'Number'), () => 'number')
    .with('User', () => 'userId')
    .with('Select', () => 'optionId')
    .with(P.union('Textarea', 'Text'), () => 'string')
    .with('Resource', () => 'resourceId')
    .exhaustive()

const resolveFieldNameToColumn = (fieldName: string, schema: Schema) => {
  const field =
    schema.allFields.find((f) => f.name === fieldName) ??
    fail(
      `Field with name "${fieldName}" not found in Schema ${schema.resourceType}`,
    )

  return `"${mapUuidToBase64(field.id)}"`
}
