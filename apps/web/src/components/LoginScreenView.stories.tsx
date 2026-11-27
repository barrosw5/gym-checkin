import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import LoginFormView from "./LoginFormView";
import LoginScreenView from "./LoginScreenView";

const meta = {
  title: "Auth/LoginScreen",
  component: LoginScreenView,
  parameters: { layout: "fullscreen" },
  args: {
    demo: { count: 6, capacity: 10, isFull: false },
    demoRole: null,
    onDemoLogin: fn(),
    form: <LoginFormView onSubmit={fn()} loading={false} error={null} />,
  },
} satisfies Meta<typeof LoginScreenView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Demo: Story = {};
export const DemoFull: Story = { args: { demo: { count: 10, capacity: 10, isFull: true } } };
export const OpeningDemoAccount: Story = { args: { demoRole: "RECEPTION" } };
/** A real install (or the demo status still loading): no numbers, no shortcuts. */
export const WithoutDemo: Story = { args: { demo: null } };
export const OnPhone: Story = { globals: { viewport: { value: "mobile1" } } };
