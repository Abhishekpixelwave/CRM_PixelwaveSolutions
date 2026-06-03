export type CabinetWebhookEvent = {
  id: string
  type: "cabinet"
  event: string
  payload: unknown
  receivedAt: string
}

export type RentCallbackEvent = {
  id: string
  type: "rent"
  tradeNo: string
  status: number
  payload: Record<string, unknown>
  receivedAt: string
}

const MAX_EVENTS = 100

const cabinetEvents: CabinetWebhookEvent[] = []
const rentCallbacks: RentCallbackEvent[] = []
const rentStatusByTradeNo = new Map<
  string,
  { status: number; receivedAt: string }
>()

function trimEvents<T>(events: T[]) {
  while (events.length > MAX_EVENTS) {
    events.pop()
  }
}

export function addCabinetEvent(event: string, payload: unknown) {
  cabinetEvents.unshift({
    id: crypto.randomUUID(),
    type: "cabinet",
    event,
    payload,
    receivedAt: new Date().toISOString(),
  })
  trimEvents(cabinetEvents)
}

export function addRentCallback(
  tradeNo: string,
  status: number,
  payload: Record<string, unknown>
) {
  rentCallbacks.unshift({
    id: crypto.randomUUID(),
    type: "rent",
    tradeNo,
    status,
    payload,
    receivedAt: new Date().toISOString(),
  })
  trimEvents(rentCallbacks)
  rentStatusByTradeNo.set(tradeNo, {
    status,
    receivedAt: new Date().toISOString(),
  })
}

export function getCabinetEvents(limit = 50) {
  return cabinetEvents.slice(0, limit)
}

export function getRentCallbacks(limit = 50) {
  return rentCallbacks.slice(0, limit)
}

export function getRentCallbackStatus(tradeNo: string) {
  return rentStatusByTradeNo.get(tradeNo) ?? null
}

export function clearWebhookEvents(type?: "cabinet" | "rent") {
  if (!type || type === "cabinet") {
    cabinetEvents.length = 0
  }
  if (!type || type === "rent") {
    rentCallbacks.length = 0
    rentStatusByTradeNo.clear()
  }
}
