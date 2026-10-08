import { NextRequest, NextResponse } from 'next/server'
import {
  assertRequestBodySize,
  assertSameOrigin,
  createAccountDynamicQr,
  DynamicQrError,
  toDynamicQrErrorResponse,
} from '../../../lib/dynamic-qr'
import { getCurrentVinkoraUser } from '../../../lib/auth/vinkora-user'
import { getPrisma } from '../../../lib/prisma'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    assertRequestBodySize(request.headers.get('content-length'))
    assertSameOrigin(request.headers.get('origin'), request.nextUrl.origin)

    const user = await getCurrentVinkoraUser()
    if (!user) {
      throw new DynamicQrError(
        'AUTHENTICATION_REQUIRED',
        401,
        'Connectez-vous pour créer votre QR dynamique.',
      )
    }

    const body = (await request.json()) as Record<string, unknown>
    const result = await createAccountDynamicQr(getPrisma(), user.id, {
      destinationUrl: body.destinationUrl,
      name: body.name,
      slug: body.slug,
      campaignChannel: body.campaignChannel,
      styleOptions: body.styleOptions,
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
