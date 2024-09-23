import puppeteer from 'puppeteer'
// https://github.com/vercel/next.js/issues/43810
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* @ts-expect-error */
import ReactDom from 'next/dist/compiled/react-dom/cjs/react-dom-server-legacy.browser.production'
import PoDocument from './doc/PoDocument'
import { createViewModel } from './doc/createViewModel'
import PoDocumentFooter from '@/domain/purchase/doc/PoDocumentFooter'
import singleton from '@/services/singleton'

const browser = singleton('browser', async (clear) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
  })

  browser.once('disconnected', () => {
    browser.close()
    clear()
    console.error('Puppeteer browser disconnected')
  })

  return browser
})

type RenderPoParams = {
  accountId: string
  resourceId: string
  isPreview?: boolean
}

export const renderPo = async ({
  accountId,
  resourceId,
  isPreview,
}: RenderPoParams) => {
  const [model, page] = await Promise.all([
    createViewModel(accountId, resourceId),
    browser().then((browser) => browser.newPage()),
  ])

  try {
    await page.setContent(
      htmlDocument(ReactDom.renderToString(PoDocument(model)), isPreview),
      { timeout: 300 },
    )

    const buffer = await page.pdf({
      format: 'letter',
      headerTemplate: '<div></div>',
      footerTemplate: ReactDom.renderToString(PoDocumentFooter(model)),
      displayHeaderFooter: true,
      margin: {
        top: '35px',
        bottom: '35px',
        left: '15px',
        right: '15px',
      },
      printBackground: true,
      timeout: 5_000,
    })

    return buffer
  } finally {
    page.close()
  }
}

const htmlDocument = (content: string, isPreview?: boolean) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Purchase Order</title>
      <style>
        body {
          ${isPreview ? `background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(watermark)}');` : ''}
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
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
