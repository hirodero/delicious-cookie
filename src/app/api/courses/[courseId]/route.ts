import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

function extractCourseId(req: Request) {
  const parts = new URL(req.url).pathname.split('/')

  const coursesIdx = parts.indexOf('courses')

  const courseId =
    coursesIdx !== -1 && parts.length > coursesIdx + 1
      ? parts[coursesIdx + 1]
      : ''

  return courseId
}

export async function PATCH(req: Request) {
  const courseId = extractCourseId(req)

  try {
    const body = await req.json()
    const { title, description, thumbnailUrl } = body

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(thumbnailUrl !== undefined ? { thumbnailUrl } : {}),
      },
    })

    return NextResponse.json({ course })
  } catch {
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  const courseId = extractCourseId(req)

  try {
    await prisma.$transaction(async (tx) => {
      await tx.watchEvent.deleteMany({
        where: { lesson: { courseId } },
      })
      await tx.lessonProgress.deleteMany({
        where: { lesson: { courseId } },
      })
      await tx.videoAsset.deleteMany({
        where: { lesson: { courseId } },
      })
      await tx.lesson.deleteMany({
        where: { courseId },
      })

      await tx.enrollment.deleteMany({
        where: { courseId },
      })

      await tx.course.delete({
        where: { id: courseId },
      })
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    )
  }
}
