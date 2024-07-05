import { JSONSchema7 } from 'json-schema'
import { mapToObj } from 'remeda'
import { P, match } from 'ts-pattern'
import { Field, Schema } from '../types'

const datePattern = '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
const emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
const phonePattern = '^[0-9]{10}$'
const uuidPattern =
  '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'

export const mapSchemaToJsonSchema = (schema: Schema): JSONSchema7 => ({
  type: 'object',
  properties: mapToObj(schema.fields, (f) => [
    f.name,
    match<Field, JSONSchema7>(f)
      .with({ type: 'Checkbox' }, () => ({ type: ['boolean', 'null'] }))
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
      }))
      .with({ type: 'Date' }, () => ({
        type: ['string', 'null'],
        pattern: datePattern,
      }))
      .with({ type: 'File' }, () => ({
        type: ['string', 'null'],
        pattern: uuidPattern,
      }))
      .with({ type: P.union('Number', 'Money') }, () => ({
        type: ['number', 'null'],
      }))
      .with({ type: 'MultiSelect' }, () => ({
        type: ['array', 'null'],
        items: { type: 'string', pattern: uuidPattern },
      }))
      .with({ type: P.union('Resource', 'Select', 'User') }, () => ({
        type: ['string', 'null'],
        pattern: uuidPattern,
      }))
      .with({ type: P.union('Text', 'Textarea') }, () => ({
        type: ['string', 'null'],
        minLength: 1,
      }))
      .exhaustive(),
  ]),
  additionalProperties: false,
})
