import { NextRequest, NextResponse } from "next/server"
import { addRentCallback } from "@/lib/webhook-events"

async function parseRentCallbackBody(
  request: NextRequest
): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    try {
      return (await request.json()) as Record<string, unknown>
    } catch {
      return {}
    }
  }

  try {
    const formData = await request.formData()
    const payload: Record<string, unknown> = {}
    formData.forEach((value, key) => {
      payload[key] = value.toString()
    })
    return payload
  } catch {
    return {}
  }
}

export async function POST(request: NextRequest) {
  const payload = await parseRentCallbackBody(request)

  const tradeNo =
    (payload.tradeNo as string) ||
    (payload.trade_no as string) ||
    (payload.orderId as string) ||
    ""

  const statusRaw = payload.status ?? payload.rentStatus
  const status =
    typeof statusRaw === "number"
      ? statusRaw
      : Number.parseInt(String(statusRaw ?? ""), 10)

  if (!tradeNo || Number.isNaN(status)) {
    return NextResponse.json(
      { code: 1, msg: "Missing tradeNo or status" },
      { status: 400 }
    )
  }

  addRentCallback(tradeNo, status, payload)

  return NextResponse.json({ code: 0, msg: "success" })
}
