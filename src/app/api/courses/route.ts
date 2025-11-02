import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'
import { getSessionUser } from '@/app/lib/auth'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()

    const user = await getSessionUser()

    const where: Prisma.CourseWhereInput = q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            {
              lessons: {
                some: { title: { contains: q, mode: 'insensitive' } },
              },
            },
          ],
        }
      : {}

    const rawCourses = await prisma.course.findMany({
      where,
      orderBy: { orderIndex: 'asc' },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            orderIndex: true,
            isFreePreview: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    })

    if (!user) {
      const shapedNoUser = rawCourses.map((c) => {
        const totalLessons = c.lessons.length
        return {
          id: c.id,
          slug: c.slug,
          title: c.title,
          description: c.description ?? '',
          thumbnailUrl: c.thumbnailUrl ?? null,
          isPublished: c.isPublished,
          orderIndex: c.orderIndex,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          createdBy: c.createdBy,
          lessons: c.lessons,
          totalLessons,
          watchedLessons: 0,
          progressPct: 0,
        }
      })

      return NextResponse.json({ courses: shapedNoUser })
    }

    const allLessonIds: string[] = []
    for (const c of rawCourses) {
      for (const l of c.lessons) {
        allLessonIds.push(l.id)
      }
    }

    if (allLessonIds.length === 0) {
      const shapedEmpty = rawCourses.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description ?? '',
        thumbnailUrl: c.thumbnailUrl ?? null,
        isPublished: c.isPublished,
        orderIndex: c.orderIndex,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        createdBy: c.createdBy,
        lessons: c.lessons,
        totalLessons: 0,
        watchedLessons: 0,
        progressPct: 0,
      }))

      return NextResponse.json({ courses: shapedEmpty })
    }

    const progresses = await prisma.lessonProgress.findMany({
      where: {
        userId: user.id,
        lessonId: { in: allLessonIds },
        completed: true,
      },
      select: {
        lessonId: true,
      },
    })

    const completedSet = new Set(progresses.map((p) => p.lessonId))

    const shaped = rawCourses.map((c) => {
      const totalLessons = c.lessons.length
      let watchedLessons = 0

      for (const l of c.lessons) {
        if (completedSet.has(l.id)) {
          watchedLessons++
        }
      }

      const progressPct =
        totalLessons === 0
          ? 0
          : (watchedLessons / totalLessons) * 100

      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description ?? '',
        thumbnailUrl: c.thumbnailUrl ?? null,
        isPublished: c.isPublished,
        orderIndex: c.orderIndex,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,

        createdBy: c.createdBy,
        lessons: c.lessons,

        totalLessons,
        watchedLessons,
        progressPct,
      }
    })

    return NextResponse.json({ courses: shaped })
  } catch (e) {
    console.error('GET /api/courses error:', e)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      title,
      description,
      thumbnailUrl,
      createdById,
    }: {
      title?: string
      description?: string | null
      thumbnailUrl?: string | null
      createdById?: string
    } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title required' },
        { status: 400 },
      )
    }

    const creatorId =
      createdById ??
      (await prisma.appUser.findFirst({ select: { id: true } }))?.id ??
      null

    if (!creatorId) {
      return NextResponse.json(
        { error: 'No creator user found' },
        { status: 400 },
      )
    }

    const base = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    let slug = base || 'course'
    let counter = 1
    while (await prisma.course.findUnique({ where: { slug } })) {
      slug = `${base}-${counter++}`
    }

    const last = await prisma.course.findFirst({
      select: { orderIndex: true },
      orderBy: { orderIndex: 'desc' },
    })
    const nextIndex = (last?.orderIndex ?? 0) + 1

    const course = await prisma.course.create({
      data: {
        slug,
        title,
        description: description ?? null,
        thumbnailUrl: thumbnailUrl ?? null,
        createdById: creatorId,
        isPublished: false,
        orderIndex: nextIndex,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        isPublished: true,
        orderIndex: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ course }, { status: 201 })
  } catch (e) {
    console.error('POST /api/courses error:', e)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 },
    )
  }
}
