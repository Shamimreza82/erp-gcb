import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { InvoiceService } from "../services/invoice-service"
import { invoiceSchema } from "../validations"
import { successResponse, errorResponse, notFoundResponse, paginatedResponse } from "@/lib/api-response"
import { getUserFromRequest } from "@/lib/auth"
import { logActivity, logError } from "@/lib/activity-logger"

export class InvoiceController {
  static async list(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { boardId: true } })
    let boardId: string | undefined = dbUser?.boardId || undefined
    if (user.role === "SUPER_ADMIN") boardId = undefined
    if (!boardId && user.role !== "SUPER_ADMIN") return errorResponse("No board assigned", 403)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || undefined
    const dueMonth = searchParams.get("dueMonth") || undefined
    const { data, total } = await InvoiceService.findAll({ boardId, skip: (page - 1) * limit, take: limit, search: searchParams.get("search") || undefined, status, dueMonth })
    return paginatedResponse(data, total, page, limit)
  }

  static async generateBatch(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { boardId: true } })
    if (!dbUser?.boardId) return errorResponse("No board assigned", 403)
    try {
      const { month } = await request.json()
      if (!month) return errorResponse("Month is required (YYYY-MM)")
      const result = await InvoiceService.generateBatch(dbUser.boardId, month, user.userId)
      await logActivity({ userId: user.userId, action: "CREATE", entity: "invoice", details: { batch: true, month, created: result.created } })
      return successResponse(result)
    } catch (error) {
      logError("invoice", error, user?.userId)
      return errorResponse(error instanceof Error ? error.message : "Batch generation failed")
    }
  }

  static async getById(request: NextRequest, { params }: { params: { id: string } }) {
    const invoice = await InvoiceService.findById(params.id)
    if (!invoice) return notFoundResponse("Invoice")
    return successResponse(invoice)
  }

  static async create(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    try {
      const body = await request.json()
      const parsed = invoiceSchema.safeParse(body)
      if (!parsed.success) return errorResponse(parsed.error.errors[0].message)

      const lease = await prisma.lease.findUnique({ where: { id: parsed.data.leaseId } })
      if (!lease) return errorResponse("Lease not found")

      const invoice = await InvoiceService.create({ ...parsed.data, tenantId: lease.tenantId }, user.userId)
      await logActivity({ userId: user.userId, action: "CREATE", entity: "invoice", entityId: invoice.id, details: { invoiceNumber: invoice.invoiceNumber } })
      return successResponse(invoice, 201)
    } catch (error) {
      logError("invoice", error, user?.userId)
      return errorResponse(error instanceof Error ? error.message : "Failed to create invoice")
    }
  }

  static async applyLateFees(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    const dbUser = await prisma.user.findUnique({ where: { id: user.userId }, select: { boardId: true } })
    if (!dbUser?.boardId) return errorResponse("No board assigned", 403)
    try {
      const { amount } = await request.json()
      const result = await InvoiceService.applyLateFees(dbUser.boardId, amount || 100)
      await logActivity({ userId: user.userId, action: "UPDATE", entity: "invoice", details: { lateFeeApplied: true, updated: result.updated } })
      return successResponse(result)
    } catch (error) {
      logError("invoice", error, user?.userId)
      return errorResponse(error instanceof Error ? error.message : "Failed to apply late fees")
    }
  }

  static async delete(request: NextRequest, { params }: { params: { id: string } }) {
    const user = getUserFromRequest(request)
    try {
      await InvoiceService.delete(params.id)
      await logActivity({ userId: user?.userId, action: "DELETE", entity: "invoice", entityId: params.id })
      return successResponse({ message: "Invoice deleted" })
    } catch (error) {
      logError("invoice", error, user?.userId)
      return errorResponse(error instanceof Error ? error.message : "Failed to delete invoice")
    }
  }
}
