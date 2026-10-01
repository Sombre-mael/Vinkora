import { NextRequest, NextResponse } from 'next/server'
import {
  assertRequestBodySize,
  assertSameOrigin,
  getManagedDynamicQr,
  readEditToken,
  toDynamicQrErrorResponse,
  updateManagedDynamicQr,
} from '../../../../lib/dynamic-qr'
import { getPrisma } from '../../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const editToken = readEditToken(request.headers.get('authorization'))
    const qrCode = await getManagedDynamicQr(getPrisma(), id, editToken, request.nextUrl.origin)
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
    const editToken = readEditToken(request.headers.get('authorization'))
    const body = (await request.json()) as Record<string, unknown>
    const qrCode = await updateManagedDynamicQr(
      getPrisma(),
      id,
      editToken,
      {
        destinationUrl: body.destinationUrl,
        name: body.name,
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
