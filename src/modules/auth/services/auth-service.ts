import { prisma } from "@/lib/prisma"
import { hashPassword, comparePassword, generateToken } from "@/lib/auth"
import type { LoginInput } from "../types"

export class AuthService {
  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (!user || !user.isActive || user.deletedAt) {
      throw new Error("Invalid credentials")
    }

    const isValid = await comparePassword(input.password, user.password)
    if (!isValid) {
      throw new Error("Invalid credentials")
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        boardId: user.boardId,
      },
      token,
    }
  }

  static async getProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        boardId: true,
        isActive: true,
        createdAt: true,
      },
    })
  }
}
