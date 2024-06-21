'use server'

import { NextRequest, NextResponse } from 'next/server'
import { readBlob } from '@/domain/blobs/actions'
import { readSession } from '@/lib/session'

/**
 * /api/download/[filename]?blobId=<blobId>
 */
export async function GET(
  req: NextRequest,
  { params: { filename } }: { params: { filename: string } },
): Promise<NextResponse> {
  console.log('here', req.url)

  const blobId = new URL(req.url).searchParams.get('blobId')
  if (!blobId) {
    return NextResponse.json({ error: '`blobId` is required' }, { status: 400 })
  }

  const session = await readSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const blob = await readBlob({ accountId: session.accountId, blobId })
  if (!blob) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  return new NextResponse(blob.buffer, {
    headers: {
      'Content-Type': blob.mimeType,
      'Content-Disposition': `attachment; filename=${filename}`,
    },
  })
}
