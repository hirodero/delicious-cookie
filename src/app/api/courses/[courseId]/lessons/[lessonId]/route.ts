// app/api/courses/[courseId]/lessons/[lessonId]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSessionUser } from '@/app/lib/auth'

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { courseId, lessonId } = params
  const body = await req.json()
  const { title, description, videoKey } = body

  const existing = await prisma.lesson.findFirst({
    where: { id: lessonId, courseId },
    include: { videos: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'lesson not found' }, { status: 404 })
  }

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      title: title ?? existing.title,
      description: description ?? existing.description,
    },
  })

  if (videoKey) {
    const currentDefault = existing.videos.find((v) => v.isDefault)
    if (!currentDefault || currentDefault.storageKey !== videoKey) {
      await prisma.videoAsset.updateMany({
        where: { lessonId },
        data: { isDefault: false },
      })

      const match = existing.videos.find((v) => v.storageKey === videoKey)
      if (match) {
        await prisma.videoAsset.update({
          where: { id: match.id },
          data: { isDefault: true },
        })
      } else {
        await prisma.videoAsset.create({
          data: {
            lessonId,
            storageKey: videoKey,
            mimeType: 'video/mp4',
            isDefault: true,
          },
        })
      }
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { courseId, lessonId } = params

  const existing = await prisma.lesson.findFirst({
    where: { id: lessonId, courseId },
  })
  if (!existing) {
    return NextResponse.json({ error: 'lesson not found' }, { status: 404 })
  }

  await prisma.watchEvent.deleteMany({
    where: { lessonId },
  })
  await prisma.lessonProgress.deleteMany({
    where: { lessonId },
  })
  await prisma.videoAsset.deleteMany({
    where: { lessonId },
  })
  await prisma.lesson.delete({
    where: { id: lessonId },
  })

  return NextResponse.json({ ok: true })
}
