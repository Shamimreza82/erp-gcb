import { NextRequest } from "next/server"
import { ReportController } from "@/modules/reports/controllers/report-controller"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  return ReportController.monthly(request)
}
