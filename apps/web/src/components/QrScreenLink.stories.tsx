import type { Meta, StoryObj } from "@storybook/react-vite";
import QrScreenLink from "./QrScreenLink";

const meta = {
  title: "Reception/QrScreenLink",
  component: QrScreenLink,
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
} satisfies Meta<typeof QrScreenLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Stateless: one story. The router comes from .storybook/preview.tsx. */
export const Default: Story = {};
