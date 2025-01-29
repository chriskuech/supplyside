import {
  AddressSchema,
  ContactSchema,
  SchemaData,
  SchemaFieldData,
} from '@supplyside/model'
import { isTruthy } from 'remeda'
import { P, match } from 'ts-pattern'
import { ZodType, ZodTypeAny, z } from 'zod'
import { mapValueModelToEntity } from '../resource/mappers'
import { FieldModel, SchemaModel } from './model'

export const mapSchemaModelToEntity = (model: SchemaModel): SchemaData => ({
  accountId: model.accountId,
  resourceType: model.resourceType,
  sections: model.Section.flatMap((s) => ({
    id: s.id,
    name: s.name,
    fields: s.SectionField.map((sf) => sf.Field).map(mapFieldModelToEntity),
  })),
  fields: [
    ...model.SchemaField,
    ...model.Section.flatMap((s) => s.SectionField),
  ]
    .map((sf) => sf.Field)
    .map(mapFieldModelToEntity),
})

export const mapFieldModelToEntity = (model: FieldModel): SchemaFieldData => ({
  fieldId: model.id,
  templateId: model.templateId,
  name: model.name,
  description: model.description,
  type: model.type,
  options: model.Option.map((o) => ({
    id: o.id,
    name: o.name,
    templateId: o.templateId,
  })),
  resourceType: model.resourceType,
  defaultValue: model.DefaultValue && mapValueModelToEntity(model.DefaultValue),
  defaultToToday: model.defaultToToday,
  isRequired: model.isRequired,
})

const nameEnum = (field: SchemaFieldData) =>
  z.enum(field.options.map((o) => o.name) as [string, ...string[]])

const resolveNames = (field: SchemaFieldData, names: string[]) =>
  names
    .map((name) => field.options.find((o) => o.name === name)?.id)
    .filter(isTruthy)

const mapSchemaFieldToZodType = (
  field: SchemaFieldData,
): ZodTypeAny | undefined => {
  let schema: ZodTypeAny | undefined = match(field.type)
    .with('Address', () => AddressSchema.optional())
    .with('Checkbox', () => z.boolean().optional())
    .with('Contact', () => ContactSchema.optional())
    .with('Date', () =>
      z
        .string()
        .date()
        .transform((d) => new Date(d))
        .optional(),
    )
    .with(P.union('Money', 'Number'), () => z.number().optional())
    .with('MultiSelect', () =>
      field.options.length
        ? z
            .array(nameEnum(field))
            .transform((names) => resolveNames(field, names))
            .optional()
        : undefined,
    )
    .with('Resource', () =>
      z
        .string()
        .describe('The name or number that primarily identifies the resource')
        .optional(),
    )
    .with('Select', () =>
      field.options.length
        ? nameEnum(field)
            .transform((name) => resolveNames(field, [name]))
            .optional()
        : undefined,
    )
    .with(P.union('Text', 'Textarea'), () => z.string().optional())
    .with('User', () =>
      z
        .object({
          email: z.string().nullable(),
          name: z.string().nullable(),
        })
        .optional(),
    )
    .with(P.union('File', 'Files'), () => undefined)
    .exhaustive()

  if (field.description) {
    schema = schema?.describe(field.description)
  }

  return schema
}

export const mapSchemaEntityToZod = (schema: SchemaData): ZodType =>
  schema.fields.reduce((acc, field) => {
    const fieldSchema = mapSchemaFieldToZodType(field)

    return fieldSchema ? acc.extend({ [field.name]: fieldSchema }) : acc
  }, z.object({}))
