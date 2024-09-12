import { fail } from 'assert'
import { Cost } from '@prisma/client'
import { findTemplateField } from '../schema/template/system-fields'
import { handleResourceUpdate } from './effects'
import { mapValueToValueInput } from './mappers'
import { createResource, readResource, readResources, updateResource } from '.'
import prisma from '@/services/prisma'
import { readSchema } from '@/domain/schema'
import {
  FieldRef,
  selectSchemaField,
  selectSchemaFieldUnsafe,
} from '@/domain/schema/extensions'
import 'server-only'

export type ResourceCopyParams = {
  accountId: string
  fromResourceId: string
  toResourceId: string
}

export const copyFields = async ({
  accountId,
  fromResourceId,
  toResourceId,
}: ResourceCopyParams) => {
  const [fromResource, toResource] = await Promise.all([
    readResource({
      accountId,
      id: fromResourceId,
    }),
    readResource({
      accountId,
      id: toResourceId,
    }),
  ])

  const [fromSchema, toSchema] = await Promise.all([
    readSchema({
      accountId,
      resourceType: fromResource.type,
    }),
    readSchema({
      accountId,
      resourceType: toResource.type,
    }),
  ])

  const fieldsToUpdate = fromResource.fields
    .map((rf) => ({
      rf,
      sf: selectSchemaField(fromSchema, rf) ?? fail(),
      tf: findTemplateField(rf.templateId),
    }))
    .filter(({ tf }) => !tf?.isDerived)

  const resource = await updateResource({
    accountId,
    resourceId: toResourceId,
    fields: fieldsToUpdate.map(({ rf, sf }) => ({
      fieldId: sf.id,
      value: mapValueToValueInput(sf.type, rf.value),
    })),
  })

  await handleResourceUpdate({
    accountId,
    schema: toSchema,
    resource,
    updatedFields: fieldsToUpdate.map(({ sf, rf }) => ({
      field: sf,
      value: rf.value,
    })),
  })
}

export const copyCosts = async ({
  fromResourceId,
  toResourceId,
}: ResourceCopyParams) => {
  const newCosts = await prisma().cost.findMany({
    where: { resourceId: fromResourceId },
  })

  const originalCosts = await prisma().cost.findMany({
    where: { resourceId: toResourceId },
  })

  const costsMatch = (cost1: Cost, cost2: Cost) => cost1.name === cost2.name

  const costs: { newCost: Cost; originalCost?: Cost }[] = newCosts.map(
    (newCost) => {
      const similarCostIndex = originalCosts.findIndex((originalCost) =>
        costsMatch(originalCost, newCost),
      )

      if (similarCostIndex >= 0) {
        const [originalCost] = originalCosts.splice(similarCostIndex, 1)
        return { newCost, originalCost }
      } else {
        return { newCost }
      }
    },
  )

  await Promise.all(
    costs.map(({ newCost, originalCost }) => {
      const newCostData = {
        name: newCost.name,
        isPercentage: newCost.isPercentage,
        value: newCost.value,
      }

      if (originalCost) {
        return prisma().cost.update({
          where: { id: originalCost.id },
          data: newCostData,
        })
      } else {
        return prisma().cost.create({
          data: { ...newCostData, resourceId: toResourceId },
        })
      }
    }),
  )
}

export const copyLines = async ({
  accountId,
  fromResourceId,
  toResourceId,
  backLinkFieldRef,
}: ResourceCopyParams & { backLinkFieldRef: FieldRef }) => {
  const lineSchema = await readSchema({
    accountId,
    resourceType: 'Line',
  })

  const backLinkField = selectSchemaFieldUnsafe(lineSchema, backLinkFieldRef)

  const lines = await readResources({
    accountId,
    type: 'Line',
    where: {
      '==': [{ var: backLinkField.name }, fromResourceId],
    },
  })

  // `createResource` is not (currently) parallelizable
  for (const line of lines) {
    await createResource({
      accountId,
      type: 'Line',
      fields: [
        ...line.fields
          .filter(({ fieldId }) => fieldId !== backLinkField.id)
          .map(({ fieldId, fieldType, value }) => ({
            fieldId,
            value: mapValueToValueInput(fieldType, value),
          })),
        {
          fieldId: backLinkField.id,
          value: { resourceId: toResourceId },
        },
      ],
    })
  }
}
