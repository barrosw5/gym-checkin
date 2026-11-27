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
  // The view is the whole page, title and import button included
  parameters: { layout: "fullscreen" },
  args: {
    users,
    failed: false,
    importResult: null,
    busy: false,
    message: null,
    readOnly: false,
    onReload: fn(),
    onImport: fn(),
    onClearImport: fn(),
    onUpdate: fn(),
  },
} satisfies Meta<typeof UsersAdminView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Accounts: Story = {};
export const Loading: Story = { args: { users: null } };
export const LoadFailed: Story = { args: { users: null, failed: true } };
export const DemoAdmin: Story = { args: { readOnly: true } };
export const Imported: Story = {
  args: {
    importResult: { ok: true, created: [{ name: "Inês Rocha", username: "ines.rocha", temporaryPassword: "q7Vt2mLx9cNe" }] },
  },
};
export const CannotDeactivateSelf: Story = { args: { message: { key: "errors.users.cannotDeactivateSelf" } } };
export const OnPhone: Story = { globals: { viewport: { value: "mobile1" } } };
