import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import UserRow from "./UserRow";

const student = {
  id: "u3",
  name: "Ana Ferreira",
  room: "214",
  username: "ana.ferreira",
  role: "STUDENT" as const,
  active: true,
};

const meta = {
  title: "Admin/UserRow",
  component: UserRow,
  args: { user: student, busy: false, onUpdate: fn() },
  // A row is an <li>: render it inside a list, as UsersAdminView does
  decorators: [(Story) => <ul className="max-w-3xl divide-y divide-slate-200">{Story()}</ul>],
} satisfies Meta<typeof UserRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {};
export const Deactivated: Story = { args: { user: { ...student, active: false } } };
export const Staff: Story = {
  args: { user: { id: "u2", name: "Maria Receção", room: "R/C", username: "rececao", role: "RECEPTION", active: true } },
};
/** While an update is saving, both actions are disabled. */
export const Busy: Story = { args: { busy: true } };
