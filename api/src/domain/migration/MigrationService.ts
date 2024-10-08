import { fields, selectResourceFieldValue } from '@supplyside/model'
import { injectable } from 'inversify'
import { ResourceService } from '../resource/ResourceService'
import { SchemaFieldService } from '../schema/SchemaFieldService'
import { MigrationUtilityService } from './MigrationUtilityService'

@injectable()
export class MigrationService {
  constructor(
    private readonly resources: ResourceService,
    private readonly utils: MigrationUtilityService,
    private readonly fields: SchemaFieldService,
  ) {}

  async migrate(accountId: string) {
    await this.migrateItemToLine(accountId)
    await this.migrateBillFilesToBillAttachments(accountId)
  }

  private async migrateItemToLine(accountId: string) {
    const accountFields = await this.fields.list(accountId)
    const nameField = accountFields.find(
      (f) => f.templateId === fields.name.templateId,
    )
    const itemNameField = accountFields.find(
      (f) => f.templateId === fields.itemName.templateId,
    )
    const itemNumberField = accountFields.find(
      (f) => f.templateId === fields.itemNumber.templateId,
    )

    const lines = await this.resources.list(accountId, 'PurchaseLine')

    await Promise.all(
      lines.map(async (line) => {
        const item = selectResourceFieldValue(line, fields.item)?.resource

        if (!item) return

        if (nameField && itemNameField) {
          await this.utils.copyOverTextField(
            item.id,
            nameField.fieldId,
            line.id,
            itemNameField.fieldId,
          )
        }

        if (itemNumberField) {
          await this.utils.copyOverTextField(
            item.id,
            itemNumberField.fieldId,
            line.id,
            itemNumberField.fieldId,
          )
        }
      }),
    )
  }

  private async migrateBillFilesToBillAttachments(accountId: string) {
    const accountFields = await this.fields.list(accountId)
    const billFilesField = accountFields.find(
      (f) => f.templateId === fields.billFiles.templateId,
    )
    const billAttachmentsField = accountFields.find(
      (f) => f.templateId === fields.billAttachments.templateId,
    )

    if (billFilesField && billAttachmentsField) {
      const bills = await this.resources.list(accountId, 'Bill')
      await Promise.all(
        bills.map(async (bill) => {
          await this.utils.mergeFilesFields(
            bill.id,
            billFilesField.fieldId,
            bill.id,
            billAttachmentsField.fieldId,
          )
        }),
      )
    }
  }
}
