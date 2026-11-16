import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  // Stories live next to their component: Button.tsx + Button.stories.tsx
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    // Docs page per component, generated from the props and the stories
    "@storybook/addon-docs",
    // Accessibility checks (contrast, labels, roles) on every story
    "@storybook/addon-a11y",
  ],
  // Reuses vite.config.ts, so Tailwind and the app's setup apply as-is
  framework: { name: "@storybook/react-vite", options: {} },
  // No usage data sent to Storybook (privacy by default)
  core: { disableTelemetry: true },
};

export default config;
