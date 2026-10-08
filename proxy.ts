import { NextRequest, NextResponse } from 'next/server'
import { auth } from './lib/auth/server'

const neonAuthMiddleware = auth.middleware({ loginUrl: '/login' })

export default async function proxy(request: NextRequest) {
  const response = await neonAuthMiddleware(request)
  const location = response.headers.get('location')

  if (!location) {
    return response
  }

  const redirectUrl = new URL(location, request.url)

  if (redirectUrl.origin !== request.nextUrl.origin || redirectUrl.pathname !== '/login') {
    return response
  }

  const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`
  redirectUrl.searchParams.set('next', returnTo)

  const redirectedResponse = NextResponse.redirect(redirectUrl, response.status)
  const setCookies = response.headers.getSetCookie?.() ?? []

  for (const cookie of setCookies) {
    redirectedResponse.headers.append('set-cookie', cookie)
  }

  return redirectedResponse
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
