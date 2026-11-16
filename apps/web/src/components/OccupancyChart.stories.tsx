import type { Meta, StoryObj } from "@storybook/react-vite";
import OccupancyChart from "./OccupancyChart";
import { stats, todayStats } from "./stats.fixtures";

const meta = {
  title: "Stats/OccupancyChart",
  component: OccupancyChart,
  args: { rows: stats.chart, showTypical: true, summary: "Num dia típico, a hora com mais gente é às 18h, com 4,1 pessoas em média." },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
} satisfies Meta<typeof OccupancyChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TodayOverTypicalDay: Story = {};
export const TodayOnly: Story = {
  args: { rows: todayStats.chart, showTypical: false, summary: "Hoje estiveram no máximo 5 pessoas ao mesmo tempo, às 18:20." },
};
