'use server'

import { fail } from 'assert'
import { revalidateTag } from 'next/cache'
import { Prisma } from '@prisma/client'
import { map, pick, pipe, sum } from 'remeda'
import { readResource, readResources } from '../actions'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { createBlob } from '@/domain/blobs/actions'
import { fields } from '@/domain/schema/template/system-fields'
import { readSchema } from '@/domain/schema/actions'
import { recalculateItemizedCosts } from '@/domain/cost/actions'

export type UpdateValueDto = {
  resourceId: string
  fieldId: string
  value: {
    boolean?: boolean | null | undefined
    date?: Date | null | undefined
    number?: number | null | undefined
    string?: string | null | undefined
    userId?: string | null | undefined
    optionId?: string | null | undefined
    optionIds?: string[] | null | undefined
    resourceId?: string | null | undefined
  }
}

export const updateValue = async ({
  resourceId,
  fieldId,
  value,
}: UpdateValueDto) => {
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
        Value: { create: value },
      },
      update: {
        Value: { update: value },
      },
      include: {
        Resource: true,
        Field: true,
      },
    }),
    ...(value.resourceId
      ? [copyLinkedResourceFields(resourceId, fieldId, value.resourceId)]
      : []),
  ])

  // Update Line."Total Cost"
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
      schema.allFields.find(
        (field) => field.templateId === fields.totalCost.templateId,
      )?.id ?? fail()

    const unitCost =
      resource.fields.find(
        (field) => field.templateId === fields.unitCost.templateId,
      )?.value.number ?? 0
    const quantity =
      resource.fields.find(
        (field) => field.templateId === fields.quantity.templateId,
      )?.value.number ?? 0

    await updateValue({
      fieldId: totalCostFieldId,
      resourceId: rf.Resource.id,
      value: {
        number: unitCost * quantity,
      },
    })
  }

  // Update Order."Subtotal Cost"
  if (
    rf.Resource.type === 'Line' &&
    rf.Field.templateId === fields.totalCost.templateId
  ) {
    const line = await readResource({
      accountId: rf.Resource.accountId,
      id: resourceId,
    })

    const order =
      line.fields.find((field) => field.templateId === fields.order.templateId)
        ?.value.resource ?? null

    if (order) {
      const orderSchema = await readSchema({
        accountId: rf.Resource.accountId,
        resourceType: 'Order',
        isSystem: true,
      })

      const lines = await readResources({
        accountId: rf.Resource.accountId,
        type: 'Line',
        where: {
          '==': [{ var: 'Order' }, order?.id],
        },
      })

      const subTotal = pipe(
        lines,
        map(
          (line) =>
            line.fields.find(
              (field) => field.templateId === fields.totalCost.templateId,
            )?.value.number ?? 0,
        ),
        sum(),
      )

      await updateValue({
        fieldId:
          orderSchema.allFields.find(
            (field) => field.templateId === fields.subtotalCost.templateId,
          )?.id ?? fail(),
        resourceId: order.id,
        value: {
          number: subTotal,
        },
      })
    }
  }

  // Update Order."Itemized Costs"
  if (
    rf.Resource.type === 'Order' &&
    rf.Field.templateId === fields.subtotalCost.templateId
  ) {
    await recalculateItemizedCosts(rf.Resource.accountId, resourceId)
  }

  // Update Order."Total Cost"
  if (
    rf.Resource.type === 'Order' &&
    (rf.Field.templateId === fields.subtotalCost.templateId ||
      rf.Field.templateId === fields.itemizedCosts.templateId)
  ) {
    const order = await readResource({
      accountId: rf.Resource.accountId,
      id: resourceId,
    })

    const orderSchema = await readSchema({
      accountId: rf.Resource.accountId,
      resourceType: 'Order',
      isSystem: true,
    })

    const itemizedCosts =
      order.fields.find(
        (field) => field.templateId === fields.itemizedCosts.templateId,
      )?.value.number ?? 0
    const subtotalCost =
      order.fields.find(
        (field) => field.templateId === fields.subtotalCost.templateId,
      )?.value.number ?? 0

    await updateValue({
      fieldId:
        orderSchema.allFields.find(
          (field) => field.templateId === fields.totalCost.templateId,
        )?.id ?? fail(),
      resourceId: order.id,
      value: {
        number: itemizedCosts + subtotalCost,
      },
    })
  }

  revalidateTag('resource')
}

export const uploadFile = async (
  resourceId: string,
  fieldId: string,
  formData: FormData,
) => {
  const { accountId } = await requireSession()

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

  revalidateTag('resource')
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
  revalidateTag('resource')

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

  const thisFieldIds = thisSchema.allFields.map(({ id }) => id)
  const linkedFieldIds = linkedSchema.allFields.map(({ id }) => id)

  await Promise.all(
    linkedFieldIds
      .filter((fieldId) => thisFieldIds.includes(fieldId))
      .map((fieldId) => copyField(linkedResourceId, resourceId, fieldId)),
  )
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
}
