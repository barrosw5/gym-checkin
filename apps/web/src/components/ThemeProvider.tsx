import { useEffect, useMemo, useState, type ReactNode } from "react";
import { THEME_COLOR, themeService } from "../core/services/themeService";
import { ThemeContext } from "../core/theme/context";

/** Holds the light/dark theme for the whole app (wraps <App /> in main.tsx). */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  // Two sources kept apart: the user's choice (may be none) and the device
  const [saved, setSaved] = useState(themeService.getSavedTheme);
  const [system, setSystem] = useState(themeService.getSystemTheme);
  const theme = saved ?? system;

  useEffect(() => themeService.watchSystemTheme(setSystem), []);

  useEffect(() => {
    // index.css switches every colour on this attribute
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (next: "light" | "dark") => {
        themeService.saveTheme(next);
        setSaved(next);
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
