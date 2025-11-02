import { cookies } from 'next/headers'

const AUTH_COOKIE = 'auth_token'

export async function readAuthCookie(): Promise<string | null> {
  const jar = await cookies()
  const raw = jar.get(AUTH_COOKIE)?.value
  return raw ?? null
}

export async function setAuthCookie(token: string) {
  const jar = await cookies()
  jar.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, 
  })
}

export async function clearAuthCookie() {
  const jar = await cookies()
  jar.set(AUTH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}
