import { ResourceService } from '@supplyside/api/domain/resource/ResourceService'
import { fields } from '@supplyside/model'
import { inject, injectable } from 'inversify'

@injectable()
export class BillService {
  constructor(
    @inject(ResourceService) private readonly resourceService: ResourceService,
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

    const lines = await this.resourceService.list(accountId, 'PurchaseLine', {
      where: {
        '==': [{ var: fields.purchase.name }, purchaseId],
      },
    })

    await Promise.all(
      lines.map((line) =>
        this.resourceService.updateResourceField(
          accountId,
          'PurchaseLine',
          line.id,
          fields.bill,
          { resourceId },
        ),
      ),
    )
  }
}
