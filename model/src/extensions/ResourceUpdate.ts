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
import { ResourcePatch } from './ResourcePatch'
import { ResourceReader } from './ResourceReader'
import { SchemaReader } from './SchemaReader'

export class ResourceUpdate implements IResourceWriter {
  readonly schema: SchemaReader
  readonly resource: ResourceReader
  readonly patch: ResourcePatch

  constructor(schema: SchemaReader, resource: ResourceReader) {
    this.schema = schema
    this.resource = resource
    this.patch = new ResourcePatch(schema)
  }

  get patches(): Patch[] {
    return this.patch.patches
  }

  get templateId(): string | null | undefined {
    return this.patch.templateId
  }

  set templateId(templateId: string | null) {
    this.patch.templateId = templateId
  }

  costs: {
    value: number
    name: string
    isPercentage: boolean
    id?: string | undefined
  }[] = []

  getAddress(fieldRef: FieldReference): Address | null | undefined {
    const address = this.patch.getAddress(fieldRef)
    if (address !== undefined) return address
    return this.resource.getAddress(fieldRef)
  }

  getBoolean(fieldRef: FieldReference): boolean | null | undefined {
    const boolean = this.patch.getBoolean(fieldRef)
    if (boolean !== undefined) return boolean
    return this.resource.getBoolean(fieldRef)
  }

  getContact(fieldRef: FieldReference): Contact | null | undefined {
    const contact = this.patch.getContact(fieldRef)
    if (contact !== undefined) return contact
    return this.resource.getContact(fieldRef)
  }

  getDate(fieldRef: FieldReference): Date | null | undefined {
    const date = this.patch.getDate(fieldRef)
    if (date !== undefined) return date
    return this.resource.getDate(fieldRef)
  }

  getFile(fieldRef: FieldReference): File | null | undefined {
    const file = this.patch.getFile(fieldRef)
    if (file !== undefined) return file
    return this.resource.getFile(fieldRef)
  }

  getFiles(fieldRef: FieldReference): File[] | undefined {
    const files = this.patch.getFiles(fieldRef)
    if (files !== undefined) return files
    return this.resource.getFiles(fieldRef)
  }

  getNumber(fieldRef: FieldReference): number | null | undefined {
    const number = this.patch.getNumber(fieldRef)
    if (number !== undefined) return number
    return this.resource.getNumber(fieldRef)
  }

  getOption(fieldRef: FieldReference): Option | null | undefined {
    const option = this.patch.getOption(fieldRef)
    if (option !== undefined) return option
    return this.resource.getOption(fieldRef)
  }

  hasOption(fieldRef: FieldReference, optionRef: OptionReference): boolean {
    const hasOption = this.patch.hasOption(fieldRef, optionRef)
    if (hasOption !== undefined) return hasOption
    return this.resource.hasOption(fieldRef, optionRef)
  }

  getResource(fieldRef: FieldReference): ValueResource | null | undefined {
    const resource = this.patch.getResource(fieldRef)
    if (resource !== undefined) return resource
    return this.resource.getResource(fieldRef)
  }

  getString(fieldRef: FieldReference): string | null | undefined {
    const string = this.patch.getString(fieldRef)
    if (string !== undefined) return string
    return this.resource.getString(fieldRef)
  }

  getUser(fieldRef: FieldReference): User | null | undefined {
    const user = this.patch.getUser(fieldRef)
    if (user !== undefined) return user
    return this.resource.getUser(fieldRef)
  }

  getPatch(fieldRef: FieldReference): Patch | null | undefined {
    const patch = this.patch.getPatch(fieldRef)
    if (patch !== undefined) return patch
    return this.resource.getPatch(fieldRef)
  }

  hasPatch(fieldRef: FieldReference): boolean {
    return this.patch.hasPatch(fieldRef)
  }

  hasAnyPatch(...fieldRefs: FieldReference[]): boolean {
    return this.patch.hasAnyPatch(...fieldRefs)
  }

  setPatch(fieldRef: FieldReference, patch: Patch): void {
    this.patch.setPatch(fieldRef, patch)
  }

  setAddress(fieldRef: FieldReference, address: Address | null): void {
    this.patch.setAddress(fieldRef, address)
  }

  setBoolean(fieldRef: FieldReference, boolean: boolean | null): void {
    this.patch.setBoolean(fieldRef, boolean)
  }

  setContact(fieldRef: FieldReference, contact: Contact | null): void {
    this.patch.setContact(fieldRef, contact)
  }

  setDate(fieldRef: FieldReference, dateOrString: Date | string | null): void {
    this.patch.setDate(fieldRef, dateOrString)
  }

  setFile(fieldRef: FieldReference, file: File | null): void {
    this.patch.setFile(fieldRef, file)
  }

  setFiles(fieldRef: FieldReference, files: File[]): void {
    this.patch.setFiles(fieldRef, files)
  }

  setNumber(fieldRef: FieldReference, number: number | null): void {
    this.patch.setNumber(fieldRef, number)
  }

  setOption(fieldRef: FieldReference, optionRef: OptionReference): void {
    this.patch.setOption(fieldRef, optionRef)
  }

  setResource(fieldRef: FieldReference, resource: ValueResource | null): void {
    this.patch.setResource(fieldRef, resource)
  }

  setString(fieldRef: FieldReference, string: string | null): void {
    this.patch.setString(fieldRef, string)
  }

  setUser(fieldRef: FieldReference, user: User | null): void {
    this.patch.setUser(fieldRef, user)
  }
}
