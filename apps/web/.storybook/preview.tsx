import type { Preview } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { LocaleContext } from "../src/core/i18n/context";
import type { Locale } from "../src/core/i18n/types";
import { ThemeContext } from "../src/core/theme/context";
import type { Theme } from "../src/core/types/theme";
import "../src/index.css";

const preview: Preview = {
  // Toolbar switches: every story in both languages and both themes
  globalTypes: {
    locale: {
      description: "Language",
      toolbar: {
        title: "Language",
        icon: "globe",
        items: [
          { value: "pt", title: "Português" },
          { value: "en", title: "English" },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      description: "Theme",
      toolbar: {
        title: "Theme",
        icon: "contrast",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { locale: "pt", theme: "light" },

  decorators: [
    // Language and theme from the toolbar (not localStorage), router for <Link>
    (Story, context) => {
      const theme = context.globals.theme as Theme;
      // The same attribute ThemeProvider sets in the app
      document.documentElement.dataset.theme = theme;

      return (
        <ThemeContext.Provider value={{ theme, setTheme: () => undefined }}>
          <LocaleContext.Provider
            value={{ locale: context.globals.locale as Locale, setLocale: () => undefined }}
          >
            <MemoryRouter>
              <Story />
            </MemoryRouter>
          </LocaleContext.Provider>
        </ThemeContext.Provider>
      );
    },
  ],

  parameters: {
    layout: "padded",
    controls: { expanded: true },
    // Fail the a11y panel on violations instead of only listing them
    a11y: { test: "error" },
  },

  tags: ["autodocs"],
};

export default preview;
