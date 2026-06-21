import { prisma } from "@/lib/prisma"
import type { PropertyFormData } from "../types"

function generateCode(): string {
  const rand = String(Math.floor(1000 + Math.random() * 9000))
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const yy = String(now.getFullYear()).slice(-2)
  return `${rand}${mm}${yy}`
}

async function generateUniqueCode(boardId: string): Promise<string> {
  let code: string
  let exists: boolean
  do {
    code = generateCode()
    exists = !!(await prisma.property.findUnique({ where: { boardId_code: { boardId, code } } }))
  } while (exists)
  return code
}

export class PropertyService {
  static async findAll(params: { boardId?: string; skip?: number; take?: number; search?: string }) {
    const where: any = { deletedAt: null }
    if (params.boardId) where.boardId = params.boardId
    if (params.search) {
      where.OR = [
        { code: { contains: params.search, mode: "insensitive" } },
        { name: { contains: params.search, mode: "insensitive" } },
      ]
    }
    const [data, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { units: true } } },
      }),
      prisma.property.count({ where }),
    ])
    return { data, total }
  }

  static async findById(id: string) {
    return prisma.property.findFirst({
      where: { id, deletedAt: null },
      include: {
        units: { where: { deletedAt: null }, orderBy: { unitNumber: "asc" } },
        _count: { select: { units: true } },
      },
    })
  }

  static async create(data: PropertyFormData & { boardId: string }, userId: string) {
    const code = await generateUniqueCode(data.boardId)
    return prisma.property.create({ data: { ...data, code, createdBy: userId } })
  }

  static async update(id: string, data: PropertyFormData, userId: string) {
    const { code, ...rest } = data
    return prisma.property.update({ where: { id }, data: { ...rest, updatedBy: userId } })
  }

  static async delete(id: string) {
    const units = await prisma.unit.count({ where: { propertyId: id, deletedAt: null } })
    if (units > 0) throw new Error("Cannot delete property with existing units")
    return prisma.property.update({ where: { id }, data: { deletedAt: new Date() } })
  }
}
