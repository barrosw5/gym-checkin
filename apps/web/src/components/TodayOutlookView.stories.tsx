import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { emptyStats, stats } from "./stats.fixtures";
import TodayOutlookView from "./TodayOutlookView";

const meta = {
  title: "Stats/TodayOutlook",
  component: TodayOutlookView,
  args: { stats, failed: false, onReload: fn() },
  decorators: [(Story) => <div className="max-w-6xl">{Story()}</div>],
} satisfies Meta<typeof TodayOutlookView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {};
export const Loading: Story = { args: { stats: null } };
export const Failed: Story = { args: { stats: null, failed: true } };
export const NoVisits: Story = { args: { stats: emptyStats } };
