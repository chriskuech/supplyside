import { ResourceType } from '@prisma/client'
import { container } from 'tsyringe'
import { FieldRef, selectSchemaFieldUnsafe } from '../schema/extensions'
import { fields } from '../schema/template/system-fields'
import { FieldTemplate } from '../schema/template/types'
import { SchemaService } from '../schema'
import { copyFields } from './copy'
import { ResourceCopyService } from './clone'
import { readResource, readResources, updateResourceField } from '.'

type LinkResourceParams = {
  accountId: string
  fromResourceId: string
  toResourceId: string
  backLinkFieldRef: FieldRef
}

export const linkResource = async ({
  accountId,
  fromResourceId,
  toResourceId,
}: LinkResourceParams & { backLinkFieldRef: FieldRef }) => {
  const cloneService = container.resolve(ResourceCopyService)

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

  await copyFields({ accountId, fromResourceId, toResourceId })

  if (fromResource.type === 'Purchase' && toResource.type === 'Bill') {
    await cloneService.cloneCosts({ accountId, fromResourceId, toResourceId })
    await linkLines({
      accountId,
      fromResourceId,
      toResourceId,
      fromResourceField: fields.purchase,
      toResourceField: fields.bill,
    })
  }
}

type LinkLinesParams = {
  accountId: string
  fromResourceId: string
  toResourceId: string
  fromResourceField: FieldTemplate
  toResourceField: FieldTemplate
}

const linkLines = async ({
  accountId,
  fromResourceId,
  toResourceId,
  fromResourceField,
  toResourceField,
}: LinkLinesParams) => {
  const schemaService = container.resolve(SchemaService)

  const lineSchema = await schemaService.readSchema(
    accountId,
    ResourceType.Line,
  )

  const lines = await readResources({
    accountId,
    type: 'Line',
    where: {
      '==': [{ var: fromResourceField.name }, fromResourceId],
    },
  })

  await Promise.all(
    lines.map((line) =>
      updateResourceField({
        accountId,
        resourceId: line.id,
        fieldId: selectSchemaFieldUnsafe(lineSchema, toResourceField).id,
        value: { resourceId: toResourceId },
      }),
    ),
  )
}
