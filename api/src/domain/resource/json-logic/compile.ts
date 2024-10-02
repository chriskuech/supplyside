import { FieldType, Value } from '@prisma/client'
import { P, match } from 'ts-pattern'
import { OrderBy, JsonLogic } from './types'
import { mapUuidToBase64, sanitizeValue } from './sanitize'
import {
  Schema,
  SchemaField,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'

export type MapToSqlParams = {
  accountId: string;
  schema: Schema;
  where: JsonLogic | undefined;
  orderBy: OrderBy[] | undefined;
};

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
          ...schema.fields.map(
            (f) =>
              `(${createPropertySubquery(f)}) AS "${mapUuidToBase64(
                f.fieldId
              )}"`
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

const createWhere = (where: JsonLogic, schema: Schema): string =>
  match(where)
    .with({ and: P.any }, ({ and: clauses }) =>
      clauses.map((c) => `(${createWhere(c, schema)})`).join(' AND ')
    )
    .with(
      { '==': P.any },
      ({ '==': [{ var: var_ }, val] }) =>
        `${resolveFieldNameToColumn(schema, var_)} = ${sanitizeValue(val)}`
    )
    .with(
      { '!=': P.any },
      ({ '!=': [{ var: var_ }, val] }) =>
        `${resolveFieldNameToColumn(schema, var_)} <> ${sanitizeValue(val)}`
    )
    .exhaustive()

const createOrderBy = (orderBy: OrderBy[]) =>
  orderBy.map((o) => `${sanitizeValue(o.var)} ${o.dir}`).join(', ')

const createPropertySubquery = ({ type, fieldId }: SchemaField) =>
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
      `
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
      `
    )
    .with(
      'Files',
      () => /*sql*/ `
        SELECT array_agg("ValueFile"."fileId")
        FROM "ResourceField"
        LEFT JOIN "ValueFile" ON "ValueFile"."valueId" = "ResourceField"."valueId"
        WHERE "Resource"."id" = "ResourceField"."resourceId"
          AND "ResourceField"."fieldId" = '${fieldId}'
      `
    )
    .with(
      'MultiSelect',
      () => /*sql*/ `
        SELECT array_agg("ValueOption"."optionId")
        FROM "ResourceField"
        LEFT JOIN "ValueOption" ON "ValueOption"."valueId" = "ResourceField"."valueId"
        WHERE "Resource"."id" = "ResourceField"."resourceId"
          AND "ResourceField"."fieldId" = '${fieldId}'
      `
    )
    .with(
      P.any,
      (t) => /*sql*/ `
        SELECT "Value"."${mapFieldTypeToValueColumn(t)}"
        FROM "ResourceField"
        LEFT JOIN "Value" ON "Value"."id" = "ResourceField"."valueId"
        WHERE "Resource"."id" = "ResourceField"."resourceId"
          AND "ResourceField"."fieldId" = '${fieldId}'
      `
    )
    .exhaustive()

type PrimitiveFieldType = Exclude<
  FieldType,
  'Address' | 'Contact' | 'Files' | 'MultiSelect'
>;

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

const resolveFieldNameToColumn = (schema: Schema, fieldName: string) => {
  const { fieldId } = selectSchemaFieldUnsafe(schema, { name: fieldName })

  return `"${mapUuidToBase64(fieldId)}"`
}
