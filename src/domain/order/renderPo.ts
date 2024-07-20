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
    printBackground: true,
  })

  page.close()

  return buffer
}
