import { NextRequest, NextResponse } from 'next/server'
import {
  assertRequestBodySize,
  assertSameOrigin,
  createAnonymousDynamicQr,
  getClientIp,
  toDynamicQrErrorResponse,
} from '../../../lib/dynamic-qr'
import { getPrisma } from '../../../lib/prisma'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    assertRequestBodySize(request.headers.get('content-length'))
    assertSameOrigin(request.headers.get('origin'), request.nextUrl.origin)

    const body = (await request.json()) as Record<string, unknown>
    const deviceToken = request.headers.get('x-vinkora-device-token') ?? ''
    const result = await createAnonymousDynamicQr(getPrisma(), {
      destinationUrl: body.destinationUrl,
      name: body.name,
      slug: body.slug,
      styleOptions: body.styleOptions,
      deviceToken,
      ipAddress: getClientIp(request.headers),
      origin: request.nextUrl.origin,
    })

    return NextResponse.json(result, {
      status: 201,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    const response = toDynamicQrErrorResponse(error)
    return NextResponse.json(response.body, {
      status: response.status,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
