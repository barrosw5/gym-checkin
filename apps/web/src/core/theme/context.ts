import { createContext } from "react";
import type { Theme } from "../types/theme";

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

/** Filled by ThemeProvider (main.tsx); read through useTheme(). */
export const ThemeContext = createContext<ThemeContextValue | null>(null);
