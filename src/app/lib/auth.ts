import { verifyAuthJWT } from '@/app/lib/jwt'
import { readAuthCookie } from '@/app/lib/cookies'
import { prisma } from '@/app/lib/prisma'

export async function getSessionUser() {
  const token = await readAuthCookie()
  if (!token) return null

  let payload
  try {
    payload = await verifyAuthJWT(token)
  } catch (err) {
    console.error('[AUTH] invalid jwt', err)
    return null
  }

  const user = await prisma.appUser.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      avatarUrl: true,
    },
  })

  if (!user) return null

  return user
}
