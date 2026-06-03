import { NextRequest, NextResponse } from "next/server"
import { addCabinetEvent } from "@/lib/webhook-events"

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown> = {}

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { code: 1, msg: "Invalid JSON body" },
      { status: 400 }
    )
  }

  const eventName =
    (payload.event as string) ||
    (payload.type as string) ||
    (payload.eventType as string) ||
    "UNKNOWN"

  addCabinetEvent(eventName, payload)

  return NextResponse.json({ code: 0, msg: "success" })
}
