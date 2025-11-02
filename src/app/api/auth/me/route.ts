import { NextResponse } from 'next/server'
import { getSessionUser } from '@/app/lib/auth'

export async function GET() {
  try {
    const user = await getSessionUser()
    return NextResponse.json({ user })
  } catch (err) {
    console.error('[ME_ERROR]', err)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
