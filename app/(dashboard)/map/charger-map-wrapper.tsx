"use client"

import dynamic from "next/dynamic"
import type { ChargerMapLocation } from "@/lib/charger-map-data"

const ChargerMap = dynamic(
  () => import("./charger-map").then((m) => m.ChargerMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[480px] items-center justify-center rounded-xl border bg-muted/20">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-boost border-t-transparent" />
          Loading map…
        </div>
      </div>
    ),
  }
)

export function ChargerMapWrapper({
  locations,
  center,
}: {
  locations: ChargerMapLocation[]
  center: [number, number]
}) {
  return <ChargerMap locations={locations} center={center} />
}
