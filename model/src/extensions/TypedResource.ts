import { Resource, Schema, SchemaField, ValueInput } from '../types'
import { FieldReference } from './reference'

// type TypedResourceParams = {
//   schema: Schema
//   resource?: Resource
// }

export type FieldData = {
  field: FieldReference
  valueInput: ValueInput
}

export class TypedResource {
  constructor(
    private readonly schema: Schema,
    private readonly resource?: Resource,
  ) {}

  get accountId() {
    return this.schema.accountId
  }

  get costs() {
    return this.resource?.costs ?? []
  }

  get type() {
    return this.schema.resourceType
  }

  getField(ref: FieldReference): SchemaField | undefined {
    return this.schema.fields.find(
      (f) =>
        ('fieldId' in ref && f.fieldId === ref.fieldId) ||
        ('templateId' in ref && f.templateId === ref.templateId) ||
        ('name' in ref && f.name === ref.name),
    )
  }

  get(ref: FieldReference): ValueInput | undefined {
    return this.resource?.fields.find(
      (f) =>
        ('fieldId' in ref && f.fieldId === ref.fieldId) ||
        ('templateId' in ref && f.templateId === ref.templateId) ||
        ('name' in ref && f.name === ref.name),
    )?.value
  }

  implements(...fields: FieldReference[]) {
    return fields.every((ref) => this.getField(ref))
  }
}
