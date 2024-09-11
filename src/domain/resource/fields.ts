import { fail } from 'assert'
import { ResourceType } from '@prisma/client'
import { pick } from 'remeda'
import { SchemaField } from '../schema/entity'
import { copyResourceCosts } from './costs'
import { readResource, readResources, updateResourceField } from '.'
import prisma from '@/services/prisma'
import {
  fields,
  findTemplateField,
} from '@/domain/schema/template/system-fields'
import { readSchema } from '@/domain/schema'
import { selectSchemaField } from '@/domain/schema/extensions'
import { FieldTemplate } from '@/domain/schema/template/types'

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

  const excludeDerivedFields = (f: SchemaField) =>
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
    linkedResourceLines.map((line) =>
      updateResourceField({
        accountId,
        resourceId: line.id,
        fieldId: field.id,
        value: {
          resourceId: thisResource.id,
        },
      }),
    ),
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
