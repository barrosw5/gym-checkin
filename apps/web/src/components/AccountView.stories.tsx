import type { Meta, StoryObj } from "@storybook/react-vite";
import { LogOut } from "lucide-react";
import type { User } from "../core/types/user";
import AccountView from "./AccountView";
import Button from "./ui/Button";
import { ICON } from "./ui/icon";

const member: User = {
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
  title: "Components/Account",
  component: AccountView,
  args: {
    user: member,
    logout: (
      <Button variant="secondary" fullWidth>
        <LogOut {...ICON} />
        Terminar sessão
      </Button>
    ),
  },
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
} satisfies Meta<typeof AccountView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Public demo account: the password cannot change. */
export const DemoMember: Story = {};
export const Staff: Story = {
  args: { user: { ...member, name: "Administrador", username: "admin", role: "ADMIN", isDemo: false } },
};
