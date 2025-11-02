import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSessionUser } from '@/app/lib/auth'

async function safeJson(req: Request) {
  try {
    return await req.json()
  } catch {
    return {}
  }
}

export async function POST(
  req: Request,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { courseId, lessonId } = params
  const body = await safeJson(req)

  const positionS =
    typeof body.positionS === 'number' && body.positionS >= 0
      ? Math.floor(body.positionS)
      : 0

  const eventName =
    typeof body.event === 'string' ? body.event : 'completed'

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, courseId },
    select: { id: true },
  })
  if (!lesson) {
    return NextResponse.json(
      { error: 'lesson not found' },
      { status: 404 },
    )
  }

  const enroll = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
    select: { role: true },
  })

  const isInstructorHere = enroll?.role === 'instructor'
  const isPrivileged =
    user.role === 'user' ||
    user.role === 'admin' ||
    user.role === 'instructor' ||
    isInstructorHere

  if (!isPrivileged) {
    return NextResponse.json(
      { error: 'forbidden' },
      { status: 403 },
    )
  }

  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId,
      },
    },
    update: {
      lastPositionS: positionS,
      completed: true,
      updatedAt: new Date(),
    },
    create: {
      userId: user.id,
      lessonId,
      lastPositionS: positionS,
      completed: true,
    },
  })

  await prisma.watchEvent.create({
    data: {
      userId: user.id,
      lessonId,
      positionS,
      event: eventName,
    },
  })

  return NextResponse.json({
    ok: true,
    lessonId,
    completed: true,
    lastPositionS: positionS,
  })
}
