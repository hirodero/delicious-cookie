import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/app/lib/prisma'
import { sendVerificationEmail } from '@/app/lib/mailer'

const VERIFY_EXPIRE_MINUTES = 60 

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Missing fields' },
        { status: 400 }
      )
    }

    const existing = await prisma.appUser.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Username atau email sudah terdaftar' },
        { status: 400 }
      )
    }

    const passhash = await bcrypt.hash(password, 10)

    // @ts-ignore 
    await prisma.appUser.create({
      data: {
        username,
        email,
        passhash,
        isVerified: false,
      },
    })

    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = await bcrypt.hash(rawToken, 10)

    // @ts-ignore
    const verifyTokenDelegate = prisma.verificationToken as any

    await verifyTokenDelegate.deleteMany({
      where: { email },
    })

    await verifyTokenDelegate.create({
      data: {
        email,
        tokenHash,
      },
    })

    const base =
      process.env.FRONTEND_BASE_URL || 'http://localhost:3000'

    const verifyUrl = `${base}/verify?token=${encodeURIComponent(
      rawToken
    )}&email=${encodeURIComponent(email)}`

    await sendVerificationEmail(email, verifyUrl)

    return NextResponse.json(
      {
        message:
          'A verification link has been sent to your email. Please verify before logging in.',
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('register error:', err)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
