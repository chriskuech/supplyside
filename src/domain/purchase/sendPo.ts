import { container } from 'tsyringe'
import { readResource } from '../resource'
import { fields } from '../schema/template/system-fields'
import { selectResourceFieldValue } from '../resource/extensions'
import BlobService from '../blob'
import SmtpService from '@/integrations/SmtpService'
import ConfigService from '@/integrations/ConfigService'
import { PrismaService } from '@/integrations/PrismaService'

type SendPoParams = {
  accountId: string
  resourceId: string
}

export const sendPo = async ({ accountId, resourceId }: SendPoParams) => {
  const blobService = container.resolve(BlobService)
  const { config } = container.resolve(ConfigService)
  const prisma = container.resolve(PrismaService)
  const smtpService = container.resolve(SmtpService)

  const [order, account] = await Promise.all([
    readResource({
      type: 'Purchase',
      id: resourceId,
      accountId,
    }),
    prisma.account.findUniqueOrThrow({
      where: {
        id: accountId,
      },
    }),
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
    blobService.readBlob({ accountId, blobId: po.blobId }),
    account.logoBlobId
      ? blobService.readBlob({ accountId, blobId: account.logoBlobId })
      : undefined,
  ])

  if (!poBlob) return

  await smtpService.sendEmailWithTemplate({
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
      product_url: config.BASE_URL,

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
