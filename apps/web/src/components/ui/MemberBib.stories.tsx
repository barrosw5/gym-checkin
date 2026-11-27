import type { Meta, StoryObj } from "@storybook/react-vite";
import MemberBib from "./MemberBib";

/**
 * The signature detail: member numbers as race bibs. Only for member numbers.
 */
const meta = {
  title: "UI/MemberBib",
  component: MemberBib,
  args: { room: "214" },
} satisfies Meta<typeof MemberBib>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Room: Story = {};
export const LongRoom: Story = { args: { room: "R/C B" } };
export const InARow: Story = {
  render: (args) => (
    <p className="flex items-center gap-2 font-medium text-ink">
      Ana Ferreira
      <MemberBib {...args} />
    </p>
  ),
};
