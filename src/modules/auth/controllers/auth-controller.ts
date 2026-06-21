import { NextRequest } from "next/server"
import { AuthService } from "../services/auth-service"
import { loginSchema } from "../validations"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getUserFromRequest } from "@/lib/auth"
import { logActivity, logError } from "@/lib/activity-logger"

export class AuthController {
  static async login(request: NextRequest) {
    try {
      const body = await request.json()
      const parsed = loginSchema.safeParse(body)
      if (!parsed.success) return errorResponse(parsed.error.errors[0].message)
      const result = await AuthService.login(parsed.data)
      await logActivity({ userId: result.user.id, action: "LOGIN", entity: "auth", entityId: result.user.id, details: { email: result.user.email } })
      return successResponse(result)
    } catch (error) {
      logError("auth", error)
      console.error("[auth] Login error:", error)
      return errorResponse(error instanceof Error ? error.message : "Login failed", 401)
    }
  }

  static async me(request: NextRequest) {
    const user = getUserFromRequest(request)
    if (!user) return errorResponse("Unauthorized", 401)
    const profile = await AuthService.getProfile(user.userId)
    return successResponse(profile)
  }
}
