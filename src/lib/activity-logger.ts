import { prisma } from "./prisma"

interface LogParams {
  userId?: string
  action: "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT" | "TERMINATE" | "LOGIN" | "ERROR"
  entity: string
  entityId?: string
  details?: Record<string, unknown>
}

export async function logActivity(params: LogParams) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId || "system",
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details ?? {},
        createdBy: params.userId || "system",
      },
    })
  } catch (error) {
    console.error("[activity-log] Failed to log:", error)
  }
}

export async function logError(entity: string, error: unknown, userId?: string) {
  const message = error instanceof Error ? error.message : String(error)
  await logActivity({
    userId,
    action: "ERROR",
    entity,
    details: { error: message },
  })
}
