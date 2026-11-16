import type { Meta, StoryObj } from "@storybook/react-vite";
import StatsLink from "./StatsLink";

const meta = {
  title: "Components/StatsLink",
  component: StatsLink,
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
} satisfies Meta<typeof StatsLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Stateless: one story. The router comes from .storybook/preview.tsx. */
export const Default: Story = {};
