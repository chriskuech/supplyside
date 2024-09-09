import { FieldType, ResourceType } from '@prisma/client'
import { ValueInput } from '@/domain/resource/patch'
import { Value } from '@/domain/resource/entity'

export type OptionPatch = {
  id: string // patch ID -- must be `id` to work with mui
  name: string
} & (
  | { op: 'add' }
  | { op: 'update'; optionId: string }
  | { op: 'remove'; optionId: string }
)

export type Option = {
  id: string
  name: string
}

export type Field = {
  id: string
  name: string
  description: string | null
  type: FieldType
  resourceType: ResourceType | null
  Option: Option[]
  defaultValue: Value
  isRequired: boolean
  templateId: string | null
  defaultToToday: boolean
}

export type CreateFieldParams = {
  name: string
  type: FieldType
  resourceType?: ResourceType
  isRequired?: boolean
}

export type UpdateFieldDto = {
  id: string
  name: string
  description: string | null
  options: OptionPatch[]
  defaultValue: ValueInput
  defaultToToday: boolean
  isRequired?: boolean
}
