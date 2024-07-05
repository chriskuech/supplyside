'use server'

import puppeteer from 'puppeteer'
// https://github.com/vercel/next.js/issues/43810
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* @ts-expect-error */
import ReactDom from 'next/dist/compiled/react-dom/cjs/react-dom-server-legacy.browser.production'
import { Prisma } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import { createBlob, readBlob } from '../blobs/actions'
import { fields } from '../schema/template/system-template'
import { readResource } from '../resource/actions'
import PoDocument from '@/lib/order/PoDocument'
import PoDocumentFooter from '@/lib/order/PoDocumentFooter'
import prisma from '@/lib/prisma'
import singleton from '@/lib/singleton'
import smtp from '@/lib/smtp'

const browser = singleton('browser', async (clear) => {
  const browser = await puppeteer.launch()

  browser.once('disconnected', () => {
    browser.close()
    clear()
  })

  return browser
})

type CreatePoParams = {
  accountId: string
  resourceId: string
}

export const createPo = async ({ accountId, resourceId }: CreatePoParams) => {
  const [page, main, footer] = await Promise.all([
    (await browser()).newPage(),
    PoDocument(),
    PoDocumentFooter(),
  ])

  await page.setContent(ReactDom.renderToString(main), {
    timeout: 300,
    waitUntil: 'domcontentloaded',
  })

  const buffer = await page.pdf({
    format: 'letter',
    footerTemplate: ReactDom.renderToString(footer),
    displayHeaderFooter: true,
    margin: {
      top: '15px',
      bottom: '15px',
      left: '15px',
      right: '15px',
    },
  })

  const [blob, field] = await Promise.all([
    createBlob({
      accountId,
      buffer,
      type: 'application/pdf',
    }),
    prisma().field.findUniqueOrThrow({
      where: {
        accountId_templateId: {
          accountId,
          templateId: fields.document.templateId,
        },
      },
      select: {
        id: true,
      },
    }),
  ])

  page.close()

  const input: Prisma.ValueCreateInput = {
    File: {
      create: {
        name: 'po.pdf',
        Account: {
          connect: {
            id: accountId,
          },
        },
        Blob: {
          connect: {
            id: blob.id,
          },
        },
      },
    },
  }

  await prisma().resourceField.upsert({
    where: {
      Resource: {
        accountId,
      },
      resourceId_fieldId: {
        resourceId,
        fieldId: field.id,
      },
    },
    create: {
      Resource: {
        connect: {
          id: resourceId,
        },
      },
      Field: {
        connect: {
          id: field.id,
        },
      },
      Value: { create: input },
    },
    update: {
      Value: { update: input },
    },
  })

  revalidateTag('resource')
}

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
    (f) => f.fieldId === fields.poRecipient.templateId,
  )?.value.user

  const po = order.fields.find((f) => f.fieldId === fields.document.templateId)
    ?.value.file

  if (!po || !poRecipient) return

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
