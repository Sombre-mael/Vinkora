import { NextRequest, NextResponse } from 'next/server'
import {
  getDynamicQrAnalytics,
  readOptionalEditToken,
  toDynamicQrErrorResponse,
} from '../../../../../lib/dynamic-qr'
import { getCurrentVinkoraUser } from '../../../../../lib/auth/vinkora-user'
import { getPrisma } from '../../../../../lib/prisma'

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
    const analytics = await getDynamicQrAnalytics(getPrisma(), id, {
      userId: user?.id,
      editToken,
    })
    return NextResponse.json({ analytics }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const response = toDynamicQrErrorResponse(error)
    return NextResponse.json(response.body, {
      status: response.status,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
