import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSessionUser } from '@/app/lib/auth'

function extractCourseId(req: Request) {
  const parts = new URL(req.url).pathname.split('/')

  const coursesIdx = parts.indexOf('courses')

  const courseId =
    coursesIdx !== -1 && parts.length > coursesIdx + 1
      ? parts[coursesIdx + 1]
      : ''

  return courseId
}

export async function GET(req: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const courseId = extractCourseId(req)

  const enroll = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
    select: {
      role: true,
    },
  })

  const isInstructorHere = enroll?.role === 'instructor'
  const isPrivileged =
    user.role === 'user' ||
    user.role === 'admin' ||
    user.role === 'instructor' ||
    isInstructorHere

  if (!isPrivileged) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    orderBy: { orderIndex: 'asc' },
    select: {
      id: true,
      title: true,
      description: true,
      orderIndex: true,
      videos: {
        where: { isDefault: true },
        take: 1,
        select: {
          storageKey: true,
          mimeType: true,
        },
      },
    },
  })

  const lessonIds = lessons.map((l) => l.id)

  const progresses = await prisma.lessonProgress.findMany({
    where: {
      userId: user.id,
      lessonId: { in: lessonIds },
    },
    select: {
      lessonId: true,
      completed: true,
    },
  })

  const progressMap = new Map(
    progresses.map((p) => [p.lessonId, p.completed]),
  )

  const shaped = lessons.map((lesson) => {
    const vid = lesson.videos[0]
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description ?? '',
      orderIndex: lesson.orderIndex ?? null,
      videoKey: vid?.storageKey || null,
      watchedByMe: progressMap.get(lesson.id) === true,
    }
  })

  return NextResponse.json({ lessons: shaped })
}

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const courseId = extractCourseId(req)

  const enroll = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
    select: {
      role: true,
    },
  })

  const isInstructorHere = enroll?.role === 'instructor'
  const isPrivileged =
    user.role === 'admin' ||
    user.role === 'instructor' ||
    isInstructorHere

  if (!isPrivileged) {
    return NextResponse.json(
      { error: 'forbidden' },
      { status: 403 },
    )
  }

  let body: {
    title?: string
    description?: string
    videoKey?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'invalid json' },
      { status: 400 },
    )
  }

  const { title, description, videoKey } = body

  if (!title || !videoKey) {
    return NextResponse.json(
      { error: 'missing required fields: title, videoKey' },
      { status: 400 },
    )
  }

  const lastLesson = await prisma.lesson.findFirst({
    where: { courseId },
    orderBy: { orderIndex: 'desc' },
    select: { orderIndex: true },
  })

  const nextOrderIndex = (lastLesson?.orderIndex ?? 0) + 1

  const created = await prisma.$transaction(async (tx) => {
    const newLesson = await tx.lesson.create({
      data: {
        courseId,
        title,
        description: description ?? '',
        durationSeconds: null,
        orderIndex: nextOrderIndex,
      },
      select: { id: true },
    })

    await tx.videoAsset.create({
      data: {
        lessonId: newLesson.id,
        storageKey: videoKey,
        mimeType: 'video/mp4',
        isDefault: true,
      },
    })

    return newLesson
  })

  return NextResponse.json(
    { ok: true, lessonId: created.id },
    { status: 201 },
  )
}
