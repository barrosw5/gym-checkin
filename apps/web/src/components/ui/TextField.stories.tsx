import type { Meta, StoryObj } from "@storybook/react-vite";
import TextField from "./TextField";

const meta = {
  title: "UI/TextField",
  component: TextField,
  args: { label: "Username", placeholder: "joaosilva" },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Filled: Story = { args: { defaultValue: "joaosilva" } };
export const Password: Story = { args: { label: "Password", type: "password", defaultValue: "segredo123" } };
export const WithError: Story = {
  args: { label: "Nova password", type: "password", error: "A nova password tem de ter pelo menos 10 caracteres." },
};
