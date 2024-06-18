import { FieldType, Value } from '@prisma/client'
import { P, match } from 'ts-pattern'
import { JsonLogicValue, OrderBy, Where } from './types'
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
}: MapToSqlParams) =>
  `
    WITH "View" AS (
      SELECT
        ${[
          '"Resource"."id" AS "_id"',
          ...schema.fields.map(
            (f) =>
              `(${createPropertySubquery(f)}) AS ${sanitizeColumnName(f.name)}`,
          ),
        ].join(', ')}
      FROM "Resource"
      WHERE "Resource"."accountId" = '${accountId}'
        AND "type" = '${schema.resourceType}'
    )
    SELECT "_id"
    FROM "View"
    ${where ? `WHERE ${createWhere(where)}` : ''}
    ${orderBy ? `ORDER BY ${createOrderBy(orderBy)}` : ''}
  `

const createWhere = (where: Where) =>
  match(where)
    .with(
      { '==': P.any },
      ({ '==': [{ var: var_ }, val] }) =>
        `${sanitizeColumnName(var_)} = ${sanitizeValue(val)}`,
    )
    .with(
      { '!=': P.any },
      ({ '!=': [{ var: var_ }, val] }) =>
        `${sanitizeColumnName(var_)} <> ${sanitizeValue(val)}`,
    )
    .exhaustive()

const createOrderBy = (orderBy: OrderBy[]) =>
  orderBy.map((o) => `${sanitizeValue(o.var)} ${o.dir}`).join(', ')

const createPropertySubquery = (field: Field) =>
  match(field.type)
    .with(
      'MultiSelect',
      () => `
        SELECT array_agg("ValueOption"."optionId")
        FROM "ResourceField"
        LEFT JOIN "ValueOption" ON "ValueOption"."valueId" = "ResourceField"."valueId"
        WHERE "Resource"."id" = "ResourceField"."resourceId"
          AND "ResourceField"."fieldId" = '${field.id}'
      `,
    )
    .with(
      P.any,
      (t) => `
        SELECT "Value"."${mapFieldTypeToValueColumn(t)}"
        FROM "ResourceField"
        LEFT JOIN "Value" ON "Value"."id" = "ResourceField"."valueId"
        WHERE "Resource"."id" = "ResourceField"."resourceId"
          AND "ResourceField"."fieldId" = '${field.id}'
      `,
    )
    .exhaustive()

const mapFieldTypeToValueColumn = (t: Exclude<FieldType, 'MultiSelect'>) =>
  match<Exclude<FieldType, 'MultiSelect'>, keyof Value>(t)
    .with('Checkbox', () => 'boolean')
    .with(P.union('Money', 'Number'), () => 'number')
    .with('User', () => 'userId')
    .with('Select', () => 'optionId')
    .with(P.union('RichText', 'Text'), () => 'string')
    .with('Resource', () => 'resourceId')
    .exhaustive()

const sanitizeColumnName = (column: string) => {
  if (!/^[a-zA-Z0-9_]+$/.test(column)) {
    throw new Error('Invalid column name')
  }

  return `"${column}"`
}

const sanitizeValue = (value: JsonLogicValue) =>
  match(value)
    .with(P.string, (s) => `'${s.replace(/'/g, "''")}'`)
    .with(P.union(P.boolean, P.number, null), (n) => String(n))
    .exhaustive()
