import { FieldType, Value } from '@prisma/client'
import { FieldReference, Schema, SchemaFieldData } from '@supplyside/model'
import { P, match } from 'ts-pattern'
import { sanitizeValue } from './sanitize'
import { JsonLogic, OrderBy } from './types'

export type MapToSqlParams = {
  accountId: string
  schema: Schema
  where: JsonLogic | undefined
  orderBy?: OrderBy[] | undefined
  take?: number | undefined
}

export const createSql = ({
  accountId,
  schema,
  where,
  orderBy,
  take,
}: MapToSqlParams) =>
  /* sql */
  `
    WITH "View" AS (
      SELECT
        ${[
          '"Resource"."id" AS "_id"',
          ...schema.fields.map((f) => {
            const subquery = createPropertySubquery(f)
            const columnName = resolveColumn(schema, f)
            return `(${subquery}) AS ${columnName}`
          }),
        ].join(', ')}
      FROM "Resource"
      WHERE "Resource"."accountId" = '${accountId}'
        AND "type" = '${schema.type}'
    )
    SELECT "_id"
    FROM "View"
    ${where ? `WHERE ${createWhere(where, schema)}` : ''}
    ${orderBy ? `ORDER BY ${createOrderBy(orderBy)}` : ''}
    ${take ? `LIMIT ${take}` : ''}
  `

const createWhere = (where: JsonLogic, schema: Schema): string =>
  match(where)
    .with({ and: P.any }, ({ and: clauses }) =>
      clauses.map((c) => `(${createWhere(c, schema)})`).join(' AND '),
    )
    .with({ or: P.any }, ({ or: clauses }) =>
      clauses.map((c) => `(${createWhere(c, schema)})`).join(' OR '),
    )
    .with({ '==': P.any }, ({ '==': [{ var: name }, val] }) =>
      match(val)
        .with(null, () => `${resolveColumn(schema, { name })} IS NULL`)
        .with(
          P.union(true, false),
          () =>
            `${resolveColumn(schema, { name })} IS ${val ? 'TRUE' : 'FALSE'}`,
        )
        .otherwise(
          () => `${resolveColumn(schema, { name })} = ${sanitizeValue(val)}`,
        ),
    )
    .with({ '!=': P.any }, ({ '!=': [{ var: name }, val] }) =>
      match(val)
        .with(null, () => `${resolveColumn(schema, { name })} IS NOT NULL`)
        .with(
          P.union(true, false),
          () =>
            `${resolveColumn(schema, { name })} IS NOT ${val ? 'TRUE' : 'FALSE'}`,
        )
        .otherwise(
          () => `${resolveColumn(schema, { name })} <> ${sanitizeValue(val)}`,
        ),
    )
    .with(
      { '<': P.any },
      ({ '<': [{ var: name }, val] }) =>
        `${resolveColumn(schema, { name })} < ${sanitizeValue(val)}`,
    )
    .with(
      { '>=': P.any },
      ({ '>=': [{ var: name }, val] }) =>
        `${resolveColumn(schema, { name })} >= ${sanitizeValue(val)}`,
    )
    .with(
      { '>': P.any },
      ({ '>': [{ var: name }, val] }) =>
        `${resolveColumn(schema, { name })} > ${sanitizeValue(val)}`,
    )
    .with(
      { '<=': P.any },
      ({ '<=': [{ var: name }, val] }) =>
        `${resolveColumn(schema, { name })} <= ${sanitizeValue(val)}`,
    )
    .exhaustive()

const createOrderBy = (orderBy: OrderBy[]) =>
  orderBy.map((o) => `${sanitizeValue(o.var)} ${o.dir}`).join(', ')

const createPropertySubquery = ({ type, fieldId }: SchemaFieldData) =>
  match(type)
    .with(
      'Address',
      () => /*sql*/ `
        SELECT json_build_object(
          'streetAddress', "Address"."streetAddress",
          'city', "Address"."city",
          'state', "Address"."state",
          'zip', "Address"."zip",
          'country', "Address"."country"
        )
        FROM "ResourceField"
        LEFT JOIN "Value" ON "Value"."id" = "ResourceField"."valueId"
        LEFT JOIN "Address" ON "Address"."id" = "Value"."addressId"
        WHERE "Resource"."id" = "ResourceField"."resourceId"
          AND "ResourceField"."fieldId" = '${fieldId}'
      `,
    )
    .with(
      'Contact',
      () => /*sql*/ `
        SELECT "Contact"."name"
        FROM "ResourceField"
        LEFT JOIN "Value" ON "Value"."id" = "ResourceField"."valueId"
        LEFT JOIN "Contact" ON "Contact"."id" = "Value"."contactId"
        WHERE "Resource"."id" = "ResourceField"."resourceId"
          AND "ResourceField"."fieldId" = '${fieldId}'
      `,
    )
    .with(
      'Files',
      () => /*sql*/ `
        SELECT array_agg("ValueFile"."fileId")
        FROM "ResourceField"
        LEFT JOIN "ValueFile" ON "ValueFile"."valueId" = "ResourceField"."valueId"
        WHERE "Resource"."id" = "ResourceField"."resourceId"
          AND "ResourceField"."fieldId" = '${fieldId}'
      `,
    )
    .with(
      'MultiSelect',
      () => /*sql*/ `
        SELECT array_agg("ValueOption"."optionId")
        FROM "ResourceField"
        LEFT JOIN "ValueOption" ON "ValueOption"."valueId" = "ResourceField"."valueId"
        WHERE "Resource"."id" = "ResourceField"."resourceId"
          AND "ResourceField"."fieldId" = '${fieldId}'
      `,
    )
    .with(
      P.any,
      (t) => /*sql*/ `
        SELECT "Value"."${mapFieldTypeToValueColumn(t)}"
        FROM "ResourceField"
        LEFT JOIN "Value" ON "Value"."id" = "ResourceField"."valueId"
        WHERE "Resource"."id" = "ResourceField"."resourceId"
          AND "ResourceField"."fieldId" = '${fieldId}'
      `,
    )
    .exhaustive()

type PrimitiveFieldType = Exclude<
  FieldType,
  'Address' | 'Contact' | 'Files' | 'MultiSelect'
>

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

const resolveColumn = (schema: Schema, field: FieldReference) => {
  const { fieldId, name } = schema.getField(field)

  return `"${name.replace(/[^a-zA-Z0-9]/g, '-')}_${fieldId}"`
}
