import { pick } from 'remeda'
import { Value, ValueInput, ValueResource } from './types'
import { ResourceValueModel, ValueModel } from './model'
import { fields } from '@/domain/schema/template/system-fields'
import { mapUserModel } from '@/domain/iam/user/types'

export const mapValueToInput = (value: Value): ValueInput => ({
  boolean: value.boolean ?? undefined,
  contact: value.contact
    ? pick(value.contact, ['name', 'title', 'email', 'phone'])
    : undefined,
  date: value.date,
  number: value.number ?? null,
  optionId: value.option?.id ?? null,
  optionIds: value.options?.map((o) => o.id) ?? [],
  string: value.string ?? null,
  userId: value.user?.id ?? null,
  fileId: value.file?.id ?? null,
  resourceId: value.resource?.id ?? null,
})

export const mapValueFromModel = (model: ValueModel): Value => ({
  boolean: model.boolean,
  contact: model.Contact,
  date: model.date,
  string: model.string,
  number: model.number,
  option: model.Option,
  options: model.ValueOption.map((vo) => vo.Option),
  user: model.User && mapUserModel(model.User),
  resource: model.Resource && mapValueFromResource(model.Resource),
  file: model.File,
  files: model.Files.map(({ File: file }) => file),
})

export const mapValueFromResource = (
  resource: ResourceValueModel,
): ValueResource => ({
  id: resource.id,
  key: resource.key,
  name:
    resource.ResourceField.find(
      (rf) =>
        rf.Field.templateId &&
        (
          [fields.name.templateId, fields.number.templateId] as string[]
        ).includes(rf.Field.templateId),
    )?.Value.string ?? '',
})
