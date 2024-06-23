'use server'

import puppeteer from 'puppeteer'
// https://github.com/vercel/next.js/issues/43810
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* @ts-expect-error */
import ReactDom from 'next/dist/compiled/react-dom/cjs/react-dom-server-legacy.browser.production'
import { Prisma } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import { createBlob } from '../blobs/actions'
import { fields } from '../schema/template/system-template'
import { requireSession } from '@/lib/session'
import PoDocument from '@/lib/order/PoDocument'
import PoDocumentFooter from '@/lib/order/PoDocumentFooter'
import prisma from '@/lib/prisma'

export const createPo = async (resourceId: string) => {
  const { accountId } = await requireSession()

  const browser = await puppeteer.launch({ headless: true })

  const [page, main, footer] = await Promise.all([
    browser.newPage(),
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

  browser.close()

  const [blob, field] = await Promise.all([
    createBlob({
      accountId,
      buffer,
      type: 'application/pdf',
    }),
    prisma.field.findUniqueOrThrow({
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

  await prisma.resourceField.upsert({
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
