import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  return (
    <header className="border-b">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-semibold text-sm">TOTP Studio</span>
        <ThemeToggle />
      </div>
    </header>
  )
}
