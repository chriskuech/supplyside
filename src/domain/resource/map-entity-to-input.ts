import { pick } from 'remeda'
import { Value } from './entity'
import { ValueInput } from './input'

export const mapValueToInput = (value: Value): ValueInput => ({
  boolean: value.boolean ?? undefined,
  contact: value.contact
    ? pick(value.contact, ['name', 'title', 'email', 'phone'])
    : undefined,
  date: value.date,
  number: value.number ?? null,
  option: value.option ? { id: value.option.id } : undefined,
  options: value.options?.map((o) => ({ id: o.id })) ?? undefined,
  string: value.string ?? null,
  user: value.user,
  fileId: value.file?.id ?? null,
  resource: value.resource,
})
