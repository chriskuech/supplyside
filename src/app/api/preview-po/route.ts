'use server'

import { NextRequest, NextResponse } from 'next/server'
import { renderPo } from '@/domain/order/renderPo'
import prisma from '@/lib/prisma'
import { readSession } from '@/lib/iam/session'

/**
 * /api/preview-po?resourceId=<resourceId>
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const query = new URL(req.url).searchParams

  const session = await readSession()

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
