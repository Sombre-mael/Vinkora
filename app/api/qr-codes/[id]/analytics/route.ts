import { NextRequest, NextResponse } from 'next/server'
import {
  getDynamicQrAnalytics,
  readEditToken,
  toDynamicQrErrorResponse,
} from '../../../../../lib/dynamic-qr'
import { getPrisma } from '../../../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const editToken = readEditToken(request.headers.get('authorization'))
    const analytics = await getDynamicQrAnalytics(getPrisma(), id, editToken)
    return NextResponse.json({ analytics }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const response = toDynamicQrErrorResponse(error)
    return NextResponse.json(response.body, {
      status: response.status,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
