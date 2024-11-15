import {
  Address,
  Contact,
  Option,
  SchemaFieldData,
  User,
  Value,
  ValueResource,
} from '.'
import { FieldReference } from '../extensions/reference'
import { OptionTemplate } from '../templates'
import { IResourceReader } from './IResourceReader'

type Patch = {
  field: SchemaFieldData
  value: Value
}

export interface IResourceWriter {
  templateId: string | null | undefined
  readonly patches: Patch[]

  setAddress(fieldRef: FieldReference, address: Address | null): void
  setBoolean(fieldRef: FieldReference, boolean: boolean | null): void
  setContact(fieldRef: FieldReference, contact: Contact | null): void
  setDate(fieldRef: FieldReference, dateOrString: Date | string | null): void
  setFile(fieldRef: FieldReference, file: File | null): void
  setFiles(fieldRef: FieldReference, files: File[]): void
  setNumber(fieldRef: FieldReference, number: number | null): void
  setOption(fieldRef: FieldReference, optionRef: OptionTemplate | Option): void
  setResource(
    fieldRef: FieldReference,
    resource: IResourceReader | ValueResource | null,
  ): void
  setString(fieldRef: FieldReference, string: string | null): void
  setUser(fieldRef: FieldReference, user: User | null): void
  setValue(fieldRef: FieldReference, value: Partial<Value>): void
}
