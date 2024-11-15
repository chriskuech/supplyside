import { fail } from 'assert'
import { match, P } from 'ts-pattern'
import { fields } from '../templates'
import { Option, SchemaData, SchemaField, SchemaFieldData } from '../types'
import { FieldReference, OptionReference } from './reference'

export class Schema {
  constructor(readonly schema: SchemaData) {}

  get type() {
    return this.schema.resourceType
  }

  get accountId() {
    return this.schema.accountId
  }

  get fields() {
    return this.schema.fields.map((field) => this.getField(field))
  }

  getField(fieldRef: FieldReference): SchemaField {
    const field =
      this.schema.fields.find((f) => Schema.isMatchingField(fieldRef, f)) ??
      fail(`Field ${JSON.stringify(fieldRef)} does not exist`)

    return {
      ...field,
      template: field.templateId
        ? Schema.findTemplateField(field.templateId)
        : null,
    }
  }

  getFieldOption(fieldRef: FieldReference, optionRef: OptionReference): Option {
    const { options, name } = this.getField(fieldRef)

    return (
      options.find((o) => Schema.isMatchingOption(optionRef, o)) ??
      fail(
        `Option ${JSON.stringify(optionRef)} does not exist in ${this.type}[${name}]`,
      )
    )
  }

  implements(...fieldRefs: FieldReference[]) {
    return fieldRefs.every((fieldRef) =>
      this.schema.fields.find((f) => Schema.isMatchingField(fieldRef, f)),
    )
  }

  private static isMatchingField(
    fieldRef: FieldReference,
    field: SchemaFieldData,
  ) {
    return match(fieldRef)
      .with(
        { templateId: P.string },
        ({ templateId }) => field.templateId === templateId,
      )
      .with({ fieldId: P.string }, ({ fieldId }) => field.fieldId === fieldId)
      .with({ name: P.string }, ({ name }) => field.name === name)
      .exhaustive()
  }

  private static isMatchingOption(optionRef: OptionReference, option: Option) {
    return match(optionRef)
      .with(
        { templateId: P.string },
        ({ templateId }) => option.templateId === templateId,
      )
      .with({ id: P.string }, ({ id }) => option.id === id)
      .with({ name: P.string }, ({ name }) => option.name === name)
      .exhaustive()
  }

  private static findTemplateField(templateId: string) {
    return (
      Object.values(fields).find((field) => field.templateId === templateId) ??
      fail(`Template field ${templateId} does not exist`)
    )
  }
}
