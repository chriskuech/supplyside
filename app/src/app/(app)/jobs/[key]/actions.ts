'use server'

import assert from 'assert'
import {
  fields,
  jobStatusOptions,
  selectResourceFieldValue,
} from '@supplyside/model'
import dayjs, { Dayjs } from 'dayjs'
import { filter, isTruthy, last, map, pipe, sortBy, zip } from 'remeda'
import { pushInvoice, read } from '@/client/quickBooks'
import { requireSession } from '@/session'
import {
  createResource,
  deleteResource,
  readResource,
  readResources,
  transitionStatus,
  updateResource,
} from '@/actions/resource'

export const transitionToInvoiced = async (jobResourceId: string) => {
  const { accountId } = await requireSession()
  const config = await read(accountId)

  if (config?.status === 'connected') {
    const result = await pushInvoice(accountId, jobResourceId)

    if (!result) return
  }

  await transitionStatus(
    jobResourceId,
    fields.jobStatus,
    jobStatusOptions.invoiced,
  )
}

export const createPurchaseStep = async (partId: string) => {
  const maxDeliveryDate = await getNextStartDate(partId)
  assert(maxDeliveryDate, 'No max delivery date found')

  const purchase = await createResource('Purchase', [])
  assert(purchase, 'Failed to create purchase')

  await createResource('Step', [
    {
      field: fields.part,
      valueInput: { resourceId: partId },
    },
    {
      field: fields.purchase,
      valueInput: { resourceId: purchase.id },
    },
    {
      field: fields.startDate,
      valueInput: { date: maxDeliveryDate.toISOString() },
    },
  ])

  const needDate = await getNeedDate(partId)
  assert(needDate, 'No need date found')

  await reschedulePart(partId, needDate)
}

export const createWorkCenterStep = async (partId: string) => {
  const maxDeliveryDate =
    (await getNextStartDate(partId)) ?? (await getNeedDate(partId))
  assert(maxDeliveryDate, 'No max delivery date found')

  await createResource('Step', [
    {
      field: fields.part,
      valueInput: { resourceId: partId },
    },
    {
      field: fields.startDate,
      valueInput: { date: maxDeliveryDate.toISOString() },
    },
  ])

  const needDate = await getNeedDate(partId)
  assert(needDate, 'No need date found')

  await reschedulePart(partId, needDate)
}

export const deleteStep = async (stepId: string) => {
  const step = await readResource(stepId)
  if (!step) return

  const partId = selectResourceFieldValue(step, fields.part)?.resource?.id
  if (!partId) return

  await deleteResource(stepId)

  const needDate = selectResourceFieldValue(step, fields.needDate)?.date
  if (!needDate) return

  await reschedulePart(partId, dayjs(needDate))
}

const getNextStartDate = async (partId: string): Promise<Dayjs | undefined> => {
  const steps = await readResources('Step', {
    where: { '==': [{ var: fields.part.name }, partId] },
  })
  assert(steps, 'No steps found')

  const maxDeliveryDate = pipe(
    steps,
    map((step) => selectResourceFieldValue(step, fields.deliveryDate)?.date),
    filter(isTruthy),
    sortBy((e) => e),
    map((e) => dayjs(e).add(1, 'day')),
    last(),
  )

  if (maxDeliveryDate) return maxDeliveryDate

  return await getNeedDate(partId)
}

const getNeedDate = async (partId: string): Promise<Dayjs | undefined> => {
  const part = await readResource(partId)
  assert(part, 'No part found')

  const needDate = selectResourceFieldValue(part, fields.needDate)?.date
  assert(needDate, 'No need date found')

  return dayjs(needDate)
}

const reschedulePart = async (partId: string, needDate: Dayjs) => {
  const unorderedSteps = await readResources('Step', {
    where: { '==': [{ var: fields.part.name }, partId] },
  })
  assert(unorderedSteps, 'No steps found')

  type Step = {
    id: string
    startDate: Dayjs | undefined
    productionDays: number
    deliveryDate: Dayjs | undefined
  }

  const currentSteps: Step[] = pipe(
    unorderedSteps,
    map((step) => {
      const startDate = selectResourceFieldValue(step, fields.startDate)?.date
      const productionDays = selectResourceFieldValue(
        step,
        fields.productionDays,
      )?.number
      const deliveryDate = selectResourceFieldValue(
        step,
        fields.deliveryDate,
      )?.date

      return {
        id: step.id,
        startDate: startDate ? dayjs(startDate) : undefined,
        productionDays: productionDays ?? 0,
        deliveryDate: deliveryDate ? dayjs(deliveryDate) : undefined,
      }
    }),
    sortBy((step) => step.deliveryDate?.toISOString() ?? ''),
  )

  const { steps: updatedSteps } = currentSteps.reduceRight(
    ({ steps, deadline }, step) => {
      const startDate = deadline.subtract(step.productionDays, 'day')
      const deliveryDate = deadline

      return {
        steps: [...steps, { ...step, startDate, deliveryDate }],
        deadline: startDate,
      }
    },
    { steps: [] as Step[], deadline: needDate },
  )

  await Promise.all(
    zip(currentSteps, updatedSteps)
      .filter(
        ([currentStep, updatedStep]) =>
          currentStep.startDate !== updatedStep.startDate ||
          currentStep.deliveryDate !== updatedStep.deliveryDate,
      )
      .map(([, updatedStep]) => updatedStep)
      .map(
        async (step) =>
          await updateResource(step.id, [
            {
              field: fields.startDate,
              valueInput: { date: step.startDate?.toISOString() },
            },
            {
              field: fields.deliveryDate,
              valueInput: { date: step.deliveryDate?.toISOString() },
            },
          ]),
      ),
  )
}
