import { readAuthCookie } from './cookies'
import { verifyAuthJWT } from './jwt'
import { prisma } from './prisma'

export async function getServerUser() {
  const token = await readAuthCookie()
  if (!token) return null
  try {
    const payload = await verifyAuthJWT(token)
    return await prisma.appUser.findUnique({
      where: { id: payload.sub },
      select: { id: true, username: true, email: true, role: true, avatarUrl: true },
    })
  } catch {
    return null
  }
}
