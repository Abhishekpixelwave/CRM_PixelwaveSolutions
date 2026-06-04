export type SlotStatus = "available" | "in-use" | "broken"

export function deriveSlotStatuses(
  total: number,
  busy: number,
  broken = 0
): SlotStatus[] {
  const slots: SlotStatus[] = []
  let remainingBusy = busy
  let remainingBroken = broken

  for (let i = 0; i < total; i++) {
    if (remainingBroken > 0) {
      slots.push("broken")
      remainingBroken--
    } else if (remainingBusy > 0) {
      slots.push("in-use")
      remainingBusy--
    } else {
      slots.push("available")
    }
  }
  return slots
}

export function estimateBrokenSlots(cab: Record<string, unknown>): number {
  if (typeof cab.brokenSlots === "number") return cab.brokenSlots
  if (cab.online === false) return 0
  if (cab.signal === "weak" && typeof cab.slots === "number") {
    return Math.min(1, cab.slots as number)
  }
  const remark = String(cab.remark || "").toLowerCase()
  if (remark.includes("repair") || remark.includes("broken")) return 1
  return 0
}
