'use server'

import puppeteer from 'puppeteer'
// https://github.com/vercel/next.js/issues/43810
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* @ts-expect-error */
import ReactDom from 'next/dist/compiled/react-dom/cjs/react-dom-server-legacy.browser.production'
import { createBlob } from '../blobs/actions'
import { requireSession } from '@/lib/session'
import PoDocument from '@/lib/order/PoDocument'
import PoDocumentFooter from '@/lib/order/PoDocumentFooter'

export const createPo = async () => {
  const { accountId } = await requireSession()

  const browser = await puppeteer.launch({ headless: true })

  const page = await browser.newPage()

  const mainHtml = ReactDom.renderToString(await PoDocument())
  const footerHtml = ReactDom.renderToString(await PoDocumentFooter())

  await page.setContent(mainHtml, {
    timeout: 300,
    waitUntil: 'domcontentloaded',
  })

  const buffer = await page.pdf({
    format: 'letter',
    footerTemplate: footerHtml,
    displayHeaderFooter: true,
    margin: {
      top: '15px',
      bottom: '15px',
      left: '15px',
      right: '15px',
    },
  })

  await browser.close()

  const { name: blobName } = await createBlob({
    accountId,
    buffer,
    type: 'application/pdf',
  })

  console.log('PO blob created', blobName)
}
