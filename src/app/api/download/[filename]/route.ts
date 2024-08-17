'use server'

import { NextRequest, NextResponse } from 'next/server'
import { readBlob } from '@/domain/blobs/actions'
import prisma from '@/lib/prisma'
import { readSession } from '@/lib/iam/actions'

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

  return new NextResponse(blob.buffer, {
    headers: {
      'Content-Type': blob.mimeType,
      ...(query.get('preview') === null
        ? { 'Content-Disposition': `attachment; filename=${filename}` }
        : undefined),
    },
  })
}
