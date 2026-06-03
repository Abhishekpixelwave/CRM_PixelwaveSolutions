"use client"

import * as React from "react"

import {
  APP_THEMES,
  applyThemeClass,
  resolveTheme,
  THEME_STORAGE_KEY,
  type AppTheme,
  type ThemeSetting,
} from "@/lib/theme"

const THEME_CYCLE = [...APP_THEMES] as const

type ThemeContextValue = {
  theme: ThemeSetting
  resolvedTheme: AppTheme
  setTheme: (theme: ThemeSetting) => void
  mounted: boolean
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function readStoredTheme(): ThemeSetting {
  if (typeof window === "undefined") return "system"
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === "light" || stored === "dark" || stored === "night") {
    return stored
  }
  if (stored === "system") return "system"
  return "system"
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeSetting>("system")
  const [resolvedTheme, setResolvedTheme] = React.useState<AppTheme>("light")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const stored = readStoredTheme()
    const resolved = resolveTheme(stored)
    setThemeState(stored)
    setResolvedTheme(resolved)
    applyThemeClass(resolved)
    setMounted(true)

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onSystemChange = () => {
      const current = readStoredTheme()
      if (current !== "system") return
      const next = resolveTheme("system")
      setResolvedTheme(next)
      applyThemeClass(next)
    }

    media.addEventListener("change", onSystemChange)
    return () => media.removeEventListener("change", onSystemChange)
  }, [])

  const setTheme = React.useCallback((next: ThemeSetting) => {
    setThemeState(next)
    localStorage.setItem(THEME_STORAGE_KEY, next)
    const resolved = resolveTheme(next)
    setResolvedTheme(resolved)
    applyThemeClass(resolved)
  }, [])

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme, mounted }),
    [theme, resolvedTheme, setTheme, mounted]
  )

  return (
    <ThemeContext.Provider value={value}>
      <ThemeHotkey />
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (!event.key || event.key.toLowerCase() !== "d") return
      if (isTypingTarget(event.target)) return

      const current =
        theme === "system"
          ? resolvedTheme
          : theme

      const idx = THEME_CYCLE.indexOf(current)
      const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]
      setTheme(next)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [theme, resolvedTheme, setTheme])

  return null
}

export { ThemeProvider, useTheme }
