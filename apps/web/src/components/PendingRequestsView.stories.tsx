import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import PendingRequestsView from "./PendingRequestsView";

const at = (time: string) => new Date(`2026-11-16T${time}`);

const meta = {
  title: "Reception/PendingRequests",
  component: PendingRequestsView,
  args: {
    requests: [
      { id: "r1", name: "Ana Ferreira", room: "214", createdAt: at("18:02:14") },
      { id: "r2", name: "Tiago Matos", room: "305", createdAt: at("18:03:40") },
    ],
    stale: false,
    busyId: null,
    message: null,
    onDecide: fn(),
  },
  decorators: [(Story) => <div className="max-w-2xl">{Story()}</div>],
} satisfies Meta<typeof PendingRequestsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = { args: { requests: null } };
export const Empty: Story = { args: { requests: [] } };
export const TwoWaiting: Story = {};
export const Deciding: Story = { args: { busyId: "r1" } };
export const AlreadyDecided: Story = { args: { message: { key: "errors.requests.notPending" } } };
export const Reconnecting: Story = { args: { stale: true } };
