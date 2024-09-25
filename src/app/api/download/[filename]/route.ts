import { NextRequest, NextResponse } from 'next/server'
import { container } from 'tsyringe'
import { readSession } from '@/lib/session/actions'
import BlobService from '@/domain/blob'

/**
 * /api/download/[filename]?blobId=<blobId>[&no-impersonation][&preview]
 */
export async function GET(
  req: NextRequest,
  { params: { filename } }: { params: { filename: string } },
): Promise<NextResponse> {
  const blobService = container.resolve(BlobService)

  const query = new URL(req.url).searchParams

  const blobId = query.get('blobId')
  if (!blobId) {
    return NextResponse.json({ error: '`blobId` is required' }, { status: 400 })
  }

  const {
    accountId: impersonatedAccountId,
    user: { accountId: realAccountId },
  } = await readSession()

  const accountId =
    query.get('no-impersonation') !== null
      ? realAccountId
      : impersonatedAccountId

  const blob = await blobService.readBlob({ accountId, blobId })
  if (!blob) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const encoding = blob.mimeType.startsWith('text/') ? 'utf-8' : undefined

  return new NextResponse(blob.buffer, {
    headers: {
      'Content-Type': encoding
        ? `${blob.mimeType}; charset=${encoding}`
        : blob.mimeType,
      ...(query.get('preview') === null
        ? { 'Content-Disposition': `attachment; filename=${filename}` }
        : undefined),
    },
  })
}
