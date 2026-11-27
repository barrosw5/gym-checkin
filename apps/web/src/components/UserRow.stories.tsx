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
  args: { user: student, busy: false, readOnly: false, editing: false, onToggle: fn(), onUpdate: fn() },
  // A row is a <tr>: render it inside a table, as UsersAdminView does
  decorators: [
    (Story) => (
      <table className="w-full max-w-3xl bg-surface">
        <tbody>{Story()}</tbody>
      </table>
    ),
  ],
} satisfies Meta<typeof UserRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {};
export const Deactivated: Story = { args: { user: { ...student, active: false } } };
export const Staff: Story = {
  args: { user: { id: "u2", name: "Maria Receção", room: "R/C", username: "rececao", role: "RECEPTION", active: true } },
};
export const Editing: Story = { args: { editing: true } };
/** Demo admin: the actions exist, switched off, with the reason. */
export const EditingInDemo: Story = { args: { editing: true, readOnly: true } };
/** While an update is saving, both actions are disabled. */
export const Busy: Story = { args: { editing: true, busy: true } };
/** A long username with no spaces must wrap, not overflow (check at 360 px). */
export const LongUsername: Story = {
  args: { user: { ...student, name: "Maria Inês Albuquerque", username: "maria.ines.albuquerque.santos" } },
};
