import type { Meta, StoryObj } from "@storybook/react-vite";
import LanguagePicker from "./LanguagePicker";

// The active language follows the toolbar's "Language" switch
const meta = {
  title: "Components/LanguagePicker",
  component: LanguagePicker,
} satisfies Meta<typeof LanguagePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
