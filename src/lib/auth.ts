import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7)
  }
  return null
}

export function getUserFromRequest(request: NextRequest): JwtPayload | null {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  )
}

export function forbiddenResponse() {
  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  )
}

export function requireRole(...roles: string[]) {
  return (request: NextRequest) => {
    const user = getUserFromRequest(request)
    if (!user) return unauthorizedResponse()
    if (roles.length > 0 && !roles.includes(user.role)) return forbiddenResponse()
    return null
  }
}
