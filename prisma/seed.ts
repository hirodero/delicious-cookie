import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passhash = await bcrypt.hash('cv3rs34dmin123#', 12)

  const user = await prisma.appUser.upsert({
    where: { email: 'admin@gmail.com' },
    update: { passhash, role: 'admin' }, 
    create: {
      username: 'admin',
      email: 'admin@gmail.com',
      passhash,
      role: 'admin',
    },
  })

  const course = await prisma.course.upsert({
    where: { slug: 'course-1' },
    update: {
      isPublished: true,
      createdById: user.id,
    },
    create: {
      slug: 'course-1',
      title: 'Course 1',
      description: 'Intro Course',
      createdById: user.id,
      isPublished: true,
      lessons: {
        create: [
          {
            title: 'Lesson 1',
            description: 'First',
            isFreePreview: true,
          },
        ],
      },
    },
    include: { lessons: true },
  })

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    update: { role: 'instructor' },
    create: { userId: user.id, courseId: course.id, role: 'instructor' },
  })

  console.log('Seed done:', { admin: user.email, course: course.slug })
}

main()
  .catch((e) => {
    console.error('SEED_ERROR', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
