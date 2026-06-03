"use client"

import { Moon, Sun, Stars } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"
import type { AppTheme } from "@/lib/theme"

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "night", label: "Night", icon: Stars },
] as const

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme()
  const active = theme === "system" ? resolvedTheme : theme
  const ActiveIcon =
    THEMES.find((t) => t.value === active)?.icon ?? Sun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className={className}
          aria-label="Toggle theme"
        >
          {mounted ? (
            <ActiveIcon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {THEMES.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value as AppTheme)}
            className={mounted && active === value ? "bg-boost/10 text-boost" : undefined}
          >
            <Icon className="h-4 w-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
