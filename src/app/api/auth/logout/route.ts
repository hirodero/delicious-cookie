import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/app/lib/cookies'

export async function POST() {
  await clearAuthCookie()
  return NextResponse.json({ ok: true })
}
