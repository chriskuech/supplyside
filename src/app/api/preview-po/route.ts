import { NextRequest, NextResponse } from 'next/server'
import { readSession } from '@/lib/session/actions'
import { ResourceService } from '@/domain/resource/ResourceService'
import { PoRenderingService } from '@/domain/purchase/PoRenderingService'
import { container } from '@/lib/di'

export const dynamic = 'force-dynamic'

/**
 * /api/preview-po?resourceId=<resourceId>
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const resourceService = container().resolve(ResourceService)
  const poRenderingService = container().resolve(PoRenderingService)

  const query = new URL(req.url).searchParams
  const resourceId = query.get('resourceId')

  const { accountId } = await readSession()

  if (!resourceId) {
    return NextResponse.json(
      { error: '`resourceId` is required' },
      { status: 400 },
    )
  }

  const resource = await resourceService.read(accountId, 'Purchase', resourceId)

  if (!resource) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
  } else if (resource.accountId !== accountId) {
    return NextResponse.json(
      { error: 'Resource does not belong to account' },
      { status: 403 },
    )
  }

  const buffer = await poRenderingService.renderPo({
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
