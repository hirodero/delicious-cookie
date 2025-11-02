import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/app/lib/prisma'
import { signAuthJWT } from '@/app/lib/jwt'
import { setAuthCookie } from '@/app/lib/cookies'

export async function POST(req: Request) {
  try {
    const { identifier, password } = (await req.json()) as {
      identifier?: string
      password?: string
    }

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Missing fields' },
        { status: 400 }
      )
    }

    const user = await prisma.appUser.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
        ],
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const ok = await bcrypt.compare(password, user.passhash)
    if (!ok) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = await signAuthJWT({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    })

    await setAuthCookie(token)

    return NextResponse.json({
      token, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl ?? null,
      },
    })
  } catch (err) {
    console.error('[LOGIN_ERROR]', err)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
