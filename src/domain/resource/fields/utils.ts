import { fail } from 'assert'
import { FieldTemplate } from '../../schema/template/types'
import { Resource } from '../types'

export const selectResourceSystemField = (
  resource: Resource,
  fieldTemplateOrTemplateId: FieldTemplate | string,
) =>
  resource.fields?.find(
    (field) =>
      field.templateId ===
      (typeof fieldTemplateOrTemplateId === 'string'
        ? fieldTemplateOrTemplateId
        : fieldTemplateOrTemplateId.templateId),
  ) ?? fail('System field not found')
