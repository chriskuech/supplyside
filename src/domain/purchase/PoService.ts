import { singleton } from 'tsyringe'
import BlobService from '../blob'
import { selectResourceFieldValue } from '../resource/extensions'
import { SchemaService } from '../schema'
import { selectSchemaFieldUnsafe } from '../schema/extensions'
import { fields } from '../schema/template/system-fields'
import { AccountService } from '../account'
import { ResourceService } from '../resource/service'
import { PoRenderingService } from './PoRenderingService'
import { PrismaService } from '@/integrations/PrismaService'
import ConfigService from '@/integrations/ConfigService'
import SmtpService from '@/integrations/SmtpService'

@singleton()
export class PoService {
  constructor(
    private readonly accountService: AccountService,
    private readonly blobService: BlobService,
    private readonly configService: ConfigService,
    private readonly poRenderingService: PoRenderingService,
    private readonly prisma: PrismaService,
    private readonly resourceService: ResourceService,
    private readonly schemaService: SchemaService,
    private readonly smtpService: SmtpService,
  ) {}

  async createPo(accountId: string, resourceId: string) {
    const schema = await this.schemaService.readSchema(accountId, 'Purchase')

    const documentFieldId = selectSchemaFieldUnsafe(schema, fields.document).id
    const issuedDateFieldId = selectSchemaFieldUnsafe(
      schema,
      fields.issuedDate,
    ).id

    await this.resourceService.updateResourceField({
      accountId,
      resourceId,
      fieldId: issuedDateFieldId,
      value: { date: new Date() },
    })

    const buffer = await this.poRenderingService.renderPo({
      accountId,
      resourceId,
    })

    const [blob, resource] = await Promise.all([
      this.blobService.createBlob({
        accountId,
        buffer,
        type: 'application/pdf',
      }),
      this.resourceService.readResource({ accountId, id: resourceId }),
    ])

    const vendorName = selectResourceFieldValue(resource, fields.vendor)
      ?.resource?.name
    const issuedDate = selectResourceFieldValue(
      resource,
      fields.issuedDate,
    )?.date
    const number = selectResourceFieldValue(resource, fields.poNumber)?.string

    const { id: fileId } = await this.prisma.file.create({
      data: {
        name: `Purchase #${number} - ${issuedDate?.toDateString()} - ${vendorName}.pdf`,
        accountId,
        blobId: blob.id,
      },
    })

    await this.resourceService.updateResourceField({
      accountId,
      resourceId,
      fieldId: documentFieldId,
      value: { fileId },
    })
  }

  async sendPo(accountId: string, resourceId: string) {
    const [order, account] = await Promise.all([
      this.resourceService.readResource({
        type: 'Purchase',
        id: resourceId,
        accountId,
      }),
      this.accountService.read(accountId),
    ])

    const poRecipient = selectResourceFieldValue(
      order,
      fields.poRecipient,
    )?.contact
    const po = selectResourceFieldValue(order, fields.document)?.file
    const assignee = selectResourceFieldValue(order, fields.assignee)?.user
    const vendor = selectResourceFieldValue(order, fields.vendor)?.resource
    const number = selectResourceFieldValue(order, fields.poNumber)?.string
    const date = selectResourceFieldValue(order, fields.issuedDate)?.date

    if (!po || !poRecipient?.email) return

    const [poBlob, logoBlob] = await Promise.all([
      this.blobService.readBlob({ accountId, blobId: po.blobId }),
      account.logoBlobId
        ? this.blobService.readBlob({ accountId, blobId: account.logoBlobId })
        : undefined,
    ])

    if (!poBlob) return

    await this.smtpService.sendEmailWithTemplate({
      From: 'SupplySide <bot@supplyside.io>',
      To: `${poRecipient.name} <${poRecipient.email}>`,
      Cc: `${assignee?.fullName} <${assignee?.email}>`,
      ReplyTo: `${assignee?.fullName} <${assignee?.email}>`,
      TemplateAlias: 'new-po',
      TemplateModel: {
        // layout
        buyer_logo_base64: logoBlob?.buffer.toString('base64'),
        buyer_logo_contenttype: logoBlob?.mimeType,
        buyer_company_name: account.name,
        product_url: this.configService.config.BASE_URL,

        // template
        supplier_user_name: poRecipient.name ?? '(No Name)',
        buyer_user_name: assignee?.fullName ?? '(Unassigned)',
        supplier_company_name: vendor?.name ?? '(No Vendor)',
        order_number: number ?? '(No Number)',
        date: date?.toLocaleDateString() ?? '(No Date)',
      },
      MessageStream: 'outbound',
      Attachments: [
        {
          Name: po.name,
          ContentID: '', // bad typings
          Content: poBlob.buffer.toString('base64'),
          ContentType: po.contentType,
        },
      ],
    })
  }
}
