'use server'

import { fail } from 'assert'
import { fields, selectResourceFieldValue } from '@supplyside/model'
import { map, pipe, sortBy } from 'remeda'
import { PartModel } from './PartModel'
import { readResource, readResources } from '@/client/resource'
import { requireSession } from '@/session'

const coerce = (value: string | null | undefined): Date | null =>
  value ? new Date(value) : null

export async function getParts(): Promise<PartModel[]> {
  const { accountId } = await requireSession()
  const parts = (await readResources(accountId, 'Part')) ?? []

  return await Promise.all(
    parts.map(async (part) => {
      const jobRef = selectResourceFieldValue(part, fields.job)?.resource
      if (!jobRef) return fail('Part does not have a Job')

      const job = await readResource(accountId, jobRef.id)
      if (!job) return fail('Part does not have a Job')

      const steps =
        (await readResources(accountId, 'Step', {
          where: {
            '==': [{ var: fields.part.name }, part.id],
          },
        })) ?? []

      return {
        id: part.id,
        jobKey: jobRef.key,
        name: selectResourceFieldValue(part, fields.partName)?.string ?? null,
        needBy: coerce(selectResourceFieldValue(part, fields.needDate)?.date),
        paymentDue: coerce(
          selectResourceFieldValue(job, fields.paymentDueDate)?.date,
        ),
        totalCost:
          selectResourceFieldValue(part, fields.totalCost)?.number ?? null,
        customer:
          selectResourceFieldValue(part, fields.customer)?.resource ?? null,
        jobStatusOption:
          selectResourceFieldValue(job, fields.jobStatus)?.option ?? null,
        steps: pipe(
          steps,
          map(
            (step) =>
              ({
                id: step.id,
                type: selectResourceFieldValue(step, fields.purchase)?.resource
                  ? 'Purchase'
                  : 'WorkCenter',
                name:
                  selectResourceFieldValue(step, fields.name)?.string ?? null,
                start: coerce(
                  selectResourceFieldValue(step, fields.startDate)?.date,
                ),
                days:
                  selectResourceFieldValue(step, fields.productionDays)
                    ?.number ?? null,
                isCompleted:
                  selectResourceFieldValue(step, fields.completed)?.boolean ??
                  false,
              }) as const,
          ),
          sortBy((s) => s.start ?? new Date(0)),
          map((step, i) => ({
            ...step,
            isFirst: i === 0,
            isLast: i === steps.length - 1,
          })),
        ),
      } satisfies PartModel
    }),
  )
}
