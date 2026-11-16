import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import Button from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: { children: "Pedir entrada à receção", onClick: fn() },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "success", "warning", "danger", "ghost"] },
    size: { control: "inline-radio", options: ["md", "lg"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary", children: "Terminar sessão" } };
export const Warning: Story = { args: { variant: "warning", children: "Sair do ginásio" } };
export const Success: Story = { args: { variant: "success", children: "Aceitar" } };
export const Danger: Story = { args: { variant: "danger", children: "Rejeitar" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Mudar password" } };
export const Large: Story = { args: { size: "lg" } };
export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };

/** The main action on a phone: full width, large. */
export const MobileMainAction: Story = {
  args: { size: "lg", fullWidth: true },
  globals: { viewport: { value: "mobile1" } },
};

/** All variants side by side, to compare the palette. */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {(["primary", "secondary", "success", "warning", "danger", "ghost"] as const).map((v) => (
        <Button key={v} {...args} variant={v}>
          {v}
        </Button>
      ))}
    </div>
  ),
};
