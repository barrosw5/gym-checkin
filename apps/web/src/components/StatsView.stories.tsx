import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { emptyStats, stats, todayStats } from "./stats.fixtures";
import StatsView from "./StatsView";

const meta = {
  title: "Stats/StatsView",
  component: StatsView,
  args: { range: "month", onRangeChange: fn(), stats, loading: false, failed: false, onReload: fn() },
  decorators: [(Story) => <div className="max-w-6xl">{Story()}</div>],
} satisfies Meta<typeof StatsView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Typical day behind today, best hours, durations and the heatmap. */
export const Month: Story = {};
/** Today only: the exact step line, no heatmap or best hours. */
export const Today: Story = { args: { range: "today", stats: todayStats } };
export const FirstLoad: Story = { args: { stats: null, loading: true } };
/** Another period is loading: the old numbers stay, dimmed. */
export const SwitchingPeriod: Story = { args: { range: "quarter", loading: true } };
export const Failed: Story = { args: { stats: null, failed: true } };
export const NoVisits: Story = { args: { stats: emptyStats } };
