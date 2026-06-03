const STATE_TO_REGION: Record<string, string> = {
  NY: "Northeast",
  NJ: "Northeast",
  PA: "Northeast",
  MA: "Northeast",
  CT: "Northeast",
  CA: "West",
  WA: "West",
  OR: "West",
  NV: "West",
  AZ: "West",
  IL: "Midwest",
  OH: "Midwest",
  MI: "Midwest",
  WI: "Midwest",
  MN: "Midwest",
  FL: "South",
  TX: "South",
  GA: "South",
  NC: "South",
  LA: "South",
}

export function parseStateFromAddress(address: string): string {
  const match = address.match(/,\s*([A-Z]{2})\s+\d{5}/)
  if (match) return match[1]

  const parts = address.split(",").map((p) => p.trim())
  const last = parts[parts.length - 1] || ""
  const stateOnly = last.match(/^([A-Z]{2})$/)
  if (stateOnly) return stateOnly[1]

  return "Unknown"
}

export function stateToRegion(state: string): string {
  return STATE_TO_REGION[state] || "Other"
}

export const US_REGIONS = [
  "Northeast",
  "West",
  "Midwest",
  "South",
  "Other",
] as const

export type UsRegion = (typeof US_REGIONS)[number]
