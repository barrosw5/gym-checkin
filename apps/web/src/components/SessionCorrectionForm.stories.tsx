import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import SessionCorrectionForm from "./SessionCorrectionForm";

const closed = {
  id: "s1",
  entryAt: new Date("2026-11-16T18:05:00"),
  exitAt: new Date("2026-11-16T19:20:00"),
  closedBy: "USER",
  name: "Ana Ferreira",
  room: "214",
};

const meta = {
  title: "Reception/SessionCorrectionForm",
  component: SessionCorrectionForm,
  args: { session: closed, busy: false, onSave: fn() },
  decorators: [(Story) => <div className="max-w-2xl">{Story()}</div>],
} satisfies Meta<typeof SessionCorrectionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ClosedSession: Story = {};
/** Still in the gym: the exit field starts empty (empty = unchanged). */
export const OpenSession: Story = { args: { session: { ...closed, exitAt: null, closedBy: null } } };
export const Saving: Story = { args: { busy: true } };
