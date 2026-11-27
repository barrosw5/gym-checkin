import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "../hooks/useTranslation";
import { ICON } from "./ui/icon";

/** Light/dark switch. Until it is used, the app follows the device. */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const next = theme === "dark" ? "light" : "dark";
  const label = t(next === "dark" ? "theme.toDark" : "theme.toLight");

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      // The name says what the button does; the icon shows where it leads
      aria-label={label}
      title={label}
      // Looks 36 px (fits the header); the invisible ::before makes the tap area 44 px
      className="relative grid h-9 w-11 place-items-center rounded-lg bg-raised text-ink-2 transition-colors duration-150 before:absolute before:inset-x-0 before:-inset-y-1 hover:text-ink"
    >
      {next === "dark" ? <Moon {...ICON} /> : <Sun {...ICON} />}
    </button>
  );
}
