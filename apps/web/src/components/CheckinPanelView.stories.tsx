import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import CheckinPanelView from "./CheckinPanelView";

const BOTH_METHODS = ["SCREEN_QR", "RECEPTION_APPROVAL"] as const;

const meta = {
  title: "Student/CheckinPanel",
  component: CheckinPanelView,
  args: {
    state: { status: "out", methods: [...BOTH_METHODS] },
    busy: false,
    message: null,
    onReload: fn(),
    onRequestEntry: fn(),
    onLeave: fn(),
  },
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
} satisfies Meta<typeof CheckinPanelView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = { args: { state: { status: "loading" } } };
export const Out: Story = {};
export const OutQrOnly: Story = { args: { state: { status: "out", methods: ["SCREEN_QR"] } } };
export const Requesting: Story = { args: { busy: true } };
export const Waiting: Story = { args: { state: { status: "waiting" } } };
export const Rejected: Story = { args: { message: { key: "errors.checkin.rejected" } } };
export const Expired: Story = { args: { message: { key: "errors.checkin.expired" } } };
export const In: Story = {
  args: { state: { status: "in", session: { id: "s1", entryAt: new Date("2026-11-16T18:05:00") } } },
};
export const Leaving: Story = { args: { ...In.args, busy: true } };
export const Error: Story = { args: { state: { status: "error" } } };
