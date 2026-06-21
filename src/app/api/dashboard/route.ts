import { NextRequest } from "next/server"
import { DashboardController } from "@/modules/dashboard/controllers/dashboard-controller"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  return DashboardController.getStats(request)
}
