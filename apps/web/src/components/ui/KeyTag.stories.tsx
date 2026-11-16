import type { Meta, StoryObj } from "@storybook/react-vite";
import KeyTag from "./KeyTag";

/**
 * The signature detail: room numbers as the brass tags on the reception
 * key board. Only for rooms.
 */
const meta = {
  title: "UI/KeyTag",
  component: KeyTag,
  args: { room: "214" },
} satisfies Meta<typeof KeyTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Room: Story = {};
export const LongRoom: Story = { args: { room: "R/C B" } };
export const InARow: Story = {
  render: (args) => (
    <p className="flex items-center gap-2 font-medium text-slate-900">
      Ana Ferreira
      <KeyTag {...args} />
    </p>
  ),
};
