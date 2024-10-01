import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/session'
import { previewPo } from '@/client/purchase'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const query = new URL(req.url).searchParams

  const resourceId = query.get('resourceId')
  if (!resourceId)
    return NextResponse.json(
      { error: '`resourceId` query parameter is required' },
      { status: 400 },
    )

  const { accountId } = await requireSession()
  const buffer = await previewPo(accountId, resourceId)

  if (!buffer)
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
    },
  })
}
