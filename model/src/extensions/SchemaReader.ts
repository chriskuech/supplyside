import { fail } from 'assert'
import { isMatching, match, P } from 'ts-pattern'
import { Option, Schema, SchemaField } from '../core'
import { FieldReference, OptionReference } from './reference'

export class SchemaReader {
  constructor(readonly schema: Schema) {}

  get type() {
    return this.schema.resourceType
  }

  get accountId() {
    return this.schema.accountId
  }

  getField(fieldRef: FieldReference): SchemaField {
    return (
      this.schema.fields.find((f) =>
        SchemaReader.isMatchingField(fieldRef, f),
      ) ?? fail(`Field ${JSON.stringify(fieldRef)} does not exist`)
    )
  }

  getFieldOption(fieldRef: FieldReference, optionRef: OptionReference): Option {
    const { options, name } = this.getField(fieldRef)

    return (
      options.find((o) => isMatching(optionRef, o)) ??
      fail(
        `Option ${JSON.stringify(optionRef)} does not exist in ${this.type}[${name}]`,
      )
    )
  }

  implements(...fieldRefs: FieldReference[]) {
    return fieldRefs.every((fieldRef) =>
      this.schema.fields.find((f) => SchemaReader.isMatchingField(fieldRef, f)),
    )
  }

  private static isMatchingField(fieldRef: FieldReference, field: SchemaField) {
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
      .with({ optionId: P.string }, ({ optionId }) => option.id === optionId)
      .with({ name: P.string }, ({ name }) => option.name === name)
      .exhaustive()
  }
}
