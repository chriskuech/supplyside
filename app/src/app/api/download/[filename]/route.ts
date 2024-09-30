import { fail } from 'assert'
import { NextRequest, NextResponse } from 'next/server'

/**
 * /api/download/[filename]?blobId=<blobId>[&no-impersonation][&preview]
 */
export async function GET(
  req: NextRequest,
  { params: { filename } }: { params: { filename: string } },
): Promise<NextResponse> {
  fail('NYI')
  // const query = new URL(req.url).searchParams

  // const blobId = query.get('blobId')
  // if (!blobId) {
  //   return NextResponse.json({ error: '`blobId` is required' }, { status: 400 })
  // }

  // const { accountId: impersonatedAccountId, userId } = await readSession()
  // const user = await readSelf(userId)

  // if (!user)
  //   return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // const accountId =
  //   query.get('no-impersonation') !== null
  //     ? user.accountId
  //     : impersonatedAccountId

  // const blob = await readBlob(accountId, blobId)
  // if (!blob) {
  //   return NextResponse.json({ error: 'File not found' }, { status: 404 })
  // }

  // const encoding = blob.mimeType.startsWith('text/') ? 'utf-8' : undefined

  // return new NextResponse(blob.buffer, {
  //   headers: {
  //     'Content-Type': encoding
  //       ? `${blob.mimeType}; charset=${encoding}`
  //       : blob.mimeType,
  //     ...(query.get('preview') === null
  //       ? { 'Content-Disposition': `attachment; filename=${filename}` }
  //       : undefined),
  //   },
  // })
}
