import type { Preview } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { LocaleContext } from "../src/core/i18n/context";
import type { Locale } from "../src/core/i18n/types";
import "../src/index.css";

const preview: Preview = {
  // A PT | EN switch in the toolbar: every story in both languages
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
  },
  initialGlobals: { locale: "pt" },

  decorators: [
    // Language from the toolbar (not localStorage), router for <Link>
    (Story, context) => (
      <LocaleContext.Provider
        value={{ locale: context.globals.locale as Locale, setLocale: () => undefined }}
      >
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </LocaleContext.Provider>
    ),
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
