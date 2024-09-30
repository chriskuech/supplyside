import { NextRequest, NextResponse } from 'next/server'
import { readSession } from '@/session'
import { readResource } from '@/client/resource'
import { renderPo } from '@/actions/purchase'

/**
 * /api/preview-po?resourceId=<resourceId>
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const query = new URL(req.url).searchParams
  const resourceId = query.get('resourceId')

  const { accountId } = await readSession()

  if (!resourceId) {
    return NextResponse.json(
      { error: '`resourceId` is required' },
      { status: 400 },
    )
  }

  const resource = await readResource(accountId, resourceId)

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
