import type { Meta, StoryObj } from "@storybook/react-vite";
import StatsHeatmap from "./StatsHeatmap";
import { stats } from "./stats.fixtures";

const meta = {
  title: "Stats/StatsHeatmap",
  component: StatsHeatmap,
  args: { heatmap: stats.heatmap, todayWeekday: 2 },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
} satisfies Meta<typeof StatsHeatmap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Month: Story = {};
/** A short period: hours never seen are "no data", not "empty". */
export const WithGaps: Story = {
  args: { heatmap: stats.heatmap.map((row, day) => row.map((v, hour) => (day > 3 && hour > 12 ? null : v))) },
};
