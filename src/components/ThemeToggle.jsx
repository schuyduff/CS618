import { useEffect, useState } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

const storageKey = "cs618-theme"
const next = { auto: "light", light: "dark", dark: "auto" }
const icons = { auto: Monitor, light: Sun, dark: Moon }

function initialTheme() {
  try {
    return localStorage.getItem(storageKey) || "auto"
  } catch {
    return "auto"
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const apply = () =>
      document.documentElement.classList.toggle(
        "dark",
        theme === "dark" || (theme === "auto" && media.matches),
      )
    apply()
    media.addEventListener("change", apply)
    try {
      localStorage.setItem(storageKey, theme)
    } catch {}
    return () => media.removeEventListener("change", apply)
  }, [theme])

  const Icon = icons[theme]
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`Color theme: ${theme}. Click to change.`}
      title={`Theme: ${theme}`}
      onClick={() => setTheme((t) => next[t])}
    >
      <Icon />
    </Button>
  )
}
