import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)
const alg = 'HS256'

export type JwtPayload = {
  sub: string        
  email: string
  username: string
  role: string
}

export async function signAuthJWT(payload: JwtPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyAuthJWT(token: string) {
  const { payload } = await jwtVerify<JwtPayload>(token, secret, {
    algorithms: [alg],
  })
  return payload
}
