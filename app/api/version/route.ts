import { NextResponse } from 'next/server'
import { VINKORA_APP_VERSION } from '@/lib/app-version'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json(
    { version: VINKORA_APP_VERSION },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  )
}
