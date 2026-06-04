import { MOCK_TOKEN } from "./mock-data"

/** Mock data + any-credentials login (local dev, DEMO_MODE, or demo session token). */
export function isDemoMode(apiToken?: string | null): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.DEMO_MODE === "true" ||
    (!!apiToken && apiToken === MOCK_TOKEN)
  )
}

/** Client-safe check — set via next.config env from DEMO_MODE. */
export function isDemoModeClient(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  )
}
