import { NextResponse } from 'next/server'
import { supabaseServer } from '@/app/lib/supabaseServer'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const fileName = `${randomUUID()}.${ext}`
  const path = fileName

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { error } = await supabaseServer
    .storage
    .from('thumbnails')
    .upload(path, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    })

  if (error) {
    console.error('UPLOAD_THUMB_ERROR', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  const { data: publicData } = supabaseServer
    .storage
    .from('thumbnails')
    .getPublicUrl(path)

  return NextResponse.json({
    url: publicData.publicUrl, 
  })
}
