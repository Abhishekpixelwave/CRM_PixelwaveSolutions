"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">This page couldn&apos;t load</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          A server error occurred while loading this page. If you&apos;re on the
          hosted demo, ensure{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">DEMO_MODE=true</code>{" "}
          is set in Vercel and redeploy.
        </p>
      </div>
      <Button onClick={() => reset()}>Reload</Button>
    </div>
  )
}
