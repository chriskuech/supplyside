import { Schema, SchemaField } from '@supplyside/model'
import { JSONSchema7 } from 'json-schema'
import { mapToObj } from 'remeda'
import { P, match } from 'ts-pattern'

const datePattern = '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
const emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
const phonePattern = '^[0-9]{10}$'
const uuidPattern =
  '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'

export const mapSchemaToJsonSchema = (schema: Schema): JSONSchema7 => ({
  type: 'object',
  properties: mapToObj(schema.fields, (f) => [
    f.name,
    match<SchemaField, JSONSchema7>(f)
      .with({ type: 'Address' }, () => ({
        type: ['object', 'null'],
        properties: {
          streetAddress: { type: ['string', 'null'] },
          city: { type: ['string', 'null'] },
          state: { type: ['string', 'null'] },
          zip: { type: ['string', 'null'] },
          country: { type: ['string', 'null'] },
        },
      }))
      .with({ type: 'Checkbox' }, () => ({
        type: ['boolean', 'null'],
        description: f.description ?? undefined,
      }))
      .with({ type: 'Contact' }, () => ({
        type: ['object', 'null'],
        properties: {
          name: { type: ['string', 'null'], minLength: 1 },
          email: { type: ['string', 'null'], pattern: emailPattern },
          phone: {
            type: ['string', 'null'],
            pattern: phonePattern,
          },
          title: { type: ['string', 'null'], minLength: 1 },
        },
        description: f.description ?? undefined,
      }))
      .with({ type: 'Date' }, () => ({
        type: ['string', 'null'],
        pattern: datePattern,
        description: f.description ?? undefined,
      }))
      .with({ type: 'File' }, () => ({
        type: ['string', 'null'],
        pattern: uuidPattern,
        description: f.description ?? undefined,
      }))
      .with({ type: 'Files' }, () => ({
        type: ['array', 'null'],
        items: { type: 'string', pattern: uuidPattern },
        description: f.description ?? undefined,
      }))
      .with({ type: P.union('Number', 'Money') }, () => ({
        type: ['number', 'null'],
        description: f.description ?? undefined,
      }))
      .with({ type: 'MultiSelect' }, () => ({
        type: ['array', 'null'],
        items: [
          { type: 'string', pattern: uuidPattern },
          { type: 'string', enum: f.options.map((o) => o.name) },
        ],
        description: f.description ?? undefined,
      }))
      .with({ type: P.union('Resource', 'Select', 'User') }, () => ({
        type: ['string', 'null'],
        pattern: uuidPattern,
        description: f.description ?? undefined,
      }))
      .with({ type: P.union('Text', 'Textarea') }, () => ({
        type: ['string', 'null'],
        minLength: 1,
        description: f.description ?? undefined,
      }))
      .exhaustive(),
  ]),
  additionalProperties: false,
})
