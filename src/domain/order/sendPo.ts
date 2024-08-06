import { readBlob } from '../blobs/actions'
import { readResource } from '../resource/actions'
import { fields } from '../schema/template/system-fields'
import { selectValue } from '../resource/types'
import smtp from '@/lib/smtp'
import prisma from '@/lib/prisma'
import config from '@/lib/config'

type SendPoParams = {
  accountId: string
  resourceId: string
}

export const sendPo = async ({ accountId, resourceId }: SendPoParams) => {
  const [order, account] = await Promise.all([
    readResource({
      type: 'Order',
      id: resourceId,
      accountId,
    }),
    prisma().account.findUniqueOrThrow({
      where: {
        id: accountId,
      },
    }),
  ])

  const poRecipient = selectValue(order, fields.poRecipient)?.contact
  const po = selectValue(order, fields.document)?.file
  const assignee = selectValue(order, fields.assignee)?.user
  const vendor = selectValue(order, fields.vendor)?.resource
  const number = selectValue(order, fields.number)?.string
  const date = selectValue(order, fields.issuedDate)?.date

  if (!po || !poRecipient?.email) return

  const [poBlob, logoBlob] = await Promise.all([
    readBlob({ accountId, blobId: po.Blob.id }),
    account.logoBlobId
      ? readBlob({ accountId, blobId: account.logoBlobId })
      : undefined,
  ])

  if (!poBlob) return

  await smtp().sendEmailWithTemplate({
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
      product_url: config().BASE_URL,

      // template
      supplier_user_name: poRecipient.name ?? '(No Name)',
      buyer_user_name: assignee?.firstName ?? '(Unassigned)',
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
        ContentType: po.Blob.mimeType,
      },
    ],
  })
}
