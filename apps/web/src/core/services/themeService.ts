import type { Theme } from "../types/theme";

// localStorage holds only this UI preference, never tokens (CLAUDE.md).
// index.html repeats this key: it must pick the theme before the app loads
const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Browser bar colour on phones: the header surface of each theme. */
export const THEME_COLOR: Record<Theme, string> = { light: "#ffffff", dark: "#18181b" };

export const themeService = {
  /** The user's own choice, or null: then the app follows the device. */
  getSavedTheme: (): Theme | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch {
      // Storage blocked (private mode): follow the device
    }
    return null;
  },

  saveTheme: (theme: Theme): void => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Not saved: the choice still applies until the page is reloaded
    }
  },

  getSystemTheme: (): Theme => (matchMedia(DARK_QUERY).matches ? "dark" : "light"),

  /** Calls back when the device switches theme (e.g. at sunset). Returns the cleanup. */
  watchSystemTheme: (onChange: (theme: Theme) => void): (() => void) => {
    const query = matchMedia(DARK_QUERY);
    const listener = () => onChange(query.matches ? "dark" : "light");
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  },
};
