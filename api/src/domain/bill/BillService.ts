import { container } from '@supplyside/api/di'
import { ResourceService } from '@supplyside/api/domain/resource/ResourceService'
import { SchemaService } from '@supplyside/api/domain/schema/SchemaService'
import { Resource, fields, selectSchemaFieldUnsafe } from '@supplyside/model'
import assert from 'assert'
import { inject, injectable } from 'inversify'
import { Message } from 'postmark'
import { AccountService } from '../account/AccountService'
import { BlobService } from '../blob/BlobService'
import { FileService } from '../file/FileService'

type FileParam = {
  content: string
  encoding: BufferEncoding
  contentType: string
  fileName: string
}

type Params = {
  accountId: string
  files: FileParam[]
}

const createBill = async (params: Params): Promise<Resource> => {
  const blobService = container.resolve(BlobService)
  const fileService = container.resolve(FileService)
  const resourceService = container.resolve(ResourceService)
  const schemaService = container.resolve(SchemaService)

  const billSchema = await schemaService.readMergedSchema(
    params.accountId,
    'Bill',
  )

  const fileIds = await Promise.all(
    params.files.map(async (file) => {
      const { id: blobId } = await blobService.createBlob(params.accountId, {
        buffer: Buffer.from(file.content, file.encoding),
        contentType: file.contentType,
      })

      const { id: fileId } = await fileService.create(params.accountId, {
        name: file.fileName,
        blobId,
      })

      return fileId
    }),
  )

  console.log('Creating Bill', fileIds)

  const bill = await resourceService.create(params.accountId, 'Bill', {
    fields: [
      {
        fieldId: selectSchemaFieldUnsafe(billSchema, fields.billFiles).fieldId,
        valueInput: { fileIds },
      },
    ],
  })

  return bill
}

@injectable()
export class BillService {
  constructor(
    @inject(AccountService) private readonly accountService: AccountService,
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

  async handleMessage(message: Message): Promise<void> {
    // for some reason this is (sometimes?) wrapped in quotes
    const accountKey = message.To?.split('@').shift()?.replace(/^"/, '')

    assert(accountKey, 'Account key not found in To: ' + message.To)

    const account = await this.accountService.readByKey(accountKey)

    if (!account) return

    const attachments: FileParam[] | undefined = message.Attachments?.map(
      (attachment) => ({
        content: attachment.Content,
        encoding: 'base64',
        contentType: attachment.ContentType,
        fileName: attachment.Name,
      }),
    )

    const email: FileParam | null = message.HtmlBody
      ? {
          content: message.HtmlBody,
          encoding: 'utf-8',
          contentType: 'text/html',
          fileName: 'email.html',
        }
      : message.TextBody
        ? {
            content: message.TextBody,
            encoding: 'utf-8',
            contentType: 'text/plain',
            fileName: 'email.txt',
          }
        : null

    await createBill({
      accountId: account.id,
      files: [...(email ? [email] : []), ...(attachments ?? [])],
    })
  }
}
