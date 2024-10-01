import dayjs from 'dayjs'
import { match, P } from 'ts-pattern'
import {
  FieldTemplate,
  formatInlineAddress,
  Resource,
  selectResourceFieldValue,
} from '@supplyside/model'

export const mapValue = (resource: Resource, field: FieldTemplate) => {
  const fieldValue = selectResourceFieldValue(resource, field)

  return match(field.type)
    .with('Checkbox', () => fieldValue?.boolean)
    .with('Address', () =>
      fieldValue?.address ? formatInlineAddress(fieldValue.address) : null
    )
    .with('Contact', () => fieldValue?.contact?.name)
    .with(
      'Date',
      () => fieldValue?.date && dayjs(fieldValue.date).format('YYYY-MM-DDZ')
    )
    .with(P.union('Money', 'Number'), () => fieldValue?.number)
    .with('MultiSelect', () =>
      fieldValue?.options?.map((o) => o.name).join(' ')
    )
    .with(P.union('Text', 'Textarea'), () => fieldValue?.string)
    .with('Select', () => fieldValue?.option?.name)
    .with('User', () => fieldValue?.user?.name)
    .with('Resource', () => fieldValue?.resource?.name)
    .with(P.union('Files', 'File'), () => undefined)
    .exhaustive()
}
