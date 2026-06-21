import { prisma } from "@/lib/prisma"
import type { ExpenseFormData } from "../types"

export class ExpenseService {
  static async findAll(params: { boardId?: string; skip?: number; take?: number; search?: string }) {
    const where: any = { deletedAt: null }
    if (params.boardId) where.boardId = params.boardId
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { category: { contains: params.search, mode: "insensitive" } },
      ]
    }
    const [data, total] = await Promise.all([
      prisma.expense.findMany({ where, skip: params.skip, take: params.take, orderBy: { date: "desc" } }),
      prisma.expense.count({ where }),
    ])
    return { data, total }
  }

  static async create(data: ExpenseFormData & { boardId: string }, userId: string) {
    return prisma.expense.create({ data: { ...data, date: new Date(data.date), createdBy: userId } })
  }

  static async update(id: string, data: ExpenseFormData, userId: string) {
    return prisma.expense.update({ where: { id }, data: { ...data, date: new Date(data.date), updatedBy: userId } })
  }

  static async delete(id: string) {
    return prisma.expense.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}
