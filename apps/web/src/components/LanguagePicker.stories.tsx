import type { Meta, StoryObj } from "@storybook/react-vite";
import LanguagePicker from "./LanguagePicker";

// The active language follows the toolbar's "Language" switch
const meta = {
  title: "Components/LanguagePicker",
  component: LanguagePicker,
} satisfies Meta<typeof LanguagePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnLight: Story = { args: { tone: "onLight" } };
export const OnDark: Story = {
  args: { tone: "onDark" },
  decorators: [(Story) => <div className="inline-block bg-navy-700 p-3">{Story()}</div>],
};
