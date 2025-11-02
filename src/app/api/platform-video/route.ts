import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  const row = await prisma.platformVideo.findFirst({
    orderBy: { createdAt: 'desc' }, 
  })

  return NextResponse.json({
    video: row
      ? {
          id: row.id,
          videoKey: row.videoKey ?? null,
          muted: row.muted,
        }
      : null,
  })
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null)
  const videoKey = body?.videoKey ?? null
  const muted = body?.muted ?? true

  const existing = await prisma.platformVideo.findFirst({
    orderBy: { createdAt: 'desc' },
  })

  const saved = existing
    ? await prisma.platformVideo.update({
        where: { id: existing.id },
        data: {
          videoKey,
          muted,
        },
      })
    : await prisma.platformVideo.create({
        data: {
          videoKey,
          muted,
        },
      })

  return NextResponse.json({
    ok: true,
    video: {
      id: saved.id,
      videoKey: saved.videoKey,
      muted: saved.muted,
    },
  })
}

export async function DELETE() {
  await prisma.platformVideo.deleteMany({})
  return NextResponse.json({ ok: true })
}
