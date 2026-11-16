import type { Meta, StoryObj } from "@storybook/react-vite";
import OccupancyCounterView from "./OccupancyCounterView";

const meta = {
  title: "Student/OccupancyCounter",
  component: OccupancyCounterView,
  args: { occupancy: { count: 3, capacity: 10, isFull: false }, stale: false },
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
} satisfies Meta<typeof OccupancyCounterView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = { args: { occupancy: null } };
export const Empty: Story = { args: { occupancy: { count: 0, capacity: 10, isFull: false } } };
export const SomePeople: Story = {};
export const AlmostFull: Story = { args: { occupancy: { count: 9, capacity: 10, isFull: false } } };
export const Full: Story = { args: { occupancy: { count: 10, capacity: 10, isFull: true } } };
/** Over capacity (informative only: entry is never blocked). */
export const OverCapacity: Story = { args: { occupancy: { count: 12, capacity: 10, isFull: true } } };
/** Big gyms: a single bar instead of one block per place. */
export const LargeCapacity: Story = { args: { occupancy: { count: 31, capacity: 40, isFull: false } } };
export const Reconnecting: Story = { args: { stale: true } };
