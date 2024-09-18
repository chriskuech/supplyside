import { Contact } from './entity'

export type ValueInput = (
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
) & { isSystemValue?: boolean }
