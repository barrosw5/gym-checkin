import type { Meta, StoryObj } from "@storybook/react-vite";
import OccupancyCounterView from "./OccupancyCounterView";
import ReceptionScreenView from "./ReceptionScreenView";

const meta = {
  title: "Reception/QrScreen",
  component: ReceptionScreenView,
  parameters: { layout: "fullscreen" },
  args: {
    qrUrl: "https://gym-checkin-pjyi.onrender.com/c/Zq3xP0kR7yVw2mN8bL4tHA",
    stale: false,
    occupancy: <OccupancyCounterView occupancy={{ count: 4, capacity: 10, isFull: false }} stale={false} />,
  },
} satisfies Meta<typeof ReceptionScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Live: Story = {};
export const Generating: Story = { args: { qrUrl: null } };
/** The last QR stays (still valid briefly) while the API is unreachable. */
export const Offline: Story = { args: { stale: true } };
