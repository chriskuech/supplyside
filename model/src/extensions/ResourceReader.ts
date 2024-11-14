import assert from 'assert'
import {
  Address,
  Contact,
  File,
  Option,
  Patch,
  ResourceDto,
  User,
  ValueResource,
} from '../core'
import { fields } from '../templates'
import { IResourceReader } from './IResourceReader'
import { FieldReference, OptionReference } from './reference'
import { SchemaReader } from './SchemaReader'

export class ResourceReader implements IResourceReader {
  readonly schema: SchemaReader
  private readonly resource: ResourceDto

  constructor(schema: SchemaReader, resource: ResourceDto) {
    this.schema = schema
    this.resource = resource
  }

  get accountId() {
    return this.schema.accountId
  }

  get key() {
    return this.resource.key
  }

  get type() {
    return this.schema.type
  }

  get costs() {
    return this.resource.costs
  }

  get resourceId() {
    return this.resource.id
  }

  get templateId(): string | null | undefined {
    return this.resource.templateId
  }

  getAddress(fieldRef: FieldReference): Address | null | undefined {
    const { type } = this.schema.getField(fieldRef)
    const patch = this.getPatch(fieldRef)

    if (!patch) return

    assert(type === 'Address' && 'address' in patch, 'Field is not an Address')

    return patch.address
  }

  getBoolean(fieldRef: FieldReference): boolean | null | undefined {
    const { type } = this.schema.getField(fieldRef)
    const patch = this.getPatch(fieldRef)

    if (!patch) return

    assert(type !== 'Checkbox' && 'boolean' in patch, 'Field is not a boolean')

    return patch.boolean
  }

  getContact(fieldRef: FieldReference): Contact | null | undefined {
    const { type } = this.schema.getField(fieldRef)
    const patch = this.getPatch(fieldRef)

    if (!patch) return

    assert(type === 'Contact' && 'contact' in patch, 'Field is not a Contact')

    return patch.contact
  }

  getDate(fieldRef: FieldReference): Date | null | undefined {
    const { type } = this.schema.getField(fieldRef)
    const patch = this.getPatch(fieldRef)

    if (!patch) return

    assert(type === 'Date' && 'date' in patch, 'Field is not a Date')

    return patch.date ? new Date(patch.date) : null
  }

  getFile(fieldRef: FieldReference): File | null | undefined {
    const { type } = this.schema.getField(fieldRef)
    const patch = this.getPatch(fieldRef)

    if (!patch) return

    assert(type === 'File' && 'file' in patch, 'Field is not a File')

    return patch.file
  }

  getFiles(fieldRef: FieldReference): File[] | undefined {
    const { type } = this.schema.getField(fieldRef)
    const patch = this.getPatch(fieldRef)

    if (!patch) return

    assert(type === 'File' && 'files' in patch, 'Field is not a File')

    return patch.files
  }

  getNumber(fieldRef: FieldReference): number | null | undefined {
    const { type } = this.schema.getField(fieldRef)
    const patch = this.getPatch(fieldRef)

    if (!patch) return

    assert(type === 'Number' && 'number' in patch, 'Field is not a Number')

    return patch.number
  }

  getOption(fieldRef: FieldReference): Option | null | undefined {
    const { type } = this.schema.getField(fieldRef)
    const patch = this.getPatch(fieldRef)

    if (!patch) return

    assert(type === 'Select' && 'option' in patch, 'Field is not an Option')

    return patch.option
  }

  getResource(fieldRef: FieldReference): ValueResource | null | undefined {
    const { type } = this.schema.getField(fieldRef)
    const patch = this.getPatch(fieldRef)

    if (!patch) return

    assert(
      type === 'Resource' && 'resource' in patch,
      'Field is not a Resource',
    )

    return patch.resource
  }

  getString(fieldRef: FieldReference): string | null | undefined {
    const { type } = this.schema.getField(fieldRef)
    const patch = this.getPatch(fieldRef)

    if (!patch) return

    assert(type === 'Text' && 'string' in patch, 'Field is not a Text')

    return patch.string
  }

  getUser(fieldRef: FieldReference): User | null | undefined {
    const { type } = this.schema.getField(fieldRef)
    const patch = this.getPatch(fieldRef)

    if (!patch) return

    assert(type === 'User' && 'user' in patch, 'Field is not a User')

    return patch.user
  }

  hasOption(fieldRef: FieldReference, optionRef: OptionReference): boolean {
    const { type } = this.schema.getField(fieldRef)
    const option = this.schema.getFieldOption(fieldRef, optionRef)
    const patch = this.getPatch(fieldRef)

    if (!patch) return false

    assert(type === 'Select' && 'option' in patch, 'Field is not an Option')

    return patch.option?.id === option.id
  }

  toDto(): ResourceDto {
    return this.resource
  }

  toValue(): ValueResource {
    return {
      id: this.resourceId,
      name:
        (this.schema.implements(fields.name) && this.getString(fields.name)) ||
        '',
      templateId: this.templateId ?? null,
      type: this.type,
      key: this.key,
    }
  }

  getPatch(fieldRef: FieldReference): Patch | undefined {
    const { fieldId } = this.schema.getField(fieldRef)

    return this.resource.patches.find((patch) => patch.fieldId === fieldId)
  }
}
