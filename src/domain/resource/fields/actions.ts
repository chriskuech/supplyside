'use server'

import { fail } from 'assert'
import { Cost, Prisma, ResourceType } from '@prisma/client'
import { isString, pick } from 'remeda'
import { revalidatePath } from 'next/cache'
import { P, match } from 'ts-pattern'
import { readResource, readResources } from '../actions'
import { selectValue } from '../types'
import prisma from '@/services/prisma'
import { createBlob } from '@/domain/blobs/actions'
import { fields, findField } from '@/domain/schema/template/system-fields'
import { readSchema } from '@/domain/schema/actions'
import {
  recalculateItemizedCosts,
  recalculateSubtotalCost,
} from '@/domain/resource/cost/actions'
import { Field, selectField } from '@/domain/schema/types'
import { readSession } from '@/lib/session/actions'
import { FieldTemplate } from '@/domain/schema/template/types'

export type UpdateValueDto = {
  resourceId: string
  fieldId: string
  value: {
    boolean?: boolean | null | undefined
    date?: Date | null | undefined
    fileId?: string | null | undefined
    fileIds?: string[] | null | undefined
    number?: number | null | undefined
    optionId?: string | null | undefined
    optionIds?: string[] | null | undefined
    resourceId?: string | null | undefined
    string?: string | null | undefined
    userId?: string | null | undefined
  }
}

export const updateValue = async ({
  resourceId,
  fieldId,
  value,
}: UpdateValueDto) => {
  revalidatePath('')
  //TODO:  check if value object is correct for each fieldType

  const {
    fileIds,
    optionIds,
    resourceId: linkedResourceId,
    string,
    ...rest
  } = value
  const data: Prisma.ValueCreateInput & Prisma.ValueUpdateInput = {
    ...rest,
    string: string?.trim() || null,
    Resource: match(linkedResourceId)
      .with(null, () => ({
        disconnect: true,
      }))
      .with(P.string, (id) => ({
        connect: { id },
      }))
      .with(undefined, () => undefined)
      .exhaustive(),
    ValueOption: optionIds
      ? {
          create: optionIds.map((optionId) => ({ optionId })),
        }
      : undefined,
    Files: fileIds
      ? {
          createMany: {
            data: fileIds.map((fileId) => ({
              fileId,
            })),
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
        Value: { create: data },
      },
      update: {
        Value: { update: data },
      },
      include: {
        Resource: true,
        Field: true,
      },
    }),
    ...(value.resourceId
      ? [copyLinkedResourceFields(resourceId, fieldId, value.resourceId)]
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

    const totalCostFieldId = selectField(schema, fields.totalCost)?.id ?? fail()
    const unitCost = selectValue(resource, fields.unitCost)?.number ?? 0
    const quantity = selectValue(resource, fields.quantity)?.number ?? 0

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

    const orderId = selectValue(line, fields.order)?.resource?.id
    if (orderId) {
      await recalculateSubtotalCost(rf.Resource.accountId, 'Order', orderId)
    }

    const billId = selectValue(line, fields.bill)?.resource?.id
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
      selectValue(resource, fields.itemizedCosts)?.number ?? 0
    const subtotalCost = selectValue(resource, fields.subtotalCost)?.number ?? 0

    await updateValue({
      fieldId: selectField(schema, fields.totalCost)?.id ?? fail(),
      resourceId: resource.id,
      value: {
        number: itemizedCosts + subtotalCost,
      },
    })
  }
}

export const uploadFile = async (
  resourceId: string,
  fieldId: string,
  formData: FormData,
) => {
  revalidatePath('')
  const { accountId } = await readSession()

  const file = formData.get('file')

  if (!file || typeof file === 'string' || file.size === 0) return

  const { id: blobId } = await createBlob({ accountId, file })

  const input: Prisma.ValueCreateInput = {
    File: {
      create: {
        name: file.name,
        Account: {
          connect: {
            id: accountId,
          },
        },
        Blob: {
          connect: {
            id: blobId,
          },
        },
      },
    },
  }

  await prisma().resourceField.upsert({
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
      Value: { create: input },
    },
    update: {
      Value: { update: input },
    },
  })
}

export const uploadFiles = async (
  resourceId: string,
  fieldId: string,
  formData: FormData,
) => {
  revalidatePath('')
  const { accountId } = await readSession()

  const files = formData.getAll('files')

  if (files.length === 0) return

  const input: Prisma.ValueCreateWithoutResourceFieldValueInput = {
    Files: {
      create: await Promise.all(
        files
          .filter(
            (file): file is Exclude<FormDataEntryValue, string> =>
              !isString(file),
          )
          .map(async (file) => {
            const blob = await createBlob({ accountId, file })
            return {
              File: {
                create: {
                  name: file.name,
                  Account: {
                    connect: {
                      id: accountId,
                    },
                  },
                  Blob: {
                    connect: {
                      id: blob.id,
                    },
                  },
                },
              },
            }
          }),
      ),
    },
  }

  await prisma().resourceField.upsert({
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
      Value: { create: input },
    },
    update: {
      Value: { update: input },
    },
  })
}

export type UpdateContactDto = {
  name?: string
  title?: string
  email?: string
  phone?: string
}

export const updateContact = async (
  resourceId: string,
  fieldId: string,
  dto: UpdateContactDto | null,
) => {
  if (!dto) {
    await prisma().resourceField.update({
      where: {
        resourceId_fieldId: {
          resourceId,
          fieldId,
        },
      },
      data: {
        Value: {
          update: {
            Contact: {
              delete: true,
            },
          },
        },
      },
    })
  } else {
    await prisma().resourceField.upsert({
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
            Contact: {
              create: dto,
            },
          },
        },
      },
      update: {
        Value: {
          upsert: {
            create: {
              Contact: {
                create: dto,
              },
            },
            update: {
              Contact: {
                upsert: {
                  create: dto,
                  update: dto,
                },
              },
            },
          },
        },
      },
    })
  }

  revalidatePath('')
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
    readSchema({ accountId, resourceType: thisResourceType }),
    readSchema({ accountId, resourceType: linkedResourceType }),
  ])

  const excludeDerivedFields = (f: Field) =>
    !f.templateId || !findField(f.templateId)?.isDerived

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
      linkedResourceType === ResourceType.Order ? fields.order : fields.bill

    const resourceFieldTemplate =
      thisResourceType === ResourceType.Order ? fields.order : fields.bill

    await Promise.all([
      copyResourceCosts(linkedResourceId, resourceId),
      copyResourceLines(
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
  linkedResourceId: string,
  linkedFieldTemplate: FieldTemplate,
  resourceId: string,
  resourceFieldTemplate: FieldTemplate,
) => {
  const [linkedResource, thisResource] = await Promise.all([
    prisma().resource.findUniqueOrThrow({
    where: { id: linkedResourceId },
    }),
    prisma().resource.findUniqueOrThrow({
    where: { id: resourceId },
    }),
  ])

  const linkedResourceLines = await readResources({
    accountId: linkedResource.accountId,
    type: ResourceType.Line,
    where: {
      '==': [{ var: linkedFieldTemplate.name }, linkedResourceId],
    },
  })

  const schema = await readSchema({
    accountId: linkedResource.accountId,
    resourceType: ResourceType.Line,
  })

  const field = selectField(schema, resourceFieldTemplate) ?? fail()

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
