import { ResourceType } from '@supplyside/model'

export type SanitizedFieldModel = {
  fieldId: string
  type: string
  name: string
  options?: { id: string; name: string }[]
  resourceType?: ResourceType
}
