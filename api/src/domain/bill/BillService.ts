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

    await this.resourceService.linkLines({
      accountId,
      fromResourceId: purchaseId,
      toResourceId: resourceId,
      fromResourceField: fields.purchase,
      toResourceField: fields.bill,
    })
  }
}
