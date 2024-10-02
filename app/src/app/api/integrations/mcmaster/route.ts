import { NextRequest, NextResponse } from 'next/server'
import { parseStringPromise } from 'xml2js'
import { config } from '@/config'
import { processPoom } from '@/client/mcmaster'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const cxmlUrlEncoded = await request.text()
  const cxml = decodeURIComponent(cxmlUrlEncoded)
    .replace('cxml-urlencoded=', '')
    .replaceAll('+', ' ')
  const cxmlString = await parseStringPromise(cxml)

  await processPoom(cxmlString)

  return new NextResponse(
    `
      <!DOCTYPE html>
      <html>
        <head>
          <script>
            window.onload = function() {
              // Check if the current frame is not the topmost frame
              if (window !== window.top) {
                // Change location of the parent frame
                window.top.location.href = "${config().BASE_URL}/purchases";
              }
            };
          </script>
          <style>
            body {
              padding: 5em;
              text-align: center;
              font-family: sans-serif;
            }
          </style>
        </head>
        <body>
          <div>
            <h3>PunchOut Order created</h3>
            Redirecting to your purchase in SupplySide
          </div>
        </body>
      </html>
    `,
    { status: 200, headers: { 'content-type': 'text/html' } },
  )
}
