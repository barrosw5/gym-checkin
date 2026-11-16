import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import SessionsTodayView from "./SessionsTodayView";

const at = (time: string) => new Date(`2026-11-16T${time}`);

const meta = {
  title: "Reception/SessionsToday",
  component: SessionsTodayView,
  args: {
    sessions: [
      { id: "s1", name: "Ana Ferreira", room: "214", entryAt: at("18:05:00"), exitAt: null, closedBy: null },
      { id: "s2", name: "Rui Costa", room: "102", entryAt: at("17:20:00"), exitAt: at("18:31:00"), closedBy: "USER" },
      { id: "s3", name: "Marta Lopes", room: "411", entryAt: at("07:10:00"), exitAt: at("09:10:00"), closedBy: "AUTO" },
    ],
    failed: false,
    busyId: null,
    message: null,
    onReload: fn(),
    onCloseNow: fn(),
    onCorrect: fn(async () => true),
  },
  decorators: [(Story) => <div className="max-w-2xl">{Story()}</div>],
} satisfies Meta<typeof SessionsTodayView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = { args: { sessions: null } };
export const Empty: Story = { args: { sessions: [] } };
export const Day: Story = {};
export const Closing: Story = { args: { busyId: "s1" } };
export const ExitBeforeEntry: Story = { args: { message: { key: "errors.sessions.exitBeforeEntry" } } };
export const LoadFailed: Story = { args: { sessions: null, failed: true } };
