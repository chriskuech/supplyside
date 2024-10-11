import { ResourceService } from '@supplyside/api/domain/resource/ResourceService'
import { SchemaService } from '@supplyside/api/domain/schema/SchemaService'
import { BadRequestError } from '@supplyside/api/integrations/fastify/BadRequestError'
import { fields, selectSchemaFieldUnsafe } from '@supplyside/model'
import { inject, injectable } from 'inversify'
import { Message } from 'postmark'
import { AccountService } from '../account/AccountService'
import { BlobService } from '../blob/BlobService'
import { FileService } from '../file/FileService'
import { BillExtractionService } from './BillExtractionService'

@injectable()
export class BillInboxService {
  constructor(
    @inject(AccountService) private readonly accountService: AccountService,
    @inject(BillExtractionService)
    private readonly billExtractionService: BillExtractionService,
    @inject(BlobService) private readonly blobService: BlobService,
    @inject(FileService) private readonly fileService: FileService,
    @inject(ResourceService) private readonly resourceService: ResourceService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
  ) {}

  async handleMessage(message: Message): Promise<void> {
    if (!message.To) throw new BadRequestError('No "To" address found')

    const accountKey = BillInboxService.parseAllEmails(message.To)
      .find((email) => email.endsWith('.supplyside.io'))
      ?.split('@')
      .shift()

    if (!accountKey)
      throw new BadRequestError('Could not infer account ID from "To" address')

    const account = await this.accountService.readByKey(accountKey)

    if (!account)
      throw new BadRequestError(`Account not found with key ${accountKey}`)

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

  private static parseAllEmails(input: string): string[] {
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g

    const matches = input.match(emailRegex)

    return matches ?? []
  }
}
