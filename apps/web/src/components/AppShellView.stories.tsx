import type { Meta, StoryObj } from "@storybook/react-vite";
import { LogOut } from "lucide-react";
import type { User } from "../core/types/user";
import AppShellView from "./AppShellView";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { ICON } from "./ui/icon";
import Page from "./ui/Page";

const student: User = {
  id: "1",
  name: "João Silva",
  room: "501",
  username: "joaosilva",
  role: "STUDENT",
  active: true,
  createdAt: "2026-11-01T00:00:00Z",
  isDemo: true,
  mustChangePassword: false,
};

const meta = {
  title: "Layout/AppShell",
  component: AppShellView,
  parameters: { layout: "fullscreen" },
  args: {
    user: student,
    logout: (
      <Button variant="secondary" fullWidth>
        <LogOut {...ICON} />
        Terminar sessão
      </Button>
    ),
    children: (
      <Page width="wide" title="Hoje no ginásio">
        <Card title="Um cartão">Conteúdo</Card>
      </Page>
    ),
  },
} satisfies Meta<typeof AppShellView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Member: Story = {};
export const Reception: Story = { args: { user: { ...student, name: "Maria Receção", role: "RECEPTION" } } };
export const Admin: Story = { args: { user: { ...student, name: "Administrador", role: "ADMIN" } } };
/** The narrowest case: five tabs on a small phone. */
export const AdminOnPhone: Story = {
  args: { user: { ...student, name: "Administrador", role: "ADMIN" } },
  globals: { viewport: { value: "mobile1" } },
};
