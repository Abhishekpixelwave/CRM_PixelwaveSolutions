export const THEME_STORAGE_KEY = "theme"

export const APP_THEMES = ["light", "dark", "night"] as const
export type AppTheme = (typeof APP_THEMES)[number]
export type ThemeSetting = AppTheme | "system"

export function resolveTheme(theme: ThemeSetting): AppTheme {
  if (theme === "system") {
    if (typeof window === "undefined") return "light"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }
  return theme
}

export function applyThemeClass(resolved: AppTheme) {
  const root = document.documentElement
  root.classList.remove("light", "dark", "night")
  root.classList.add(resolved)
  root.dataset.theme = resolved
  root.style.colorScheme = resolved === "light" ? "light" : "dark"
}

export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k)||"system";var themes=${JSON.stringify(APP_THEMES)};var r=t;if(t==="system"){r=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}if(themes.indexOf(r)===-1){r="light";}var d=document.documentElement;d.classList.remove("light","dark","night");d.classList.add(r);d.dataset.theme=r;d.style.colorScheme=r==="light"?"light":"dark";}catch(e){}})();`
