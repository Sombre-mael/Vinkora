import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST() {
  return NextResponse.json(
    {
      code: 'AUTHENTICATION_AND_ACTIVE_PLAN_REQUIRED',
      error: 'Les liens courts Vinkora nécessitent une authentification et une offre active.',
    },
    {
      status: 401,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
}
