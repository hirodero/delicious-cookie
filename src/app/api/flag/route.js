import { NextResponse } from 'next/server'

export async function GET(req) {
  const raw = req.cookies.get('cookie')?.value || ''
  if (!raw) {
    return NextResponse.json({ hint: 'Set the cookie first buddy.' }, { status: 404 })
  }
  if (raw === 'secret') {
    return NextResponse.json({
      secret: 'CSC{s3hr_l3ck3r_c00kie}',
    })
  }
  return NextResponse.json({ hint: 'not yet benar. try to change the value to "secret" buddy.' }, { status: 403 })
}
