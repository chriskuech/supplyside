'use server'

import puppeteer from 'puppeteer'
// https://github.com/vercel/next.js/issues/43810
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* @ts-expect-error */
import ReactDom from 'next/dist/compiled/react-dom/cjs/react-dom-server-legacy.browser.production'
import PoDocument from '@/lib/order/PoDocument'
import PoDocumentFooter from '@/lib/order/PoDocumentFooter'
import singleton from '@/lib/singleton'

const browser = singleton('browser', async (clear) => {
  const browser = await puppeteer.launch()

  browser.once('disconnected', () => {
    browser.close()
    clear()
  })

  return browser
})

type RenderPoParams = {
  accountId: string
  resourceId: string
  isPreview?: boolean
}

export const renderPo = async (params: RenderPoParams) => {
  const [page, main, footer] = await Promise.all([
    (await browser()).newPage(),
    PoDocument(params),
    PoDocumentFooter(params),
  ])

  await page.setContent(htmlDocument(ReactDom.renderToString(main)), {
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
    printBackground: params.isPreview,
  })

  page.close()

  return buffer
}

const htmlDocument = (content: string) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Purchase Order</title>
      <style>
        body {
          background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(watermark)}');
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
  </html>
`

const watermark = `
  <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="none"/>
    <text x="100" y="100" font-family="sans-serif" font-size="40" fill="rgba(0,0,0,0.2)" font-weight="bold" text-anchor="middle" dominant-baseline="middle" transform="rotate(-27 100 100)">PREVIEW</text>
  </svg>
`
