import { NextRequest, NextResponse, after } from 'next/server'
import {
  buildDynamicQrScanMetadata,
  recordDynamicQrScanSafely,
  resolveDynamicQrRedirect,
} from '../../../lib/dynamic-qr'
import { getPrisma } from '../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type DynamicQrRouteContext = {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, context: DynamicQrRouteContext) {
  const { slug } = await context.params
  const prisma = getPrisma()
  const qrCode = await resolveDynamicQrRedirect(prisma, slug)

  if (!qrCode) {
    return rewriteToStatus(request, 'unknown', 404)
  }

  if (qrCode.status !== 'ACTIVE') {
    return rewriteToStatus(request, qrCode.status === 'ARCHIVED' ? 'archived' : 'suspended', 410)
  }

  const metadata = buildDynamicQrScanMetadata(request.headers, qrCode.id)
  after(() => recordDynamicQrScanSafely(prisma, qrCode.id, metadata))
  return NextResponse.redirect(qrCode.destinationUrl, 302)
}

function rewriteToStatus(request: NextRequest, reason: 'unknown' | 'archived' | 'suspended', status: number) {
  const statusUrl = new URL('/q/status', request.url)
  statusUrl.searchParams.set('reason', reason)
  return NextResponse.rewrite(statusUrl, { status })
}
