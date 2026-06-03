"use client"

import { cn } from "@/lib/utils"

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

const SLOT_STYLE: Record<SlotStatus, string> = {
  available: "bg-boost/80",
  "in-use": "bg-amber-500/80",
  broken: "bg-destructive/80",
}

export function KioskSlotGrid({
  slots,
  compact = false,
  className,
}: {
  slots: SlotStatus[]
  compact?: boolean
  className?: string
}) {
  const cols = slots.length <= 6 ? 3 : 4

  return (
    <div
      className={cn("grid gap-0.5", className)}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {slots.map((status, i) => (
        <div
          key={i}
          title={`Slot ${i + 1}: ${status}`}
          className={cn(
            "rounded-sm",
            compact ? "h-2 w-2" : "h-3 min-w-3",
            SLOT_STYLE[status]
          )}
        />
      ))}
    </div>
  )
}

export function KioskHealthBadge({
  online,
  brokenSlots,
  weakSignal,
}: {
  online: boolean
  brokenSlots: number
  weakSignal: boolean
}) {
  if (!online) {
    return (
      <span className="text-xs font-medium text-destructive">Offline</span>
    )
  }
  if (brokenSlots > 0) {
    return (
      <span className="text-xs font-medium text-destructive">
        {brokenSlots} broken slot{brokenSlots !== 1 ? "s" : ""}
      </span>
    )
  }
  if (weakSignal) {
    return (
      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
        Weak signal
      </span>
    )
  }
  return (
    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
      Healthy
    </span>
  )
}
