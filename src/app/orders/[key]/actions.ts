'use server'

import { fail } from 'assert'
import { revalidatePath } from 'next/cache'
import { requireSession } from '@/lib/session'
import {
  fields,
  orderStatusOptions,
} from '@/domain/schema/template/system-fields'
import { sendPo as domainSendPo } from '@/domain/order/sendPo'
import { createPo as domainCreatePo } from '@/domain/order/createPo'
import { OptionTemplate } from '@/domain/schema/template/types'
import { readResource } from '@/domain/resource/actions'
import { readSchema } from '@/domain/schema/actions'
import { selectField } from '@/domain/schema/types'
import { updateValue } from '@/domain/resource/fields/actions'

export const createPo = async (resourceId: string) => {
  const { accountId } = await requireSession()

  return domainCreatePo({ accountId, resourceId })
}

export const sendPo = async (resourceId: string) => {
  const { accountId } = await requireSession()

  await domainSendPo({ accountId, resourceId })
  await transitionStatus(resourceId, orderStatusOptions.ordered)
}

export const transitionStatus = async (
  resourceId: string,
  status: OptionTemplate,
) => {
  const { accountId } = await requireSession()
  const { type: resourceType } = await readResource({
    accountId,
    id: resourceId,
  })
  const schema = await readSchema({
    accountId,
    resourceType,
    isSystem: true,
  })
  const field =
    selectField(schema, fields.orderStatus) ?? fail('Field not found')

  await updateValue({
    resourceId,
    fieldId: field.id,
    value: {
      optionId:
        field.options.find((o) => o.templateId === status.templateId)?.id ??
        fail('Option not found'),
    },
  })

  revalidatePath('.')
}
