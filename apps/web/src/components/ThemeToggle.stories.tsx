import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ThemeContext } from "../core/theme/context";
import type { Theme } from "../core/types/theme";
import ThemeToggle from "./ThemeToggle";

// Each story holds its own theme, so clicking the button changes the icon.
// The colours of the page follow the toolbar's "Theme" switch
function Standalone({ initial }: { initial: Theme }) {
  const [theme, setTheme] = useState(initial);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ThemeToggle />
    </ThemeContext.Provider>
  );
}

const meta = {
  title: "Components/ThemeToggle",
  component: ThemeToggle,
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** On the light theme: offers the dark one. */
export const OnLight: Story = { render: () => <Standalone initial="light" /> };
/** On the dark theme: offers the light one. */
export const OnDark: Story = { render: () => <Standalone initial="dark" /> };
