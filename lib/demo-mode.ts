/** Mock data + any-credentials login (local dev or DEMO_MODE=true on Vercel). */
export function isDemoMode(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.DEMO_MODE === "true"
  )
}

/** Client-safe check — set via next.config env from DEMO_MODE. */
export function isDemoModeClient(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  )
}
