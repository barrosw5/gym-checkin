import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import UsersAdminView from "./UsersAdminView";

const users = [
  { id: "u1", name: "Administrador", room: "N/A", username: "admin", role: "ADMIN" as const, active: true },
  { id: "u2", name: "Maria Receção", room: "R/C", username: "rececao", role: "RECEPTION" as const, active: true },
  { id: "u3", name: "Ana Ferreira", room: "214", username: "ana.ferreira", role: "STUDENT" as const, active: true },
  { id: "u4", name: "Tiago Matos", room: "305", username: "tiago.matos", role: "STUDENT" as const, active: false },
];

const meta = {
  title: "Admin/Users",
  component: UsersAdminView,
  parameters: { layout: "fullscreen" },
  args: {
    users,
    failed: false,
    importResult: null,
    busy: false,
    message: null,
    onReload: fn(),
    onImport: fn(),
    onClearImport: fn(),
    onUpdate: fn(),
  },
  decorators: [(Story) => <div className="max-w-6xl bg-slate-50 p-6">{Story()}</div>],
} satisfies Meta<typeof UsersAdminView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Accounts: Story = {};
export const Loading: Story = { args: { users: null } };
export const Importing: Story = { args: { busy: true } };
export const ImportErrors: Story = {
  args: {
    importResult: {
      ok: false,
      errors: [
        { line: 2, messages: [{ key: "errors.import.nameRequired" }] },
        { line: 3, messages: [{ key: "errors.import.exists", params: { username: "ana.ferreira" } }] },
      ],
    },
  },
};
/** Temporary passwords are shown once, then hidden. */
export const Imported: Story = {
  args: {
    importResult: {
      ok: true,
      created: [
        { name: "Inês Rocha", username: "ines.rocha", temporaryPassword: "q7Vt2mLx9cNe" },
        { name: "João Pires", username: "joao.pires", temporaryPassword: "Hb4sP0wZr1Ka" },
      ],
    },
  },
};
export const CannotDeactivateSelf: Story = { args: { message: { key: "errors.users.cannotDeactivateSelf" } } };
