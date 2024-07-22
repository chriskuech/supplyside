import { readBlob } from '../blobs/actions'
import { readResource } from '../resource/actions'
import { fields } from '../schema/template/system-fields'
import smtp from '@/lib/smtp'
import prisma from '@/lib/prisma'

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

  const poRecipient = order.fields.find(
    (f) => f.templateId === fields.poRecipient.templateId,
  )?.value.contact

  const po = order.fields.find(
    (f) => f.templateId === fields.document.templateId,
  )?.value.file

  if (!po || !poRecipient?.email) return

  const blob = await readBlob({ accountId, blobId: po.Blob.id })

  if (!blob) return

  await smtp().sendEmail({
    From: 'bot@supplyside.io',
    To: poRecipient.email,
    Subject: 'New Purchase Order from ' + account.name,
    TextBody: 'Please see attached purchase order.',
    Attachments: [
      {
        Name: po.name,
        ContentID: '', // bad typings
        Content: blob.buffer.toString('base64'),
        ContentType: po.Blob.mimeType,
      },
    ],
  })
}
