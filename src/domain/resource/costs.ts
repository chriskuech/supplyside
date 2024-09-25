import { ResourceType } from '@prisma/client'
import { map, pipe, sum } from 'remeda'
import { singleton } from 'tsyringe'
import { SchemaService } from '../schema'
import { selectResourceFieldValue } from './extensions'
import { readResource, readResources, updateResourceField } from '.'
import { selectSchemaFieldUnsafe } from '@/domain/schema/extensions'
import { fields } from '@/domain/schema/template/system-fields'
import { PrismaService } from '@/integrations/PrismaService'

@singleton()
export class CostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schemaService: SchemaService,
  ) {}

  async create(accountId: string, resourceId: string) {
    await this.prisma.cost.create({
      data: {
        Resource: {
          connect: {
            id: resourceId,
            accountId,
          },
        },
      },
    })
  }

  async update(
    accountId: string,
    resourceId: string,
    costId: string,
    data: {
      name?: string
      isPercentage?: boolean
      value?: number
    },
  ) {
    await this.prisma.cost.update({
      where: {
        id: costId,
        Resource: {
          id: resourceId,
          accountId,
        },
      },
      data: {
        name: data.name,
        isPercentage: data.isPercentage,
        value: data.value,
      },
      include: {
        Resource: true,
      },
    })

    await this.recalculateItemizedCosts(accountId, resourceId)
  }

  async delete(accountId: string, resourceId: string, costId: string) {
    await this.prisma.cost.delete({
      where: {
        id: costId,
        Resource: {
          id: resourceId,
          accountId,
        },
      },
    })

    await this.recalculateItemizedCosts(accountId, resourceId)
  }

  async recalculateItemizedCosts(accountId: string, resourceId: string) {
    const resource = await readResource({ accountId, id: resourceId })
    const schema = await this.schemaService.readSchema(accountId, resource.type)

    const subtotal =
      selectResourceFieldValue(resource, fields.subtotalCost)?.number ?? 0

    await updateResourceField({
      accountId,
      resourceId,
      fieldId: selectSchemaFieldUnsafe(schema, fields.itemizedCosts).id,
      value: {
        number: pipe(
          resource.costs,
          map((cost) =>
            cost.isPercentage ? (cost.value * subtotal) / 100 : cost.value,
          ),
          sum(),
        ),
      },
    })
  }

  async recalculateSubtotalCost(
    accountId: string,
    resourceType: ResourceType,
    resourceId: string,
  ) {
    const schema = await this.schemaService.readSchema(
      accountId,
      resourceType,
      true,
    )

    const lines = await readResources({
      accountId,
      type: 'Line',
      where: {
        '==': [{ var: resourceType }, resourceId],
      },
    })

    const subTotal = pipe(
      lines,
      map(
        (line) => selectResourceFieldValue(line, fields.totalCost)?.number ?? 0,
      ),
      sum(),
    )

    await updateResourceField({
      accountId,
      fieldId: selectSchemaFieldUnsafe(schema, fields.subtotalCost)?.id,
      resourceId,
      value: {
        number: Number(subTotal), // TODO: this is ignoring that subTotal is bigint
      },
    })
  }
}
