import { jwtVerify, SignJWT } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-key-change-in-production")

export interface AuthPayload {
  userId: string
  email: string
  role: "user" | "admin"
  iat?: number
  exp?: number
}

// Generate JWT token
export async function generateToken(payload: Omit<AuthPayload, "iat" | "exp">) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret)

  return token
}

// Verify JWT token
export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload as AuthPayload
  } catch (error) {
    return null
  }
}

// Hash password (mock - use bcrypt in production)
export function hashPassword(password: string): string {
  // In production, use bcrypt: import bcrypt from 'bcrypt'
  // return await bcrypt.hash(password, 10)
  return Buffer.from(password).toString("base64")
}

// Verify password (mock - use bcrypt in production)
export function verifyPassword(password: string, hash: string): boolean {
  // In production, use bcrypt: import bcrypt from 'bcrypt'
  // return await bcrypt.compare(password, hash)
  return Buffer.from(password).toString("base64") === hash
}
