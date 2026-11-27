import type { Meta, StoryObj } from "@storybook/react-vite";
import BestHoursCard from "./BestHoursCard";

const meta = {
  title: "Stats/BestHoursCard",
  component: BestHoursCard,
  args: {
    best: [
      { hour: 15, average: 1.2 },
      { hour: 22, average: 0.8 },
    ],
  },
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
} satisfies Meta<typeof BestHoursCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoHours: Story = {};
/** Late in the day, or no history for this weekday yet. */
export const None: Story = { args: { best: [] } };
