import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import ChangePasswordFormView from "./ChangePasswordFormView";

const meta = {
  title: "Auth/ChangePasswordForm",
  component: ChangePasswordFormView,
  args: {
    forced: false,
    isDemo: false,
    busy: false,
    done: false,
    error: null,
    onSubmit: fn(),
    onLeave: fn(),
  },
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
} satisfies Meta<typeof ChangePasswordFormView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
/** Imported account: must choose a new password, no cancel. */
export const ForcedAfterImport: Story = { args: { forced: true } };
export const Saving: Story = { args: { busy: true } };
export const WrongCurrent: Story = { args: { error: { key: "errors.password.currentWrong" } } };
export const Done: Story = { args: { done: true } };
export const DemoAccount: Story = { args: { isDemo: true } };
