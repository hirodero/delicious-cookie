import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSessionUser } from '@/app/lib/auth'

function extractIds(req: NextRequest) {
  const parts = new URL(req.url).pathname.split('/')

  const coursesIdx = parts.indexOf('courses')
  const lessonsIdx = parts.indexOf('lessons')

  const courseId =
    coursesIdx !== -1 && parts.length > coursesIdx + 1
      ? parts[coursesIdx + 1]
      : ''
  const lessonId =
    lessonsIdx !== -1 && parts.length > lessonsIdx + 1
      ? parts[lessonsIdx + 1]
      : ''

  return { courseId, lessonId }
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { courseId, lessonId } = extractIds(req)

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

    // if current default video is different than requested videoKey,
    // update default
    if (!currentDefault || currentDefault.storageKey !== videoKey) {
      // unset all defaults first
      await prisma.videoAsset.updateMany({
        where: { lessonId },
        data: { isDefault: false },
      })

      // check if this video already exists
      const match = existing.videos.find((v) => v.storageKey === videoKey)

      if (match) {
        // just flip that one to default
        await prisma.videoAsset.update({
          where: { id: match.id },
          data: { isDefault: true },
        })
      } else {
        // create a new asset
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

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { courseId, lessonId } = extractIds(req)

  const existing = await prisma.lesson.findFirst({
    where: { id: lessonId, courseId },
  })

  if (!existing) {
    return NextResponse.json({ error: 'lesson not found' }, { status: 404 })
  }

  // clean up all related data
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
