import type { Meta, StoryObj } from "@storybook/react-vite";
import { emptyStats, stats, todayStats } from "./stats.fixtures";
import StatsHighlights from "./StatsHighlights";

const meta = {
  title: "Stats/Highlights",
  component: StatsHighlights,
  args: { stats },
  decorators: [(Story) => <div className="max-w-6xl">{Story()}</div>],
} satisfies Meta<typeof StatsHighlights>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Period: Story = {};
export const Today: Story = { args: { stats: todayStats } };
export const NoVisits: Story = { args: { stats: emptyStats } };
export const OnPhone: Story = { globals: { viewport: { value: "mobile1" } } };
