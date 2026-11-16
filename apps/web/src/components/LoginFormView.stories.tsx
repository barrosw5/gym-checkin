import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import LoginFormView from "./LoginFormView";

const meta = {
  title: "Auth/LoginForm",
  component: LoginFormView,
  args: { onSubmit: fn(), loading: false, error: null },
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
} satisfies Meta<typeof LoginFormView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const LoggingIn: Story = { args: { loading: true } };
export const WrongPassword: Story = { args: { error: { key: "errors.login.invalid" } } };
export const TooManyAttempts: Story = {
  args: { error: { key: "errors.login.tooManyIn", params: { seconds: 42 } } },
};
