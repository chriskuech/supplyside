import { inject, injectable } from 'inversify'
import { BlobService } from '../blob/BlobService'
import { SchemaService } from '../schema/SchemaService'
import {
  fields,
  selectResourceFieldValue,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { AccountService } from '../account/AccountService'
import { ResourceService } from '../resource/ResourceService'
import { PoRenderingService } from './PoRenderingService'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import SmtpService from '@supplyside/api/integrations/SmtpService'
import { ConfigService } from '@supplyside/api/ConfigService'

@injectable()
export class PoService {
  constructor(
    @inject(AccountService) private readonly accountService: AccountService,
    @inject(BlobService) private readonly blobService: BlobService,
    @inject(PoRenderingService)
    private readonly poRenderingService: PoRenderingService,
    @inject(PrismaService) private readonly prisma: PrismaService,
    @inject(ResourceService) private readonly resourceService: ResourceService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
    @inject(SmtpService) private readonly smtpService: SmtpService,
    @inject(ConfigService) private readonly configService: ConfigService
  ) {}

  async createPo(accountId: string, resourceId: string) {
    const schema = await this.schemaService.readMergedSchema(accountId, 'Purchase')

    const documentFieldId = selectSchemaFieldUnsafe(
      schema,
      fields.document
    ).fieldId
    const issuedDateFieldId = selectSchemaFieldUnsafe(
      schema,
      fields.issuedDate
    ).fieldId

    await this.resourceService.updateResourceField({
      accountId,
      resourceId,
      fieldId: issuedDateFieldId,
      valueInput: { date: new Date().toISOString() },
    })

    const buffer = await this.poRenderingService.renderPo(
      accountId,
      resourceId
    )

    const [blob, resource] = await Promise.all([
      this.blobService.createBlob(accountId, {
        buffer,
        contentType: 'application/pdf',
      }),
      this.resourceService.read(accountId, resourceId),
    ])

    const vendorName = selectResourceFieldValue(resource, fields.vendor)
      ?.resource?.name
    const issuedDate = selectResourceFieldValue(
      resource,
      fields.issuedDate
    )?.date
    const number = selectResourceFieldValue(resource, fields.poNumber)?.string

    const { id: fileId } = await this.prisma.file.create({
      data: {
        name: `Purchase #${number} - ${
          issuedDate ? new Date(issuedDate).toDateString() : ''
        } - ${vendorName}.pdf`,
        accountId,
        blobId: blob.id,
      },
    })

    await this.resourceService.updateResourceField({
      accountId,
      resourceId,
      fieldId: documentFieldId,
      valueInput: { fileId },
    })
  }

  async sendPo(accountId: string, resourceId: string) {
    const [order, account] = await Promise.all([
      this.resourceService.read(accountId, resourceId),
      this.accountService.read(accountId),
    ])

    const poRecipient = selectResourceFieldValue(
      order,
      fields.poRecipient
    )?.contact
    const po = selectResourceFieldValue(order, fields.document)?.file
    const assignee = selectResourceFieldValue(order, fields.assignee)?.user
    const vendor = selectResourceFieldValue(order, fields.vendor)?.resource
    const number = selectResourceFieldValue(order, fields.poNumber)?.string
    const date = selectResourceFieldValue(order, fields.issuedDate)?.date

    if (!po || !poRecipient?.email) return

    const [poBlob, logoBlob] = await Promise.all([
      this.blobService.readBlobWithData(accountId, po.blobId),
      account.logoBlobId
        ? this.blobService.readBlobWithData(accountId, account.logoBlobId)
        : undefined,
    ])

    if (!poBlob) return

    await this.smtpService.sendEmail({
      to: [poRecipient],
      cc: assignee && [assignee],
      replyTo: assignee && [assignee],
      templateAlias: 'new-po',
      templateModel: {
        // layout
        buyer_logo_base64: logoBlob?.buffer.toString('base64'),
        buyer_logo_contenttype: logoBlob?.mimeType,
        buyer_company_name: account.name,
        product_url: this.configService.config.APP_BASE_URL,

        // template
        supplier_user_name: poRecipient.name ?? '(No Name)',
        buyer_user_name: assignee?.name ?? '(Unassigned)',
        supplier_company_name: vendor?.name ?? '(No Vendor)',
        order_number: number ?? '(No Number)',
        date: date ? new Date(date).toLocaleDateString() : '(No Date)',
      },
      attachments: [
        {
          name: po.name,
          contentBase64: poBlob.buffer.toString('base64'),
          contentType: po.contentType,
        },
      ],
    })
  }
}
