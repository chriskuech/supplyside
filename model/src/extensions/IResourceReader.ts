import {
  Address,
  Contact,
  Cost,
  File,
  Option,
  Patch,
  User,
  ValueResource,
} from '../core'
import { FieldReference, OptionReference } from './reference'
import { SchemaReader } from './SchemaReader'

export interface IResourceReader {
  readonly schema: SchemaReader

  readonly costs: Cost[]

  getAddress(fieldRef: FieldReference): Address | null | undefined
  getBoolean(fieldRef: FieldReference): boolean | null | undefined
  getContact(fieldRef: FieldReference): Contact | null | undefined
  getDate(fieldRef: FieldReference): Date | null | undefined
  getFile(fieldRef: FieldReference): File | null | undefined
  getFiles(fieldRef: FieldReference): File[] | undefined
  getNumber(fieldRef: FieldReference): number | null | undefined
  getOption(fieldRef: FieldReference): Option | null | undefined
  hasOption(fieldRef: FieldReference, optionRef: OptionReference): boolean
  getResource(fieldRef: FieldReference): ValueResource | null | undefined
  getString(fieldRef: FieldReference): string | null | undefined
  getUser(fieldRef: FieldReference): User | null | undefined
  getPatch(fieldRef: FieldReference): Patch | null | undefined
}
