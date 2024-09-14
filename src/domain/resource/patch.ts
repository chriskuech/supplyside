import { Contact } from './entity'

export type ResourceFieldCreateInput = ResourceFieldInput
export type ResourceFieldUpdateInput = ResourceFieldInput & {
  valueId: string | null
}

type ResourceFieldInput = {
  fieldId: string
  valueInput: ValueInput
}

export type ValueInput =
  | { boolean: boolean | null }
  | { contact: Contact | null }
  | { date: Date | null }
  | { fileId: string | null }
  | { fileIds: string[] }
  | { number: number | null }
  | { optionId: string | null }
  | { optionIds: string[] }
  | { resourceId: string | null }
  | { string: string | null }
  | { userId: string | null }
