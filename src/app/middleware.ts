import { NextResponse, type NextRequest } from 'next/server'
import { readAndExtendSession } from '@/domain/iam/session'

export async function middleware(request: NextRequest) {
  const session = await readAndExtendSession().catch(() => null)

  if (!session)
    return NextResponse.redirect(
      new URL(
        '/auth/login?rel=' + encodeURIComponent(request.url),
        request.url,
      ),
      { status: 307 },
    )

  if (session.user.requirePasswordReset)
    return NextResponse.redirect(
      new URL(
        '/auth/update-password?rel=' + encodeURIComponent(request.url),
        request.url,
      ),
    )

  if (!session.user.tsAndCsSignedAt)
    return NextResponse.redirect(
      new URL(
        '/auth/terms-and-conditions?rel=' + encodeURIComponent(request.url),
        request.url,
      ),
    )
}

export const config = {
  matcher: '/(?!auth)',
}
