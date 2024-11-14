import { Address, Contact, File, Patch, User, ValueResource } from '../core'
import { IResourceReader } from './IResourceReader'
import { FieldReference, OptionReference } from './reference'

export interface IResourceWriter extends IResourceReader {
  templateId: string | null | undefined
  readonly patches: Patch[]

  hasPatch(fieldRef: FieldReference): boolean
  hasAnyPatch(...fieldRefs: FieldReference[]): boolean
  setPatch(fieldRef: FieldReference, patch: Patch): void

  setAddress(fieldRef: FieldReference, address: Address | null): void
  setBoolean(fieldRef: FieldReference, boolean: boolean | null): void
  setContact(fieldRef: FieldReference, contact: Contact | null): void
  setDate(fieldRef: FieldReference, dateOrString: Date | string | null): void
  setFile(fieldRef: FieldReference, file: File | null): void
  setFiles(fieldRef: FieldReference, files: File[]): void
  setNumber(fieldRef: FieldReference, number: number | null): void
  setOption(fieldRef: FieldReference, optionRef: OptionReference): void
  setResource(fieldRef: FieldReference, resource: ValueResource | null): void
  setString(fieldRef: FieldReference, string: string | null): void
  setUser(fieldRef: FieldReference, user: User | null): void
}
