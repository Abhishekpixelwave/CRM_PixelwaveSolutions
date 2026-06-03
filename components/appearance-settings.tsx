"use client"

import { Moon, Sun, Stars } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import type { AppTheme } from "@/lib/theme"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const THEMES = [
  { value: "light", label: "Light", description: "White canvas, black type", icon: Sun },
  { value: "dark", label: "Dark", description: "Charcoal canvas, white type", icon: Moon },
  { value: "night", label: "Night", description: "True black, high contrast", icon: Stars },
] as const

export function AppearanceSettings() {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme()
  const active = mounted
    ? theme === "system"
      ? resolvedTheme
      : theme
    : "light"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Boost green (#44D62C) accents with white and black surfaces. Press{" "}
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
            D
          </kbd>{" "}
          to cycle themes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {THEMES.map(({ value, label, description, icon: Icon }) => {
            const selected = active === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value as AppTheme)}
                className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors ${
                  selected
                    ? "border-boost bg-boost/10 ring-1 ring-boost/30"
                    : "border-border hover:border-boost/40 hover:bg-muted/50"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${selected ? "text-boost" : "text-muted-foreground"}`}
                />
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                {value === "light" && (
                  <div className="mt-1 flex gap-1">
                    <span className="h-3 w-3 rounded-full bg-white ring-1 ring-border" />
                    <span className="h-3 w-3 rounded-full bg-black" />
                    <span className="h-3 w-3 rounded-full bg-boost" />
                  </div>
                )}
                {value === "dark" && (
                  <div className="mt-1 flex gap-1">
                    <span className="h-3 w-3 rounded-full bg-zinc-800 ring-1 ring-border" />
                    <span className="h-3 w-3 rounded-full bg-white" />
                    <span className="h-3 w-3 rounded-full bg-boost" />
                  </div>
                )}
                {value === "night" && (
                  <div className="mt-1 flex gap-1">
                    <span className="h-3 w-3 rounded-full bg-black ring-1 ring-border" />
                    <span className="h-3 w-3 rounded-full bg-white" />
                    <span className="h-3 w-3 rounded-full bg-boost" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
