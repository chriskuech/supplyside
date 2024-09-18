import { readFile } from 'fs/promises'

/* @ts-expect-error Workaround for https://github.com/vercel/next.js/issues/43810 */
import ReactDom from 'next/dist/compiled/react-dom/cjs/react-dom-server-legacy.browser.production'

import { exec, withTempDir } from '../os'
import { createDataUrl } from '../blobs/util'
import { createViewModel } from './doc/createViewModel'
import PoDocument from './doc/PoDocument'

type RenderPoParams = {
  accountId: string
  resourceId: string
  isPreview?: boolean
}

export const renderPo = async ({
  accountId,
  resourceId,
  isPreview,
}: RenderPoParams) =>
  await withTempDir(async (path) => {
    const viewModel = await createViewModel(accountId, resourceId)

    const html = htmlDocument(
      ReactDom.renderToString(PoDocument(viewModel)),
      isPreview,
    )

    const htmlDataUrl = createDataUrl({
      mimeType: 'text/html',
      buffer: Buffer.from(html),
    })

    const command = `
      wkhtmltopdf
        --print-media-type
        --dpi 300
        --page-size Letter
        --margin-top 10
        --margin-bottom 10
        --margin-left 10
        --margin-right 10
        --footer-left 'Order ${viewModel.number} | ${viewModel.issuedDate}'
        --footer-right 'Page [page] of [topage]'
        '${htmlDataUrl}'
        '${path}/out.pdf'
    `
    await exec(command.replaceAll(/\s+/g, ' '))

    return await readFile(`${path}/out.pdf`)
  })

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
          height: 100%;
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
