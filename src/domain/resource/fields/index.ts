'use server'

import { fail } from 'assert'
import { Cost, Prisma, ResourceType } from '@prisma/client'
import { pick } from 'remeda'
import { revalidatePath } from 'next/cache'
import { match } from 'ts-pattern'
import { readResource, readResources } from '../actions'
import { selectResourceField } from '../types'
import { ValueInput } from '../values/types'
import prisma from '@/services/prisma'
import {
  fields,
  findTemplateField,
} from '@/domain/schema/template/system-fields'
import { readSchema } from '@/domain/schema/actions'
import {
  recalculateItemizedCosts,
  recalculateSubtotalCost,
} from '@/domain/resource/cost/actions'
import { Field, selectSchemaField } from '@/domain/schema/types'
import { FieldTemplate } from '@/domain/schema/template/types'

export type UpdateValueDto = {
  resourceId: string
  fieldId: string
  value: ValueInput
}

export const updateValue = async ({
  resourceId,
  fieldId,
  value,
}: UpdateValueDto) => {
  revalidatePath('')

  // TODO: use `match` or something
  const fileIds = 'fileIds' in value ? value.fileIds : []
  const optionIds = 'optionIds' in value ? value.optionIds : []
  const string = 'string' in value ? value.string : null
  const contact = 'contact' in value ? value.contact : null
  const fileId = 'fileId' in value ? value.fileId : null
  const optionId = 'optionId' in value ? value.optionId : null
  const userId = 'userId' in value ? value.userId : null
  const linkedResourceId = 'resourceId' in value ? value.resourceId : null

  const data: Prisma.ValueCreateInput & Prisma.ValueUpdateInput = {
    boolean: 'boolean' in value ? value.boolean : undefined,
    date: 'date' in value ? value.date : undefined,
    number: 'number' in value ? value.number : undefined,

    string: string?.trim() || null,
    ValueOption: optionIds
      ? {
          create: optionIds.map((optionId) => ({ optionId })),
        }
      : undefined,
    Files: fileIds
      ? {
          createMany: {
            data: fileIds.map((fileId) => ({ fileId })),
            skipDuplicates: true,
          },
        }
      : undefined,
  }

  await prisma().valueOption.deleteMany({
    where: { Value: { ResourceFieldValue: { every: { fieldId } } } },
  })

  const [rf] = await Promise.all([
    prisma().resourceField.upsert({
      where: {
        resourceId_fieldId: {
          resourceId,
          fieldId,
        },
      },
      create: {
        Resource: {
          connect: {
            id: resourceId,
          },
        },
        Field: {
          connect: {
            id: fieldId,
          },
        },
        Value: {
          create: {
            ...data,
            Contact: contact
              ? {
                  create: {
                    name: contact.name,
                    title: contact.title,
                    email: contact.email,
                    phone: contact.phone,
                  },
                }
              : undefined,
            File: fileId ? { connect: { id: fileId } } : undefined,
            Option: optionId ? { connect: { id: optionId } } : undefined,
            Resource: linkedResourceId
              ? { connect: { id: linkedResourceId } }
              : undefined,
            User: userId ? { connect: { id: userId } } : undefined,
            ValueOption: optionIds
              ? { create: optionIds.map((optionId) => ({ optionId })) }
              : undefined,
          },
        },
      },
      update: {
        Value: {
          update: {
            ...data,
            Contact: contact
              ? {
                  upsert: {
                    create: {
                      name: contact.name,
                      title: contact.title,
                      email: contact.email,
                      phone: contact.phone,
                    },
                    update: {
                      name: contact.name,
                      title: contact.title,
                      email: contact.email,
                      phone: contact.phone,
                    },
                  },
                }
              : {
                  disconnect: true,
                },
            File: fileId ? { connect: { id: fileId } } : { disconnect: true },
            Option: optionId
              ? { connect: { id: optionId } }
              : { disconnect: true },
            Resource: match(linkedResourceId)
              .with(null, () => ({
                disconnect: true,
              }))
              .otherwise((id) => ({
                connect: { id },
              })),
            User: userId ? { connect: { id: userId } } : { disconnect: true },
            // ValueOption: {
            //   upsert: value.options.map(({ id }) => ({
            //     where: { optionId: id },
            //     create: { optionId: id },
            //     update: { optionId: id },
            //   })),
            // },
          },
        },
      },
      include: {
        Resource: true,
        Field: true,
      },
    }),
    ...(resourceId
      ? [copyLinkedResourceFields(resourceId, fieldId, resourceId)]
      : []),
    ...(fileIds
      ? [
          prisma().valueFile.deleteMany({
            where: { fileId: { notIn: fileIds } },
          }),
        ]
      : []),
  ])

  // When the Line."Unit Cost" or Line."Quantity" field is updated,
  // Then update Line."Total Cost"
  if (
    rf.Resource.type === 'Line' &&
    (rf.Field.templateId === fields.unitCost.templateId ||
      rf.Field.templateId === fields.quantity.templateId)
  ) {
    const [resource, schema] = await Promise.all([
      readResource({
        accountId: rf.Resource.accountId,
        id: resourceId,
      }),
      readSchema({
        accountId: rf.Resource.accountId,
        resourceType: 'Line',
        isSystem: true,
      }),
    ])

    const totalCostFieldId =
      selectSchemaField(schema, fields.totalCost)?.id ?? fail()
    const unitCost = selectResourceField(resource, fields.unitCost)?.number ?? 0
    const quantity = selectResourceField(resource, fields.quantity)?.number ?? 0

    await updateValue({
      fieldId: totalCostFieldId,
      resourceId: rf.Resource.id,
      value: {
        number: unitCost * quantity,
      },
    })
  }

  // When the Line."Total Cost" field is updated,
  // Then update the {Bill|Order}."Subtotal Cost" field
  if (
    rf.Resource.type === 'Line' &&
    rf.Field.templateId === fields.totalCost.templateId
  ) {
    const line = await readResource({
      accountId: rf.Resource.accountId,
      id: rf.Resource.id,
    })

    const orderId = selectResourceField(line, fields.order)?.resource?.id
    if (orderId) {
      await recalculateSubtotalCost(rf.Resource.accountId, 'Order', orderId)
    }

    const billId = selectResourceField(line, fields.bill)?.resource?.id
    if (billId) {
      await recalculateSubtotalCost(rf.Resource.accountId, 'Bill', billId)
    }
  }

  // When the {Bill|Order}."Subtotal Cost" field is updated,
  // Then recalculate the {Bill|Order}."Itemized Costs" field
  if (
    ['Bill', 'Order'].includes(rf.Resource.type) &&
    rf.Field.templateId === fields.subtotalCost.templateId
  ) {
    await recalculateItemizedCosts(rf.Resource.accountId, resourceId)
  }

  // When the {Bill|Order}."Itemized Costs" or {Bill|Order}."Subtotal Cost" field is updated,
  // Then update {Bill|Order}."Total Cost"
  if (
    ['Bill', 'Order'].includes(rf.Resource.type) &&
    (rf.Field.templateId === fields.subtotalCost.templateId ||
      rf.Field.templateId === fields.itemizedCosts.templateId)
  ) {
    const resource = await readResource({
      accountId: rf.Resource.accountId,
      id: resourceId,
    })

    const schema = await readSchema({
      accountId: rf.Resource.accountId,
      resourceType: rf.Resource.type,
      isSystem: true,
    })

    const itemizedCosts =
      selectResourceField(resource, fields.itemizedCosts)?.number ?? 0
    const subtotalCost =
      selectResourceField(resource, fields.subtotalCost)?.number ?? 0

    await updateValue({
      fieldId: selectSchemaField(schema, fields.totalCost)?.id ?? fail(),
      resourceId: resource.id,
      value: {
        number: itemizedCosts + subtotalCost,
      },
    })
  }

  // When the Order field of a Bill resource has been updated (an Order has been linked to a Bill)
  // Then recalculate the Bill."Subtotal Cost"
  if (
    rf.Resource.type === 'Bill' &&
    rf.Field.templateId === fields.order.templateId
  ) {
    await recalculateSubtotalCost(rf.Resource.accountId, 'Bill', rf.Resource.id)
  }
}

export const copyLinkedResourceFields = async (
  resourceId: string,
  fieldId: string,
  linkedResourceId: string,
) => {
  const { resourceType: linkedResourceType } =
    await prisma().field.findUniqueOrThrow({
      where: { id: fieldId },
    })

  if (!linkedResourceType || !linkedResourceId) return

  const { accountId, type: thisResourceType } =
    await prisma().resource.findUniqueOrThrow({
      where: { id: resourceId },
    })

  const [thisSchema, linkedSchema] = await Promise.all([
    readSchema({
      accountId,
      resourceType: thisResourceType,
    }),
    readSchema({
      accountId,
      resourceType: linkedResourceType,
    }),
  ])

  const excludeDerivedFields = (f: Field) =>
    !f.templateId || !findTemplateField(f.templateId)?.isDerived

  const thisFieldIds = thisSchema.allFields
    .filter(excludeDerivedFields)
    .map(({ id }) => id)
  const linkedFieldIds = linkedSchema.allFields
    .filter(excludeDerivedFields)
    .map(({ id }) => id)

  await Promise.all(
    linkedFieldIds
      .filter((fieldId) => thisFieldIds.includes(fieldId))
      .map((fieldId) => copyField(linkedResourceId, resourceId, fieldId)),
  )

  const resourcesWithLines: ResourceType[] = ['Order', 'Bill']
  if (
    [thisResourceType, linkedResourceType].every((linkedResource) =>
      resourcesWithLines.includes(linkedResource),
    )
  ) {
    const linkedFieldTemplate =
      linkedResourceType === 'Order' ? fields.order : fields.bill

    const resourceFieldTemplate =
      thisResourceType === 'Order' ? fields.order : fields.bill

    await Promise.all([
      copyResourceCosts(linkedResourceId, resourceId),
      copyResourceLines(
        accountId,
        linkedResourceId,
        linkedFieldTemplate,
        resourceId,
        resourceFieldTemplate,
      ),
    ])
  }

  revalidatePath('')
}

const copyResourceLines = async (
  accountId: string,
  linkedResourceId: string,
  linkedFieldTemplate: FieldTemplate,
  resourceId: string,
  resourceFieldTemplate: FieldTemplate,
) => {
  const [linkedResource, thisResource] = await Promise.all([
    readResource({
      accountId,
      id: linkedResourceId,
    }),
    readResource({
      accountId,
      id: resourceId,
    }),
  ])

  const linkedResourceLines = await readResources({
    accountId: linkedResource.accountId,
    type: 'Line',
    where: {
      '==': [{ var: linkedFieldTemplate.name }, linkedResourceId],
    },
  })

  const schema = await readSchema({
    accountId: linkedResource.accountId,
    resourceType: 'Line',
  })

  const field = selectSchemaField(schema, resourceFieldTemplate) ?? fail()

  await Promise.all(
    linkedResourceLines.map(async (line) =>
      updateValue({
        resourceId: line.id,
        fieldId: field.id,
        value: {
          resourceId: thisResource.id,
        },
      }),
    ),
  )

  revalidatePath('')
}

export const copyResourceCosts = async (
  fromResourceId: string,
  toResourceId: string,
) => {
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

  revalidatePath('')
}

export const copyField = async (
  fromResourceId: string,
  toResourceId: string,
  fieldId: string,
) => {
  const rf = await prisma().resourceField.findUniqueOrThrow({
    where: {
      resourceId_fieldId: { resourceId: fromResourceId, fieldId },
    },
    include: {
      Value: {
        include: {
          Contact: true,
          ValueOption: true,
        },
      },
    },
  })

  if (!rf.Value) return

  await prisma().resourceField.upsert({
    where: {
      resourceId_fieldId: {
        resourceId: toResourceId,
        fieldId,
      },
    },
    create: {
      Resource: {
        connect: {
          id: toResourceId,
        },
      },
      Field: {
        connect: {
          id: fieldId,
        },
      },
      Value: {
        create: {
          boolean: rf.Value.boolean,
          date: rf.Value.date,
          number: rf.Value.number,
          string: rf.Value.string,
          Contact: rf.Value.Contact
            ? {
                create: pick(rf.Value.Contact, [
                  'name',
                  'title',
                  'email',
                  'phone',
                ]),
              }
            : undefined,
          Option: rf.Value.optionId
            ? {
                connect: {
                  id: rf.Value.optionId,
                },
              }
            : undefined,
          File: rf.Value.fileId
            ? {
                connect: {
                  id: rf.Value.fileId,
                },
              }
            : undefined,
          Resource: rf.Value.resourceId
            ? {
                connect: {
                  id: rf.Value.resourceId,
                },
              }
            : undefined,
          User: rf.Value.userId
            ? {
                connect: {
                  id: rf.Value.userId,
                },
              }
            : undefined,
          ValueOption: {
            create: rf.Value.ValueOption.map(({ optionId }) => ({
              optionId,
            })),
          },
        },
      },
    },
    update: {
      Value: {
        update: {
          boolean: rf.Value.boolean,
          date: rf.Value.date,
          number: rf.Value.number,
          string: rf.Value.string,
          Contact: rf.Value.Contact
            ? {
                create: pick(rf.Value.Contact, [
                  'name',
                  'title',
                  'email',
                  'phone',
                ]),
              }
            : undefined,
          Option: rf.Value.optionId
            ? {
                connect: {
                  id: rf.Value.optionId,
                },
              }
            : undefined,
          File: rf.Value.fileId
            ? {
                connect: {
                  id: rf.Value.fileId,
                },
              }
            : undefined,
          Resource: rf.Value.resourceId
            ? {
                connect: {
                  id: rf.Value.resourceId,
                },
              }
            : undefined,
          User: rf.Value.userId
            ? {
                connect: {
                  id: rf.Value.userId,
                },
              }
            : undefined,
          ValueOption: {
            create: rf.Value.ValueOption.map(({ optionId }) => ({
              optionId,
            })),
          },
        },
      },
    },
  })
  revalidatePath('')
}
