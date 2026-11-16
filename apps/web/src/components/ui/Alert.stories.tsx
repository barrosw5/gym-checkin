import type { Meta, StoryObj } from "@storybook/react-vite";
import Alert from "./Alert";

const meta = {
  title: "UI/Alert",
  component: Alert,
  args: { children: "O código expirou. Volta a ler o QR no ecrã da receção." },
  argTypes: { tone: { control: "inline-radio", options: ["error", "warning", "info", "success"] } },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = { args: { tone: "error" } };
export const Warning: Story = { args: { tone: "warning", children: "O ginásio está cheio." } };
export const Info: Story = { args: { tone: "info", children: "À espera que a receção aceite o teu pedido..." } };
export const Success: Story = { args: { tone: "success", children: "Password mudada." } };
