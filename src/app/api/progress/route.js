import { prisma } from '@/app/lib/prisma'

export async function POST(req) {
  const { userId, lessonId, position, completed } = await req.json()

  const row = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { lastPositionS: position ?? 0, completed: completed ?? false, updatedAt: new Date() },
    create: { userId, lessonId, lastPositionS: position ?? 0, completed: completed ?? false },
  })

  return Response.json(row)
}
