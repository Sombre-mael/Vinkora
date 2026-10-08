import { NextRequest, NextResponse } from 'next/server'
import {
  assertRequestBodySize,
  assertSameOrigin,
  getManagedDynamicQr,
  readOptionalEditToken,
  toDynamicQrErrorResponse,
  updateManagedDynamicQr,
} from '../../../../lib/dynamic-qr'
import { getCurrentVinkoraUser } from '../../../../lib/auth/vinkora-user'
import { getPrisma } from '../../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const user = await getCurrentVinkoraUser()
    const editToken = readOptionalEditToken(request.headers.get('authorization'))
    const qrCode = await getManagedDynamicQr(
      getPrisma(),
      id,
      { userId: user?.id, editToken },
      request.nextUrl.origin,
    )
    return NextResponse.json({ qrCode }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const response = toDynamicQrErrorResponse(error)
    return NextResponse.json(response.body, {
      status: response.status,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    assertRequestBodySize(request.headers.get('content-length'))
    assertSameOrigin(request.headers.get('origin'), request.nextUrl.origin)

    const { id } = await context.params
    const user = await getCurrentVinkoraUser()
    const editToken = readOptionalEditToken(request.headers.get('authorization'))
    const body = (await request.json()) as Record<string, unknown>
    const qrCode = await updateManagedDynamicQr(
      getPrisma(),
      id,
      { userId: user?.id, editToken },
      {
        destinationUrl: body.destinationUrl,
        name: body.name,
        campaignChannel: body.campaignChannel,
        styleOptions: body.styleOptions,
        status: body.status,
      },
      request.nextUrl.origin,
    )

    return NextResponse.json({ qrCode }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const response = toDynamicQrErrorResponse(error)
    return NextResponse.json(response.body, {
      status: response.status,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
