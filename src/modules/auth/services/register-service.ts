import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

export class RegisterService {
  static async register(data: {
    fullName: string
    email: string
    phone: string
    password: string
    nidNumber?: string
    address?: string
  }) {
    const exists = await prisma.user.findUnique({ where: { email: data.email } })
    if (exists) {
      throw new Error("Email already registered")
    }

    const hashed = await hashPassword(data.password)

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: hashed,
        nidNumber: data.nidNumber,
        address: data.address,
        role: "TENANT",
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    })

    return user
  }
}
