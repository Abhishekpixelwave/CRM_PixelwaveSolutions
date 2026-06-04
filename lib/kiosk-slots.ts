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

export function summarizeSlotStatuses(slots: SlotStatus[]) {
  return slots.reduce(
    (acc, status) => {
      acc[status]++
      return acc
    },
    { available: 0, "in-use": 0, broken: 0 } as Record<SlotStatus, number>
  )
}

export function getSlotGridLayout(slotCount: number) {
  if (slotCount <= 8) {
    return { cols: 4, dotClass: "h-3 w-3 rounded-sm", gapClass: "gap-0.5" }
  }
  if (slotCount <= 12) {
    return { cols: 4, dotClass: "h-2.5 w-2.5 rounded-sm", gapClass: "gap-0.5" }
  }
  if (slotCount <= 24) {
    return { cols: 6, dotClass: "h-2 w-2 rounded-full", gapClass: "gap-0.5" }
  }
  return { cols: 8, dotClass: "h-1.5 w-1.5 rounded-full", gapClass: "gap-px" }
}
