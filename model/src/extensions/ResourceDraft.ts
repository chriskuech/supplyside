import { TypedResource } from './TypedResource'
import { FieldReference } from './reference'
import { selectSchemaFieldUnsafe } from './schema'

export class ResourceDraft extends TypedResource {
  private readonly _patches: Map<string, ValueInput> = new Map()
  private readonly _costs: Map<string, Cost> = new Map()

  get patchedFields() {
    return [...this._patches.entries()].map(([fieldId, value]) => ({
      field: selectSchemaFieldUnsafe(this.schema, { fieldId }),
      valueInput: value,
    }))
  }

  get patchedCosts() {
    return this.resource?._costs ?? []
  }

  get() {
    const { fieldId } = selectSchemaFieldUnsafe(this.schema, field)

    const patch = this._patches.get(fieldId)
    if (patch) return patch

    return {
      accountId: this.accountId,
      type: this.type,
      fields: this.patchedFields,
      costs: this.patchedCosts,
    }
  }

  hasPatch(field: FieldReference) {
    return this._patches.has(
      selectSchemaFieldUnsafe(this.schema, field).fieldId,
    )
  }

  set(field: FieldReference, value: ValueInput) {
    const { fieldId } = selectSchemaFieldUnsafe(this.schema, field)

    this._patches.set(fieldId, value)
    deriveFields(this)
  }

  setCost(cost: Cost) {
    this._costs.set(cost.name, cost)
  }
}
