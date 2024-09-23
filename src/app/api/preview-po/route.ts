import { NextRequest, NextResponse } from 'next/server'
import { readSession } from '@/lib/session/actions'
import { renderPo } from '@/domain/purchase/renderPo'
import prisma from '@/services/prisma'

/**
 * /api/preview-po?resourceId=<resourceId>
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const query = new URL(req.url).searchParams

  const session = await readSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { accountId } = session

  const resourceId = query.get('resourceId')
  if (!resourceId) {
    return NextResponse.json(
      { error: '`resourceId` is required' },
      { status: 400 },
    )
  }

  const resource = await prisma().resource.findUnique({
    where: {
      id: resourceId,
    },
  })
  if (!resource) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
  } else if (resource.accountId !== accountId) {
    return NextResponse.json(
      { error: 'Resource does not belong to account' },
      { status: 403 },
    )
  }

  const buffer = await renderPo({
    resourceId,
    accountId,
    isPreview: true,
  })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
    },
  })
}
