"use client"

import { cn } from "@/lib/utils"
import type { CabinetScreenPosition } from "@/lib/cabinet-screen-ads"

const ZONE_LABEL: Record<CabinetScreenPosition, string> = {
  "0": "Main",
  "1": "Lower left",
  "2": "Lower right",
  "3": "QR logo",
}

function ZoneContent({
  position,
  activePosition,
  mediaUrl,
  label,
}: {
  position: CabinetScreenPosition
  activePosition: CabinetScreenPosition
  mediaUrl?: string
  label: string
}) {
  const active = position === activePosition
  const showMedia = active && mediaUrl

  return (
    <>
      {showMedia ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl}
          alt={`${label} ad`}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none"
          }}
        />
      ) : active ? (
        <span className="relative z-10 px-1 text-center text-[8px] font-medium leading-tight text-boost">
          Your ad here
        </span>
      ) : (
        <span className="relative z-10 text-[7px] text-zinc-500">{label}</span>
      )}
    </>
  )
}

export function CabinetScreenPreview({
  position = "0",
  mediaUrl,
  className,
}: {
  position?: CabinetScreenPosition
  mediaUrl?: string
  className?: string
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[220px]", className)}>
      <p className="mb-2 text-center text-xs font-medium text-muted-foreground">
        Kiosk screen preview
      </p>

      {/* Cabinet body */}
      <div className="rounded-xl border-2 border-zinc-700 bg-zinc-900 p-2 shadow-lg">
        {/* ── LCD (single display — all zones are ON this surface) ── */}
        <div className="relative aspect-[9/16] overflow-hidden rounded-md bg-black ring-2 ring-zinc-600">
          {/* Main screen zone — fills LCD above bottom row */}
          <div
            className={cn(
              "absolute inset-x-0 top-0 bottom-[30%] flex items-center justify-center overflow-hidden bg-zinc-900",
              position === "0" && "ring-2 ring-inset ring-boost"
            )}
          >
            <ZoneContent
              position="0"
              activePosition={position}
              mediaUrl={mediaUrl}
              label="Main screen"
            />
          </div>

          {/* Bottom row — still ON the LCD, not below it */}
          <div className="absolute inset-x-0 bottom-0 flex h-[30%] border-t border-zinc-700/80 bg-zinc-950">
            {/* Lower left — bottom-left of LCD */}
            <div
              className={cn(
                "relative flex flex-1 items-center justify-center overflow-hidden border-r border-zinc-700/80",
                position === "1" && "ring-2 ring-inset ring-boost bg-boost/10"
              )}
            >
              <ZoneContent
                position="1"
                activePosition={position}
                mediaUrl={mediaUrl}
                label="Lower left"
              />
            </div>

            {/* QR — bottom-center of LCD */}
            <div
              className={cn(
                "relative flex w-[34%] shrink-0 flex-col items-center justify-center gap-0.5 border-r border-zinc-700/80 bg-zinc-900 px-0.5",
                position === "3" && "ring-2 ring-inset ring-boost bg-boost/10"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded border-2 bg-white text-[7px] font-bold text-zinc-900",
                  position === "3" ? "border-boost" : "border-zinc-400"
                )}
              >
                QR
              </div>
              <span className="text-[6px] text-zinc-500">Scan to rent</span>
              {position === "3" && mediaUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaUrl}
                  alt="QR logo"
                  className="absolute inset-0 h-full w-full object-contain p-2 opacity-90"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              )}
            </div>

            {/* Lower right — bottom-right of LCD */}
            <div
              className={cn(
                "relative flex flex-1 items-center justify-center overflow-hidden",
                position === "2" && "ring-2 ring-inset ring-boost bg-boost/10"
              )}
            >
              <ZoneContent
                position="2"
                activePosition={position}
                mediaUrl={mediaUrl}
                label="Lower right"
              />
            </div>
          </div>

          {/* LCD gloss */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
        </div>

        {/* Physical battery slots — below LCD, not part of the display */}
        <div className="mt-2 grid grid-cols-4 gap-1 px-0.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-2 rounded-sm bg-zinc-700"
              title="Battery slot"
            />
          ))}
        </div>
        <p className="mt-1 text-center text-[9px] text-zinc-500">
          Screen above · slots below
        </p>
      </div>

      <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
        Active zone: <span className="font-medium text-boost">{ZONE_LABEL[position]}</span>
      </p>
    </div>
  )
}
