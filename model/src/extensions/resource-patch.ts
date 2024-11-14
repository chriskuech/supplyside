import { FieldReference, OptionReference, Schema } from '.'
import { Cost, Resource, ValueInput } from '../types'

export type FieldPatch = {
  fieldId: string
  valueInput: ValueInput
}

export type CostPatch = Omit<Cost, 'id'> & { id?: string }

export class ResourcePatch {
  private _costs: CostPatch[] = []
  private _patches: FieldPatch[] = []

  resource?: Resource | undefined

  constructor(
    readonly schema: Schema,
    resource?: Resource | undefined,
  ) {
    this.resource = resource
  }

  get costs(): CostPatch[] {
    const updatedIds = new Set(...this._costs.map((c) => c.id))
    const nonUpdatedCosts =
      this.resource?.costs.filter((c) => !c.id || !updatedIds.has(c.id)) ?? []

    return [...nonUpdatedCosts, ...this._costs]
  }

  get patchedCosts(): CostPatch[] {
    return this._costs
  }

  get patchedFields(): FieldPatch[] {
    return this._patches
  }

  addCost(cost: CostPatch) {
    this._costs = [
      ...this._costs.filter((c) => !c.id || c.id !== cost.id),
      cost,
    ]
  }

  hasPatch(fieldRef: FieldReference) {
    const { fieldId } = this.schema.getField(fieldRef)

    return this._patches.some((p) => p.fieldId === fieldId)
  }

  hasAnyPatch(...fieldRefs: FieldReference[]) {
    return fieldRefs.some((fieldRef) => this.hasPatch(fieldRef))
  }

  hasOption(fieldRef: FieldReference, optionRef: OptionReference) {
    const option = this.schema.getFieldOption(fieldRef, optionRef)

    return this.getPatch(fieldRef)?.valueInput.optionId === option.id
  }

  getDate(fieldRef: FieldReference) {
    return this.getPatch(fieldRef)?.valueInput.date
  }

  getNumber(fieldRef: FieldReference) {
    return this.getPatch(fieldRef)?.valueInput.number
  }

  getResourceId(fieldRef: FieldReference) {
    return this.getPatch(fieldRef)?.valueInput.resourceId
  }

  getString(fieldRef: FieldReference) {
    return this.getPatch(fieldRef)?.valueInput.string
  }

  setDate(fieldRef: FieldReference, date: string) {
    this.setPatch(fieldRef, { date })
  }

  setNumber(fieldRef: FieldReference, number: number) {
    this.setPatch(fieldRef, { number })
  }

  setPatch(fieldRef: FieldReference, valueInput: ValueInput) {
    const { fieldId } = this.schema.getField(fieldRef)

    this._patches = [
      ...this._patches.filter((p) => p.fieldId !== fieldId),
      { fieldId, valueInput },
    ]
  }

  private getPatch(fieldRef: FieldReference): FieldPatch | undefined {
    const { fieldId } = this.schema.getField(fieldRef)

    const patch = this._patches.find((p) => p.fieldId === fieldId)
    if (patch) return patch

    const rf = this.resource?.fields.find((f) => f.fieldId === fieldId)
    if (!rf) return

    return { fieldId, valueInput: rf.value }
  }
}
