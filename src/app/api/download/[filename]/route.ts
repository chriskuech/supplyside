'use server'

import { NextRequest, NextResponse } from 'next/server'
import { readBlob } from '@/domain/blobs/actions'
import { readSession } from '@/lib/session/actions'
import prisma from '@/services/prisma'

/**
 * /api/download/[filename]?blobId=<blobId>[&no-impersonation][&preview]
 */
export async function GET(
  req: NextRequest,
  { params: { filename } }: { params: { filename: string } },
): Promise<NextResponse> {
  const query = new URL(req.url).searchParams

  const blobId = query.get('blobId')
  if (!blobId) {
    return NextResponse.json({ error: '`blobId` is required' }, { status: 400 })
  }

  const session = await readSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { accountId } =
    query.get('no-impersonation') !== null
      ? await prisma().user.findUniqueOrThrow({
          where: { id: session.userId },
        })
      : session

  const blob = await readBlob({ accountId, blobId })
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
