import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/app/lib/prisma'
import { differenceInMinutes } from 'date-fns'

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json()

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Invalid verification link' },
        { status: 400 }
      )
    }

    const verifyTokenDelegate = prisma.verificationToken as any

    const rec = await verifyTokenDelegate.findFirst({
      where: { email },
    })

    if (!rec) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    const ageMin = differenceInMinutes(new Date(), rec.createdAt)
    if (ageMin > 60) {
      await verifyTokenDelegate.deleteMany({ where: { email } })
      return NextResponse.json(
        { error: 'Verification link expired' },
        { status: 400 }
      )
    }

    const match = await bcrypt.compare(token, rec.tokenHash)
    if (!match) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    await prisma.appUser.update({
      where: { email },
      data: {
        isVerified: true,
      },
    })

    await verifyTokenDelegate.deleteMany({
      where: { email },
    })

    return NextResponse.json(
      { message: 'Account verified successfully' },
      { status: 200 }
    )
  } catch (err) {
    console.error('verify error:', err)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
