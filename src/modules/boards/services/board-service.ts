import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { UserRole } from "@prisma/client"
import type { BoardFormData } from "../types"

export class BoardService {
  static async findAll(params: { skip?: number; take?: number; search?: string }) {
    const where: any = { deletedAt: null }
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { code: { contains: params.search, mode: "insensitive" } },
      ]
    }
    const [data, total] = await Promise.all([
      prisma.board.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { users: true, properties: true } },
        },
      }),
      prisma.board.count({ where }),
    ])
    return { data, total }
  }

  static async findById(id: string) {
    return prisma.board.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: { select: { users: true, properties: true } },
        users: { where: { deletedAt: null }, select: { id: true, fullName: true, email: true, role: true } },
      },
    })
  }

  static async create(data: BoardFormData) {
    const password = await hashPassword("123456")
    return prisma.$transaction(async (tx) => {
      const board = await tx.board.create({
        data: { name: data.name, code: data.code, address: data.address },
      })
      // Create CEO user for this board
      await tx.user.create({
        data: {
          boardId: board.id,
          email: data.ceoEmail,
          password,
          fullName: data.ceoName,
          phone: data.ceoPhone,
          role: UserRole.CEO,
        },
      })
      // Create default Manager
      await tx.user.create({
        data: {
          boardId: board.id,
          email: `manager@${data.code.toLowerCase()}.gov.bd`,
          password,
          fullName: "Default Manager",
          role: UserRole.MANAGER,
        },
      })
      // Create default Finance Officer
      await tx.user.create({
        data: {
          boardId: board.id,
          email: `finance@${data.code.toLowerCase()}.gov.bd`,
          password,
          fullName: "Default Finance Officer",
          role: UserRole.FINANCE_OFFICER,
        },
      })
      return board
    })
  }

  static async update(id: string, data: Partial<BoardFormData>) {
    return prisma.board.update({ where: { id }, data })
  }

  static async delete(id: string) {
    return prisma.board.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}
