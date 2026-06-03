/** Bajie cabinet screen ad zones — ads display on the physical machine LCD */

export type CabinetScreenPosition = "0" | "1" | "2" | "3"

export const CABINET_SCREEN_POSITIONS: Array<{
  value: CabinetScreenPosition
  label: string
  description: string
}> = [
  {
    value: "0",
    label: "Main screen",
    description: "Center display — primary ad zone on the cabinet LCD",
  },
  {
    value: "1",
    label: "Lower left",
    description: "Bottom-left panel on the LCD, beside the QR code",
  },
  {
    value: "2",
    label: "Lower right",
    description: "Bottom-right panel on the LCD, beside the QR code",
  },
  {
    value: "3",
    label: "QR code logo",
    description: "Logo overlay inside the rental QR code",
  },
]

export function buildScreenAdCode(
  slotCount: number,
  position: CabinetScreenPosition
): string {
  return `P_GG_${slotCount}_TYPE,${position}`
}

export function getScreenPositionLabel(code: string): string {
  const match = code.match(/,(\d)$/)
  const pos = (match?.[1] ?? "0") as CabinetScreenPosition
  return (
    CABINET_SCREEN_POSITIONS.find((p) => p.value === pos)?.label ?? "Main screen"
  )
}

export function parseScreenPosition(code: string): CabinetScreenPosition {
  const match = code.match(/,(\d)$/)
  const pos = match?.[1]
  if (pos === "1" || pos === "2" || pos === "3") return pos
  return "0"
}
