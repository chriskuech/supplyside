import { NextResponse, type NextRequest } from 'next/server'
import { readSession } from './session'
import { readSelf } from './client/user'

export async function middleware(request: NextRequest) {
  // TODO: extend the session
  const session = await readSession()

  if (!session)
    return NextResponse.redirect(
      new URL(`/auth/login?returnTo=${request.url}`, request.url),
    )

  const user = await readSelf(session.userId)

  if (!user)
    return NextResponse.redirect(
      new URL(`/auth/login?returnTo=${request.url}`, request.url),
    )

  if (!user.tsAndCsSignedAt)
    return NextResponse.redirect(
      new URL('/auth/terms-and-conditions', request.url),
    )

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icon.png|manifest.webmanifest).*)',
  ],
}
