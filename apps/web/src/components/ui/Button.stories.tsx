import type { Meta, StoryObj } from "@storybook/react-vite";
import { LogIn } from "lucide-react";
import { fn } from "storybook/test";
import Button from "./Button";
import { ICON } from "./icon";

const meta = {
  title: "UI/Button",
  component: Button,
  args: { children: "Pedir entrada à receção", onClick: fn() },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "danger", "ghost"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The one filled button per screen: the main action. */
export const Primary: Story = {};
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <LogIn {...ICON} />
        Pedir entrada à receção
      </>
    ),
  },
};
export const Secondary: Story = { args: { variant: "secondary", children: "Terminar sessão" } };
/** Destructive but quiet: red text on white, never a red block. */
export const Danger: Story = { args: { variant: "danger", children: "Desativar" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Corrigir" } };
export const Small: Story = { args: { size: "sm", children: "Aceitar" } };
export const Large: Story = { args: { size: "lg" } };
export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };
export const FullWidth: Story = {
  args: { size: "lg", fullWidth: true },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
};

/** All variants side by side, to compare the palette. */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {(["primary", "secondary", "danger", "ghost"] as const).map((v) => (
        <Button key={v} {...args} variant={v}>
          {v}
        </Button>
      ))}
    </div>
  ),
};
