import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/app/lib/prisma'
import { differenceInMinutes } from 'date-fns'

const RESET_EXPIRE_MINUTES = 15

export async function POST(req: Request) {
  try {
    const {
      email,
      token,
      password,
      password_confirmation,
    } = await req.json()

    // basic validation
    if (!email || !token || !password || !password_confirmation) {
      return NextResponse.json(
        { message: 'Missing fields' },
        { status: 400 }
      )
    }

    if (typeof email !== 'string' ||
        typeof token !== 'string' ||
        typeof password !== 'string' ||
        typeof password_confirmation !== 'string') {
      return NextResponse.json(
        { message: 'Invalid payload' },
        { status: 400 }
      )
    }

    if (password !== password_confirmation) {
      return NextResponse.json(
        { message: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // @ts-ignore 
    const resetTokenDelegate = prisma.passwordResetToken as any

    const rec = await resetTokenDelegate.findFirst({
      where: { email },
    })

    if (!rec) {
      return NextResponse.json(
        { message: 'Invalid token/email' },
        { status: 400 }
      )
    }

    const ageMin = differenceInMinutes(new Date(), rec.createdAt)
    if (ageMin > RESET_EXPIRE_MINUTES) {
      await resetTokenDelegate.deleteMany({ where: { email } })
      return NextResponse.json(
        { message: 'Token expired' },
        { status: 400 }
      )
    }

    const isValid = await bcrypt.compare(token, rec.tokenHash)
    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid token/email' },
        { status: 400 }
      )
    }

    const newHash = await bcrypt.hash(password, 10)

    await prisma.appUser.update({
      where: { email },
      data: {
        passhash: newHash,
      },
    })

    await resetTokenDelegate.deleteMany({
      where: { email },
    })

    return NextResponse.json(
      { message: 'Password updated' },
      { status: 200 }
    )
  } catch (err) {
    console.error('reset error:', err)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}
