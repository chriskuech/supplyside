import 'server-only'
import { fail } from 'assert'
import { ResourceType } from '@prisma/client'
import { FieldRef, selectSchemaField } from '../schema/extensions'
import { fields } from '../schema/template/system-fields'
import { FieldTemplate } from '../schema/template/types'
import { readSchema } from '../schema'
import { cloneCosts } from './clone'
import { copyFields } from './copy'
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

  if (fromResource.type === 'Order' && toResource.type === 'Bill') {
    await cloneCosts({ accountId, fromResourceId, toResourceId })
    await linkLines({
      accountId,
      fromResourceId,
      toResourceId,
      fromResourceField: fields.order,
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
  const lineSchema = await readSchema({
    accountId,
    resourceType: ResourceType.Line,
  })

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
        fieldId: selectSchemaField(lineSchema, toResourceField)?.id ?? fail(),
        value: { resourceId: toResourceId },
      }),
    ),
  )
}
