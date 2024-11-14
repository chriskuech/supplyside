import assert from 'assert'
import {
  Address,
  Contact,
  File,
  Option,
  Patch,
  User,
  ValueResource,
} from '../core'
import { IResourceWriter } from './IResourceWriter'
import { FieldReference, OptionReference } from './reference'
import { SchemaReader } from './SchemaReader'

export class ResourcePatch implements IResourceWriter {
  templateId: string | null | undefined
  private _patches: Patch[] = []
  get patches() {
    return this._patches
  }

  constructor(readonly schema: SchemaReader) {}

  costs: {
    value: number
    name: string
    isPercentage: boolean
    id?: string | undefined
  }[] = []

  getAddress(fieldRef: FieldReference): Address | null | undefined {
    const patch = this.getPatch(fieldRef)
    if (!patch) return

    assert('address' in patch)

    return patch.address
  }

  getBoolean(fieldRef: FieldReference): boolean | null | undefined {
    const patch = this.getPatch(fieldRef)
    if (!patch) return

    assert('boolean' in patch)

    return patch.boolean
  }

  getContact(fieldRef: FieldReference): Contact | null | undefined {
    const patch = this.getPatch(fieldRef)
    if (!patch) return

    assert('contact' in patch)

    return patch.contact
  }

  getDate(fieldRef: FieldReference): Date | null | undefined {
    const patch = this.getPatch(fieldRef)
    if (!patch) return

    assert('date' in patch)

    return patch.date ? new Date(patch.date) : null
  }

  getFile(fieldRef: FieldReference): File | null | undefined {
    const patch = this.getPatch(fieldRef)
    if (!patch) return

    assert('file' in patch)

    return patch.file
  }

  getFiles(fieldRef: FieldReference): File[] | undefined {
    const patch = this.getPatch(fieldRef)
    if (!patch) return

    assert('files' in patch)

    return patch.files
  }

  getNumber(fieldRef: FieldReference): number | null | undefined {
    const patch = this.getPatch(fieldRef)
    if (!patch) return

    assert('number' in patch)

    return patch.number
  }

  getOption(fieldRef: FieldReference): Option | null | undefined {
    const patch = this.getPatch(fieldRef)
    if (!patch) return

    assert('option' in patch)

    return patch.option
  }

  getResource(fieldRef: FieldReference): ValueResource | null | undefined {
    const patch = this.getPatch(fieldRef)
    if (!patch) return

    assert('resource' in patch)

    return patch.resource
  }

  getString(fieldRef: FieldReference): string | null | undefined {
    const patch = this.getPatch(fieldRef)
    if (!patch) return

    assert('string' in patch)

    return patch.string
  }

  getUser(fieldRef: FieldReference): User | null | undefined {
    const patch = this.getPatch(fieldRef)
    if (!patch) return

    assert('user' in patch)

    return patch.user
  }

  setPatch(fieldRef: FieldReference, patch: Patch): void {
    const { fieldId } = this.schema.getField(fieldRef)

    this._patches = [
      ...this._patches.filter((p) => p.fieldId !== fieldId),
      patch,
    ]
  }

  hasOption(fieldRef: FieldReference, optionRef: OptionReference): boolean {
    const { id: optionId } = this.schema.getFieldOption(fieldRef, optionRef)
    const option = this.getOption(fieldRef)

    return option?.id === optionId
  }

  getPatch(fieldRef: FieldReference): Patch | undefined {
    const { fieldId } = this.schema.getField(fieldRef)

    return this._patches.find((p) => p.fieldId === fieldId)
  }

  hasPatch(fieldRef: FieldReference): boolean {
    const { fieldId } = this.schema.getField(fieldRef)

    return this._patches.some((p) => p.fieldId === fieldId)
  }

  hasAnyPatch(...fieldRefs: FieldReference[]): boolean {
    return fieldRefs.some((fieldRef) => this.hasPatch(fieldRef))
  }

  setAddress(fieldRef: FieldReference, address: Address | null): void {
    const { fieldId } = this.schema.getField(fieldRef)

    this.setPatch(fieldRef, { address, fieldId, timestamp: new Date() })
  }

  setBoolean(fieldRef: FieldReference, boolean: boolean | null): void {
    const { fieldId } = this.schema.getField(fieldRef)

    this.setPatch(fieldRef, { boolean, fieldId, timestamp: new Date() })
  }

  setContact(fieldRef: FieldReference, contact: Contact | null): void {
    const { fieldId } = this.schema.getField(fieldRef)

    this.setPatch(fieldRef, { contact, fieldId, timestamp: new Date() })
  }

  setDate(fieldRef: FieldReference, dateOrString: Date | string | null): void {
    const { fieldId } = this.schema.getField(fieldRef)

    const date =
      typeof dateOrString === 'string' ? new Date(dateOrString) : null
    const string = date?.toISOString() ?? null

    this.setPatch(fieldRef, { date: string, fieldId, timestamp: new Date() })
  }

  setFile(fieldRef: FieldReference, file: File | null): void {
    const { fieldId } = this.schema.getField(fieldRef)

    this.setPatch(fieldRef, { file, fieldId, timestamp: new Date() })
  }

  setFiles(fieldRef: FieldReference, files: File[]): void {
    const { fieldId } = this.schema.getField(fieldRef)

    this.setPatch(fieldRef, { files, fieldId, timestamp: new Date() })
  }

  setNumber(fieldRef: FieldReference, number: number | null): void {
    const { fieldId } = this.schema.getField(fieldRef)

    this.setPatch(fieldRef, { number, fieldId, timestamp: new Date() })
  }

  setOption(fieldRef: FieldReference, optionRef: OptionReference): void {
    const { fieldId } = this.schema.getField(fieldRef)
    const option = this.schema.getFieldOption(fieldRef, optionRef)

    this.setPatch(fieldRef, { option, fieldId, timestamp: new Date() })
  }

  setResource(fieldRef: FieldReference, resource: ValueResource | null): void {
    const { fieldId } = this.schema.getField(fieldRef)

    this.setPatch(fieldRef, { resource, fieldId, timestamp: new Date() })
  }

  setString(fieldRef: FieldReference, string: string | null): void {
    const { fieldId } = this.schema.getField(fieldRef)

    this.setPatch(fieldRef, { string, fieldId, timestamp: new Date() })
  }

  setUser(fieldRef: FieldReference, user: User | null): void {
    const { fieldId } = this.schema.getField(fieldRef)

    this.setPatch(fieldRef, { user, fieldId, timestamp: new Date() })
  }
}
