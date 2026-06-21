import { NextResponse } from "next/server"

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  })
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status })
}

export function notFoundResponse(resource = "Resource") {
  return errorResponse(`${resource} not found`, 404)
}
