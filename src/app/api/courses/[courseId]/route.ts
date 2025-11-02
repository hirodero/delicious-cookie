import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

type Ctx = { params: { courseId: string } }

export async function PATCH(req: Request, { params }: Ctx) {
  const { courseId } = await params

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
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { courseId } = await params

  try {
    await prisma.$transaction(async (tx) => {
      await tx.watchEvent.deleteMany({ where: { lesson: { courseId } } })
      await tx.lessonProgress.deleteMany({ where: { lesson: { courseId } } })
      await tx.videoAsset.deleteMany({ where: { lesson: { courseId } } })
      await tx.lesson.deleteMany({ where: { courseId } })

      await tx.enrollment.deleteMany({ where: { courseId } })

      await tx.course.delete({ where: { id: courseId } })
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}
