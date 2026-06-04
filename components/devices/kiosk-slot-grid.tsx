"use client"

import { cn } from "@/lib/utils"
import {
  getSlotGridLayout,
  summarizeSlotStatuses,
  type SlotStatus,
} from "@/lib/kiosk-slots"

export type { SlotStatus } from "@/lib/kiosk-slots"

const SLOT_STYLE: Record<SlotStatus, string> = {
  available: "bg-boost/85",
  "in-use": "bg-amber-500/85",
  broken: "bg-destructive/85",
}

function SlotLegend({ counts }: { counts: Record<SlotStatus, number> }) {
  if (counts.available + counts["in-use"] + counts.broken === 0) return null

  return (
    <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] leading-none text-muted-foreground">
      {counts.available > 0 && (
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-boost/85" />
          {counts.available}
        </span>
      )}
      {counts["in-use"] > 0 && (
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500/85" />
          {counts["in-use"]}
        </span>
      )}
      {counts.broken > 0 && (
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-destructive/85" />
          {counts.broken}
        </span>
      )}
    </div>
  )
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
  const { cols, dotClass, gapClass } = getSlotGridLayout(slots.length)
  const counts = summarizeSlotStatuses(slots)
  const dense = slots.length > 12
  const showPerSlotTooltip = slots.length <= 24

  return (
    <div className={cn("min-w-0", className)}>
      <div
        className={cn("inline-grid", gapClass, dense && "max-w-[5.5rem]")}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        title={
          dense
            ? `${counts.available} available · ${counts["in-use"]} in use · ${counts.broken} broken (${slots.length} slots)`
            : undefined
        }
      >
        {slots.map((status, i) => (
          <div
            key={i}
            title={
              showPerSlotTooltip ? `Slot ${i + 1}: ${status}` : undefined
            }
            className={cn(
              "shrink-0",
              compact ? "h-1.5 w-1.5 rounded-full" : dotClass,
              SLOT_STYLE[status]
            )}
          />
        ))}
      </div>
      {dense && <SlotLegend counts={counts} />}
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
