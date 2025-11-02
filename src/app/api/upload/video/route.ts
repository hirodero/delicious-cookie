import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { supabaseServer } from '@/app/lib/supabaseServer'
import { getSessionUser } from '@/app/lib/auth'

function guessExt(mime?: string) {
  if (!mime) return '.mp4'
  if (mime.includes('mp4')) return '.mp4'
  if (mime.includes('webm')) return '.webm'
  if (mime.includes('ogg')) return '.ogv'
  return '.mp4'
}

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file required' }, { status: 400 })
  }

  const arrayBuf = await file.arrayBuffer()
  const bytes = Buffer.from(arrayBuf)

  const ext = guessExt(file.type)
  const storageKey = `lessons/${randomUUID()}${ext}`

  const { error: uploadErr } = await supabaseServer.storage
    .from('videos')
    .upload(storageKey, bytes, {
      contentType: file.type || 'video/mp4',
      upsert: false,
    })

  if (uploadErr) {
    console.error('[UPLOAD_ERR]', uploadErr)
    return NextResponse.json({ error: 'upload failed' }, { status: 500 })
  }

  return NextResponse.json({ storageKey })
}
