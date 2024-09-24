import { fail } from 'assert'
import { match } from 'ts-pattern'
import { container } from 'tsyringe'
import { FieldRef, selectSchemaFieldUnsafe } from '../schema/extensions'
import {
  billStatusOptions,
  fields,
  purchaseStatusOptions,
} from '../schema/template/system-fields'
import { readSchema } from '../schema'
import { mapValueToValueInput } from './mappers'
import { createResource, readResource, readResources } from '.'
import { PrismaService } from '@/integrations/PrismaService'

type ResourceCopyParams = {
  accountId: string
  fromResourceId: string
  toResourceId: string
}

export const cloneResource = async (accountId: string, resourceId: string) => {
  const source = await readResource({ accountId, id: resourceId })

  const destination = await match(source.type)
    .with('Bill', async () => {
      const schema = await readSchema({
        accountId,
        resourceType: 'Bill',
      })

      const billStatusField = selectSchemaFieldUnsafe(schema, fields.billStatus)

      const draftStatusOption =
        billStatusField.options.find(
          (o) => o.templateId === billStatusOptions.draft.templateId,
        ) ?? fail('Draft status not found')

      const destination = await createResource({
        accountId,
        type: source.type,
        fields: [
          ...source.fields
            .filter((rf) => rf.fieldId !== billStatusField.id)
            .map(({ fieldId, fieldType, value }) => ({
              fieldId,
              value: mapValueToValueInput(fieldType, value),
            })),
          {
            fieldId: billStatusField.id,
            value: { optionId: draftStatusOption?.id ?? null },
          },
        ],
      })

      await Promise.all([
        cloneLines({
          accountId,
          fromResourceId: source.id,
          toResourceId: destination.id,
          backLinkFieldRef: fields.bill,
        }),
        cloneCosts({
          accountId,
          fromResourceId: source.id,
          toResourceId: destination.id,
        }),
      ])

      return destination
    })
    .with('Purchase', async () => {
      const schema = await readSchema({
        accountId,
        resourceType: 'Purchase',
      })

      const orderStatusField = selectSchemaFieldUnsafe(
        schema,
        fields.purchaseStatus,
      )

      const draftStatusOption =
        orderStatusField.options.find(
          (o) => o.templateId === purchaseStatusOptions.draft.templateId,
        ) ?? fail('Draft status not found')

      const destination = await createResource({
        accountId,
        type: source.type,
        fields: [
          ...source.fields
            .filter((rf) => rf.fieldId !== orderStatusField.id)
            .map(({ fieldId, fieldType, value }) => ({
              fieldId,
              value: mapValueToValueInput(fieldType, value),
            })),
          {
            fieldId: orderStatusField.id,
            value: { optionId: draftStatusOption?.id ?? null },
          },
        ],
      })

      await Promise.all([
        cloneLines({
          accountId,
          fromResourceId: source.id,
          toResourceId: destination.id,
          backLinkFieldRef: fields.purchase,
        }),
        cloneCosts({
          accountId,
          fromResourceId: source.id,
          toResourceId: destination.id,
        }),
      ])

      return destination
    })
    .otherwise(
      async () =>
        await createResource({
          accountId,
          type: source.type,
          fields: source.fields.map(({ fieldId, fieldType, value }) => ({
            fieldId,
            value: mapValueToValueInput(fieldType, value),
          })),
        }),
    )

  return destination
}

export const cloneCosts = async ({
  accountId,
  fromResourceId,
  toResourceId,
}: ResourceCopyParams) => {
  const prisma = container.resolve(PrismaService)

  const fromCosts = await prisma.cost.findMany({
    where: { resourceId: fromResourceId, Resource: { accountId } },
    orderBy: {
      createdAt: 'asc',
    },
  })

  await prisma.cost.deleteMany({
    where: { resourceId: toResourceId, Resource: { accountId } },
  })

  await prisma.cost.createMany({
    data: fromCosts.map(({ name, isPercentage, value }) => ({
      resourceId: toResourceId,
      name,
      isPercentage,
      value,
    })),
  })
}

export const cloneLines = async ({
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
