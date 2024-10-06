import { AddressSchema, ContactSchema } from '@supplyside/model'
import { z } from 'zod'

export const ExtractionFieldModelSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('Address'),
    fieldId: z.string(),
    address: AddressSchema
  }),
  z.object({
    type: z.literal('Checkbox'),
    fieldId: z.string(),
    boolean: z.boolean()
  }),
  z.object({
    type: z.literal('Contact'),
    fieldId: z.string(),
    contact: ContactSchema
  }),
  z.object({
    type: z.literal('Date'),
    fieldId: z.string(),
    date: z.string()
  }),
  z.object({
    type: z.literal('Money'),
    fieldId: z.string(),
    number: z.number()
  }),
  z.object({
    type: z.literal('MultiSelect'),
    fieldId: z.string(),
    optionIds: z.array(z.string())
  }),
  z.object({
    type: z.literal('Number'),
    fieldId: z.string(),
    number: z.number()
  }),
  z.object({
    type: z.literal('Select'),
    fieldId: z.string(),
    optionId: z.string()
  }),
  z.object({
    type: z.literal('Text'),
    fieldId: z.string(),
    string: z.string()
  }),
  z.object({
    type: z.literal('Textarea'),
    fieldId: z.string(),
    string: z.string()
  }),
  z.object({
    type: z.literal('User'),
    fieldId: z.string(),
    userId: z.string()
  }),
  z.object({
    type: z.literal('Resource'),
    fieldId: z.string(),
    resourceId: z.string()
  })
])

export type ExtractionFieldModel = z.infer<typeof ExtractionFieldModelSchema>

export const ExtractionModelSchema = z.object({
  headerFields: z
    .array(ExtractionFieldModelSchema)
    .describe('The extracted header information'),
  costs: z
    .array(
      z.object({
        name: z.string(),
        isPercentage: z.boolean(),
        value: z
          .number()
          .describe(
            'The extracted cost value. If isPercentage is true, then this value is interpreted as a percentage instead of a dollar amount.'
          )
      })
    )
    .describe('The extracted costs'),
  lines: z
    .array(z.object({ fields: z.array(ExtractionFieldModelSchema) }))
    .describe(
      'The extracted line items (all documents must have at least one line)'
    )
})

export type ExtractionModel = z.infer<typeof ExtractionModelSchema>
