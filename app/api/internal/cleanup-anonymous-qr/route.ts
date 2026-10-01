import { NextRequest, NextResponse } from 'next/server'
import { cleanupAnonymousDynamicQrData } from '../../../../lib/dynamic-qr'
import { getPrisma } from '../../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const result = await cleanupAnonymousDynamicQrData(getPrisma())
  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } })
}
