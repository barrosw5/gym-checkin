import { useContext } from "react";
import { ThemeContext } from "../core/theme/context";

/** The active theme (light or dark) and the way to change it. */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
};
