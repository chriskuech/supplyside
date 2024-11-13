'use server'

import { fail } from 'assert'
import { fields, selectResourceFieldValue } from '@supplyside/model'
import { PartModel } from './PartModel'
import { readResources, updateResource } from '@/client/resource'
import { requireSession } from '@/session'

const coerce = (value: string | null | undefined): Date | null =>
  value ? new Date(value) : null

export async function getParts(): Promise<PartModel[]> {
  const { accountId } = await requireSession()
  const parts = (await readResources(accountId, 'Part')) ?? []

  return await Promise.all(
    parts.map(async (part) => {
      const steps =
        (await readResources(accountId, 'Step', {
          where: {
            '==': [{ var: fields.part.name }, part.id],
          },
        })) ?? []

      return {
        id: part.id,
        jobKey:
          selectResourceFieldValue(part, fields.job)?.resource?.key ??
          fail('Part does not have a Job'),
        name: selectResourceFieldValue(part, fields.partName)?.string ?? null,
        needBy: coerce(selectResourceFieldValue(part, fields.needDate)?.date),
        paymentDue: coerce(
          selectResourceFieldValue(part, fields.paymentDueDate)?.date,
        ),
        steps: steps.map((step) => ({
          id: step.id,
          name: selectResourceFieldValue(step, fields.name)?.string ?? null,
          start: coerce(selectResourceFieldValue(step, fields.startDate)?.date),
          days:
            selectResourceFieldValue(step, fields.productionDays)?.number ??
            null,
        })),
      }
    }),
  )
}

export async function updatePartPaymentDueDate(
  partId: string,
  paymentDueDate: Date,
) {
  const { accountId } = await requireSession()
  await updateResource(accountId, partId, [
    {
      field: fields.paymentDueDate,
      valueInput: {
        string: paymentDueDate.toISOString(),
      },
    },
  ])
}

export async function updatePartNeedByDate(partId: string, needByDate: Date) {
  const { accountId } = await requireSession()
  await updateResource(accountId, partId, [
    {
      field: fields.needDate,
      valueInput: { string: needByDate.toISOString() },
    },
  ])
}

export async function updateStepStartDate(stepId: string, startDate: Date) {
  const { accountId } = await requireSession()
  await updateResource(accountId, stepId, [
    {
      field: fields.startDate,
      valueInput: { string: startDate.toISOString() },
    },
  ])
}
