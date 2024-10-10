import { ResourceService } from '@supplyside/api/domain/resource/ResourceService'
import { fields, selectSchemaFieldUnsafe } from '@supplyside/model'
import { inject, injectable } from 'inversify'
import { SchemaService } from '../schema/SchemaService'

@injectable()
export class BillService {
  constructor(
    @inject(ResourceService) private readonly resourceService: ResourceService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
  ) {}

  async linkPurchase(
    accountId: string,
    resourceId: string,
    { purchaseId }: { purchaseId: string },
  ) {
    await this.resourceService.copyFields(accountId, resourceId, {
      fromResourceId: purchaseId,
    })

    await this.resourceService.cloneCosts({
      accountId,
      fromResourceId: purchaseId,
      toResourceId: resourceId,
    })

    const lineSchema = await this.schemaService.readMergedSchema(
      accountId,
      'PurchaseLine',
    )

    const lines = await this.resourceService.list(accountId, 'PurchaseLine', {
      where: {
        '==': [{ var: fields.purchase.name }, purchaseId],
      },
    })

    await Promise.all(
      lines.map((line) =>
        this.resourceService.updateResourceField(accountId, line.id, {
          fieldId: selectSchemaFieldUnsafe(lineSchema, fields.bill).fieldId,
          valueInput: { resourceId },
        }),
      ),
    )

    await this.resourceService.recalculateSubtotalCost(
      accountId,
      'Bill',
      resourceId,
    )
  }
}
