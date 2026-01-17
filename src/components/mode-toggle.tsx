import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/80 hover:bg-secondary text-foreground transition-all focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Alternar tema"
        >
            {/* Se o tema for ESCURO, mostre a LUA. Senão, mostre o SOL */}
            {theme === "dark" ? (
                <Moon className="h-5 w-5 text-blue-500 animate-in spin-in-90 duration-300" />
            ) : (
                <Sun className="h-5 w-5 text-amber-500 animate-in spin-in-90 duration-300" />
            )}
            
            <span className="sr-only">Alternar tema</span>
        </button>
    )
}