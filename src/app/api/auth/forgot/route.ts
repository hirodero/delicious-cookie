import { NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/app/lib/prisma'
import { sendResetEmail } from '@/app/lib/mailer'

const RESET_EXPIRE_MINUTES = 15

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await prisma.appUser.findUnique({
      where: { email },
      select: { email: true },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'If that email exists, we sent a reset link.' },
        { status: 200 }
      )
    }

    const rawToken = crypto.randomBytes(32).toString('hex') 

    const tokenHash = await bcrypt.hash(rawToken, 10)

    // @ts-ignore 
    const resetTokenDelegate = prisma.passwordResetToken as any

    await resetTokenDelegate.deleteMany({
      where: { email },
    })

    await resetTokenDelegate.create({
      data: {
        email,
        tokenHash,
      },
    })

    const frontendBase =
      process.env.FRONTEND_BASE_URL || 'http://localhost:3000'

    const resetUrl = `${frontendBase}/forgot-password?token=${encodeURIComponent(
      rawToken
    )}&email=${encodeURIComponent(email)}`

    await sendResetEmail(email, resetUrl, RESET_EXPIRE_MINUTES)

    return NextResponse.json(
      { message: 'If that email exists, we sent a reset link.' },
      { status: 200 }
    )
  } catch (err) {
    console.error('forgot error:', err)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}
