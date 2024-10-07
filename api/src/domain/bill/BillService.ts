import { ResourceService } from '@supplyside/api/domain/resource/ResourceService'
import { SchemaService } from '@supplyside/api/domain/schema/SchemaService'
import { fields, selectSchemaFieldUnsafe } from '@supplyside/model'
import assert from 'assert'
import { inject, injectable } from 'inversify'
import { Message } from 'postmark'
import { AccountService } from '../account/AccountService'
import { BlobService } from '../blob/BlobService'
import { FileService } from '../file/FileService'
import { BillExtractionService } from './BillExtractionService'

@injectable()
export class BillService {
  constructor(
    @inject(AccountService) private readonly accountService: AccountService,
    @inject(BillExtractionService)
    private readonly billExtractionService: BillExtractionService,
    @inject(BlobService) private readonly blobService: BlobService,
    @inject(FileService) private readonly fileService: FileService,
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

    await this.resourceService.linkLines({
      accountId,
      fromResourceId: purchaseId,
      toResourceId: resourceId,
      fromResourceField: fields.purchase,
      toResourceField: fields.bill,
    })
  }

  async handleMessage(message: Message): Promise<void> {
    // for some reason this is (sometimes?) wrapped in quotes
    const accountKey = message.To?.split('@').shift()?.replace(/^"/, '')

    assert(accountKey, 'Account key not found in To: ' + message.To)

    const account = await this.accountService.readByKey(accountKey)

    if (!account) return

    const attachments =
      message.Attachments?.map(
        (attachment) =>
          ({
            content: attachment.Content,
            encoding: 'base64',
            contentType: attachment.ContentType,
            fileName: attachment.Name,
          }) as const,
      ) ?? []

    const emails = message.HtmlBody
      ? [
          {
            content: message.HtmlBody,
            encoding: 'utf-8',
            contentType: 'text/html',
            fileName: 'email.html',
          } as const,
        ]
      : message.TextBody
        ? [
            {
              content: message.TextBody,
              encoding: 'utf-8',
              contentType: 'text/plain',
              fileName: 'email.txt',
            } as const,
          ]
        : []

    const billSchema = await this.schemaService.readMergedSchema(
      account.id,
      'Bill',
    )

    const fileIds = await Promise.all(
      [...emails, ...attachments].map(async (file) => {
        const { id: blobId } = await this.blobService.createBlob(account.id, {
          buffer: Buffer.from(file.content, file.encoding),
          contentType: file.contentType,
        })

        const { id: fileId } = await this.fileService.create(account.id, {
          name: file.fileName,
          blobId,
        })

        return fileId
      }),
    )

    const bill = await this.resourceService.create(account.id, 'Bill', {
      fields: [
        {
          fieldId: selectSchemaFieldUnsafe(billSchema, fields.billAttachments)
            .fieldId,
          valueInput: { fileIds },
        },
      ],
    })

    await this.billExtractionService.extractContent(account.id, bill.id)
  }
}
