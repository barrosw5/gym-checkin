import type { Meta, StoryObj } from "@storybook/react-vite";
import CheckinPanelView from "./CheckinPanelView";
import QrCheckinView from "./QrCheckinView";

const leave = (
  <CheckinPanelView
    state={{ status: "in", session: { id: "s1", entryAt: new Date("2026-11-16T18:05:00") } }}
    busy={false}
    message={null}
    onReload={() => undefined}
    onRequestEntry={() => undefined}
    onLeave={() => undefined}
  />
);

const meta = {
  title: "Student/QrCheckin",
  component: QrCheckinView,
  args: { state: { status: "working" }, alreadyIn: leave },
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
} satisfies Meta<typeof QrCheckinView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Working: Story = {};
export const CheckedIn: Story = {
  args: { state: { status: "checked-in", session: { id: "s1", entryAt: new Date("2026-11-16T18:05:00") } } },
};
/** Scanned on the way out: offers to leave right there. */
export const AlreadyIn: Story = { args: { state: { status: "already-in" } } };
export const Expired: Story = {
  args: { state: { status: "error", message: { key: "errors.checkin.qrExpired" } } },
};
