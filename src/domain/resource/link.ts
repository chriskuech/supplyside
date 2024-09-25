import { ResourceType } from '@prisma/client'
import { container, singleton } from 'tsyringe'
import { FieldRef, selectSchemaFieldUnsafe } from '../schema/extensions'
import { fields } from '../schema/template/system-fields'
import { FieldTemplate } from '../schema/template/types'
import { SchemaService } from '../schema'
import { ResourceCloneService } from './clone'
import { ResourceCopyService } from './copy'
import { readResource, readResources, updateResourceField } from '.'

type LinkResourceParams = {
  accountId: string
  fromResourceId: string
  toResourceId: string
  backLinkFieldRef: FieldRef
}

@singleton()
export class ResourceLinkService {
  constructor(
    private readonly resourceCopyService: ResourceCopyService,
    private readonly cloneService: ResourceCloneService,
  ) {}

  linkResource = async ({
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

    await this.resourceCopyService.copyFields({
      accountId,
      fromResourceId,
      toResourceId,
    })

    if (fromResource.type === 'Purchase' && toResource.type === 'Bill') {
      await this.cloneService.cloneCosts({
        accountId,
        fromResourceId,
        toResourceId,
      })
      await linkLines({
        accountId,
        fromResourceId,
        toResourceId,
        fromResourceField: fields.purchase,
        toResourceField: fields.bill,
      })
    }
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
