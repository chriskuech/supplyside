import dayjs from 'dayjs'
import { match, P } from 'ts-pattern'
import { selectResourceField } from '@/domain/resource/extensions'
import { Resource } from '@/domain/resource/entity'
import { FieldTemplate } from '@/domain/schema/template/types'

export const mapValue = (resource: Resource, field: FieldTemplate) => {
  const fieldValue = selectResourceField(resource, field)

  return match(field.type)
    .with('Checkbox', () => fieldValue?.value.boolean)
    .with('Contact', () => fieldValue?.value.contact?.name)
    .with(
      'Date',
      () =>
        fieldValue?.value.date &&
        dayjs(fieldValue.value.date).format('YYYY-MM-DDZ'),
    )
    .with(P.union('Money', 'Number'), () => fieldValue?.value.number)
    .with('MultiSelect', () =>
      fieldValue?.value.options?.map((o) => o.name).join(' '),
    )
    .with(P.union('Text', 'Textarea'), () => fieldValue?.value.string)
    .with('Select', () => fieldValue?.value.option?.name)
    .with('User', () => fieldValue?.value.user?.name)
    .with('Resource', () => fieldValue?.value.resource?.name)
    .with(P.union('Files', 'File'), () => undefined)
    .exhaustive()
}
