import { NextResponse } from 'next/server'
import { supabaseServer } from '@/app/lib/supabaseServer'
import { getSessionUser } from '@/app/lib/auth'

export async function GET(req: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')
  if (!key) {
    return NextResponse.json({ error: 'key required' }, { status: 400 })
  }

  const { data, error } = await supabaseServer.storage
    .from('videos')
    .createSignedUrl(key, 60)

  if (error || !data?.signedUrl) {
    console.error('[SIGNED_URL_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to sign URL' },
      { status: 500 }
    )
  }

  return NextResponse.json({ url: data.signedUrl })
}
